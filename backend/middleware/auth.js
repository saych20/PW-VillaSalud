const JWTUtils = require('../utils/jwt');
const config = require('../config/config');

class AuthMiddleware {
    // Middleware para verificar token JWT
    static verifyToken(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const token = JWTUtils.extractTokenFromHeader(authHeader);
            const decoded = JWTUtils.verifyToken(token);
            
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado',
                error: error.message
            });
        }
    }

    // Middleware para verificar roles específicos
    static requireRole(roles) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.user.rol;
            const allowedRoles = Array.isArray(roles) ? roles : [roles];

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para acceder a este recurso',
                    requiredRoles: allowedRoles,
                    userRole: userRole
                });
            }

            next();
        };
    }

    // Middleware para verificar si es administrador
    static requireAdmin(req, res, next) {
        return AuthMiddleware.requireRole(config.ROLES.ADMIN)(req, res, next);
    }

    // Middleware para verificar si es administrador o admisionista
    static requireAdminOrAdmission(req, res, next) {
        return AuthMiddleware.requireRole([
            config.ROLES.ADMIN, 
            config.ROLES.ADMISSION
        ])(req, res, next);
    }

    // Middleware para verificar si es staff (admin, admisionista, técnico)
    static requireStaff(req, res, next) {
        return AuthMiddleware.requireRole([
            config.ROLES.ADMIN,
            config.ROLES.ADMISSION,
            config.ROLES.TECHNICIAN
        ])(req, res, next);
    }

    // Middleware para verificar si es médico
    static requireDoctor(req, res, next) {
        return AuthMiddleware.requireRole(config.ROLES.DOCTOR)(req, res, next);
    }

    // Middleware para verificar si es empresa
    static requireCompany(req, res, next) {
        return AuthMiddleware.requireRole(config.ROLES.COMPANY)(req, res, next);
    }

    // Middleware para verificar permisos de escritura (no eliminar para ciertos roles)
    static requireWritePermission(req, res, next) {
        const userRole = req.user.rol;
        const method = req.method;

        // Solo administradores pueden eliminar
        if (method === 'DELETE' && userRole !== config.ROLES.ADMIN) {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden eliminar registros'
            });
        }

        next();
    }

    // Middleware para verificar si el usuario puede acceder a datos de empresa específica
    static requireCompanyAccess(req, res, next) {
        const userRole = req.user.rol;
        const userId = req.user.id;
        const empresaId = req.params.empresaId || req.body.empresa_id;

        // Administradores y staff pueden acceder a cualquier empresa
        if ([config.ROLES.ADMIN, config.ROLES.ADMISSION, config.ROLES.TECHNICIAN].includes(userRole)) {
            return next();
        }

        // Empresas solo pueden acceder a sus propios datos
        if (userRole === config.ROLES.COMPANY) {
            if (req.user.empresa_id && req.user.empresa_id.toString() === empresaId?.toString()) {
                return next();
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes acceder a los datos de tu empresa'
                });
            }
        }

        next();
    }

    // Middleware opcional para verificar token (no falla si no hay token)
    static optionalAuth(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            if (authHeader) {
                const token = JWTUtils.extractTokenFromHeader(authHeader);
                const decoded = JWTUtils.verifyToken(token);
                req.user = decoded;
            }
        } catch (error) {
            // No hacer nada, continuar sin usuario autenticado
        }
        next();
    }
}

module.exports = AuthMiddleware;