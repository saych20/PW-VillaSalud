# Documento de Diseño - Sistema de Gestión de Exámenes Médicos Ocupacionales (EMOS)

## Visión General

El Sistema EMOS implementará una arquitectura MVC (Modelo-Vista-Controlador) con una separación clara entre frontend, backend y base de datos. El sistema será una aplicación web moderna, responsiva y segura que gestione integralmente los exámenes médicos ocupacionales del Policlínico Villa Salud SRL.

## Arquitectura

### Arquitectura General
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │    │     Backend     │    │   Base de Datos │
│   (Vista)       │◄──►│  (Controlador   │◄──►│    (Modelo)     │
│                 │    │   + Modelo)     │    │                 │
│ HTML/CSS/JS     │    │  Node.js +      │    │     SQLite      │
│                 │    │   Express       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Tecnologías Seleccionadas

**Frontend:**
- HTML5, CSS3, JavaScript Vanilla
- Bootstrap 5 para componentes UI
- Chart.js para gráficos del dashboard
- Fetch API para comunicación con backend

**Backend:**
- Node.js con Express.js
- Middleware de autenticación JWT
- Bcrypt para hash de contraseñas
- Multer para manejo de archivos

**Base de Datos:**
- SQLite para desarrollo y despliegue local
- Sequelize ORM para abstracción de base de datos

**Librerías Adicionales:**
- jsPDF para generación de reportes PDF
- Moment.js para manejo de fechas
- Nodemailer para notificaciones por email

## Componentes y Interfaces

### 1. Sistema de Autenticación

**Componente:** AuthController
- Login/Logout
- Validación de sesiones
- Middleware de autorización por roles

**Flujo de Autenticación:**
```
Usuario → Login Form → AuthController → JWT Token → Session Storage → Protected Routes
```

### 2. Gestión de Usuarios y Roles

**Componentes:**
- UserController: CRUD de usuarios
- RoleController: Gestión de roles y permisos
- PermissionMiddleware: Validación de permisos por ruta

**Roles del Sistema:**
```javascript
const ROLES = {
  ADMIN: 'administrador',        // Acceso total, CRUD completo en todos los módulos
  ADMISSION: 'admisionista',     // Gestionar pacientes, empresas, médicos, exámenes (agregar/editar, no eliminar)
  TECHNICIAN: 'tecnico',         // Gestionar pacientes, empresas, exámenes, médicos (agregar/editar, no eliminar)
  COMPANY: 'empresa',            // Solo ver resultados de exámenes y descargar PDF
  DOCTOR: 'medico'               // Acceso limitado según especialidad, registrar conclusiones
};

const PERMISSIONS = {
  CREATE: 'create',
  READ: 'read', 
  UPDATE: 'update',
  DELETE: 'delete'
};

const MODULES = {
  DASHBOARD: 'dashboard',
  CONFIGURACION: 'configuración',
  NOTIFICACIONES: 'notificaciones',
  CHAT: 'chat_interno',
  INVENTARIO: 'inventario_backup',
  CERRAR_SESION: 'cerrar_sesion',
  USUARIOS: 'gestión_usuarios',
  ROLES: 'roles_permisos',
  CITAS: 'gestión_citas',
  PACIENTES: 'gestión_pacientes',
  EMPRESAS: 'gestión_empresas', 
  MEDICOS: 'gestión_médicos',
  EXAMENES: 'gestión_exámenes',
  INTERCONSULTAS: 'hojas_interconsulta'
};

const EXAM_COMPONENTS = {
  SIGNOS_VITALES: 'signos_vitales',
  OFTALMOLOGIA: 'oftalmologia',
  AUDIOMETRIA: 'audiometria',
  CARDIOLOGIA: 'cardiologia',
  PSICOLOGIA: 'psicologia',
  EKG: 'ekg',
  ESPIROMETRIA: 'espirometria',
  LABORATORIO: 'laboratorio',
  ALTURA: 'altura',
  RADIOLOGIA: 'radiologia',
  MUSCULO_ESQUELETICA: 'musculo_esqueletica',
  ODONTOLOGIA: 'odontologia'
};

const APTITUD_TYPES = {
  APTO: 'apto',
  NO_APTO: 'no_apto',
  OBSERVADO: 'observado',
  APTO_CON_RESTRICCIONES: 'apto_con_restricciones'
};
```

### 3. Módulos Principales

#### 3.1 Gestión de Citas
**Componente:** AppointmentController
- CRUD de citas médicas según permisos de rol
- Calendario de disponibilidad de horarios
- Vinculación con pacientes, médicos y tipos de examen
- Sistema de notificaciones y recordatorios

#### 3.2 Gestión de Pacientes
**Componente:** PatientController
- CRUD completo según permisos de rol
- Vinculación con empresas
- Historial de exámenes

#### 3.3 Gestión de Empresas  
**Componente:** CompanyController
- Registro de empresas
- Gestión de trabajadores
- Acceso a resultados de exámenes

#### 3.4 Gestión de Exámenes
**Componente:** ExamController
- Programación de exámenes con límite de 20 cupos por sesión
- Control de cupos y validación de límites
- Estados: Programado, En Proceso, Completado
- Tipos de aptitud: Apto, No Apto, Observado, Apto con Restricciones

#### 3.5 Gestión de Médicos
**Componente:** DoctorController  
- Registro de especialistas
- Asignación de especialidades y permisos específicos
- Control de acceso por especialidad (Oftalmología, Audiometría, etc.)

#### 3.6 Sistema de Interconsultas
**Componente:** ConsultationController
- Creación de interconsultas
- Seguimiento de derivaciones
- Notificaciones a médicos especialistas
- Acceso para Administrador (CRUD completo), Admisionista y Técnico (agregar/editar)

#### 3.7 Gestión de Exámenes Médicos Ocupacionales
**Componente:** ExamComponentController
- Gestión de componentes específicos de EMO
- Control de aptitud laboral (Apto, No Apto, Observado, Apto con restricciones)
- Procesamiento de resultados para descarga PDF
- Validación de exámenes completos y estado "Completado"

#### 3.8 Sistema de Cupos y Programación
**Componente:** SchedulingController
- Control de cupos disponibles por día (máximo 20 para empresas)
- Programación de exámenes con datos de paciente y tipo
- Validación de disponibilidad de fechas y horarios

#### 3.9 Gestión de Componentes EMO Específicos
**Componente:** EMOComponentController
- **Signos Vitales**: Presión arterial, frecuencia cardíaca, temperatura, peso, talla
- **Oftalmología**: Agudeza visual, visión de colores, campo visual
- **Audiometría**: Pruebas de audición y umbrales auditivos
- **Cardiología**: Evaluación cardiovascular y factores de riesgo
- **Psicología**: Evaluación psicológica y aptitud mental
- **EKG**: Electrocardiograma y análisis de ritmo cardíaco
- **Espirometría**: Función pulmonar y capacidad respiratoria
- **Laboratorio**: Análisis clínicos y bioquímicos
- **Altura**: Evaluación para trabajos en altura
- **Radiología**: Estudios radiológicos según requerimientos
- **Músculo Esquelética**: Evaluación osteomuscular y postural
- **Odontología**: Evaluación dental y oral

#### 3.10 Sistema de Aptitud Laboral
**Componente:** FitnessController
- **Apto**: Trabajador apto para el puesto sin restricciones
- **No Apto**: Trabajador no apto para el puesto de trabajo
- **Observado**: Requiere seguimiento médico periódico
- **Apto con Restricciones**: Apto con limitaciones específicas

### 4. Dashboard y Reportes

**Componente:** DashboardController
- Métricas en tiempo real
- Gráficos dinámicos con Chart.js
- Filtros por fecha, médico, empresa

**Componente:** ReportController
- Generación de PDF con jsPDF
- Plantillas personalizables
- Descarga automática

## Modelos de Datos

### Esquema de Base de Datos SQLite

```sql
-- Tabla de citas
CREATE TABLE citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    medico_id INTEGER,
    tipo_examen VARCHAR(100),
    fecha_cita DATETIME NOT NULL,
    duracion_minutos INTEGER DEFAULT 30,
    estado VARCHAR(20) DEFAULT 'programada', -- programada, confirmada, completada, cancelada
    observaciones TEXT,
    recordatorio_enviado BOOLEAN DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    activo BOOLEAN DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de roles y permisos
CREATE TABLE roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    permisos TEXT, -- JSON con permisos por módulo
    descripcion TEXT
);

-- Tabla de pacientes
CREATE TABLE pacientes (
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
);

-- Tabla de empresas
CREATE TABLE empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(200) NOT NULL,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    contacto_principal VARCHAR(100),
    activa BOOLEAN DEFAULT 1,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de médicos
CREATE TABLE medicos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100),
    colegiatura VARCHAR(50),
    telefono VARCHAR(20),
    email VARCHAR(100),
    permisos_examenes TEXT, -- JSON con tipos de exámenes permitidos
    activo BOOLEAN DEFAULT 1,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de exámenes
CREATE TABLE examenes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    paciente_id INTEGER NOT NULL,
    empresa_id INTEGER NOT NULL,
    tipo_examen VARCHAR(100) NOT NULL,
    componentes_emo TEXT, -- JSON con componentes seleccionados
    fecha_programada DATETIME NOT NULL,
    fecha_realizada DATETIME,
    tecnico_id INTEGER,
    medico_id INTEGER,
    estado VARCHAR(20) DEFAULT 'programado', -- programado, en_proceso, completado
    aptitud VARCHAR(30), -- apto, no_apto, observado, apto_con_restricciones
    resultados TEXT, -- JSON con resultados detallados por componente
    observaciones TEXT,
    procesado BOOLEAN DEFAULT 0, -- indica si está listo para descarga PDF
    cupo_dia INTEGER, -- número de cupo del día (1-20)
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (tecnico_id) REFERENCES usuarios(id),
    FOREIGN KEY (medico_id) REFERENCES medicos(id)
);

-- Tabla de cupos diarios
CREATE TABLE cupos_diarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATE NOT NULL,
    empresa_id INTEGER NOT NULL,
    cupos_utilizados INTEGER DEFAULT 0,
    cupos_maximos INTEGER DEFAULT 20,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    UNIQUE(fecha, empresa_id)
);

-- Tabla de interconsultas
CREATE TABLE interconsultas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    examen_id INTEGER NOT NULL,
    medico_solicitante_id INTEGER NOT NULL,
    medico_especialista_id INTEGER,
    especialidad_requerida VARCHAR(100) NOT NULL,
    motivo TEXT NOT NULL,
    observaciones TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente', -- pendiente, en_proceso, completada
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta DATETIME,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY (examen_id) REFERENCES examenes(id),
    FOREIGN KEY (medico_solicitante_id) REFERENCES medicos(id),
    FOREIGN KEY (medico_especialista_id) REFERENCES medicos(id)
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Diseño de Interfaz de Usuario

### Paleta de Colores (CSS Variables)
```css
:root {
    /* Colores principales */
    --primary-color: #a187a5;
    --primary-light: #f8bbd9;
    --primary-dark: #9a9a9a;
    --secondary-color: #a1d3c9;
    --accent-color: #ff4081;
    
    /* Colores neutros */
    --white: #ffffff;
    --light-gray: #f8f9fa;
    --gray: #6c757d;
    --dark-gray: #343a40;
    --black: #212529;
    
    /* Colores de estado */
    --success: #76c3be;
    --warning: #ffc107;
    --danger: #dc3545;
    --info: #d7d649;
    
    /* Efectos */
    --shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    --shadow: 0.5rem 1rem rgba(0, 0, 0, 0.15);
    --shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);
    --border-radius: 0.5rem;
    --border-radius-lg: 1rem;
    --transition: all 0.3s ease;
}
```

### Estructura de Páginas

#### 1. Página de Inicio (Landing Page) - Atractiva y Profesional
- **Header animado** con logo del Policlínico Villa Salud SRL y navegación suave
- **Hero section llamativo** con gradientes corporativos y animaciones CSS
- **Presentación profesional** del sistema EMOS con iconografía médica
- **Sección de características** con tarjetas interactivas y efectos hover
- **Elementos visuales atractivos**: partículas animadas, transiciones suaves
- **Botón de acceso prominente** al sistema con efectos de loading
- **Footer corporativo** con información de contacto y redes sociales
- **Responsive design** optimizado para todos los dispositivos
- **Colores corporativos** consistentes con la paleta del sistema

#### 2. Sistema Principal (Dashboard)
```
┌─────────────────────────────────────────────────────────┐
│                    Header/Navbar                        │
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │            Contenido Principal            │
│   Menú      │                                           │
│             │                                           │
│             │                                           │
├─────────────┴───────────────────────────────────────────┤
│                      Footer                             │
└─────────────────────────────────────────────────────────┘
```

#### 3. Módulos del Menú Lateral por Rol

**Administrador (Acceso Total):**
- Dashboard
- Configuración
- Notificaciones
- Chat Interno
- Inventario/Backup
- Cerrar Sesión
- Gestión de Usuarios
- Roles y Permisos
- Gestión de Citas
- Gestión de Pacientes
- Gestión de Empresas
- Gestión de Médicos
- Gestión de Exámenes
- Hojas de Interconsulta

**Admisionista:**
- Gestión de Pacientes
- Gestión de Exámenes
- Gestión de Empresas
- Gestión de Médicos
- Hojas de Interconsulta

**Técnico:**
- Gestión de Pacientes
- Gestión de Exámenes
- Gestión de Empresas
- Gestión de Médicos
- Hojas de Interconsulta

**Empresa:**
- Gestión de Exámenes (Solo ver resultados)

## Manejo de Errores

### Estrategia de Manejo de Errores

**Frontend:**
- Validación de formularios en tiempo real
- Mensajes de error amigables al usuario
- Manejo de errores de conectividad
- Loading states para operaciones asíncronas

**Backend:**
- Middleware global de manejo de errores
- Logging de errores con niveles (info, warn, error)
- Respuestas HTTP estandarizadas
- Validación de datos de entrada

**Base de Datos:**
- Transacciones para operaciones críticas
- Constraints para integridad de datos
- Backup automático de datos
- Rollback en caso de errores

### Códigos de Respuesta HTTP
```javascript
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};
```

## Estrategia de Testing

### Testing Frontend
- Pruebas unitarias para funciones JavaScript
- Pruebas de integración para formularios
- Pruebas de responsividad en diferentes dispositivos
- Validación de accesibilidad (WCAG 2.1)

### Testing Backend  
- Pruebas unitarias para controladores
- Pruebas de integración para APIs
- Pruebas de autenticación y autorización
- Pruebas de base de datos con datos de prueba

### Testing End-to-End
- Flujos completos de usuario por rol
- Pruebas de generación de PDF
- Pruebas de carga para múltiples usuarios
- Pruebas de seguridad y vulnerabilidades

## Consideraciones de Seguridad

### Autenticación y Autorización
- Tokens JWT con expiración
- Hash de contraseñas con bcrypt
- Validación de permisos en cada endpoint
- Logout seguro con invalidación de tokens

### Protección de Datos
- Validación y sanitización de inputs
- Protección contra SQL Injection
- Encriptación de datos sensibles
- Logs de auditoría para acciones críticas

### Configuración de Seguridad
- Headers de seguridad HTTP
- CORS configurado apropiadamente  
- Rate limiting para APIs
- Validación de archivos subidos

## Consideraciones de Performance

### Optimización Frontend
- Minificación de CSS y JavaScript
- Lazy loading para imágenes
- Caché del navegador para recursos estáticos
- Compresión gzip

### Optimización Backend
- Índices en base de datos para consultas frecuentes
- Paginación para listados grandes
- Caché de consultas frecuentes
- Compresión de respuestas HTTP

### Optimización Base de Datos
- Índices compuestos para consultas complejas
- Normalización apropiada de tablas
- Consultas optimizadas con EXPLAIN
- Limpieza periódica de datos obsoletos