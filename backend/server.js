const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importar configuración y base de datos
const config = require('./config/config');
const database = require('./config/database');

// Importar rutas (comentadas temporalmente por errores)
// const authRoutes = require('./routes/auth');
// const pacientesRoutes = require('./routes/pacientes');
// const examenesRoutes = require('./routes/examenes');
// const resultadosRoutes = require('./routes/resultados');
// const empresasRoutes = require('./routes/empresas');
// const interconsultasRoutes = require('./routes/interconsultas');
// const rolesRoutes = require('./routes/roles');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de seguridad
app.use(helmet());

// Compresión
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  }
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas de la API
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patients'));
// app.use('/api/exams', require('./routes/exams'));
// app.use('/api/companies', require('./routes/companies'));
// app.use('/api/doctors', require('./routes/doctors'));
// app.use('/api/resultados', resultadosRoutes);
// app.use('/api/interconsultas', interconsultasRoutes);
// app.use('/api/roles', rolesRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Policlínico Villa Salud SRL',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      pacientes: '/api/pacientes',
      examenes: '/api/examenes',
      resultados: '/api/resultados',
      health: '/api/health'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware global de manejo de errores
app.use((error, req, res, next) => {
  console.error('Error global:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Función para iniciar el servidor
async function startServer() {
  try {
    // Conectar a la base de datos
    console.log('🔄 Conectando a la base de datos...');
    await database.connect();
    console.log('✅ Base de datos conectada');

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado correctamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📋 Documentación API: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('📚 Endpoints disponibles:');
      console.log('   • POST /api/auth/login - Autenticación');
      console.log('   • GET  /api/auth/profile - Perfil de usuario');
      console.log('   • GET  /api/pacientes - Listar pacientes');
      console.log('   • POST /api/pacientes - Crear paciente');
      console.log('   • GET  /api/examenes - Listar exámenes');
      console.log('   • POST /api/examenes - Crear examen');
      console.log('   • PATCH /api/examenes/:id/aptitud - Actualizar aptitud');
      console.log('   • PATCH /api/examenes/:id/seleccion/agregar - Agregar exámenes a selección');
      console.log('   • POST /api/examenes/:id/publicar - Publicar examen a empresa');
      console.log('   • POST /api/resultados/:examenId/:tipoExamen - Completar resultado');
      console.log('   • GET  /api/resultados/pendientes/tecnico - Resultados pendientes');
      console.log('   • GET/POST/PUT/DELETE /api/empresas - Gestión de empresas');
      console.log('   • GET/POST/PUT/DELETE /api/interconsultas - Gestión de interconsultas');
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error.message);
    process.exit(1);
  }
}

// Manejar cierre graceful del servidor
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer();
