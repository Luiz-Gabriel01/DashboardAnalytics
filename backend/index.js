const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "secretkey";

// 📂 Banco SQLite
const db = new sqlite3.Database("./db.sqlite");

// Criação de tabelas
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    value INTEGER
  )`);

  // ✅ Criar admin/admin se não existir
  const defaultUser = "admin";
  const defaultPass = "admin";

  db.get("SELECT * FROM users WHERE username = ?", [defaultUser], (err, row) => {
    if (!row) {
      const hashed = bcrypt.hashSync(defaultPass, 8);
      db.run("INSERT INTO users (username, password) VALUES (?, ?)", [defaultUser, hashed]);
      console.log("Usuário admin criado (admin/admin)");
    } else {
      console.log("Usuário admin já existe");
    }
  });

  // ✅ Criar métricas iniciais se estiver vazio
  db.get("SELECT COUNT(*) as count FROM metrics", (err, row) => {
    if (row.count === 0) {
      const sampleMetrics = [
        { label: "Vendas", value: 120 },
        { label: "Usuários Ativos", value: 80 },
        { label: "Visitas", value: 200 },
        { label: "Conversões", value: 45 }
      ];
      const stmt = db.prepare("INSERT INTO metrics (label, value) VALUES (?, ?)");
      sampleMetrics.forEach(m => stmt.run(m.label, m.value));
      stmt.finalize();
      console.log("📊 Métricas iniciais adicionadas ao banco");
    }
  });
});

// 📌 Middleware de autenticação
function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// 📌 Registro
app.post("/api/auth/register", (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 8);
  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashed],
    function (err) {
      if (err) return res.status(400).json({ error: "User already exists" });
      const token = jwt.sign({ id: this.lastID, username }, SECRET, { expiresIn: "1h" });
      res.json({ token });
    }
  );
});

// 📌 Login
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  });
});

// 📌 Endpoint de métricas
app.get("/api/metrics", authenticate, (req, res) => {
  db.all("SELECT * FROM metrics", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// 📌 Endpoint de resumo das métricas
app.get("/api/metrics/summary", authenticate, (req, res) => {
  db.all("SELECT * FROM metrics", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });

    const total = rows.reduce((sum, m) => sum + m.value, 0);
    const media = rows.length > 0 ? total / rows.length : 0;
    const max = rows.length > 0 ? Math.max(...rows.map(m => m.value)) : 0;
    const min = rows.length > 0 ? Math.min(...rows.map(m => m.value)) : 0;

    res.json({
      total,
      media,
      max,
      min,
      quantidade: rows.length
    }); const express = require("express");
    const cors = require("cors");
    const jwt = require("jsonwebtoken");
    const sqlite3 = require("sqlite3").verbose();
    const bcrypt = require("bcryptjs");

    const app = express();
    app.use(cors());
    app.use(express.json());

    const SECRET = process.env.JWT_SECRET || "secretkey";

    // 📂 Banco SQLite
    const db = new sqlite3.Database("./db.sqlite");

    // Criação de tabelas e seed inicial
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);

      db.run(`CREATE TABLE IF NOT EXISTS metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    value INTEGER
  )`);

      // Admin default
      const defaultUser = "admin";
      const defaultPass = "admin";
      db.get("SELECT * FROM users WHERE username = ?", [defaultUser], (err, row) => {
        if (!row) {
          const hashed = bcrypt.hashSync(defaultPass, 8);
          db.run("INSERT INTO users (username, password) VALUES (?, ?)", [defaultUser, hashed]);
          console.log("Usuário admin criado (admin/admin)");
        }
      });

      // Seed métricas iniciais
      db.get("SELECT COUNT(*) as count FROM metrics", (err, row) => {
        if (row.count === 0) {
          const sampleMetrics = [
            { label: "Vendas", value: 120 },
            { label: "Usuários Ativos", value: 80 },
            { label: "Visitas", value: 200 },
            { label: "Conversões", value: 45 }
          ];
          const stmt = db.prepare("INSERT INTO metrics (label, value) VALUES (?, ?)");
          sampleMetrics.forEach(m => stmt.run(m.label, m.value));
          stmt.finalize();
          console.log("📊 Métricas iniciais adicionadas ao banco");
        }
      });
    });

    // Middleware de autenticação
    function authenticate(req, res, next) {
      const token = req.headers["authorization"];
      if (!token) return res.status(401).json({ error: "No token" });
      jwt.verify(token.split(" ")[1], SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });
        req.user = decoded;
        next();
      });
    }

    // Registro
    app.post("/api/auth/register", (req, res) => {
      const { username, password } = req.body;
      const hashed = bcrypt.hashSync(password, 8);
      db.run(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashed],
        function (err) {
          if (err) return res.status(400).json({ error: "User already exists" });
          const token = jwt.sign({ id: this.lastID, username }, SECRET, { expiresIn: "1h" });
          res.json({ token });
        }
      );
    });

    // Login
    app.post("/api/auth/login", (req, res) => {
      const { username, password } = req.body;
      db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) return res.status(400).json({ error: "Invalid credentials" });
        if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: "Invalid credentials" });
        const token = jwt.sign({ id: user.id, username }, SECRET, { expiresIn: "1h" });
        res.json({ token });
      });
    });

    // Endpoint de métricas
    app.get("/api/metrics", authenticate, (req, res) => {
      db.all("SELECT * FROM metrics", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        res.json(rows);
      });
    });

    // 🔹 Endpoint de resumo consolidado (sem duplicação)
    app.get("/api/metrics/summary", authenticate, (req, res) => {
      db.all("SELECT value FROM metrics", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB error" });
        const values = rows.map(r => r.value);
        const total = values.reduce((a, b) => a + b, 0);
        const media = values.length > 0 ? Math.round(total / values.length) : 0;
        const max = values.length > 0 ? Math.max(...values) : 0;
        const min = values.length > 0 ? Math.min(...values) : 0;
        res.json({
          total,
          media,
          max,
          min,
          quantidade: values.length
        });
      });
    });

    // Servidor
    app.listen(4000, () => {
      console.log("✅ Backend rodando em http://localhost:4000");
    });

  });
});

// 🔹 Endpoint dashboard atualizado
app.get("/api/dashboard", authenticate, (req, res) => {
  // Primeiro pegamos os usuários
  db.get("SELECT COUNT(*) as userCount FROM users", (err, userRow) => {
    if (err) return res.status(500).json({ error: "DB error" });

    // Agora pegamos as métricas
    db.all("SELECT value FROM metrics", [], (err, metricRows) => {
      if (err) return res.status(500).json({ error: "DB error" });

      const values = metricRows.map(r => r.value);
      const total = values.reduce((a, b) => a + b, 0);
      const media = values.length > 0 ? Math.round(total / values.length) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;

      res.json({
        userCount: userRow.userCount, // ✅ quantidade de usuários
        total,
        media,
        max,
        min
      });
    });
  });
});


// Servidor
app.listen(4000, () => {
  console.log("✅ Backend rodando em http://localhost:4000");
});
