const database = require('../config/database');
const BcryptUtils = require('../utils/bcrypt');

// Script de migración para crear todas las tablas del sistema EMOS
async function createTables() {
    try {
        console.log('🔄 Iniciando migración de base de datos...');
        
        // Conectar a la base de datos
        await database.connect();
        
        // Crear tabla de roles
        await database.run(`
            CREATE TABLE IF NOT EXISTS roles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(50) UNIQUE NOT NULL,
                permisos TEXT,
                descripcion TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla roles creada');
        
        // Crear tabla de usuarios
        await database.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(100) NOT NULL,
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
        console.log('✅ Tabla usuarios creada');
        
        // Crear tabla de empresas
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
        console.log('✅ Tabla empresas creada');
        
        // Crear tabla de pacientes
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
        console.log('✅ Tabla pacientes creada');
        
        // Crear tabla de médicos
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
        console.log('✅ Tabla médicos creada');
        
        // Crear tabla de citas
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
        console.log('✅ Tabla citas creada');
        
        // Crear tabla de exámenes
        await database.run(`
            CREATE TABLE IF NOT EXISTS examenes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                codigo VARCHAR(50) UNIQUE NOT NULL,
                paciente_id INTEGER NOT NULL,
                empresa_id INTEGER NOT NULL,
                tipo_examen VARCHAR(100) NOT NULL,
                fecha_programada DATETIME NOT NULL,
                fecha_realizada DATETIME,
                tecnico_id INTEGER,
                medico_id INTEGER,
                estado VARCHAR(20) DEFAULT 'programado',
                aptitud VARCHAR(30),
                resultados TEXT,
                observaciones TEXT,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
                FOREIGN KEY (empresa_id) REFERENCES empresas(id),
                FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
                FOREIGN KEY (medico_id) REFERENCES medicos(id)
            )
        `);
        console.log('✅ Tabla exámenes creada');
        
        // Crear tabla de interconsultas
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
        console.log('✅ Tabla interconsultas creada');
        
        // Crear tabla de configuración
        await database.run(`
            CREATE TABLE IF NOT EXISTS configuracion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                clave VARCHAR(100) UNIQUE NOT NULL,
                valor TEXT,
                descripcion TEXT,
                fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla configuración creada');
        
        // Crear índices para mejorar el rendimiento
        await createIndexes();
        
        console.log('🎉 Migración completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    }
}

async function createIndexes() {
    console.log('🔄 Creando índices...');
    
    try {
        // Índices para usuarios
        await database.run('CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON usuarios(usuario)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)');
        
        // Índices para pacientes
        await database.run('CREATE INDEX IF NOT EXISTS idx_pacientes_dni ON pacientes(dni)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_pacientes_empresa ON pacientes(empresa_id)');
        
        // Índices para empresas
        await database.run('CREATE INDEX IF NOT EXISTS idx_empresas_ruc ON empresas(ruc)');
        
        // Índices para exámenes
        await database.run('CREATE INDEX IF NOT EXISTS idx_examenes_paciente ON examenes(paciente_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_examenes_empresa ON examenes(empresa_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_examenes_estado ON examenes(estado)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_examenes_fecha ON examenes(fecha_programada)');
        
        // Índices para citas
        await database.run('CREATE INDEX IF NOT EXISTS idx_citas_paciente ON citas(paciente_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_citas_medico ON citas(medico_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita)');
        
        // Índices para interconsultas
        await database.run('CREATE INDEX IF NOT EXISTS idx_interconsultas_paciente ON interconsultas(paciente_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_interconsultas_examen ON interconsultas(examen_id)');
        await database.run('CREATE INDEX IF NOT EXISTS idx_interconsultas_estado ON interconsultas(estado)');
        
        console.log('✅ Índices creados');
    } catch (error) {
        console.error('❌ Error creando índices:', error);
        throw error;
    }
}

// Función para insertar datos iniciales
async function seedInitialData() {
    console.log('🔄 Insertando datos iniciales...');
    
    try {
        // Insertar roles por defecto
        const roles = [
            {
                nombre: 'administrador',
                descripcion: 'Acceso total al sistema',
                permisos: JSON.stringify({
                    usuarios: ['create', 'read', 'update', 'delete'],
                    pacientes: ['create', 'read', 'update', 'delete'],
                    empresas: ['create', 'read', 'update', 'delete'],
                    medicos: ['create', 'read', 'update', 'delete'],
                    examenes: ['create', 'read', 'update', 'delete'],
                    citas: ['create', 'read', 'update', 'delete'],
                    interconsultas: ['create', 'read', 'update', 'delete'],
                    configuracion: ['create', 'read', 'update', 'delete']
                })
            },
            {
                nombre: 'admisionista',
                descripcion: 'Gestión de pacientes, empresas y exámenes',
                permisos: JSON.stringify({
                    pacientes: ['create', 'read', 'update'],
                    empresas: ['create', 'read', 'update'],
                    medicos: ['create', 'read', 'update'],
                    examenes: ['create', 'read', 'update'],
                    citas: ['create', 'read', 'update']
                })
            },
            {
                nombre: 'tecnico',
                descripcion: 'Gestión de exámenes y resultados',
                permisos: JSON.stringify({
                    pacientes: ['create', 'read', 'update'],
                    empresas: ['read'],
                    examenes: ['create', 'read', 'update'],
                    interconsultas: ['create', 'read', 'update']
                })
            },
            {
                nombre: 'empresa',
                descripcion: 'Programación de exámenes y consulta de resultados',
                permisos: JSON.stringify({
                    examenes: ['create', 'read'],
                    pacientes: ['read']
                })
            },
            {
                nombre: 'medico',
                descripcion: 'Registro de conclusiones médicas',
                permisos: JSON.stringify({
                    examenes: ['read', 'update'],
                    interconsultas: ['read', 'update'],
                    pacientes: ['read']
                })
            }
        ];
        
        for (const rol of roles) {
            await database.run(
                'INSERT OR IGNORE INTO roles (nombre, descripcion, permisos) VALUES (?, ?, ?)',
                [rol.nombre, rol.descripcion, rol.permisos]
            );
        }
        console.log('✅ Roles insertados');
        
        // Crear usuario administrador por defecto
        const adminPassword = await BcryptUtils.hashPassword('admin123');
        await database.run(`
            INSERT OR IGNORE INTO usuarios (nombre, usuario, email, contraseña, rol) 
            VALUES (?, ?, ?, ?, ?)
        `, ['Administrador', 'admin', 'admin@villasalud.com', adminPassword, 'administrador']);
        console.log('✅ Usuario administrador creado (usuario: admin, contraseña: admin123)');
        
        // Insertar configuraciones por defecto
        const configuraciones = [
            {
                clave: 'sistema_nombre',
                valor: 'Sistema EMOS - Policlínico Villa Salud SRL',
                descripcion: 'Nombre del sistema'
            },
            {
                clave: 'sistema_version',
                valor: '1.0.0',
                descripcion: 'Versión del sistema'
            },
            {
                clave: 'max_examenes_empresa',
                valor: '20',
                descripcion: 'Máximo número de exámenes que puede programar una empresa por sesión'
            },
            {
                clave: 'duracion_cita_default',
                valor: '30',
                descripcion: 'Duración por defecto de las citas en minutos'
            }
        ];
        
        for (const config of configuraciones) {
            await database.run(
                'INSERT OR IGNORE INTO configuracion (clave, valor, descripcion) VALUES (?, ?, ?)',
                [config.clave, config.valor, config.descripcion]
            );
        }
        console.log('✅ Configuraciones insertadas');
        
    } catch (error) {
        console.error('❌ Error insertando datos iniciales:', error);
        throw error;
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    (async () => {
        try {
            await createTables();
            await seedInitialData();
            console.log('🎉 Base de datos inicializada correctamente');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error inicializando base de datos:', error);
            process.exit(1);
        }
    })();
}

module.exports = {
    createTables,
    createIndexes,
    seedInitialData
};