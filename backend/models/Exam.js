const database = require('../config/database');

class Exam {
    constructor(data = {}) {
        this.id = data.id;
        this.codigo = data.codigo;
        this.paciente_id = data.paciente_id;
        this.empresa_id = data.empresa_id;
        this.tipo_examen = data.tipo_examen;
        this.subtipo_examen = data.subtipo_examen;
        this.componentes_emo = data.componentes_emo;
        this.fecha_programada = data.fecha_programada;
        this.fecha_realizada = data.fecha_realizada;
        this.tecnico_id = data.tecnico_id;
        this.medico_id = data.medico_id;
        this.estado = data.estado || 'programado';
        this.aptitud = data.aptitud;
        this.resultados = data.resultados;
        this.observaciones = data.observaciones;
        this.procesado = data.procesado || 0;
        this.cupo_dia = data.cupo_dia;
        this.fecha_creacion = data.fecha_creacion;
    }

    // Guardar examen
    async save() {
        try {
            // Generar código si no existe
            if (!this.codigo && !this.id) {
                this.codigo = await this.generateCode();
            }

            // Convertir datos complejos a JSON si es necesario
            const resultados = typeof this.resultados === 'object' 
                ? JSON.stringify(this.resultados) 
                : this.resultados;
            
            const componentes_emo = typeof this.componentes_emo === 'object'
                ? JSON.stringify(this.componentes_emo)
                : this.componentes_emo;

            if (this.id) {
                // Actualizar examen existente
                const result = await database.run(`
                    UPDATE examenes 
                    SET codigo = ?, paciente_id = ?, empresa_id = ?, tipo_examen = ?, subtipo_examen = ?,
                        componentes_emo = ?, fecha_programada = ?, fecha_realizada = ?, tecnico_id = ?, medico_id = ?, 
                        estado = ?, aptitud = ?, resultados = ?, observaciones = ?, procesado = ?, cupo_dia = ?
                    WHERE id = ?
                `, [
                    this.codigo, this.paciente_id, this.empresa_id, this.tipo_examen, this.subtipo_examen,
                    componentes_emo, this.fecha_programada, this.fecha_realizada, this.tecnico_id, this.medico_id,
                    this.estado, this.aptitud, resultados, this.observaciones, this.procesado, this.cupo_dia, this.id
                ]);
                
                return result.changes > 0;
            } else {
                // Crear nuevo examen
                const result = await database.run(`
                    INSERT INTO examenes (codigo, paciente_id, empresa_id, tipo_examen, subtipo_examen, componentes_emo,
                                        fecha_programada, fecha_realizada, tecnico_id, medico_id, estado, aptitud, 
                                        resultados, observaciones, procesado, cupo_dia)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    this.codigo, this.paciente_id, this.empresa_id, this.tipo_examen, this.subtipo_examen, componentes_emo,
                    this.fecha_programada, this.fecha_realizada, this.tecnico_id, this.medico_id,
                    this.estado, this.aptitud, resultados, this.observaciones, this.procesado, this.cupo_dia
                ]);
                
                this.id = result.id;
                return this;
            }
        } catch (error) {
            throw new Error(`Error guardando examen: ${error.message}`);
        }
    }

    // Generar código único para el examen
    async generateCode() {
        try {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            
            // Obtener el último número de secuencia del mes
            const lastExam = await database.get(`
                SELECT codigo FROM examenes 
                WHERE codigo LIKE ? 
                ORDER BY codigo DESC 
                LIMIT 1
            `, [`EMO-${year}${month}-%`]);
            
            let sequence = 1;
            if (lastExam && lastExam.codigo) {
                const lastSequence = parseInt(lastExam.codigo.split('-')[2]);
                sequence = lastSequence + 1;
            }
            
            return `EMO-${year}${month}-${String(sequence).padStart(4, '0')}`;
        } catch (error) {
            throw new Error(`Error generando código de examen: ${error.message}`);
        }
    }

    // Buscar examen por ID
    static async findById(id) {
        try {
            const row = await database.get(`
                SELECT e.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.dni,
                       em.nombre as empresa_nombre, u.nombre as tecnico_nombre, m.nombre as medico_nombre,
                       m.especialidad as medico_especialidad
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                LEFT JOIN empresas em ON e.empresa_id = em.id
                LEFT JOIN usuarios u ON e.tecnico_id = u.id
                LEFT JOIN medicos m ON e.medico_id = m.id
                WHERE e.id = ?
            `, [id]);
            
            if (row) {
                // Parsear resultados JSON
                if (row.resultados) {
                    try {
                        row.resultados = JSON.parse(row.resultados);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Exam(row);
            }
            return null;
        } catch (error) {
            throw new Error(`Error buscando examen por ID: ${error.message}`);
        }
    }

    // Buscar examen por código
    static async findByCode(codigo) {
        try {
            const row = await database.get(`
                SELECT e.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.dni,
                       em.nombre as empresa_nombre, u.nombre as tecnico_nombre, m.nombre as medico_nombre
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                LEFT JOIN empresas em ON e.empresa_id = em.id
                LEFT JOIN usuarios u ON e.tecnico_id = u.id
                LEFT JOIN medicos m ON e.medico_id = m.id
                WHERE e.codigo = ?
            `, [codigo]);
            
            if (row) {
                if (row.resultados) {
                    try {
                        row.resultados = JSON.parse(row.resultados);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Exam(row);
            }
            return null;
        } catch (error) {
            throw new Error(`Error buscando examen por código: ${error.message}`);
        }
    }

    // Obtener todos los exámenes
    static async findAll(filters = {}) {
        try {
            let query = `
                SELECT e.*, p.nombre as paciente_nombre, p.apellidos as paciente_apellidos, p.dni,
                       em.nombre as empresa_nombre, u.nombre as tecnico_nombre, m.nombre as medico_nombre
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                LEFT JOIN empresas em ON e.empresa_id = em.id
                LEFT JOIN usuarios u ON e.tecnico_id = u.id
                LEFT JOIN medicos m ON e.medico_id = m.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.empresa_id) {
                query += ' AND e.empresa_id = ?';
                params.push(filters.empresa_id);
            }

            if (filters.paciente_id) {
                query += ' AND e.paciente_id = ?';
                params.push(filters.paciente_id);
            }

            if (filters.medico_id) {
                query += ' AND e.medico_id = ?';
                params.push(filters.medico_id);
            }

            if (filters.tecnico_id) {
                query += ' AND e.tecnico_id = ?';
                params.push(filters.tecnico_id);
            }

            if (filters.estado) {
                query += ' AND e.estado = ?';
                params.push(filters.estado);
            }

            if (filters.aptitud) {
                query += ' AND e.aptitud = ?';
                params.push(filters.aptitud);
            }

            if (filters.tipo_examen) {
                query += ' AND e.tipo_examen LIKE ?';
                params.push(`%${filters.tipo_examen}%`);
            }

            if (filters.fecha_desde) {
                query += ' AND DATE(e.fecha_programada) >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                query += ' AND DATE(e.fecha_programada) <= ?';
                params.push(filters.fecha_hasta);
            }

            if (filters.search) {
                query += ' AND (e.codigo LIKE ? OR p.nombre LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
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
            return rows.map(row => {
                if (row.resultados) {
                    try {
                        row.resultados = JSON.parse(row.resultados);
                    } catch (e) {
                        // Si no es JSON válido, mantener como string
                    }
                }
                return new Exam(row);
            });
        } catch (error) {
            throw new Error(`Error obteniendo exámenes: ${error.message}`);
        }
    }

    // Contar exámenes
    static async count(filters = {}) {
        try {
            let query = `
                SELECT COUNT(*) as total 
                FROM examenes e
                LEFT JOIN pacientes p ON e.paciente_id = p.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.empresa_id) {
                query += ' AND e.empresa_id = ?';
                params.push(filters.empresa_id);
            }

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

            if (filters.search) {
                query += ' AND (e.codigo LIKE ? OR p.nombre LIKE ? OR p.apellidos LIKE ? OR p.dni LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            const result = await database.get(query, params);
            return result.total;
        } catch (error) {
            throw new Error(`Error contando exámenes: ${error.message}`);
        }
    }

    // Eliminar examen
    async delete() {
        try {
            if (!this.id) {
                throw new Error('No se puede eliminar un examen sin ID');
            }

            // Verificar si tiene interconsultas asociadas
            const interconsultas = await database.get(
                'SELECT COUNT(*) as total FROM interconsultas WHERE examen_id = ?',
                [this.id]
            );

            if (interconsultas.total > 0) {
                throw new Error('No se puede eliminar el examen porque tiene interconsultas asociadas');
            }

            const result = await database.run('DELETE FROM examenes WHERE id = ?', [this.id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error eliminando examen: ${error.message}`);
        }
    }

    // Cambiar estado del examen
    async changeState(nuevoEstado) {
        try {
            const estadosValidos = ['programado', 'en_proceso', 'completado', 'cancelado'];
            if (!estadosValidos.includes(nuevoEstado)) {
                throw new Error('Estado no válido');
            }

            this.estado = nuevoEstado;
            
            // Si se completa, establecer fecha de realización
            if (nuevoEstado === 'completado' && !this.fecha_realizada) {
                this.fecha_realizada = new Date().toISOString();
            }

            const result = await database.run(
                'UPDATE examenes SET estado = ?, fecha_realizada = ? WHERE id = ?',
                [this.estado, this.fecha_realizada, this.id]
            );
            
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error cambiando estado del examen: ${error.message}`);
        }
    }

    // Establecer aptitud
    async setFitness(aptitud, observaciones = null) {
        try {
            const aptitudesValidas = ['apto', 'no_apto', 'observado', 'apto_con_restricciones'];
            if (!aptitudesValidas.includes(aptitud)) {
                throw new Error('Tipo de aptitud no válido');
            }

            this.aptitud = aptitud;
            if (observaciones) {
                this.observaciones = observaciones;
            }

            const result = await database.run(
                'UPDATE examenes SET aptitud = ?, observaciones = ? WHERE id = ?',
                [this.aptitud, this.observaciones, this.id]
            );
            
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error estableciendo aptitud del examen: ${error.message}`);
        }
    }

    // Agregar resultados
    async addResults(resultados) {
        try {
            // Combinar con resultados existentes si los hay
            let currentResults = {};
            if (this.resultados) {
                if (typeof this.resultados === 'string') {
                    currentResults = JSON.parse(this.resultados);
                } else {
                    currentResults = this.resultados;
                }
            }

            const updatedResults = { ...currentResults, ...resultados };
            this.resultados = updatedResults;

            const result = await database.run(
                'UPDATE examenes SET resultados = ? WHERE id = ?',
                [JSON.stringify(updatedResults), this.id]
            );
            
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error agregando resultados al examen: ${error.message}`);
        }
    }

    // Asignar técnico
    async assignTechnician(tecnicoId) {
        try {
            this.tecnico_id = tecnicoId;
            const result = await database.run(
                'UPDATE examenes SET tecnico_id = ? WHERE id = ?',
                [this.tecnico_id, this.id]
            );
            
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error asignando técnico al examen: ${error.message}`);
        }
    }

    // Asignar médico
    async assignDoctor(medicoId) {
        try {
            this.medico_id = medicoId;
            const result = await database.run(
                'UPDATE examenes SET medico_id = ? WHERE id = ?',
                [this.medico_id, this.id]
            );
            
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error asignando médico al examen: ${error.message}`);
        }
    }

    // Obtener interconsultas del examen
    async getConsultations() {
        try {
            const rows = await database.all(`
                SELECT i.*, ms.nombre as medico_solicitante_nombre, me.nombre as medico_especialista_nombre
                FROM interconsultas i
                LEFT JOIN medicos ms ON i.medico_solicitante_id = ms.id
                LEFT JOIN medicos me ON i.medico_especialista_id = me.id
                WHERE i.examen_id = ?
                ORDER BY i.fecha_solicitud DESC
            `, [this.id]);
            
            return rows;
        } catch (error) {
            throw new Error(`Error obteniendo interconsultas del examen: ${error.message}`);
        }
    }

    // Validar datos del examen
    validate() {
        const errors = [];

        if (!this.paciente_id) {
            errors.push('El ID del paciente es requerido');
        }

        if (!this.empresa_id) {
            errors.push('El ID de la empresa es requerido');
        }

        if (!this.tipo_examen || this.tipo_examen.trim().length < 2) {
            errors.push('El tipo de examen es requerido');
        }

        if (!this.fecha_programada) {
            errors.push('La fecha programada es requerida');
        } else {
            const fechaProgramada = new Date(this.fecha_programada);
            if (isNaN(fechaProgramada.getTime())) {
                errors.push('La fecha programada no es válida');
            }
        }

        if (this.estado && !['programado', 'en_proceso', 'completado', 'cancelado'].includes(this.estado)) {
            errors.push('El estado del examen no es válido');
        }

        if (this.aptitud && !['apto', 'no_apto', 'observado', 'apto_con_restricciones'].includes(this.aptitud)) {
            errors.push('El tipo de aptitud no es válido');
        }

        return errors;
    }

    // Verificar si el examen está completado
    isCompleted() {
        return this.estado === 'completado';
    }

    // Verificar si el examen puede ser editado
    canBeEdited() {
        return ['programado', 'en_proceso'].includes(this.estado);
    }

    // Obtener estadísticas de exámenes
    static async getStats(filters = {}) {
        try {
            const stats = {};

            // Total de exámenes
            const total = await this.count(filters);
            stats.total = total;

            // Exámenes por estado
            let query = 'SELECT estado, COUNT(*) as total FROM examenes';
            const params = [];
            
            if (filters.empresa_id) {
                query += ' WHERE empresa_id = ?';
                params.push(filters.empresa_id);
            }
            
            query += ' GROUP BY estado';
            
            const estadosRows = await database.all(query, params);
            stats.por_estado = {};
            estadosRows.forEach(row => {
                stats.por_estado[row.estado] = row.total;
            });

            // Exámenes por aptitud
            query = 'SELECT aptitud, COUNT(*) as total FROM examenes WHERE aptitud IS NOT NULL';
            const aptitudParams = [];
            
            if (filters.empresa_id) {
                query += ' AND empresa_id = ?';
                aptitudParams.push(filters.empresa_id);
            }
            
            query += ' GROUP BY aptitud';
            
            const aptitudRows = await database.all(query, aptitudParams);
            stats.por_aptitud = {};
            aptitudRows.forEach(row => {
                stats.por_aptitud[row.aptitud] = row.total;
            });

            return stats;
        } catch (error) {
            throw new Error(`Error obteniendo estadísticas de exámenes: ${error.message}`);
        }
    }
}

module.exports = Exam;