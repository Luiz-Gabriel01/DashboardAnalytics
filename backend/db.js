const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts INTEGER,
    value INTEGER
  )`);

  db.get('SELECT COUNT(*) as c FROM metrics', (err, row) => {
    if (!err && row.c === 0) {
      const now = Date.now();
      const stmt = db.prepare('INSERT INTO metrics (ts, value) VALUES (?,?)');
      for (let i = 0; i < 30; i++) {
        stmt.run(now - (29 - i) * 24 * 3600 * 1000, Math.floor(Math.random() * 200) + 50);
      }
      stmt.finalize();
    }
  });
});

module.exports = db;