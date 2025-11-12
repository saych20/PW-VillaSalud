-- SQLite schema para Policlínico Villa Salud (convertido desde MySQL)
PRAGMA foreign_keys = ON;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL,
    nombre TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    empresa_id INTEGER NULL,
    especialidad TEXT NULL,
    telefono TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now'))
);

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    razon_social TEXT NOT NULL,
    ruc TEXT UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    telefono TEXT NOT NULL,
    email TEXT NOT NULL,
    representante_legal TEXT NOT NULL,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now'))
);

-- Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono TEXT NOT NULL,
    numero_afiliacion TEXT NULL,
    preexistencias TEXT NULL,
    email TEXT NULL,
    direccion TEXT NULL,
    genero TEXT NOT NULL,
    empresa_id INTEGER NOT NULL,
    activo INTEGER DEFAULT 1,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabla de examenes
CREATE TABLE IF NOT EXISTS examenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    paciente_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    categoria_examen TEXT NOT NULL,
    tipo_examen TEXT NOT NULL,
    examenes_seleccionados TEXT NOT NULL,
    fecha_programada DATE NOT NULL,
    hora_programada TEXT NOT NULL,
    estado TEXT DEFAULT 'programado',
    aptitud TEXT NULL,
    publicado INTEGER DEFAULT 0,
    observaciones TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);

-- Tabla de resultados_examenes
CREATE TABLE IF NOT EXISTS resultados_examenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    examen_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    tipo_examen TEXT NOT NULL,
    resultado TEXT NOT NULL,
    archivo TEXT NULL,
    completado INTEGER DEFAULT 0,
    fecha_completado DATETIME NULL,
    completado_por INTEGER NULL,
    observaciones TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (examen_id) REFERENCES examenes(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (completado_por) REFERENCES usuarios(id)
);

-- Tabla de citas
CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    paciente_id INTEGER NOT NULL,
    medico_id INTEGER NOT NULL,
    tipo_consulta TEXT NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TEXT NOT NULL,
    estado TEXT DEFAULT 'programada',
    observaciones TEXT NULL,
    diagnostico TEXT NULL,
    tratamiento TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    fecha_actualizacion DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (medico_id) REFERENCES usuarios(id)
);

-- Tabla de interconsultas
CREATE TABLE IF NOT EXISTS interconsultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cita_id INTEGER NOT NULL,
    especialidad TEXT NOT NULL,
    motivo TEXT NOT NULL,
    recomendaciones TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (cita_id) REFERENCES citas(id)
);

-- Tabla de logs
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NULL,
    accion TEXT NOT NULL,
    modulo TEXT NOT NULL,
    descripcion TEXT NULL,
    ip_address TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now'))
);

-- Tabla de roles y permisos (opcional, complementaria a la columna `rol` en usuarios)
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS permisos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    descripcion TEXT NULL,
    fecha_creacion DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS role_permisos (
    role_id INTEGER NOT NULL,
    permiso_id INTEGER NOT NULL,
    PRIMARY KEY (role_id, permiso_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);
