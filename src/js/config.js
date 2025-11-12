// Configuración global del frontend
const CONFIG = {
    // URL base de la API
    API_BASE_URL: 'http://localhost:3002/api',
    
    // Configuración de autenticación
    TOKEN_KEY: 'emos_token',
    USER_KEY: 'emos_user',
    
    // Configuración de la aplicación
    APP_NAME: 'Sistema EMOS',
    APP_VERSION: '1.0.0',
    
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
    },
    
    // Configuración de paginación
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 10,
        PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100]
    },
    
    // Configuración de notificaciones
    NOTIFICATIONS: {
        DURATION: 5000, // 5 segundos
        POSITION: 'top-right'
    },
    
    // Configuración de fechas
    DATE_FORMAT: 'DD/MM/YYYY',
    DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
    TIME_FORMAT: 'HH:mm',
    
    // Límites del sistema
    MAX_EXAMS_PER_COMPANY_SESSION: 20,
    
    // Especialidades médicas disponibles
    MEDICAL_SPECIALTIES: [
        'Medicina Ocupacional',
        'Oftalmología',
        'Audiometría',
        'Cardiología',
        'Neumología',
        'Radiología',
        'Laboratorio Clínico',
        'Psicología',
        'Odontología'
    ],
    
    // Tipos de exámenes
    EXAM_TYPES: [
        'Examen Médico Ocupacional Completo',
        'Examen Oftalmológico',
        'Audiometría',
        'Electrocardiograma',
        'Radiografía de Tórax',
        'Espirometría',
        'Análisis de Laboratorio',
        'Evaluación Psicológica',
        'Examen Odontológico'
    ],
    
    // Configuración de archivos
    FILE_UPLOAD: {
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'],
        ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']
    }
};

// Función para obtener la configuración
window.getConfig = () => CONFIG;

// Exportar configuración para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}