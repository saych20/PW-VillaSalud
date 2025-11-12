const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authenticateToken);

// Obtener todos los pacientes
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
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
    const empresaId = req.query.empresa_id;

    let whereConditions = ['p.activo = 1'];
    let queryParams = [];

    // Filtro por empresa si no es admin
    if (req.user.rol === 'empresa') {
      whereConditions.push('p.empresa_id = ?');
      queryParams.push(req.user.empresa_id);
    } else if (empresaId) {
      whereConditions.push('p.empresa_id = ?');
      queryParams.push(empresaId);
    }

    // Búsqueda por texto
    if (search) {
      whereConditions.push('(p.nombres LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ? OR p.codigo LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = whereConditions.join(' AND ');

    // Consulta principal
    const sql = `
      SELECT 
        p.*,
        e.razon_social as empresa_nombre
      FROM pacientes p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE ${whereClause}
      ORDER BY p.fecha_creacion DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limit, offset);

    const pacientes = await db.query(sql, queryParams);

    // Contar total para paginación
    const countSql = `
      SELECT COUNT(*) as total
      FROM pacientes p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE ${whereClause}
    `;

    const countResult = await db.query(countSql, queryParams.slice(0, -2));
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        pacientes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo pacientes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Obtener paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const pacientes = await db.query(`
      SELECT 
        p.*,
        e.razon_social as empresa_nombre,
        e.ruc as empresa_ruc
      FROM pacientes p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE p.id = ? AND p.activo = 1
    `, [id]);

    if (pacientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    const paciente = pacientes[0];

    // Verificar permisos de acceso
    if (req.user.rol === 'empresa' && paciente.empresa_id !== req.user.empresa_id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver este paciente'
      });
    }

    res.json({
      success: true,
      data: paciente
    });

  } catch (error) {
    console.error('Error obteniendo paciente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear nuevo paciente
router.post('/', [
  requireRole(['admin', 'admisionista']),
  body('nombres').isLength({ min: 2 }).trim(),
  body('apellidos').isLength({ min: 2 }).trim(),
  body('dni').isLength({ min: 8, max: 8 }).isNumeric(),
  body('numero_afiliacion').optional().isString(),
  body('preexistencias').optional().isString(),
  body('fecha_nacimiento').isISO8601(),
  body('telefono').isLength({ min: 9 }),
  body('genero').isIn(['M', 'F']),
  body('empresa_id').isInt()
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

  const { nombres, apellidos, dni, fecha_nacimiento, telefono, email, direccion, genero, empresa_id, numero_afiliacion, preexistencias } = req.body;

    // Verificar que el DNI no exista
    const existingDni = await db.query('SELECT id FROM pacientes WHERE dni = ? AND activo = 1', [dni]);
    if (existingDni.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un paciente con este DNI'
      });
    }

    // Verificar que la empresa existe
    const empresas = await db.query('SELECT id FROM empresas WHERE id = ? AND activo = 1', [empresa_id]);
    if (empresas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La empresa especificada no existe'
      });
    }

    // Generar código único para el paciente
    const pacientes = await db.query('SELECT COUNT(*) as count FROM pacientes');
    const count = pacientes[0].count + 1;
    const codigo = `PAC${count.toString().padStart(3, '0')}`;

    // Insertar paciente
    const result = await db.query(`
      INSERT INTO pacientes (codigo, nombres, apellidos, dni, fecha_nacimiento, telefono, numero_afiliacion, preexistencias, email, direccion, genero, empresa_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [codigo, nombres, apellidos, dni, fecha_nacimiento, telefono, numero_afiliacion || null, preexistencias || null, email || null, direccion || null, genero, empresa_id]);

    // Obtener el paciente creado
    const nuevoPaciente = await db.query(`
      SELECT 
        p.*,
        e.razon_social as empresa_nombre
      FROM pacientes p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE p.id = ?
    `, [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Paciente creado exitosamente',
      data: nuevoPaciente[0]
    });

  } catch (error) {
    console.error('Error creando paciente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar paciente
router.put('/:id', [
  requireRole(['admin', 'admisionista']),
  body('nombres').optional().isLength({ min: 2 }).trim(),
  body('apellidos').optional().isLength({ min: 2 }).trim(),
  body('dni').optional().isLength({ min: 8, max: 8 }).isNumeric(),
  body('numero_afiliacion').optional().isString(),
  body('preexistencias').optional().isString(),
  body('fecha_nacimiento').optional().isISO8601(),
  body('telefono').optional().isLength({ min: 9 }),
  body('genero').optional().isIn(['M', 'F']),
  body('empresa_id').optional().isInt()
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
    const updateData = req.body;

    // Verificar que el paciente existe
    const pacientes = await db.query('SELECT * FROM pacientes WHERE id = ? AND activo = 1', [id]);
    if (pacientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Si se está actualizando el DNI, verificar que no exista
    if (updateData.dni) {
      const existingDni = await db.query('SELECT id FROM pacientes WHERE dni = ? AND id != ? AND activo = 1', [updateData.dni, id]);
      if (existingDni.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro paciente con este DNI'
        });
      }
    }

    // Si se está actualizando la empresa, verificar que existe
    if (updateData.empresa_id) {
      const empresas = await db.query('SELECT id FROM empresas WHERE id = ? AND activo = 1', [updateData.empresa_id]);
      if (empresas.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La empresa especificada no existe'
        });
      }
    }

    // Construir query de actualización
    const fields = Object.keys(updateData).filter(key => updateData[key] !== undefined);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updateData[field]);

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar'
      });
    }

    await db.query(`UPDATE pacientes SET ${setClause} WHERE id = ?`, [...values, id]);

    // Obtener el paciente actualizado
    const pacienteActualizado = await db.query(`
      SELECT 
        p.*,
        e.razon_social as empresa_nombre
      FROM pacientes p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE p.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Paciente actualizado exitosamente',
      data: pacienteActualizado[0]
    });

  } catch (error) {
    console.error('Error actualizando paciente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Eliminar paciente (soft delete) - solo ADMIN
router.delete('/:id', [requireRole(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el paciente existe
    const pacientes = await db.query('SELECT * FROM pacientes WHERE id = ? AND activo = 1', [id]);
    if (pacientes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Paciente no encontrado'
      });
    }

    // Soft delete
    await db.query('UPDATE pacientes SET activo = 0 WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Paciente eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando paciente:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;
