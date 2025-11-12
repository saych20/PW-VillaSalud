const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const BcryptUtils = require('../utils/bcrypt');
const config = require('../config/config');

class AuthController {
    // Login de usuario
    static async login(req, res) {
        try {
            const { usuario, password, contraseña } = req.body;
        const userPassword = password || contraseña;

            // Validar datos de entrada
            if (!usuario || !userPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            // Buscar usuario por nombre de usuario
            const user = await User.findByUsername(usuario);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar si el usuario está activo
            if (!user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario inactivo. Contacta al administrador.'
                });
            }

            // Verificar contraseña
            const isValidPassword = await user.verifyPassword(userPassword);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const tokenPayload = {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
                empresa_id: user.empresa_id
            };

            const token = JWTUtils.generateToken(tokenPayload);

            // Preparar datos del usuario (sin contraseña)
            const userData = user.toJSON();

            // Obtener información de la empresa si aplica
            if (user.empresa_id) {
                try {
                    const Company = require('../models/Company');
                    const empresa = await Company.findById(user.empresa_id);
                    userData.empresa = empresa ? empresa : null;
                } catch (error) {
                    console.warn('Error obteniendo empresa:', error);
                    userData.empresa = null;
                }
            }

            res.json({
                success: true,
                message: 'Login exitoso',
                token: token,
                user: userData
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener perfil del usuario actual
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;

            // Buscar usuario completo
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Preparar datos del usuario
            const userData = user.toJSON();

            // Obtener información de la empresa si aplica
            if (user.empresa_id) {
                try {
                    const Company = require('../models/Company');
                    const empresa = await Company.findById(user.empresa_id);
                    userData.empresa = empresa ? empresa : null;
                } catch (error) {
                    console.warn('Error obteniendo empresa:', error);
                    userData.empresa = null;
                }
            }

            res.json({
                success: true,
                data: userData
            });

        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Verificar token
    static async verifyToken(req, res) {
        try {
            // Si llegamos aquí, el token es válido (verificado por middleware)
            res.json({
                success: true,
                message: 'Token válido',
                user: req.user
            });
        } catch (error) {
            console.error('Error verificando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Logout (invalidar token en el cliente)
    static async logout(req, res) {
        try {
            // En una implementación más avanzada, aquí se podría
            // agregar el token a una lista negra
            res.json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Cambiar contraseña
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Validar datos de entrada
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 6 caracteres'
                });
            }

            // Buscar usuario
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verificar contraseña actual
            const isValidPassword = await user.verifyPassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Cambiar contraseña
            await user.changePassword(newPassword);

            res.json({
                success: true,
                message: 'Contraseña cambiada exitosamente'
            });

        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Solicitar recuperación de contraseña
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Email es requerido'
                });
            }

            // Buscar usuario por email
            const user = await User.findByEmail(email);
            if (!user) {
                // Por seguridad, no revelar si el email existe o no
                return res.json({
                    success: true,
                    message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
                });
            }

            // En una implementación completa, aquí se enviaría un email
            // con un token de recuperación
            console.log(`Solicitud de recuperación de contraseña para: ${email}`);

            res.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
            });

        } catch (error) {
            console.error('Error en recuperación de contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Renovar token
    static async refreshToken(req, res) {
        try {
            const userId = req.user.id;

            // Buscar usuario para verificar que sigue activo
            const user = await User.findById(userId);
            if (!user || !user.activo) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no válido'
                });
            }

            // Generar nuevo token
            const tokenPayload = {
                id: user.id,
                usuario: user.usuario,
                rol: user.rol,
                empresa_id: user.empresa_id
            };

            const newToken = JWTUtils.generateToken(tokenPayload);

            res.json({
                success: true,
                token: newToken
            });

        } catch (error) {
            console.error('Error renovando token:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = AuthController;