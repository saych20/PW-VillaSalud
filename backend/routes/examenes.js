const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todos los exámenes
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('categoria').optional().isIn(['EMO', 'Especifico']),
  query('tipo').optional().isIn(['ingreso', 'retiro', 'anual', 'recategorizacion']),
  query('estado').optional().isIn(['programado', 'en_proceso', 'completado', 'cancelado']),
  query('empresa_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Parámetros inválidos',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const categoria = req.query.categoria;
    const tipo = req.query.tipo;
    const estado = req.query.estado;
    const empresaId = req.query.empresa_id;

    let whereConditions = ['e.activo = 1'];
    let queryParams = [];

    // Filtro por empresa: si el rol es empresa, solo sus exámenes y publicados
    if (req.user.rol === 'empresa') {
      whereConditions.push('e.empresa_id = ?');
      queryParams.push(req.user.empresa_id);
      // Solo exámenes publicados visibles para empresa
      whereConditions.push('e.publicado = 1');
    } else if (empresaId) {
      whereConditions.push('e.empresa_id = ?');
      queryParams.push(empresaId);
    }

    // Filtros específicos
    if (categoria) {
      whereConditions.push('e.categoria_examen = ?');
      queryParams.push(categoria);
    }

    if (tipo) {
      whereConditions.push('e.tipo_examen = ?');
      queryParams.push(tipo);
    }

    if (estado) {
      whereConditions.push('e.estado = ?');
      queryParams.push(estado);
    }

    // Búsqueda por texto
    if (search) {
      whereConditions.push('(p.nombres LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ? OR e.codigo LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.join(' AND ');

    // Consulta principal
    const sql = `
      SELECT 
        e.*,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.dni as paciente_dni,
        emp.razon_social as empresa_nombre
      FROM examenes e
      LEFT JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE ${whereClause}
      ORDER BY e.fecha_programada DESC, e.hora_programada DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const examenes = await db.query(sql, queryParams);

    // Para cada examen, obtener sus resultados
    for (let examen of examenes) {
      examen.examenes_seleccionados = JSON.parse(examen.examenes_seleccionados);
      
      const resultados = await db.query(`
        SELECT * FROM resultados_examenes 
        WHERE examen_id = ?
      `, [examen.id]);

      examen.resultados = resultados.map(r => ({
        ...r,
        resultado: JSON.parse(r.resultado)
      }));
    }

    // Contar total para paginación
    const countSql = `
      SELECT COUNT(*) as total
      FROM examenes e
      LEFT JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE ${whereClause}
    `;

    const countResult = await db.query(countSql, queryParams.slice(0, -2));
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        examenes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo exámenes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener examen por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const examenes = await db.query(`
      SELECT 
        e.*,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.dni as paciente_dni,
        emp.razon_social as empresa_nombre
      FROM examenes e
      LEFT JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE e.id = ?
    `, [id]);

    if (examenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    const examen = examenes[0];
    examen.examenes_seleccionados = JSON.parse(examen.examenes_seleccionados);

    // Verificar permisos de acceso
    if (req.user.rol === 'empresa') {
      if (examen.empresa_id !== req.user.empresa_id) {
        return res.status(403).json({ success: false, message: 'No tienes permisos para ver este examen' });
      }
      if (examen.publicado !== 1) {
        return res.status(403).json({ success: false, message: 'El examen no está publicado' });
      }
    }

    // Obtener resultados del examen
    const resultados = await db.query(`
      SELECT 
        r.*,
        u.nombre as completado_por_nombre,
        u.apellidos as completado_por_apellidos
      FROM resultados_examenes r
      LEFT JOIN usuarios u ON r.completado_por = u.id
      WHERE r.examen_id = ?
      ORDER BY r.tipo_examen
    `, [id]);

    examen.resultados = resultados.map(r => ({
      ...r,
      resultado: JSON.parse(r.resultado)
    }));

    res.json({
      success: true,
      data: examen
    });

  } catch (error) {
    console.error('Error obteniendo examen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear nuevo examen
router.post('/', [
  requireRole(['admin', 'admisionista']),
  body('paciente_id').isInt(),
  body('empresa_id').isInt(),
  body('categoria_examen').isIn(['EMO', 'Especifico']),
  body('tipo_examen').isIn(['ingreso', 'retiro', 'anual', 'recategorizacion']),
  body('examenes_seleccionados').isArray(),
  body('fecha_programada').isISO8601(),
  body('hora_programada').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { 
      paciente_id, 
      empresa_id, 
      categoria_examen, 
      tipo_examen, 
      examenes_seleccionados, 
      fecha_programada, 
      hora_programada, 
      observaciones 
    } = req.body;

    // Verificar que el paciente existe
    const pacientes = await db.query('SELECT * FROM pacientes WHERE id = ? AND activo = 1', [paciente_id]);
    if (pacientes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El paciente especificado no existe'
      });
    }

    // Verificar que la empresa existe
    const empresas = await db.query('SELECT * FROM empresas WHERE id = ? AND activo = 1', [empresa_id]);
    if (empresas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La empresa especificada no existe'
      });
    }

    // Generar código único para el examen
    const examenes = await db.query('SELECT COUNT(*) as count FROM examenes');
    const count = examenes[0].count + 1;
    const codigo = `EXA${count.toString().padStart(3, '0')}`;

    // Insertar examen
    const result = await db.query(`
      INSERT INTO examenes (
        codigo, paciente_id, empresa_id, categoria_examen, tipo_examen, 
        examenes_seleccionados, fecha_programada, hora_programada, observaciones
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      codigo, paciente_id, empresa_id, categoria_examen, tipo_examen,
      JSON.stringify(examenes_seleccionados), fecha_programada, hora_programada, observaciones || null
    ]);

    // Crear registros de resultados para cada examen seleccionado
    for (const tipoExamen of examenes_seleccionados) {
      await db.query(`
        INSERT INTO resultados_examenes (examen_id, paciente_id, tipo_examen, resultado, completado)
        VALUES (?, ?, ?, '{}', 0)
      `, [result.insertId, paciente_id, tipoExamen]);
    }

    // Obtener el examen creado
    const nuevoExamen = await db.query(`
      SELECT 
        e.*,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.dni as paciente_dni,
        emp.razon_social as empresa_nombre
      FROM examenes e
      LEFT JOIN pacientes p ON e.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE e.id = ?
    `, [result.insertId]);

    nuevoExamen[0].examenes_seleccionados = JSON.parse(nuevoExamen[0].examenes_seleccionados);

    res.status(201).json({
      success: true,
      message: 'Examen creado exitosamente',
      data: nuevoExamen[0]
    });

  } catch (error) {
    console.error('Error creando examen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar estado del examen
router.patch('/:id/estado', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('estado').isIn(['programado', 'en_proceso', 'completado', 'cancelado'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { estado } = req.body;

    // Verificar que el examen existe
    const examenes = await db.query('SELECT * FROM examenes WHERE id = ?', [id]);
    if (examenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    await db.query('UPDATE examenes SET estado = ? WHERE id = ?', [estado, id]);

    res.json({
      success: true,
      message: 'Estado del examen actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando estado del examen:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;

// =====================
// Extensiones requeridas
// =====================

// Actualizar aptitud del examen
router.patch('/:id/aptitud', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('aptitud').isIn(['apto', 'no_apto', 'con_restricciones', 'observacion', null])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const { aptitud } = req.body;

    // Verificar que el examen existe
    const examenes = await db.query('SELECT * FROM examenes WHERE id = ?', [id]);
    if (examenes.length === 0) {
      return res.status(404).json({ success: false, message: 'Examen no encontrado' });
    }

    await db.query('UPDATE examenes SET aptitud = ? WHERE id = ?', [aptitud || null, id]);

    res.json({ success: true, message: 'Aptitud actualizada exitosamente' });
  } catch (error) {
    console.error('Error actualizando aptitud del examen:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Agregar nuevos tipos de examen a un examen programado
router.patch('/:id/seleccion/agregar', [
  requireRole(['admin', 'admisionista']),
  body('examenes_nuevos').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const { examenes_nuevos } = req.body; // array de strings

    // Verificar que el examen existe
    const examenes = await db.query('SELECT * FROM examenes WHERE id = ?', [id]);
    if (examenes.length === 0) {
      return res.status(404).json({ success: false, message: 'Examen no encontrado' });
    }

    const examen = examenes[0];
    const seleccionActual = JSON.parse(examen.examenes_seleccionados || '[]');
    const setActual = new Set(seleccionActual);

    let agregados = 0;
    for (const tipo of examenes_nuevos) {
      if (!setActual.has(tipo)) {
        seleccionActual.push(tipo);
        agregados++;
        // Crear resultado inicial para el nuevo tipo
        await db.query(`
          INSERT INTO resultados_examenes (examen_id, paciente_id, tipo_examen, resultado, completado)
          VALUES (?, ?, ?, '{}', 0)
        `, [examen.id, examen.paciente_id, tipo]);
      }
    }

    if (agregados === 0) {
      return res.json({ success: true, message: 'No se agregaron nuevos exámenes a la selección', data: { total_agregados: 0 } });
    }

    await db.query('UPDATE examenes SET examenes_seleccionados = ? WHERE id = ?', [JSON.stringify(seleccionActual), id]);

    res.json({ success: true, message: `Se agregaron ${agregados} exámenes a la selección`, data: { total_agregados: agregados, examenes_seleccionados: seleccionActual } });
  } catch (error) {
    console.error('Error agregando exámenes a la selección:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Publicar resultados para vista de empresa (disponibilizar descarga)
router.post('/:id/publicar', [
  requireRole(['admin', 'admisionista', 'tecnico'])
], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el examen existe
    const examenes = await db.query('SELECT * FROM examenes WHERE id = ?', [id]);
    if (examenes.length === 0) {
      return res.status(404).json({ success: false, message: 'Examen no encontrado' });
    }

    // Verificar si todos los resultados están completados
    const resultados = await db.query('SELECT completado FROM resultados_examenes WHERE examen_id = ?', [id]);
    const todosCompletos = resultados.length > 0 && resultados.every(r => r.completado === 1 || r.completado === true);

    // Marcar como publicado y si corresponde, como completado
    await db.query('UPDATE examenes SET publicado = 1, estado = ? WHERE id = ?', [todosCompletos ? 'completado' : examenes[0].estado, id]);

    res.json({ success: true, message: 'Examen publicado para la empresa', data: { publicado: true, completado: todosCompletos } });
  } catch (error) {
    console.error('Error publicando examen:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});
