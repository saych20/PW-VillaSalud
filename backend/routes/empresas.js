const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Autenticación para todas las rutas
router.use(authenticateToken);

// Listar empresas (admin, admisionista, tecnico)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString()
], async (req, res) => {
  try {
    if (!['admin', 'admisionista', 'tecnico'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Parámetros inválidos', errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereConditions = ['activo = 1'];
    const params = [];

    if (search) {
      whereConditions.push('(razon_social LIKE ? OR ruc LIKE ? OR email LIKE ?)');
      const p = `%${search}%`;
      params.push(p, p, p);
    }

    const whereClause = whereConditions.join(' AND ');

    const empresas = await db.query(`
      SELECT * FROM empresas
      WHERE ${whereClause}
      ORDER BY fecha_creacion DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const count = await db.query(`
      SELECT COUNT(*) as total FROM empresas WHERE ${whereClause}
    `, params);

    res.json({
      success: true,
      data: { empresas, pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) } }
    });
  } catch (error) {
    console.error('Error listando empresas:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Obtener empresa por ID (admin, admisionista, tecnico)
router.get('/:id', async (req, res) => {
  try {
    if (!['admin', 'admisionista', 'tecnico'].includes(req.user.rol)) {
      return res.status(403).json({ success: false, message: 'No autorizado' });
    }

    const { id } = req.params;
    const empresas = await db.query('SELECT * FROM empresas WHERE id = ? AND activo = 1', [id]);
    if (empresas.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    res.json({ success: true, data: empresas[0] });
  } catch (error) {
    console.error('Error obteniendo empresa:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Crear empresa (admin, admisionista, tecnico)
router.post('/', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('razon_social').isLength({ min: 2 }),
  body('ruc').isLength({ min: 11, max: 11 }).isNumeric(),
  body('direccion').isLength({ min: 3 }),
  body('telefono').isLength({ min: 6 }),
  body('email').isEmail(),
  body('representante_legal').isLength({ min: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { razon_social, ruc, direccion, telefono, email, representante_legal } = req.body;

    // Verificar RUC único
    const exists = await db.query('SELECT id FROM empresas WHERE ruc = ?', [ruc]);
    if (exists.length > 0) {
      return res.status(400).json({ success: false, message: 'Ya existe una empresa con este RUC' });
    }

    const result = await db.query(`
      INSERT INTO empresas (razon_social, ruc, direccion, telefono, email, representante_legal)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [razon_social, ruc, direccion, telefono, email, representante_legal]);

    const creada = await db.query('SELECT * FROM empresas WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Empresa creada exitosamente', data: creada[0] });
  } catch (error) {
    console.error('Error creando empresa:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Actualizar empresa (admin, admisionista, tecnico)
router.put('/:id', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('razon_social').optional().isLength({ min: 2 }),
  body('ruc').optional().isLength({ min: 11, max: 11 }).isNumeric(),
  body('direccion').optional().isLength({ min: 3 }),
  body('telefono').optional().isLength({ min: 6 }),
  body('email').optional().isEmail(),
  body('representante_legal').optional().isLength({ min: 3 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const empresas = await db.query('SELECT * FROM empresas WHERE id = ? AND activo = 1', [id]);
    if (empresas.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    // Unicidad de RUC si se actualiza
    if (updateData.ruc) {
      const ex = await db.query('SELECT id FROM empresas WHERE ruc = ? AND id != ?', [updateData.ruc, id]);
      if (ex.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe otra empresa con este RUC' });
      }
    }

    const fields = Object.keys(updateData).filter(k => updateData[k] !== undefined);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
    }
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updateData[f]);

    await db.query(`UPDATE empresas SET ${setClause} WHERE id = ?`, [...values, id]);

    const actualizada = await db.query('SELECT * FROM empresas WHERE id = ?', [id]);
    res.json({ success: true, message: 'Empresa actualizada exitosamente', data: actualizada[0] });
  } catch (error) {
    console.error('Error actualizando empresa:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Eliminar empresa (soft delete) - solo admin
router.delete('/:id', [requireRole(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;

    const empresas = await db.query('SELECT * FROM empresas WHERE id = ? AND activo = 1', [id]);
    if (empresas.length === 0) {
      return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
    }

    await db.query('UPDATE empresas SET activo = 0 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Empresa eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando empresa:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
