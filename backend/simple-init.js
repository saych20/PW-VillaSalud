const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Crear directorio si no existe
const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'emos.db');

// Usar base de datos existente o crear nueva

const db = new sqlite3.Database(dbPath);

async function initDB() {
    console.log('🚀 Inicializando Sistema EMOS...');

    // Crear tablas
    db.serialize(() => {
        // Usuarios
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre VARCHAR(200) NOT NULL,
                usuario VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE,
                contraseña VARCHAR(255) NOT NULL,
                rol VARCHAR(20) NOT NULL,
                empresa_id INTEGER,
                activo BOOLEAN DEFAULT 1,
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Empresas
        db.run(`
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

        // Médicos
        db.run(`
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

        // Pacientes
        db.run(`
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
                fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Exámenes
        db.run(`
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
                fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insertar datos de prueba
        console.log('📊 Insertando datos de prueba...');

        // Usuarios
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO usuarios (nombre, usuario, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)`,
            ['Administrador Sistema', 'admin', 'admin@villasalud.com', adminPassword, 'administrador']);

        db.run(`INSERT INTO usuarios (nombre, usuario, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)`,
            ['María López Admisionista', 'admisionista', 'admisionista@villasalud.com', adminPassword, 'admisionista']);

        db.run(`INSERT INTO usuarios (nombre, usuario, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)`,
            ['José Técnico Ramírez', 'tecnico', 'tecnico@villasalud.com', adminPassword, 'tecnico']);

        db.run(`INSERT INTO usuarios (nombre, usuario, email, contraseña, rol, empresa_id) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Ana Empresa García', 'empresa', 'empresa@minera.com', adminPassword, 'empresa', 1]);

        db.run(`INSERT INTO usuarios (nombre, usuario, email, contraseña, rol) VALUES (?, ?, ?, ?, ?)`,
            ['Dr. Luis Médico Fernández', 'medico', 'medico@villasalud.com', adminPassword, 'medico']);

        // Empresas
        db.run(`INSERT INTO empresas (nombre, ruc, direccion, telefono, email, contacto_principal) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Minera del Sur S.A.C.', '20123456789', 'Av. Industrial 123, Lima', '01-234-5678', 'rrhh@mineradelsur.com', 'Ana García Rodríguez']);

        db.run(`INSERT INTO empresas (nombre, ruc, direccion, telefono, email, contacto_principal) VALUES (?, ?, ?, ?, ?, ?)`,
            ['Constructora Lima Norte E.I.R.L.', '20987654321', 'Jr. Construcción 456, Lima', '01-987-6543', 'personal@constructoralima.com', 'Carlos Mendoza Silva']);

        // Médicos
        db.run(`INSERT INTO medicos (nombre, apellidos, especialidad, colegiatura, telefono, email, permisos_examenes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Dr. Luis Alberto', 'Fernández Castillo', 'Medicina Ocupacional', 'CMP-12345', '999-123-456', 'lfernandez@villasalud.com', '["signos_vitales", "oftalmologia", "cardiologia"]']);

        db.run(`INSERT INTO medicos (nombre, apellidos, especialidad, colegiatura, telefono, email, permisos_examenes) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            ['Dra. Carmen Rosa', 'Vega Morales', 'Oftalmología', 'CMP-23456', '999-234-567', 'cvega@villasalud.com', '["oftalmologia"]']);

        // Pacientes
        db.run(`INSERT INTO pacientes (nombre, apellidos, dni, fecha_nacimiento, edad, sexo, telefono, email, direccion, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['Juan Carlos', 'Pérez González', '12345678', '1985-03-15', 39, 'Masculino', '987-654-321', 'jperez@email.com', 'Av. Los Olivos 123, San Juan de Lurigancho', 1]);

        db.run(`INSERT INTO pacientes (nombre, apellidos, dni, fecha_nacimiento, edad, sexo, telefono, email, direccion, empresa_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['María Elena', 'Rodríguez Silva', '23456789', '1990-07-22', 34, 'Femenino', '987-765-432', 'mrodriguez@email.com', 'Jr. Las Flores 456, Villa El Salvador', 1]);

        // Exámenes
        db.run(`INSERT INTO examenes (codigo, paciente_id, empresa_id, tipo_examen, subtipo_examen, componentes_emo, fecha_programada, estado, aptitud, procesado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['EMO-2024-001', 1, 1, 'EMO', 'ingreso', '["signos_vitales", "oftalmologia", "audiometria"]', '2024-01-15 09:00:00', 'completado', 'apto', 1]);

        db.run(`INSERT INTO examenes (codigo, paciente_id, empresa_id, tipo_examen, subtipo_examen, componentes_emo, fecha_programada, estado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            ['EMO-2024-002', 2, 1, 'EMO', 'anual', '["signos_vitales", "oftalmologia"]', '2024-01-16 10:00:00', 'programado']);

        console.log('✅ Base de datos inicializada correctamente');
        console.log('🔑 Credenciales de acceso:');
        console.log('   - Administrador: admin / admin123');
        console.log('   - Admisionista: admisionista / admin123');
        console.log('   - Técnico: tecnico / admin123');
        console.log('   - Empresa: empresa / admin123');
        console.log('   - Médico: medico / admin123');
        console.log('🌐 Servidor listo para iniciar con: npm start');

        db.close();
    });
}

initDB();