const express = require('express');
const PatientController = require('../controllers/PatientController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(AuthMiddleware.verifyToken);

// Middleware para verificar permisos de staff (admin, admisionista, técnico)
const requireStaffAccess = AuthMiddleware.requireStaff;

// Rutas CRUD para pacientes
router.get('/', requireStaffAccess, PatientController.getAll);
router.get('/:id', requireStaffAccess, PatientController.getById);
router.post('/', requireStaffAccess, AuthMiddleware.requireWritePermission, PatientController.create);
router.put('/:id', requireStaffAccess, AuthMiddleware.requireWritePermission, PatientController.update);
router.delete('/:id', AuthMiddleware.requireAdmin, PatientController.delete);

// Rutas relacionadas
router.get('/:id/exams', requireStaffAccess, PatientController.getExams);
router.get('/:id/appointments', requireStaffAccess, PatientController.getAppointments);

module.exports = router;