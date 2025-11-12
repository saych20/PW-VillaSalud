require('dotenv').config();

const config = {
    // Configuración del servidor
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Configuración JWT
    JWT_SECRET: process.env.JWT_SECRET || 'emos_secret_key_2024',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    
    // Configuración de la base de datos
    DB_PATH: process.env.DB_PATH || './database/emos.db',
    
    // Configuración de CORS
    CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
    
    // Configuración de archivos
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '5MB',
    
    // Configuración de rate limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutos
    RATE_LIMIT_MAX: 100, // máximo 100 requests por ventana
    
    // Configuración de sesión
    SESSION_SECRET: process.env.SESSION_SECRET || 'emos_session_secret',
    
    // Configuración de email (para notificaciones futuras)
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    
    // Configuración del sistema
    SYSTEM_NAME: 'Sistema EMOS - Policlínico Villa Salud SRL',
    SYSTEM_VERSION: '1.0.0',
    
    // Límites del sistema
    MAX_EXAMS_PER_COMPANY_SESSION: 20,
    DEFAULT_APPOINTMENT_DURATION: 30, // minutos
    
    // Roles del sistema
    ROLES: {
        ADMIN: 'administrador',
        ADMISSION: 'admisionista',
        TECHNICIAN: 'tecnico',
        COMPANY: 'empresa',
        DOCTOR: 'medico'
    },
    
    // Estados de exámenes
    EXAM_STATES: {
        SCHEDULED: 'programado',
        IN_PROGRESS: 'en_proceso',
        COMPLETED: 'completado',
        CANCELLED: 'cancelado'
    },
    
    // Tipos de aptitud
    FITNESS_TYPES: {
        FIT: 'apto',
        UNFIT: 'no_apto',
        OBSERVED: 'observado',
        FIT_WITH_RESTRICTIONS: 'apto_con_restricciones'
    }
};

module.exports = config;