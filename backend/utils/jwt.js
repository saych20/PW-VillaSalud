const jwt = require('jsonwebtoken');
const config = require('../config/config');

class JWTUtils {
    // Generar token JWT
    static generateToken(payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: config.JWT_EXPIRES_IN
        });
    }

    // Verificar token JWT
    static verifyToken(token) {
        try {
            return jwt.verify(token, config.JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido');
        }
    }

    // Decodificar token sin verificar (para debugging)
    static decodeToken(token) {
        return jwt.decode(token);
    }

    // Generar token de refresh
    static generateRefreshToken(payload) {
        return jwt.sign(payload, config.JWT_SECRET, {
            expiresIn: '7d' // 7 días para refresh token
        });
    }

    // Extraer token del header Authorization
    static extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            throw new Error('No se proporcionó token de autorización');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Error('Formato de token inválido');
        }

        return parts[1];
    }
}

module.exports = JWTUtils;