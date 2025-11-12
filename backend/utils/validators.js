const { body, param, query, validationResult } = require('express-validator');

class Validators {
    // Middleware para manejar errores de validación
    static handleValidationErrors(req, res, next) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }
        next();
    }

    // Validaciones para usuarios
    static validateUser() {
        return [
            body('nombre')
                .notEmpty()
                .withMessage('El nombre es requerido')
                .isLength({ min: 2, max: 100 })
                .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
            
            body('usuario')
                .notEmpty()
                .withMessage('El usuario es requerido')
                .isLength({ min: 3, max: 50 })
                .withMessage('El usuario debe tener entre 3 y 50 caracteres')
                .matches(/^[a-zA-Z0-9_]+$/)
                .withMessage('El usuario solo puede contener letras, números y guiones bajos'),
            
            body('email')
                .optional()
                .isEmail()
                .withMessage('Debe ser un email válido'),
            
            body('contraseña')
                .isLength({ min: 6 })
                .withMessage('La contraseña debe tener al menos 6 caracteres'),
            
            body('rol')
                .isIn(['administrador', 'admisionista', 'tecnico', 'empresa', 'medico'])
                .withMessage('Rol inválido')
        ];
    }

    // Validaciones para pacientes
    static validatePatient() {
        return [
            body('nombre')
                .notEmpty()
                .withMessage('El nombre es requerido')
                .isLength({ min: 2, max: 100 })
                .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
            
            body('apellidos')
                .notEmpty()
                .withMessage('Los apellidos son requeridos')
                .isLength({ min: 2, max: 100 })
                .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
            
            body('dni')
                .notEmpty()
                .withMessage('El DNI es requerido')
                .isLength({ min: 8, max: 20 })
                .withMessage('El DNI debe tener entre 8 y 20 caracteres')
                .matches(/^[0-9]+$/)
                .withMessage('El DNI solo puede contener números'),
            
            body('fecha_nacimiento')
                .optional()
                .isISO8601()
                .withMessage('Fecha de nacimiento inválida'),
            
            body('sexo')
                .optional()
                .isIn(['M', 'F', 'Masculino', 'Femenino'])
                .withMessage('Sexo inválido'),
            
            body('empresa_id')
                .optional()
                .isInt({ min: 1 })
                .withMessage('ID de empresa inválido')
        ];
    }

    // Validaciones para empresas
    static validateCompany() {
        return [
            body('nombre')
                .notEmpty()
                .withMessage('El nombre de la empresa es requerido')
                .isLength({ min: 2, max: 200 })
                .withMessage('El nombre debe tener entre 2 y 200 caracteres'),
            
            body('ruc')
                .notEmpty()
                .withMessage('El RUC es requerido')
                .isLength({ min: 11, max: 11 })
                .withMessage('El RUC debe tener 11 dígitos')
                .matches(/^[0-9]+$/)
                .withMessage('El RUC solo puede contener números'),
            
            body('email')
                .optional()
                .isEmail()
                .withMessage('Debe ser un email válido')
        ];
    }

    // Validaciones para médicos
    static validateDoctor() {
        return [
            body('nombre')
                .notEmpty()
                .withMessage('El nombre es requerido')
                .isLength({ min: 2, max: 100 })
                .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
            
            body('apellidos')
                .notEmpty()
                .withMessage('Los apellidos son requeridos')
                .isLength({ min: 2, max: 100 })
                .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
            
            body('especialidad')
                .notEmpty()
                .withMessage('La especialidad es requerida'),
            
            body('colegiatura')
                .optional()
                .isLength({ min: 3, max: 50 })
                .withMessage('La colegiatura debe tener entre 3 y 50 caracteres')
        ];
    }

    // Validaciones para exámenes
    static validateExam() {
        return [
            body('paciente_id')
                .isInt({ min: 1 })
                .withMessage('ID de paciente inválido'),
            
            body('empresa_id')
                .isInt({ min: 1 })
                .withMessage('ID de empresa inválido'),
            
            body('tipo_examen')
                .notEmpty()
                .withMessage('El tipo de examen es requerido'),
            
            body('fecha_programada')
                .isISO8601()
                .withMessage('Fecha programada inválida'),
            
            body('aptitud')
                .optional()
                .isIn(['apto', 'no_apto', 'observado', 'apto_con_restricciones'])
                .withMessage('Tipo de aptitud inválido')
        ];
    }

    // Validaciones para citas
    static validateAppointment() {
        return [
            body('paciente_id')
                .isInt({ min: 1 })
                .withMessage('ID de paciente inválido'),
            
            body('fecha_cita')
                .isISO8601()
                .withMessage('Fecha de cita inválida'),
            
            body('duracion_minutos')
                .optional()
                .isInt({ min: 15, max: 180 })
                .withMessage('Duración debe estar entre 15 y 180 minutos')
        ];
    }

    // Validaciones para login
    static validateLogin() {
        return [
            body('usuario')
                .notEmpty()
                .withMessage('El usuario es requerido')
        ];
    }

    // Validaciones para parámetros de ID
    static validateId() {
        return [
            param('id')
                .isInt({ min: 1 })
                .withMessage('ID inválido')
        ];
    }
}

module.exports = Validators;