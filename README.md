# Policlínico Villa Salud EIRL

## Sistema de Gestión de Exámenes Médicos Ocupacionales

Sistema completo para la gestión de exámenes médicos ocupacionales (EMO) con base de datos MySQL y API REST.

### 🏥 Características del Sistema

- **Gestión de Pacientes**: CRUD completo de pacientes
- **Gestión de Empresas**: Administración de empresas y sus trabajadores
- **Exámenes Médicos Ocupacionales (EMO)**: Sistema completo de programación y seguimiento
- **Tipos de Exámenes**: Ingreso, Retiro, Anual, Recategorización
- **Exámenes Específicos**: Oftalmología, Audiometría, Psicología, EKG, Espirometría
- **Gestión de Resultados**: Completar, editar y visualizar resultados
- **Sistema de Citas**: Programación de consultas e interconsultas
- **Reportes**: Módulo de reportes para admisionista
- **Roles y Permisos**: Admin, Admisionista, Médico, Técnico, Empresa

### 🎨 Diseño

- **Tema**: Fucsia blanqueado llamativo
- **Responsive**: Diseño adaptable a diferentes dispositivos
- **Moderno**: Interfaz intuitiva y profesional

## 🚀 Instalación y Configuración

### Prerrequisitos

1. Node.js (v16+)
2. npm (incluido con Node)
3. Navegador web moderno

Este repositorio soporta SQLite en el backend (configuración por defecto en `backend/database/db.sqlite3`). Si prefieres MySQL puedes reutilizar los scripts pero deberás ajustar `backend/config/database.js` y las variables de entorno.

### 2. Configurar Backend

#### Instalar dependencias

```bash
cd backend
npm install
```

#### Configurar variables de entorno

```bash
# Copiar archivo de configuración
cp config.env.example .env

# Editar .env con tus datos
nano .env
```

**Contenido del archivo `.env`:**

```env
# Configuración del servidor
PORT=3001
NODE_ENV=development

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=policlinico_user
DB_PASSWORD=tu_password_seguro
DB_NAME=policlinico_villa_salud

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:3000

# Archivos
UPLOAD_DIR=uploads/
MAX_FILE_SIZE=10485760
```

#### Ejecutar migración de base de datos (SQLite)

En Windows PowerShell (desde la carpeta `backend`):

```powershell
# Instalar dependencias del backend (una sola vez)
npm install

# Ejecutar migración SQLite (crea/actualiza db.sqlite3 según schema_sqlite.sql)
npm run migrate:sqlite

# (Opcional) Crear usuario admin por defecto
node scripts/create_admin.js
```

#### Iniciar servidor backend

```bash
# Desarrollo (con auto-reload)
   npm run dev

# Producción
npm start
```

### 3. Configurar Frontend

El frontend es estático en `src/` y puede servirse con `http-server`, `live-server` o desde cualquier servidor web.

En Windows PowerShell (desde la raíz del proyecto):

```powershell
# Servir carpeta src en el puerto 3000 usando http-server (si no está instalado, instalar global o usar npx)
npx http-server src -p 3000 -o

# Alternativa con live-server (para desarrollo)
npx live-server src --port=3000 --open=/
```

### Uso rápido sin backend (modo demo utilizando localStorage)

Si quieres probar rápidamente la interfaz y la gestión de exámenes sin levantar el backend, la aplicación incluye una base de datos simulada usando localStorage. Solo sirve la carpeta `src/` con un servidor estático (ej. Live Server de VSCode) o abre las páginas desde `src/views/`.

- Abre `src/views/examenes.html` en el navegador.
- Los datos de ejemplo (usuarios, empresas, pacientes, exámenes, resultados) se inicializan automáticamente.
- Usa las credenciales indicadas en la sección "Credenciales de Prueba" para cambiar de rol (simulado en localStorage).

Para restablecer los datos de demo, limpia las claves `policlinico_*` en el almacenamiento local del navegador o abre la consola y ejecuta:

```javascript
localStorage.clear();
window.location.reload();
```

## 🌐 Acceso al Sistema

### URLs del Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentación API**: http://localhost:3001/api/health

### 🔑 Credenciales de Prueba

| Rol                    | Email                        | Password        | Descripción                      |
| ---------------------- | ---------------------------- | --------------- | --------------------------------- |
| **Admin**        | admin@policlinico.com        | admin123        | Acceso completo al sistema        |
| **Admisionista** | admisionista@policlinico.com | admisionista123 | Gestión de pacientes y empresas  |
| **Médico**      | medico@policlinico.com       | medico123       | Gestión de citas y consultas     |
| **Técnico**     | tecnico@policlinico.com      | tecnico123      | Completar resultados de exámenes |
| **Empresa 1**    | empresa1@empresa.com         | empresa123      | Vista de exámenes de empresa     |
| **Empresa 2**    | empresa2@empresa.com         | empresa123      | Vista de exámenes de empresa     |

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **usuarios**: Usuarios del sistema con roles y permisos
- **empresas**: Empresas que solicitan exámenes EMO
- **pacientes**: Trabajadores que se realizan exámenes
- **examenes**: Exámenes médicos ocupacionales programados
- **resultados_examenes**: Resultados específicos de cada examen
- **citas**: Citas médicas e interconsultas
- **interconsultas**: Referencias a especialistas
- **logs_sistema**: Registro de actividades del sistema

### Tipos de Exámenes EMO

#### Categorías

- **EMO**: Examen Médico Ocupacional
- **Específico**: Examen médico específico

#### Tipos de EMO

- **Ingreso**: Examen para nuevo trabajador
- **Retiro**: Examen para trabajador que se retira
- **Anual**: Examen de seguimiento anual
- **Recategorización**: Examen por cambio de categoría

#### Exámenes Específicos

- **Oftalmología**: Examen de la vista
- **Audiometría**: Examen auditivo
- **Psicología**: Evaluación psicológica
- **EKG**: Electrocardiograma
- **Espirometría**: Prueba de función pulmonar

## 🔧 API REST Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `GET /api/auth/verify` - Verificar token
- `POST /api/auth/logout` - Cerrar sesión

### Pacientes

- `GET /api/pacientes` - Listar pacientes
- `GET /api/pacientes/:id` - Obtener paciente
- `POST /api/pacientes` - Crear paciente
- `PUT /api/pacientes/:id` - Actualizar paciente
- `DELETE /api/pacientes/:id` - Eliminar paciente

### Exámenes

- `GET /api/examenes` - Listar exámenes
- `GET /api/examenes/:id` - Obtener examen
- `POST /api/examenes` - Crear examen
- `PATCH /api/examenes/:id/estado` - Actualizar estado

### Resultados

- `GET /api/resultados/:examenId` - Obtener resultados de examen
- `GET /api/resultados/:examenId/:tipoExamen` - Obtener resultado específico
- `POST /api/resultados/:examenId/:tipoExamen` - Completar resultado
- `GET /api/resultados/pendientes/tecnico` - Resultados pendientes

## 🛠️ Desarrollo

### Estructura del Proyecto

```
EMO/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configuración de base de datos
│   ├── middleware/         # Middleware de autenticación
│   ├── routes/             # Rutas de la API
│   ├── scripts/            # Scripts de migración
│   ├── package.json        # Dependencias del backend
│   └── server.js           # Servidor principal
├── database/               # Esquemas de base de datos
│   └── schema.sql          # Esquema completo
├── src/                    # Frontend
│   ├── assets/            # CSS, JS, imágenes
│   ├── views/             # Páginas HTML
│   ├── index.html         # Página principal
│   └── package.json       # Dependencias del frontend
└── README.md              # Este archivo
```

### Comandos Útiles

#### Backend

```bash
# Instalar dependencias
npm install

# Desarrollo con auto-reload
npm run dev

# Migración de base de datos
npm run migrate

# Producción
npm start
```

#### Frontend

```bash
# Instalar dependencias
npm install

# Desarrollo con live-reload
npm run dev

# Producción
npm start
```

## 🔒 Seguridad

### Configuración de Producción

1. **Cambiar JWT_SECRET** por uno seguro
2. **Configurar HTTPS** en producción
3. **Usar variables de entorno** para datos sensibles
4. **Configurar firewall** para MySQL
5. **Hacer backups regulares** de la base de datos

### Backup de Base de Datos

```bash
# Crear backup
mysqldump -u policlinico_user -p policlinico_villa_salud > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
mysql -u policlinico_user -p policlinico_villa_salud < backup_file.sql
```

## 📝 Notas Importantes

### Funcionalidades Implementadas ✅

- Sistema de autenticación completo
- Gestión de pacientes con validaciones
- Gestión de empresas
- Programación de exámenes EMO
- Sistema de resultados por tipo de examen
- Dashboards por rol de usuario
- API REST completa
- Base de datos MySQL con datos de prueba

### Próximas Funcionalidades 🔄

- Módulo de reportes avanzados
- Generación de PDFs
- Sistema de notificaciones
- Chat interno
- Inventario de equipos
- Backup automático

## 🆘 Soporte

### Problemas Comunes

1. **Error de conexión a MySQL**

   - Verificar que MySQL esté ejecutándose
   - Revisar credenciales en `.env`
   - Verificar permisos de usuario
2. **Error CORS**

   - Verificar `CORS_ORIGIN` en `.env`
   - Asegurar que frontend y backend estén en los puertos correctos
3. **Token inválido**

   - Limpiar localStorage del navegador
   - Verificar `JWT_SECRET` en `.env`

### Logs del Sistema

```bash
# Ver logs del backend
cd backend
npm run dev

# Ver logs de MySQL
sudo tail -f /var/log/mysql/error.log
```

## 📄 Licencia

© 2024 Policlínico Villa Salud EIRL. Todos los derechos reservados.

---

**¡Sistema listo para usar!** 🎉

Para más información o soporte, contactar al equipo de desarrollo.
