const Patient = require('../models/Patient');
const Company = require('../models/Company');

class PatientController {
    // Obtener todos los pacientes
    static async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search, empresa_id } = req.query;
            const user = req.user;

            // Filtros según el rol del usuario
            const filters = {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            if (search) {
                filters.search = search;
            }

            // Si es empresa, solo ver sus pacientes
            if (user.rol === 'empresa' && user.empresa_id) {
                filters.empresa_id = user.empresa_id;
            } else if (empresa_id) {
                filters.empresa_id = empresa_id;
            }

            const patients = await Patient.findAll(filters);
            const total = await Patient.count(filters);

            res.json({
                success: true,
                data: patients,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error obteniendo pacientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener paciente por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const patient = await Patient.findById(id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            // Verificar permisos de empresa
            if (user.rol === 'empresa' && user.empresa_id !== patient.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver este paciente'
                });
            }

            res.json({
                success: true,
                data: patient
            });

        } catch (error) {
            console.error('Error obteniendo paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear nuevo paciente
    static async create(req, res) {
        try {
            const patientData = req.body;
            const user = req.user;

            // Validar datos
            const patient = new Patient(patientData);
            const validationErrors = patient.validate();
            
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: validationErrors
                });
            }

            // Verificar que la empresa existe
            if (patient.empresa_id) {
                const company = await Company.findById(patient.empresa_id);
                if (!company) {
                    return res.status(400).json({
                        success: false,
                        message: 'La empresa especificada no existe'
                    });
                }
            }

            // Verificar DNI único
            const existingPatient = await Patient.findByDNI(patient.dni);
            if (existingPatient) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un paciente con este DNI'
                });
            }

            // Guardar paciente
            const savedPatient = await patient.save();

            res.status(201).json({
                success: true,
                message: 'Paciente creado exitosamente',
                data: savedPatient
            });

        } catch (error) {
            console.error('Error creando paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar paciente
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const user = req.user;

            const patient = await Patient.findById(id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            // Verificar permisos de empresa
            if (user.rol === 'empresa' && user.empresa_id !== patient.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para editar este paciente'
                });
            }

            // Actualizar datos
            Object.assign(patient, updateData);

            // Validar datos actualizados
            const validationErrors = patient.validate();
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: validationErrors
                });
            }

            // Verificar DNI único (excluyendo el paciente actual)
            if (updateData.dni && updateData.dni !== patient.dni) {
                const existingPatient = await Patient.findByDNI(updateData.dni);
                if (existingPatient && existingPatient.id !== patient.id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un paciente con este DNI'
                    });
                }
            }

            // Guardar cambios
            await patient.save();

            res.json({
                success: true,
                message: 'Paciente actualizado exitosamente',
                data: patient
            });

        } catch (error) {
            console.error('Error actualizando paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar paciente (solo administrador)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            // Solo administradores pueden eliminar
            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden eliminar pacientes'
                });
            }

            const patient = await Patient.findById(id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            // Eliminar paciente
            await patient.delete();

            res.json({
                success: true,
                message: 'Paciente eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando paciente:', error);
            
            if (error.message.includes('exámenes asociados')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener exámenes del paciente
    static async getExams(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const patient = await Patient.findById(id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            // Verificar permisos
            if (user.rol === 'empresa' && user.empresa_id !== patient.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver los exámenes de este paciente'
                });
            }

            const exams = await patient.getExams();

            res.json({
                success: true,
                data: exams
            });

        } catch (error) {
            console.error('Error obteniendo exámenes del paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener citas del paciente
    static async getAppointments(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            const patient = await Patient.findById(id);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Paciente no encontrado'
                });
            }

            // Verificar permisos
            if (user.rol === 'empresa' && user.empresa_id !== patient.empresa_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para ver las citas de este paciente'
                });
            }

            const appointments = await patient.getAppointments();

            res.json({
                success: true,
                data: appointments
            });

        } catch (error) {
            console.error('Error obteniendo citas del paciente:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = PatientController;