const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Completar resultado de examen
router.post('/:examenId/:tipoExamen', [
  requireRole(['tecnico', 'medico', 'admin']),
  body('resultado').isObject(),
  body('observaciones').optional().isString()
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

    const { examenId, tipoExamen } = req.params;
    const { resultado, observaciones } = req.body;

    // Verificar que el examen existe
    const examenes = await db.query('SELECT * FROM examenes WHERE id = ?', [examenId]);
    if (examenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    const examen = examenes[0];

    // Verificar que el tipo de examen está en los seleccionados
    const examenesSeleccionados = JSON.parse(examen.examenes_seleccionados);
    if (!examenesSeleccionados.includes(tipoExamen)) {
      return res.status(400).json({
        success: false,
        message: 'Este tipo de examen no está seleccionado para este examen'
      });
    }

    // Buscar el resultado existente
    const resultados = await db.query(`
      SELECT * FROM resultados_examenes 
      WHERE examen_id = ? AND tipo_examen = ?
    `, [examenId, tipoExamen]);

    if (resultados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resultado no encontrado'
      });
    }

    const resultadoExistente = resultados[0];

    // Actualizar el resultado
    await db.query(`
      UPDATE resultados_examenes 
      SET resultado = ?, completado = 1, fecha_completado = NOW(), completado_por = ?, observaciones = ?
      WHERE id = ?
    `, [
      JSON.stringify(resultado),
      req.user.id,
      observaciones || null,
      resultadoExistente.id
    ]);

    // Obtener el resultado actualizado
    const resultadoActualizado = await db.query(`
      SELECT 
        r.*,
        u.nombre as completado_por_nombre,
        u.apellidos as completado_por_apellidos
      FROM resultados_examenes r
      LEFT JOIN usuarios u ON r.completado_por = u.id
      WHERE r.id = ?
    `, [resultadoExistente.id]);

    resultadoActualizado[0].resultado = JSON.parse(resultadoActualizado[0].resultado);

    res.json({
      success: true,
      message: 'Resultado completado exitosamente',
      data: resultadoActualizado[0]
    });

  } catch (error) {
    console.error('Error completando resultado:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener resultado específico
router.get('/:examenId/:tipoExamen', async (req, res) => {
  try {
    const { examenId, tipoExamen } = req.params;

    const resultados = await db.query(`
      SELECT 
        r.*,
        u.nombre as completado_por_nombre,
        u.apellidos as completado_por_apellidos,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        e.codigo as examen_codigo,
        emp.razon_social as empresa_nombre
      FROM resultados_examenes r
      LEFT JOIN usuarios u ON r.completado_por = u.id
      LEFT JOIN examenes e ON r.examen_id = e.id
      LEFT JOIN pacientes p ON r.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE r.examen_id = ? AND r.tipo_examen = ?
    `, [examenId, tipoExamen]);

    if (resultados.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Resultado no encontrado'
      });
    }

    const resultado = resultados[0];
    resultado.resultado = JSON.parse(resultado.resultado);

    // Verificar permisos de acceso
    if (req.user.rol === 'empresa' && resultado.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este resultado'
      });
    }

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('Error obteniendo resultado:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener todos los resultados de un examen
router.get('/:examenId', async (req, res) => {
  try {
    const { examenId } = req.params;

    // Verificar que el examen existe
    const examenes = await db.query(`
      SELECT e.*, emp.id as empresa_id
      FROM examenes e
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE e.id = ?
    `, [examenId]);

    if (examenes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Examen no encontrado'
      });
    }

    const examen = examenes[0];

    // Verificar permisos de acceso
    if (req.user.rol === 'empresa' && examen.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este examen'
      });
    }

    const resultados = await db.query(`
      SELECT 
        r.*,
        u.nombre as completado_por_nombre,
        u.apellidos as completado_por_apellidos
      FROM resultados_examenes r
      LEFT JOIN usuarios u ON r.completado_por = u.id
      WHERE r.examen_id = ?
      ORDER BY r.tipo_examen
    `, [examenId]);

    const resultadosFormateados = resultados.map(r => ({
      ...r,
      resultado: JSON.parse(r.resultado)
    }));

    res.json({
      success: true,
      data: resultadosFormateados
    });

  } catch (error) {
    console.error('Error obteniendo resultados:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener resultados pendientes para técnico
router.get('/pendientes/tecnico', [requireRole(['tecnico', 'admin'])], async (req, res) => {
  try {
    const resultados = await db.query(`
      SELECT 
        r.*,
        p.nombres as paciente_nombres,
        p.apellidos as paciente_apellidos,
        p.dni as paciente_dni,
        e.codigo as examen_codigo,
        e.fecha_programada,
        e.hora_programada,
        emp.razon_social as empresa_nombre
      FROM resultados_examenes r
      LEFT JOIN examenes e ON r.examen_id = e.id
      LEFT JOIN pacientes p ON r.paciente_id = p.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE r.completado = 0
      ORDER BY e.fecha_programada ASC, e.hora_programada ASC
    `);

    const resultadosFormateados = resultados.map(r => ({
      ...r,
      resultado: JSON.parse(r.resultado)
    }));

    res.json({
      success: true,
      data: resultadosFormateados
    });

  } catch (error) {
    console.error('Error obteniendo resultados pendientes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
