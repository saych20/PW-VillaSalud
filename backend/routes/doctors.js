const express = require('express');
const DoctorController = require('../controllers/DoctorController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Rutas CRUD para médicos
router.get('/', DoctorController.getAll);
router.get('/specialties', DoctorController.getSpecialties);
router.get('/specialty/:especialidad', DoctorController.getBySpecialty);
router.get('/:id', DoctorController.getById);
router.post('/', AuthMiddleware.requireWritePermission, DoctorController.create);
router.put('/:id', AuthMiddleware.requireWritePermission, DoctorController.update);
router.delete('/:id', AuthMiddleware.requireAdmin, DoctorController.delete);

// Rutas específicas
router.post('/:id/permissions', AuthMiddleware.requireAdmin, DoctorController.assignExamPermissions);
router.get('/:id/stats', DoctorController.getStats);

module.exports = router;