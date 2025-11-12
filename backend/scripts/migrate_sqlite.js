const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const schemaPath = path.join(__dirname, '..', 'database', 'schema_sqlite.sql');
const dbPath = path.join(__dirname, '..', 'database', 'db.sqlite3');

async function run() {
  try {
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found:', schemaPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');

    // Ensure folder exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const db = new sqlite3.Database(dbPath);

    db.serialize(() => {
      db.exec('PRAGMA foreign_keys = ON;');
      db.exec(sql, (err) => {
        if (err) {
          console.error('Error ejecutando schema:', err.message);
          process.exit(1);
        } else {
          console.log('✅ Migración SQLite ejecutada correctamente en', dbPath);
          process.exit(0);
        }
      });
    });

  } catch (error) {
    console.error('Error en migración:', error.message);
    process.exit(1);
  }
}

run();
