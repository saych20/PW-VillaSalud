const database = require('./database');
const { initializeDemoData } = require('../seeders/demo-data');

async function initializeDatabase() {
    try {
        console.log('🚀 Inicializando base de datos del Sistema EMOS...');

        // Crear tablas
        console.log('📋 Creando tablas...');

        // Tabla de usuarios
        await database.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(200) NOT NULL,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                contraseña VARCHAR(255) NOT NULL,
                rol VARCHAR(20) NOT NULL,
                empresa_id INTEGER,
                activo BOOLEAN DEFAULT 1,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id)
            )
        `);

        // Tabla de empresas
        await database.run(`
            CREATE TABLE IF NOT EXISTS empresas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(200) NOT NULL,
                ruc VARCHAR(20) UNIQUE NOT NULL,
                direccion TEXT,
                telefono VARCHAR(20),
                email VARCHAR(100),
                contacto_principal VARCHAR(100),
                activa BOOLEAN DEFAULT 1,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de médicos
        await database.run(`
            CREATE TABLE IF NOT EXISTS medicos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
                apellidos VARCHAR(100) NOT NULL,
                especialidad VARCHAR(100),
                colegiatura VARCHAR(50),
                telefono VARCHAR(20),
                email VARCHAR(100),
                permisos_examenes TEXT,
                activo BOOLEAN DEFAULT 1,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de pacientes
        await database.run(`
            CREATE TABLE IF NOT EXISTS pacientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
                apellidos VARCHAR(100) NOT NULL,
                dni VARCHAR(20) UNIQUE NOT NULL,
                fecha_nacimiento DATE,
                edad INTEGER,
                sexo VARCHAR(10),
                telefono VARCHAR(20),
                email VARCHAR(100),
                direccion TEXT,
                empresa_id INTEGER,
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id)
            )
        `);

        // Tabla de exámenes
        await database.run(`
            CREATE TABLE IF NOT EXISTS examenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                paciente_id INTEGER NOT NULL,
                empresa_id INTEGER NOT NULL,
                tipo_examen VARCHAR(100) NOT NULL,
                subtipo_examen VARCHAR(100),
                componentes_emo TEXT,
                fecha_programada DATETIME NOT NULL,
                fecha_realizada DATETIME,
                tecnico_id INTEGER,
                medico_id INTEGER,
                estado VARCHAR(20) DEFAULT 'programado',
                aptitud VARCHAR(30),
                resultados TEXT,
                observaciones TEXT,
                procesado BOOLEAN DEFAULT 0,
                cupo_dia INTEGER,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
                FOREIGN KEY (empresa_id) REFERENCES empresas(id),
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
                FOREIGN KEY (medico_id) REFERENCES medicos(id)
            )
        `);

        // Tabla de cupos diarios
        await database.run(`
            CREATE TABLE IF NOT EXISTS cupos_diarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha DATE NOT NULL,
                empresa_id INTEGER NOT NULL,
                cupos_utilizados INTEGER DEFAULT 0,
                cupos_maximos INTEGER DEFAULT 20,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id),
                UNIQUE(fecha, empresa_id)
            )
        `);

        // Tabla de interconsultas
        await database.run(`
            CREATE TABLE IF NOT EXISTS interconsultas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paciente_id INTEGER NOT NULL,
                examen_id INTEGER NOT NULL,
                medico_solicitante_id INTEGER NOT NULL,
                medico_especialista_id INTEGER,
                especialidad_requerida VARCHAR(100) NOT NULL,
                motivo TEXT NOT NULL,
                observaciones TEXT,
                estado VARCHAR(20) DEFAULT 'pendiente',
                fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
                fecha_respuesta DATETIME,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
                FOREIGN KEY (examen_id) REFERENCES examenes(id),
                FOREIGN KEY (medico_solicitante_id) REFERENCES medicos(id),
                FOREIGN KEY (medico_especialista_id) REFERENCES medicos(id)
            )
        `);

        // Tabla de citas
        await database.run(`
            CREATE TABLE IF NOT EXISTS citas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                paciente_id INTEGER NOT NULL,
                medico_id INTEGER,
                tipo_examen VARCHAR(100),
                fecha_cita DATETIME NOT NULL,
                duracion_minutos INTEGER DEFAULT 30,
                estado VARCHAR(20) DEFAULT 'programada',
                observaciones TEXT,
                recordatorio_enviado BOOLEAN DEFAULT 0,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
                FOREIGN KEY (medico_id) REFERENCES medicos(id)
            )
        `);

        // Tabla de configuración
        await database.run(`
            CREATE TABLE IF NOT EXISTS configuracion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clave VARCHAR(100) UNIQUE NOT NULL,
                valor TEXT,
                descripcion TEXT,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Tablas creadas exitosamente');

        // Inicializar con datos de prueba
        await initializeDemoData();

        console.log('🎉 Base de datos inicializada completamente');
        console.log('🌐 El servidor puede iniciarse ahora con: npm start');

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };