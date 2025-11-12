const Doctor = require('../models/Doctor');

class DoctorController {
    // Obtener todos los médicos
    static async getAll(req, res) {
        try {
            const { page = 1, limit = 10, search, especialidad, activo } = req.query;
            const user = req.user;

            const filters = {
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            };

            if (search) filters.search = search;
            if (especialidad) filters.especialidad = especialidad;
            if (activo !== undefined) filters.activo = activo === 'true';

            const doctors = await Doctor.findAll(filters);
            const total = await Doctor.count(filters);

            res.json({
                success: true,
                data: doctors,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error obteniendo médicos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener médico por ID
    static async getById(req, res) {
        try {
            const { id } = req.params;

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Médico no encontrado'
                });
            }

            res.json({
                success: true,
                data: doctor
            });

        } catch (error) {
            console.error('Error obteniendo médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Crear nuevo médico
    static async create(req, res) {
        try {
            const doctorData = req.body;
            const user = req.user;

            // Solo staff puede crear médicos
            if (!['administrador', 'admisionista', 'tecnico'].includes(user.rol)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para crear médicos'
                });
            }

            const doctor = new Doctor(doctorData);
            const validationErrors = doctor.validate();
            
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: validationErrors
                });
            }

            // Verificar colegiatura única
            const existingDoctor = await Doctor.findByColegiatura(doctor.colegiatura);
            if (existingDoctor) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un médico con esta colegiatura'
                });
            }

            const savedDoctor = await doctor.save();

            res.status(201).json({
                success: true,
                message: 'Médico creado exitosamente',
                data: savedDoctor
            });

        } catch (error) {
            console.error('Error creando médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Actualizar médico
    static async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const user = req.user;

            // Solo staff puede editar médicos
            if (!['administrador', 'admisionista', 'tecnico'].includes(user.rol)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para editar médicos'
                });
            }

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Médico no encontrado'
                });
            }

            // Actualizar datos
            Object.assign(doctor, updateData);

            // Validar datos actualizados
            const validationErrors = doctor.validate();
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: validationErrors
                });
            }

            // Verificar colegiatura única (excluyendo el médico actual)
            if (updateData.colegiatura && updateData.colegiatura !== doctor.colegiatura) {
                const existingDoctor = await Doctor.findByColegiatura(updateData.colegiatura);
                if (existingDoctor && existingDoctor.id !== doctor.id) {
                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un médico con esta colegiatura'
                    });
                }
            }

            await doctor.save();

            res.json({
                success: true,
                message: 'Médico actualizado exitosamente',
                data: doctor
            });

        } catch (error) {
            console.error('Error actualizando médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Eliminar médico (solo administrador)
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;

            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden eliminar médicos'
                });
            }

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Médico no encontrado'
                });
            }

            await doctor.delete();

            res.json({
                success: true,
                message: 'Médico eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error eliminando médico:', error);
            
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

    // Obtener especialidades disponibles
    static async getSpecialties(req, res) {
        try {
            const specialties = [
                'Medicina Ocupacional',
                'Oftalmología',
                'Audiología',
                'Cardiología',
                'Psicología',
                'Neumología',
                'Radiología',
                'Medicina Interna',
                'Traumatología',
                'Odontología'
            ];

            res.json({
                success: true,
                data: specialties
            });

        } catch (error) {
            console.error('Error obteniendo especialidades:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener médicos por especialidad
    static async getBySpecialty(req, res) {
        try {
            const { especialidad } = req.params;

            const doctors = await Doctor.findBySpecialty(especialidad);

            res.json({
                success: true,
                data: doctors
            });

        } catch (error) {
            console.error('Error obteniendo médicos por especialidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Asignar permisos de exámenes a médico
    static async assignExamPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permisos_examenes } = req.body;
            const user = req.user;

            if (user.rol !== 'administrador') {
                return res.status(403).json({
                    success: false,
                    message: 'Solo los administradores pueden asignar permisos'
                });
            }

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Médico no encontrado'
                });
            }

            await doctor.assignExamPermissions(permisos_examenes);

            res.json({
                success: true,
                message: 'Permisos asignados exitosamente',
                data: doctor
            });

        } catch (error) {
            console.error('Error asignando permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }

    // Obtener estadísticas del médico
    static async getStats(req, res) {
        try {
            const { id } = req.params;

            const doctor = await Doctor.findById(id);
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: 'Médico no encontrado'
                });
            }

            const stats = await doctor.getStats();

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error obteniendo estadísticas del médico:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    }
}

module.exports = DoctorController;