import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function authRouter(db) {
  const router = express.Router();

  // REGISTER
  router.post("/register", async (req, res) => {
    const { username, password, email, phone } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username et mot de passe requis" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Nom d'utilisateur déjà pris" });
    }

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (username, password, email, phone, role) VALUES (?, ?, ?, ?, 'user')",
      [username, hash, email || null, phone || null]
    );

    res.status(201).json({ id: result.insertId, username });
  });

  // LOGIN
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username et mot de passe requis" });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      role: user.role,
      username: user.username,
      email: user.email,
      phone: user.phone
    });
  });

  return router;
}
