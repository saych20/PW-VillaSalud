const database = require('../config/database');

class Patient {
    constructor(data = {}) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.apellidos = data.apellidos;
        this.dni = data.dni;
        this.fecha_nacimiento = data.fecha_nacimiento;
        this.edad = data.edad;
        this.sexo = data.sexo;
        this.telefono = data.telefono;
        this.email = data.email;
        this.direccion = data.direccion;
        this.empresa_id = data.empresa_id;
        this.fecha_registro = data.fecha_registro;
    }

    // Guardar paciente
    async save() {
        try {
            // Calcular edad si se proporciona fecha de nacimiento
            if (this.fecha_nacimiento && !this.edad) {
                this.edad = this.calculateAge();
            }

            if (this.id) {
                // Actualizar paciente existente
                const result = await database.run(`
                    UPDATE pacientes 
                    SET nombre = ?, apellidos = ?, dni = ?, fecha_nacimiento = ?, edad = ?, 
                        sexo = ?, telefono = ?, email = ?, direccion = ?, empresa_id = ?
                    WHERE id = ?
                `, [
                    this.nombre, this.apellidos, this.dni, this.fecha_nacimiento, this.edad,
                    this.sexo, this.telefono, this.email, this.direccion, this.empresa_id, this.id
                ]);
                
                return result.changes > 0;
            } else {
                // Crear nuevo paciente
                const result = await database.run(`
                    INSERT INTO pacientes (nombre, apellidos, dni, fecha_nacimiento, edad, sexo, telefono, email, direccion, empresa_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    this.nombre, this.apellidos, this.dni, this.fecha_nacimiento, this.edad,
                    this.sexo, this.telefono, this.email, this.direccion, this.empresa_id
                ]);
                
                this.id = result.id;
                return this;
            }
        } catch (error) {
            throw new Error(`Error guardando paciente: ${error.message}`);
        }
    }

    // Buscar paciente por ID
    static async findById(id) {
        try {
            const row = await database.get(`
                SELECT p.*, e.nombre as empresa_nombre 
                FROM pacientes p 
                LEFT JOIN empresas e ON p.empresa_id = e.id 
                WHERE p.id = ?
            `, [id]);
            return row ? new Patient(row) : null;
        } catch (error) {
            throw new Error(`Error buscando paciente por ID: ${error.message}`);
        }
    }

    // Buscar paciente por DNI
    static async findByDNI(dni) {
        try {
            const row = await database.get(`
                SELECT p.*, e.nombre as empresa_nombre 
                FROM pacientes p 
                LEFT JOIN empresas e ON p.empresa_id = e.id 
                WHERE p.dni = ?
            `, [dni]);
            return row ? new Patient(row) : null;
        } catch (error) {
            throw new Error(`Error buscando paciente por DNI: ${error.message}`);
        }
    }

    // Obtener todos los pacientes
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT p.*, e.nombre as empresa_nombre 
                FROM pacientes p 
                LEFT JOIN empresas e ON p.empresa_id = e.id 
                WHERE 1=1
            `;
            const params = [];

            if (filters.empresa_id) {
                query += ' AND p.empresa_id = ?';
                params.push(filters.empresa_id);
            }

            if (filters.search) {
                query += ' AND (p.nombre LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (filters.sexo) {
                query += ' AND p.sexo = ?';
                params.push(filters.sexo);
            }

            query += ' ORDER BY p.apellidos ASC, p.nombre ASC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const rows = await database.all(query, params);
            return rows.map(row => new Patient(row));
        } catch (error) {
            throw new Error(`Error obteniendo pacientes: ${error.message}`);
        }
    }

    // Contar pacientes
    static async count(filters = {}) {
        try {
            let query = 'SELECT COUNT(*) as total FROM pacientes WHERE 1=1';
            const params = [];

            if (filters.empresa_id) {
                query += ' AND empresa_id = ?';
                params.push(filters.empresa_id);
            }

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR apellidos LIKE ? OR dni LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            const result = await database.get(query, params);
            return result.total;
        } catch (error) {
            throw new Error(`Error contando pacientes: ${error.message}`);
        }
    }

    // Eliminar paciente
    async delete() {
        try {
            if (!this.id) {
                throw new Error('No se puede eliminar un paciente sin ID');
            }

            // Verificar si tiene exámenes asociados
            const examenes = await database.get(
                'SELECT COUNT(*) as total FROM examenes WHERE paciente_id = ?',
                [this.id]
            );

            if (examenes.total > 0) {
                throw new Error('No se puede eliminar el paciente porque tiene exámenes asociados');
            }

            const result = await database.run('DELETE FROM pacientes WHERE id = ?', [this.id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error eliminando paciente: ${error.message}`);
        }
    }

    // Obtener exámenes del paciente
    async getExams() {
        try {
            const rows = await database.all(`
                SELECT e.*, em.nombre as empresa_nombre, u.nombre as tecnico_nombre, m.nombre as medico_nombre
                FROM examenes e
                LEFT JOIN empresas em ON e.empresa_id = em.id
                LEFT JOIN usuarios u ON e.tecnico_id = u.id
                LEFT JOIN medicos m ON e.medico_id = m.id
                WHERE e.paciente_id = ?
                ORDER BY e.fecha_programada DESC
            `, [this.id]);
            
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo exámenes del paciente: ${error.message}`);
        }
    }

    // Obtener citas del paciente
    async getAppointments() {
        try {
            const rows = await database.all(`
                SELECT c.*, m.nombre as medico_nombre, m.especialidad
                FROM citas c
                LEFT JOIN medicos m ON c.medico_id = m.id
                WHERE c.paciente_id = ?
                ORDER BY c.fecha_cita DESC
            `, [this.id]);
            
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo citas del paciente: ${error.message}`);
        }
    }

    // Calcular edad
    calculateAge() {
        if (!this.fecha_nacimiento) return null;
        
        const today = new Date();
        const birthDate = new Date(this.fecha_nacimiento);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    // Obtener nombre completo
    getFullName() {
        return `${this.nombre} ${this.apellidos}`.trim();
    }

    // Validar datos del paciente
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.apellidos || this.apellidos.trim().length < 2) {
            errors.push('Los apellidos deben tener al menos 2 caracteres');
        }

        if (!this.dni || !/^[0-9]{8}$/.test(this.dni)) {
            errors.push('El DNI debe tener 8 dígitos');
        }

        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('El email no tiene un formato válido');
        }

        if (this.sexo && !['M', 'F', 'Masculino', 'Femenino'].includes(this.sexo)) {
            errors.push('El sexo debe ser M, F, Masculino o Femenino');
        }

        if (this.fecha_nacimiento) {
            const birthDate = new Date(this.fecha_nacimiento);
            const today = new Date();
            if (birthDate > today) {
                errors.push('La fecha de nacimiento no puede ser futura');
            }
        }

        return errors;
    }

    // Buscar pacientes por empresa
    static async findByCompany(empresaId, filters = {}) {
        try {
            let query = `
                SELECT p.*, e.nombre as empresa_nombre 
                FROM pacientes p 
                LEFT JOIN empresas e ON p.empresa_id = e.id 
                WHERE p.empresa_id = ?
            `;
            const params = [empresaId];

            if (filters.search) {
                query += ' AND (p.nombre LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            query += ' ORDER BY p.apellidos ASC, p.nombre ASC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const rows = await database.all(query, params);
            return rows.map(row => new Patient(row));
        } catch (error) {
            throw new Error(`Error obteniendo pacientes por empresa: ${error.message}`);
        }
    }
}

module.exports = Patient;