const database = require('../config/database');

class Company {
    constructor(data = {}) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.ruc = data.ruc;
        this.direccion = data.direccion;
        this.telefono = data.telefono;
        this.email = data.email;
        this.contacto_principal = data.contacto_principal;
        this.activa = data.activa !== undefined ? data.activa : true;
        this.fecha_registro = data.fecha_registro;
    }

    // Guardar empresa
    async save() {
        try {
            if (this.id) {
                // Actualizar empresa existente
                const result = await database.run(`
                    UPDATE empresas 
                    SET nombre = ?, ruc = ?, direccion = ?, telefono = ?, email = ?, 
                        contacto_principal = ?, activa = ?
                    WHERE id = ?
                `, [
                    this.nombre, this.ruc, this.direccion, this.telefono, this.email,
                    this.contacto_principal, this.activa, this.id
                ]);
                
                return result.changes > 0;
            } else {
                // Crear nueva empresa
                const result = await database.run(`
                    INSERT INTO empresas (nombre, ruc, direccion, telefono, email, contacto_principal, activa)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    this.nombre, this.ruc, this.direccion, this.telefono, this.email,
                    this.contacto_principal, this.activa
                ]);
                
                this.id = result.id;
                return this;
            }
        } catch (error) {
            throw new Error(`Error guardando empresa: ${error.message}`);
        }
    }

    // Buscar empresa por ID
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM empresas WHERE id = ?', [id]);
            return row ? new Company(row) : null;
        } catch (error) {
            throw new Error(`Error buscando empresa por ID: ${error.message}`);
        }
    }

    // Buscar empresa por RUC
    static async findByRUC(ruc) {
        try {
            const row = await database.get('SELECT * FROM empresas WHERE ruc = ?', [ruc]);
            return row ? new Company(row) : null;
        } catch (error) {
            throw new Error(`Error buscando empresa por RUC: ${error.message}`);
        }
    }

    // Obtener todas las empresas
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM empresas WHERE 1=1';
            const params = [];

            if (filters.activa !== undefined) {
                query += ' AND activa = ?';
                params.push(filters.activa);
            }

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR ruc LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            query += ' ORDER BY nombre ASC';

            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const rows = await database.all(query, params);
            return rows.map(row => new Company(row));
        } catch (error) {
            throw new Error(`Error obteniendo empresas: ${error.message}`);
        }
    }

    // Contar empresas
    static async count(filters = {}) {
        try {
            let query = 'SELECT COUNT(*) as total FROM empresas WHERE 1=1';
            const params = [];

            if (filters.activa !== undefined) {
                query += ' AND activa = ?';
                params.push(filters.activa);
            }

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR ruc LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            const result = await database.get(query, params);
            return result.total;
        } catch (error) {
            throw new Error(`Error contando empresas: ${error.message}`);
        }
    }

    // Eliminar empresa
    async delete() {
        try {
            if (!this.id) {
                throw new Error('No se puede eliminar una empresa sin ID');
            }

            // Verificar si tiene pacientes asociados
            const pacientes = await database.get(
                'SELECT COUNT(*) as total FROM pacientes WHERE empresa_id = ?',
                [this.id]
            );

            if (pacientes.total > 0) {
                throw new Error('No se puede eliminar la empresa porque tiene pacientes asociados');
            }

            // Verificar si tiene exámenes asociados
            const examenes = await database.get(
                'SELECT COUNT(*) as total FROM examenes WHERE empresa_id = ?',
                [this.id]
            );

            if (examenes.total > 0) {
                throw new Error('No se puede eliminar la empresa porque tiene exámenes asociados');
            }

            const result = await database.run('DELETE FROM empresas WHERE id = ?', [this.id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error eliminando empresa: ${error.message}`);
        }
    }

    // Obtener pacientes de la empresa
    async getPatients(filters = {}) {
        try {
            let query = 'SELECT * FROM pacientes WHERE empresa_id = ?';
            const params = [this.id];

            if (filters.search) {
                query += ' AND (nombre LIKE ? OR apellidos LIKE ? OR dni LIKE ?)';
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
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo pacientes de la empresa: ${error.message}`);
        }
    }

    // Obtener exámenes de la empresa
    async getExams(filters = {}) {
        try {
            let query = `
                SELECT e.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.dni,
                       u.nombre as tecnico_nombre, m.nombre as medico_nombre
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                LEFT JOIN usuarios u ON e.tecnico_id = u.id
                LEFT JOIN medicos m ON e.medico_id = m.id
                WHERE e.empresa_id = ?
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

            if (filters.offset) {
                query += ' OFFSET ?';
                params.push(filters.offset);
            }

            const rows = await database.all(query, params);
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo exámenes de la empresa: ${error.message}`);
        }
    }

    // Obtener estadísticas de la empresa
    async getStats() {
        try {
            const stats = {};

            // Total de pacientes
            const pacientes = await database.get(
                'SELECT COUNT(*) as total FROM pacientes WHERE empresa_id = ?',
                [this.id]
            );
            stats.total_pacientes = pacientes.total;

            // Total de exámenes
            const examenes = await database.get(
                'SELECT COUNT(*) as total FROM examenes WHERE empresa_id = ?',
                [this.id]
            );
            stats.total_examenes = examenes.total;

            // Exámenes por estado
            const examenesPorEstado = await database.all(`
                SELECT estado, COUNT(*) as total 
                FROM examenes 
                WHERE empresa_id = ? 
                GROUP BY estado
            `, [this.id]);
            
            stats.examenes_por_estado = {};
            examenesPorEstado.forEach(row => {
                stats.examenes_por_estado[row.estado] = row.total;
            });

            // Exámenes por aptitud
            const examenesPorAptitud = await database.all(`
                SELECT aptitud, COUNT(*) as total 
                FROM examenes 
                WHERE empresa_id = ? AND aptitud IS NOT NULL 
                GROUP BY aptitud
            `, [this.id]);
            
            stats.examenes_por_aptitud = {};
            examenesPorAptitud.forEach(row => {
                stats.examenes_por_aptitud[row.aptitud] = row.total;
            });

            // Exámenes del mes actual
            const examenesMesActual = await database.get(`
                SELECT COUNT(*) as total 
                FROM examenes 
                WHERE empresa_id = ? 
                AND strftime('%Y-%m', fecha_programada) = strftime('%Y-%m', 'now')
            `, [this.id]);
            stats.examenes_mes_actual = examenesMesActual.total;

            return stats;
        } catch (error) {
            throw new Error(`Error obteniendo estadísticas de la empresa: ${error.message}`);
        }
    }

    // Activar/desactivar empresa
    async toggleActive() {
        try {
            this.activa = !this.activa;
            const result = await database.run(
                'UPDATE empresas SET activa = ? WHERE id = ?',
                [this.activa, this.id]
            );
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error cambiando estado de la empresa: ${error.message}`);
        }
    }

    // Validar datos de la empresa
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre de la empresa debe tener al menos 2 caracteres');
        }

        if (!this.ruc || !/^[0-9]{11}$/.test(this.ruc)) {
            errors.push('El RUC debe tener 11 dígitos');
        }

        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('El email no tiene un formato válido');
        }

        return errors;
    }

    // Verificar si puede programar más exámenes
    async canScheduleMoreExams(fecha = null) {
        try {
            const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
            
            const examenes = await database.get(`
                SELECT COUNT(*) as total 
                FROM examenes 
                WHERE empresa_id = ? 
                AND DATE(fecha_programada) = ? 
                AND estado != 'cancelado'
            `, [this.id, fechaConsulta]);

            const maxExamenes = 20; // Límite configurado
            return examenes.total < maxExamenes;
        } catch (error) {
            throw new Error(`Error verificando límite de exámenes: ${error.message}`);
        }
    }

    // Obtener número de exámenes programados para una fecha
    async getScheduledExamsCount(fecha = null) {
        try {
            const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
            
            const result = await database.get(`
                SELECT COUNT(*) as total 
                FROM examenes 
                WHERE empresa_id = ? 
                AND DATE(fecha_programada) = ? 
                AND estado != 'cancelado'
            `, [this.id, fechaConsulta]);

            return result.total;
        } catch (error) {
            throw new Error(`Error obteniendo número de exámenes programados: ${error.message}`);
        }
    }
}

module.exports = Company;