const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Autenticación
router.use(authenticateToken);

// Listar interconsultas (visible para todos los roles autenticados)
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('paciente_id').optional().isInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Parámetros inválidos', errors: errors.array() });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const pacienteId = req.query.paciente_id;

    const where = [];
    const params = [];
    if (search) {
      where.push('(i.especialidad LIKE ? OR i.motivo LIKE ? OR i.recomendaciones LIKE ?)');
      const p = `%${search}%`;
      params.push(p, p, p);
    }
    if (pacienteId) {
      where.push('c.paciente_id = ?');
      params.push(pacienteId);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const rows = await db.query(`
      SELECT i.*, c.codigo as cita_codigo, c.paciente_id, c.medico_id, c.fecha_cita, c.hora_cita
      FROM interconsultas i
      LEFT JOIN citas c ON i.cita_id = c.id
      ${whereClause}
      ORDER BY i.fecha_creacion DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const count = await db.query(`
      SELECT COUNT(*) as total
      FROM interconsultas i
      LEFT JOIN citas c ON i.cita_id = c.id
      ${whereClause}
    `, params);

    res.json({ success: true, data: { interconsultas: rows, pagination: { page, limit, total: count[0].total, pages: Math.ceil(count[0].total / limit) } } });
  } catch (error) {
    console.error('Error listando interconsultas:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Crear interconsulta (admin, admisionista, tecnico)
router.post('/', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('cita_id').isInt(),
  body('especialidad').isLength({ min: 2 }),
  body('motivo').isLength({ min: 2 }),
  body('recomendaciones').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { cita_id, especialidad, motivo, recomendaciones } = req.body;

    // Verificar cita existente
    const citas = await db.query('SELECT * FROM citas WHERE id = ?', [cita_id]);
    if (citas.length === 0) {
      return res.status(400).json({ success: false, message: 'La cita especificada no existe' });
    }

    const result = await db.query(`
      INSERT INTO interconsultas (cita_id, especialidad, motivo, recomendaciones)
      VALUES (?, ?, ?, ?)
    `, [cita_id, especialidad, motivo, recomendaciones || null]);

    const creada = await db.query('SELECT * FROM interconsultas WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Interconsulta creada exitosamente', data: creada[0] });
  } catch (error) {
    console.error('Error creando interconsulta:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Actualizar interconsulta (admin, admisionista, tecnico)
router.put('/:id', [
  requireRole(['admin', 'admisionista', 'tecnico']),
  body('especialidad').optional().isLength({ min: 2 }),
  body('motivo').optional().isLength({ min: 2 }),
  body('recomendaciones').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Datos inválidos', errors: errors.array() });
    }

    const { id } = req.params;
    const updateData = req.body;

    const inter = await db.query('SELECT * FROM interconsultas WHERE id = ?', [id]);
    if (inter.length === 0) {
      return res.status(404).json({ success: false, message: 'Interconsulta no encontrada' });
    }

    const fields = Object.keys(updateData).filter(k => updateData[k] !== undefined);
    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No hay datos para actualizar' });
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => updateData[f]);

    await db.query(`UPDATE interconsultas SET ${setClause} WHERE id = ?`, [...values, id]);

    const updated = await db.query('SELECT * FROM interconsultas WHERE id = ?', [id]);

    res.json({ success: true, message: 'Interconsulta actualizada exitosamente', data: updated[0] });
  } catch (error) {
    console.error('Error actualizando interconsulta:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

// Eliminar interconsulta (solo admin)
router.delete('/:id', [requireRole(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;

    const inter = await db.query('SELECT * FROM interconsultas WHERE id = ?', [id]);
    if (inter.length === 0) {
      return res.status(404).json({ success: false, message: 'Interconsulta no encontrada' });
    }

    await db.query('DELETE FROM interconsultas WHERE id = ?', [id]);

    res.json({ success: true, message: 'Interconsulta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando interconsulta:', error.message);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

module.exports = router;
