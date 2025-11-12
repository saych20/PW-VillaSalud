-- Base de datos para Policlínico Villa Salud EIRL
-- Sistema de Gestión de Exámenes Médicos Ocupacionales

CREATE DATABASE IF NOT EXISTS policlinico_villa_salud;
USE policlinico_villa_salud;

-- Tabla de usuarios del sistema
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'admisionista', 'medico', 'tecnico', 'empresa') NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    empresa_id INT NULL,
    especialidad VARCHAR(100) NULL,
    telefono VARCHAR(20) NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rol (rol),
    INDEX idx_empresa (empresa_id),
    INDEX idx_activo (activo)
);

-- Tabla de empresas
CREATE TABLE empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    direccion TEXT NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    representante_legal VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ruc (ruc),
    INDEX idx_activo (activo)
);

-- Tabla de pacientes
CREATE TABLE pacientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    numero_afiliacion VARCHAR(50) NULL,
    preexistencias TEXT NULL,
    email VARCHAR(255) NULL,
    direccion TEXT NULL,
    genero ENUM('M', 'F') NOT NULL,
    empresa_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_dni (dni),
    INDEX idx_empresa (empresa_id),
    INDEX idx_activo (activo)
);

-- Tabla de exámenes médicos ocupacionales
CREATE TABLE examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    paciente_id INT NOT NULL,
    empresa_id INT NOT NULL,
    categoria_examen ENUM('EMO', 'Especifico') NOT NULL,
    tipo_examen ENUM('ingreso', 'retiro', 'anual', 'recategorizacion') NOT NULL,
    examenes_seleccionados JSON NOT NULL, -- Array de tipos de exámenes
    fecha_programada DATE NOT NULL,
    hora_programada TIME NOT NULL,
    estado ENUM('programado', 'en_proceso', 'completado', 'cancelado') DEFAULT 'programado',
    aptitud ENUM('apto', 'no_apto', 'con_restricciones', 'observacion') NULL,
    publicado BOOLEAN DEFAULT FALSE,
    observaciones TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    INDEX idx_paciente (paciente_id),
    INDEX idx_empresa (empresa_id),
    INDEX idx_fecha (fecha_programada),
    INDEX idx_estado (estado)
);

-- Tabla de resultados de exámenes
CREATE TABLE resultados_examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    examen_id INT NOT NULL,
    paciente_id INT NOT NULL,
    tipo_examen ENUM('signos_vitales', 'oftalmologia', 'audiometria', 'cardiologia', 'psicologia', 'ekg', 'espirometria', 'laboratorio', 'altura', 'radiologia', 'musculo_esqueletica', 'odontologia') NOT NULL,
    resultado JSON NOT NULL, -- Datos específicos del examen
    archivo VARCHAR(255) NULL, -- Ruta del archivo si existe
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP NULL,
    completado_por INT NULL,
    observaciones TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (examen_id) REFERENCES examenes(id),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (completado_por) REFERENCES usuarios(id),
    INDEX idx_examen (examen_id),
    INDEX idx_paciente (paciente_id),
    INDEX idx_tipo (tipo_examen),
    INDEX idx_completado (completado)
);

-- Tabla de citas médicas
CREATE TABLE citas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    paciente_id INT NOT NULL,
    medico_id INT NOT NULL,
    tipo_consulta ENUM('consulta', 'interconsulta', 'seguimiento') NOT NULL,
    fecha_cita DATE NOT NULL,
    hora_cita TIME NOT NULL,
    estado ENUM('programada', 'confirmada', 'en_progreso', 'completada', 'cancelada') DEFAULT 'programada',
    observaciones TEXT NULL,
    diagnostico TEXT NULL,
    tratamiento TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (medico_id) REFERENCES usuarios(id),
    INDEX idx_paciente (paciente_id),
    INDEX idx_medico (medico_id),
    INDEX idx_fecha (fecha_cita),
    INDEX idx_estado (estado)
);

-- Tabla de interconsultas
CREATE TABLE interconsultas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cita_id INT NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,
    recomendaciones TEXT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cita_id) REFERENCES citas(id),
    INDEX idx_cita (cita_id)
);

-- Tabla de logs del sistema
CREATE TABLE logs_sistema (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(50) NOT NULL,
    descripcion TEXT NULL,
    ip_address VARCHAR(45) NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_modulo (modulo)
);

-- Insertar datos iniciales

-- Empresas de prueba
INSERT INTO empresas (razon_social, ruc, direccion, telefono, email, representante_legal) VALUES
('Empresa ABC S.A.C.', '20123456789', 'Av. Industrial 123, Lima', '01-2345678', 'contacto@empresaabc.com', 'Roberto Sánchez'),
('Industrias XYZ S.A.', '20987654321', 'Av. Comercial 789, Lima', '01-8765432', 'info@industriasxyz.com', 'Carmen Vega'),
('Constructora DEF S.A.C.', '20555666777', 'Av. Construcción 456, Lima', '01-5556667', 'admin@constructoradef.com', 'Miguel Torres');

-- Usuarios del sistema
INSERT INTO usuarios (email, password, rol, nombre, apellidos, especialidad, telefono) VALUES
('admin@policlinico.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Administrador', 'Sistema', 'Administración', '01-1111111'),
('admisionista@policlinico.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admisionista', 'María', 'González', 'Admisión', '01-2222222'),
('medico@policlinico.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'medico', 'Dr. Carlos', 'Rodríguez', 'Medicina Ocupacional', '01-3333333'),
('tecnico@policlinico.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tecnico', 'Ana', 'López', 'Laboratorio', '01-4444444');

-- Usuarios de empresa
INSERT INTO usuarios (email, password, rol, nombre, apellidos, empresa_id, telefono) VALUES
('empresa1@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empresa', 'Empresa', 'ABC S.A.C.', 1, '01-5555555'),
('empresa2@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empresa', 'Empresa', 'XYZ S.A.', 2, '01-6666666');

-- Pacientes de prueba
INSERT INTO pacientes (codigo, nombres, apellidos, dni, fecha_nacimiento, telefono, email, direccion, genero, empresa_id) VALUES
('PAC001', 'Juan', 'Pérez García', '12345678', '1985-05-15', '987654321', 'juan.perez@email.com', 'Av. Principal 123, Lima', 'M', 1),
('PAC002', 'María', 'López Silva', '87654321', '1990-08-22', '987123456', 'maria.lopez@email.com', 'Jr. Secundario 456, Lima', 'F', 1),
('PAC003', 'Carlos', 'Rodríguez Vega', '11223344', '1988-12-10', '987789123', 'carlos.rodriguez@email.com', 'Av. Norte 789, Lima', 'M', 2),
('PAC004', 'Ana', 'Martínez Torres', '55667788', '1992-03-25', '987456789', 'ana.martinez@email.com', 'Calle Sur 321, Lima', 'F', 2);

-- Exámenes de prueba
INSERT INTO examenes (codigo, paciente_id, empresa_id, categoria_examen, tipo_examen, examenes_seleccionados, fecha_programada, hora_programada, estado, aptitud, publicado, observaciones) VALUES
('EXA001', 1, 1, 'EMO', 'ingreso', '["oftalmologia", "audiometria", "psicologia", "ekg", "espirometria"]', '2024-12-20', '09:00:00', 'programado', NULL, FALSE, 'Examen de ingreso para nuevo empleado'),
('EXA002', 2, 1, 'EMO', 'anual', '["oftalmologia", "audiometria", "psicologia"]', '2024-12-21', '10:30:00', 'en_proceso', NULL, FALSE, 'Examen anual de seguimiento'),
('EXA003', 3, 2, 'EMO', 'ingreso', '["oftalmologia", "audiometria", "ekg", "espirometria"]', '2024-12-22', '14:00:00', 'programado', NULL, FALSE, 'Examen de ingreso para operario'),
('EXA004', 4, 2, 'EMO', 'retiro', '["oftalmologia", "audiometria", "psicologia"]', '2024-12-23', '11:00:00', 'completado', 'apto', TRUE, 'Examen de retiro laboral');

-- Resultados de exámenes de prueba
INSERT INTO resultados_examenes (examen_id, paciente_id, tipo_examen, resultado, completado, fecha_completado, completado_por, observaciones) VALUES
(1, 1, 'oftalmologia', '{"agudeza_visual": "20/20", "presion_ocular": 15, "diagnostico": "Normal"}', FALSE, NULL, NULL, 'Pendiente de evaluación'),
(1, 1, 'audiometria', '{"frecuencias": [250, 500, 1000, 2000, 4000], "oido_derecho": [10, 15, 20, 25, 30], "oido_izquierdo": [12, 18, 22, 28, 32], "diagnostico": "Audición normal"}', TRUE, '2024-12-20 10:30:00', 4, 'Resultados dentro de parámetros normales'),
(2, 2, 'oftalmologia', '{"agudeza_visual": "20/25", "presion_ocular": 18, "diagnostico": "Leve miopía"}', TRUE, '2024-12-21 11:00:00', 4, 'Requiere corrección visual'),
(4, 4, 'oftalmologia', '{"agudeza_visual": "20/20", "presion_ocular": 16, "diagnostico": "Normal"}', TRUE, '2024-12-23 12:00:00', 4, 'Sin alteraciones'),
(4, 4, 'audiometria', '{"frecuencias": [250, 500, 1000, 2000, 4000], "oido_derecho": [15, 20, 25, 30, 35], "oido_izquierdo": [18, 22, 28, 32, 38], "diagnostico": "Pérdida auditiva leve"}', TRUE, '2024-12-23 12:30:00', 4, 'Pérdida auditiva relacionada con edad');

-- Citas de prueba
INSERT INTO citas (codigo, paciente_id, medico_id, tipo_consulta, fecha_cita, hora_cita, estado, observaciones) VALUES
('CIT001', 1, 3, 'consulta', '2024-12-25', '14:00:00', 'programada', 'Consulta de seguimiento post-examen'),
('CIT002', 2, 3, 'interconsulta', '2024-12-26', '09:30:00', 'programada', 'Interconsulta por resultados oftalmológicos'),
('CIT003', 3, 3, 'consulta', '2024-12-27', '16:00:00', 'confirmada', 'Consulta pre-examen');

localStorage.setItem('policlinico_token', '<Pega-aquí-el-token>');
location.reload(); // recarga la página para que use el token
