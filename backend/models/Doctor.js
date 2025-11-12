const database = require('../config/database');

class Doctor {
    constructor(data = {}) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.apellidos = data.apellidos;
        this.especialidad = data.especialidad;
        this.colegiatura = data.colegiatura;
        this.telefono = data.telefono;
        this.email = data.email;
        this.permisos_examenes = data.permisos_examenes;
        this.activo = data.activo !== undefined ? data.activo : true;
        this.fecha_registro = data.fecha_registro;
    }

    // Guardar médico
    async save() {
        try {
            // Convertir permisos a JSON si es un objeto
            const permisos = typeof this.permisos_examenes === 'object' 
                ? JSON.stringify(this.permisos_examenes) 
                : this.permisos_examenes;

            if (this.id) {
                // Actualizar médico existente
                const result = await database.run(`
                    UPDATE medicos 
                    SET nombre = ?, apellidos = ?, especialidad = ?, colegiatura = ?, 
                        telefono = ?, email = ?, permisos_examenes = ?, activo = ?
                    WHERE id = ?
                `, [
                    this.nombre, this.apellidos, this.especialidad, this.colegiatura,
                    this.telefono, this.email, permisos, this.activo, this.id
                ]);
                
                return result.changes > 0;
            } else {
                // Crear nuevo médico
                const result = await database.run(`
                    INSERT INTO medicos (nombre, apellidos, especialidad, colegiatura, telefono, email, permisos_examenes, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    this.nombre, this.apellidos, this.especialidad, this.colegiatura,
                    this.telefono, this.email, permisos, this.activo
                ]);
                
                this.id = result.id;
                return this;
            }
        } catch (error) {
            throw new Error(`Error guardando médico: ${error.message}`);
        }
    }

    // Buscar médico por ID
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM medicos WHERE id = ?', [id]);
            if (row) {
                // Parsear permisos JSON
                if (row.permisos_examenes) {
                    try {
                        row.permisos_examenes = JSON.parse(row.permisos_examenes);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Doctor(row);
            }
            return null;
        } catch (error) {
            throw new Error(`Error buscando médico por ID: ${error.message}`);
        }
    }

    // Buscar médico por colegiatura
    static async findByColegiatura(colegiatura) {
        try {
            const row = await database.get('SELECT * FROM medicos WHERE colegiatura = ?', [colegiatura]);
            if (row) {
                if (row.permisos_examenes) {
                    try {
                        row.permisos_examenes = JSON.parse(row.permisos_examenes);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Doctor(row);
            }
            return null;
        } catch (error) {
            throw new Error(`Error buscando médico por colegiatura: ${error.message}`);
        }
    }

    // Obtener todos los médicos
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM medicos WHERE 1=1';
            const params = [];

            if (filters.activo !== undefined) {
                query += ' AND activo = ?';
                params.push(filters.activo);
            }

            if (filters.especialidad) {
                query += ' AND especialidad LIKE ?';
                params.push(`%${filters.especialidad}%`);
            }

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR apellidos LIKE ? OR colegiatura LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY apellidos ASC, nombre ASC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const rows = await database.all(query, params);
            return rows.map(row => {
                // Parsear permisos JSON
                if (row.permisos_examenes) {
                    try {
                        row.permisos_examenes = JSON.parse(row.permisos_examenes);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Doctor(row);
            });
        } catch (error) {
            throw new Error(`Error obteniendo médicos: ${error.message}`);
        }
    }

    // Contar médicos
    static async count(filters = {}) {
        try {
            let query = 'SELECT COUNT(*) as total FROM medicos WHERE 1=1';
            const params = [];

            if (filters.activo !== undefined) {
                query += ' AND activo = ?';
                params.push(filters.activo);
            }

            if (filters.especialidad) {
                query += ' AND especialidad LIKE ?';
                params.push(`%${filters.especialidad}%`);
            }

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR apellidos LIKE ? OR colegiatura LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const result = await database.get(query, params);
            return result.total;
        } catch (error) {
            throw new Error(`Error contando médicos: ${error.message}`);
        }
    }

    // Eliminar médico
    async delete() {
        try {
            if (!this.id) {
                throw new Error('No se puede eliminar un médico sin ID');
            }

            // Verificar si tiene exámenes asociados
            const examenes = await database.get(
                'SELECT COUNT(*) as total FROM examenes WHERE medico_id = ?',
                [this.id]
            );

            if (examenes.total > 0) {
                throw new Error('No se puede eliminar el médico porque tiene exámenes asociados');
            }

            // Verificar si tiene interconsultas asociadas
            const interconsultas = await database.get(
                'SELECT COUNT(*) as total FROM interconsultas WHERE medico_solicitante_id = ? OR medico_especialista_id = ?',
                [this.id, this.id]
            );

            if (interconsultas.total > 0) {
                throw new Error('No se puede eliminar el médico porque tiene interconsultas asociadas');
            }

            const result = await database.run('DELETE FROM medicos WHERE id = ?', [this.id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error eliminando médico: ${error.message}`);
        }
    }

    // Obtener exámenes del médico
    async getExams(filters = {}) {
        try {
            let query = `
                SELECT e.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, 
                       p.dni, em.nombre as empresa_nombre
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                LEFT JOIN empresas em ON e.empresa_id = em.id
                WHERE e.medico_id = ?
            `;
            const params = [this.id];

            if (filters.estado) {
                query += ' AND e.estado = ?';
                params.push(filters.estado);
            }

            if (filters.fecha_desde) {
                query += ' AND DATE(e.fecha_programada) >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ' AND DATE(e.fecha_programada) <= ?';
                params.push(filters.fecha_hasta);
            }

            query += ' ORDER BY e.fecha_programada DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo exámenes del médico: ${error.message}`);
        }
    }

    // Obtener interconsultas del médico
    async getConsultations(filters = {}) {
        try {
            let query = `
                SELECT i.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos,
                       ms.nombre as medico_solicitante_nombre, me.nombre as medico_especialista_nombre
                FROM interconsultas i
                LEFT JOIN pacientes p ON i.paciente_id = p.id
                LEFT JOIN medicos ms ON i.medico_solicitante_id = ms.id
                LEFT JOIN medicos me ON i.medico_especialista_id = me.id
                WHERE i.medico_solicitante_id = ? OR i.medico_especialista_id = ?
            `;
            const params = [this.id, this.id];

            if (filters.estado) {
                query += ' AND i.estado = ?';
                params.push(filters.estado);
            }

            if (filters.tipo === 'solicitadas') {
                query = query.replace('WHERE i.medico_solicitante_id = ? OR i.medico_especialista_id = ?', 
                                    'WHERE i.medico_solicitante_id = ?');
                params.splice(1, 1); // Remover el segundo parámetro
            } else if (filters.tipo === 'recibidas') {
                query = query.replace('WHERE i.medico_solicitante_id = ? OR i.medico_especialista_id = ?', 
                                    'WHERE i.medico_especialista_id = ?');
                params.splice(0, 1); // Remover el primer parámetro
            }

            query += ' ORDER BY i.fecha_solicitud DESC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo interconsultas del médico: ${error.message}`);
        }
    }

    // Obtener nombre completo
    getFullName() {
        return `Dr. ${this.nombre} ${this.apellidos}`.trim();
    }

    // Verificar si tiene permisos para un tipo de examen
    hasExamPermission(tipoExamen) {
        if (!this.permisos_examenes) return false;
        
        if (typeof this.permisos_examenes === 'string') {
            try {
                const permisos = JSON.parse(this.permisos_examenes);
                return permisos.includes(tipoExamen);
            } catch (e) {
                return false;
            }
        }
        
        if (Array.isArray(this.permisos_examenes)) {
            return this.permisos_examenes.includes(tipoExamen);
        }
        
        return false;
    }

    // Agregar permiso de examen
    async addExamPermission(tipoExamen) {
        try {
            let permisos = [];
            
            if (this.permisos_examenes) {
                if (typeof this.permisos_examenes === 'string') {
                    permisos = JSON.parse(this.permisos_examenes);
                } else if (Array.isArray(this.permisos_examenes)) {
                    permisos = [...this.permisos_examenes];
                }
            }
            
            if (!permisos.includes(tipoExamen)) {
                permisos.push(tipoExamen);
                this.permisos_examenes = permisos;
                
                const result = await database.run(
                    'UPDATE medicos SET permisos_examenes = ? WHERE id = ?',
                    [JSON.stringify(permisos), this.id]
                );
                
                return result.changes > 0;
            }
            
            return true;
        } catch (error) {
            throw new Error(`Error agregando permiso de examen: ${error.message}`);
        }
    }

    // Remover permiso de examen
    async removeExamPermission(tipoExamen) {
        try {
            let permisos = [];
            
            if (this.permisos_examenes) {
                if (typeof this.permisos_examenes === 'string') {
                    permisos = JSON.parse(this.permisos_examenes);
                } else if (Array.isArray(this.permisos_examenes)) {
                    permisos = [...this.permisos_examenes];
                }
            }
            
            const index = permisos.indexOf(tipoExamen);
            if (index > -1) {
                permisos.splice(index, 1);
                this.permisos_examenes = permisos;
                
                const result = await database.run(
                    'UPDATE medicos SET permisos_examenes = ? WHERE id = ?',
                    [JSON.stringify(permisos), this.id]
                );
                
                return result.changes > 0;
            }
            
            return true;
        } catch (error) {
            throw new Error(`Error removiendo permiso de examen: ${error.message}`);
        }
    }

    // Activar/desactivar médico
    async toggleActive() {
        try {
            this.activo = !this.activo;
            const result = await database.run(
                'UPDATE medicos SET activo = ? WHERE id = ?',
                [this.activo, this.id]
            );
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error cambiando estado del médico: ${error.message}`);
        }
    }

    // Validar datos del médico
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.apellidos || this.apellidos.trim().length < 2) {
            errors.push('Los apellidos deben tener al menos 2 caracteres');
        }

        if (!this.especialidad || this.especialidad.trim().length < 2) {
            errors.push('La especialidad es requerida');
        }

        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('El email no tiene un formato válido');
        }

        if (this.colegiatura && this.colegiatura.trim().length < 3) {
            errors.push('La colegiatura debe tener al menos 3 caracteres');
        }

        return errors;
    }

    // Buscar médicos por especialidad
    static async findBySpecialty(especialidad, filters = {}) {
        try {
            let query = 'SELECT * FROM medicos WHERE especialidad LIKE ? AND activo = 1';
            const params = [`%${especialidad}%`];

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR apellidos LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            query += ' ORDER BY apellidos ASC, nombre ASC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(query, params);
            return rows.map(row => {
                if (row.permisos_examenes) {
                    try {
                        row.permisos_examenes = JSON.parse(row.permisos_examenes);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Doctor(row);
            });
        } catch (error) {
            throw new Error(`Error buscando médicos por especialidad: ${error.message}`);
        }
    }
}

module.exports = Doctor;