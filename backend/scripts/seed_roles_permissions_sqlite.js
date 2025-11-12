const db = require('../config/database');
const rolesConfig = require('../config/roles');

async function seed() {
  try {
    console.log('Iniciando seed de roles y permisos...');

    // Insertar permisos únicos
    const permisoKeys = new Set();
    for (const key of Object.keys(rolesConfig)) {
      const permisos = rolesConfig[key].permisos || [];
      permisos.forEach(p => permisoKeys.add(p));
    }

    const permisoMap = {};
    for (const key of permisoKeys) {
      const res = await db.query('INSERT OR IGNORE INTO permisos (key, descripcion) VALUES (?, ?)', [key, null]);
      // Obtener id
      const row = await db.query('SELECT id FROM permisos WHERE key = ?', [key]);
      permisoMap[key] = row[0].id;
    }

    const roleMap = {};
    for (const roleKey of Object.keys(rolesConfig)) {
      const roleEntry = rolesConfig[roleKey];
      await db.query('INSERT OR IGNORE INTO roles (nombre, descripcion) VALUES (?, ?)', [roleKey, roleEntry.nombre || null]);
      const row = await db.query('SELECT id FROM roles WHERE nombre = ?', [roleKey]);
      roleMap[roleKey] = row[0].id;
    }

    // Asociar permisos a roles
    for (const roleKey of Object.keys(rolesConfig)) {
      const permisos = rolesConfig[roleKey].permisos || [];
      const rid = roleMap[roleKey];
      for (const p of permisos) {
        const pid = permisoMap[p];
        if (pid && rid) {
          await db.query('INSERT OR IGNORE INTO role_permisos (role_id, permiso_id) VALUES (?, ?)', [rid, pid]);
        }
      }
    }

    console.log('Seed completado: roles y permisos cargados.');
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err.message);
    process.exit(1);
  }
}

seed();
