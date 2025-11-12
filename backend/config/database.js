const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../database/emos.db');
        this.init();
    }

    init() {
        // Crear directorio de base de datos si no existe
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Conectar automáticamente
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('Error conectando a SQLite:', err.message);
            } else {
                console.log('Conectado a la base de datos SQLite');
                this.enableForeignKeys();
            }
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
            } else {
                this.init();
                setTimeout(() => resolve(this.db), 100);
            }
        });
    }

    enableForeignKeys() {
        this.db.run('PRAGMA foreign_keys = ON');
    }

    getDb() {
        return this.db;
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error cerrando la base de datos:', err.message);
                } else {
                    console.log('Conexión a la base de datos cerrada');
                }
            });
        }
    }

    // Método para ejecutar consultas con promesas
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Método para obtener un registro
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Método para obtener múltiples registros
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

module.exports = new Database();