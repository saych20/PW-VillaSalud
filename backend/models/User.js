const database = require('../config/database');
const BcryptUtils = require('../utils/bcrypt');

class User {
    constructor(data = {}) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.usuario = data.usuario;
        this.email = data.email;
        this.contraseña = data.contraseña;
        this.rol = data.rol;
        this.empresa_id = data.empresa_id;
        this.activo = data.activo !== undefined ? data.activo : true;
        this.fecha_creacion = data.fecha_creacion;
        this.fecha_actualizacion = data.fecha_actualizacion;
    }

    // Crear nuevo usuario
    async save() {
        try {
            // Hash de la contraseña si es nueva
            if (this.contraseña && !this.id) {
                this.contraseña = await BcryptUtils.hashPassword(this.contraseña);
            }

            if (this.id) {
                // Actualizar usuario existente
                const result = await database.run(`
                    UPDATE usuarios 
                    SET nombre = ?, usuario = ?, email = ?, rol = ?, empresa_id = ?, 
                        activo = ?, fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [this.nombre, this.usuario, this.email, this.rol, this.empresa_id, this.activo, this.id]);
                
                return result.changes > 0;
            } else {
                // Crear nuevo usuario
                const result = await database.run(`
                    INSERT INTO usuarios (nombre, usuario, email, contraseña, rol, empresa_id, activo)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [this.nombre, this.usuario, this.email, this.contraseña, this.rol, this.empresa_id, this.activo]);
                
                this.id = result.id;
                return this;
            }
        } catch (error) {
            throw new Error(`Error guardando usuario: ${error.message}`);
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        try {
            const row = await database.get('SELECT * FROM usuarios WHERE id = ?', [id]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario por ID: ${error.message}`);
        }
    }

    // Buscar usuario por nombre de usuario
    static async findByUsername(usuario) {
        try {
            const row = await database.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario por nombre: ${error.message}`);
        }
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        try {
            const row = await database.get('SELECT * FROM usuarios WHERE email = ?', [email]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error buscando usuario por email: ${error.message}`);
        }
    }

    // Obtener todos los usuarios
    static async findAll(filters = {}) {
        try {
            let query = 'SELECT * FROM usuarios WHERE 1=1';
            const params = [];

            if (filters.rol) {
                query += ' AND rol = ?';
                params.push(filters.rol);
            }

            if (filters.activo !== undefined) {
                query += ' AND activo = ?';
                params.push(filters.activo);
            }

            if (filters.empresa_id) {
                query += ' AND empresa_id = ?';
                params.push(filters.empresa_id);
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
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error obteniendo usuarios: ${error.message}`);
        }
    }

    // Contar usuarios
    static async count(filters = {}) {
        try {
            let query = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
            const params = [];

            if (filters.rol) {
                query += ' AND rol = ?';
                params.push(filters.rol);
            }

            if (filters.activo !== undefined) {
                query += ' AND activo = ?';
                params.push(filters.activo);
            }

            const result = await database.get(query, params);
            return result.total;
        } catch (error) {
            throw new Error(`Error contando usuarios: ${error.message}`);
        }
    }

    // Eliminar usuario
    async delete() {
        try {
            if (!this.id) {
                throw new Error('No se puede eliminar un usuario sin ID');
            }

            const result = await database.run('DELETE FROM usuarios WHERE id = ?', [this.id]);
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error eliminando usuario: ${error.message}`);
        }
    }

    // Verificar contraseña
    async verifyPassword(password) {
        try {
            return await BcryptUtils.comparePassword(password, this.contraseña);
        } catch (error) {
            throw new Error(`Error verificando contraseña: ${error.message}`);
        }
    }

    // Cambiar contraseña
    async changePassword(newPassword) {
        try {
            const hashedPassword = await BcryptUtils.hashPassword(newPassword);
            const result = await database.run(
                'UPDATE usuarios SET contraseña = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, this.id]
            );
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error cambiando contraseña: ${error.message}`);
        }
    }

    // Activar/desactivar usuario
    async toggleActive() {
        try {
            this.activo = !this.activo;
            const result = await database.run(
                'UPDATE usuarios SET activo = ?, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ?',
                [this.activo, this.id]
            );
            return result.changes > 0;
        } catch (error) {
            throw new Error(`Error cambiando estado del usuario: ${error.message}`);
        }
    }

    // Obtener datos sin contraseña para respuestas
    toJSON() {
        const { contraseña, ...userData } = this;
        return userData;
    }

    // Validar datos del usuario
    validate() {
        const errors = [];

        if (!this.nombre || this.nombre.trim().length < 2) {
            errors.push('El nombre debe tener al menos 2 caracteres');
        }

        if (!this.usuario || this.usuario.trim().length < 3) {
            errors.push('El usuario debe tener al menos 3 caracteres');
        }

        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('El email no tiene un formato válido');
        }

        if (!this.rol || !['administrador', 'admisionista', 'tecnico', 'empresa', 'medico'].includes(this.rol)) {
            errors.push('El rol no es válido');
        }

        return errors;
    }
}

module.exports = User;