const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO usuarios (email, password, rol, nombre, apellidos, activo, fecha_creacion)
      VALUES (?, ?, 'admin', 'Admin', 'Local', 1, datetime('now'))`;

    const result = await db.query(sql, ['admin@local', hashed]);
    console.log('Usuario creado:', result);
    console.log('Credenciales -> email: admin@local  password: admin123');
  } catch (err) {
    console.error('Error creando admin:', err.message);
  } finally {
    // no cerrar db porque es manejado por el config
    process.exit(0);
  }
}

createAdmin();
