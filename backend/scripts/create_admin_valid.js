const db = require('../config/database');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 10);

    const sql = `INSERT INTO usuarios (email, password, rol, nombre, apellidos, activo, fecha_creacion)
      VALUES (?, ?, 'admin', 'Admin', 'Valid', 1, datetime('now'))`;

    const result = await db.query(sql, ['admin@example.com', hashed]);
    console.log('Usuario creado:', result);
    console.log('Credenciales -> email: admin@example.com  password: admin123');
  } catch (err) {
    console.error('Error creando admin:', err.message);
  } finally {
    process.exit(0);
  }
}

createAdmin();
