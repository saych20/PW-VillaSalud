const express = require('express');
const rolesConfig = require('../config/roles');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Listar todos los roles (requiere admin)
router.get('/', authenticateToken, requireRole(['admin']), (req, res) => {
  const roles = Object.keys(rolesConfig).map(key => ({ id: key, nombre: rolesConfig[key].nombre, permisos: rolesConfig[key].permisos }));
  res.json({ success: true, data: roles });
});

// Obtener permisos de un rol (publico)
router.get('/:rol', (req, res) => {
  const rol = req.params.rol;
  const entry = rolesConfig[rol];
  if (!entry) return res.status(404).json({ success: false, message: 'Rol no encontrado' });
  res.json({ success: true, data: { id: rol, nombre: entry.nombre, permisos: entry.permisos } });
});

module.exports = router;
