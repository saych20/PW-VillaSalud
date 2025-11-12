const express = require('express');
const AuthController = require('../controllers/AuthController');
const AuthMiddleware = require('../middleware/auth');
const Validators = require('../utils/validators');

const router = express.Router();

// Ruta de login
router.post('/login', AuthController.login);

// Ruta para obtener perfil (requiere autenticación)
router.get('/profile', 
    AuthMiddleware.verifyToken,
    AuthController.getProfile
);

// Ruta para verificar token
router.get('/verify', 
    AuthMiddleware.verifyToken,
    AuthController.verifyToken
);

// Ruta de logout
router.post('/logout', 
    AuthMiddleware.verifyToken,
    AuthController.logout
);

// Ruta para cambiar contraseña
router.post('/change-password', 
    AuthMiddleware.verifyToken,
    AuthController.changePassword
);

// Ruta para solicitar recuperación de contraseña
router.post('/forgot-password', 
    AuthController.forgotPassword
);

// Ruta para renovar token
router.post('/refresh', 
    AuthMiddleware.verifyToken,
    AuthController.refreshToken
);

module.exports = router;