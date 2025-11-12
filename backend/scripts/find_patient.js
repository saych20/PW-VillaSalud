const db = require('../config/database');

async function findPatient({ email, dni }) {
  try {
    if (!email && !dni) {
      console.error('Proveer email o dni');
      process.exit(1);
    }

    const sql = `SELECT id, nombres, apellidos, dni, email, numero_afiliacion, preexistencias, empresa_id, fecha_creacion FROM pacientes WHERE email = ? OR dni = ?`;
    const rows = await db.query(sql, [email || '', dni || '']);
    if (!rows || rows.length === 0) {
      console.log(JSON.stringify({ success: true, data: [] }, null, 2));
    } else {
      console.log(JSON.stringify({ success: true, data: rows }, null, 2));
    }
  } catch (err) {
    console.error('Error consultando paciente:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

const args = process.argv.slice(2);
const params = {};
args.forEach(a => {
  const [k, v] = a.split('=');
  params[k] = v;
});

findPatient(params);
