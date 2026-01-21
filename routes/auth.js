import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function authRouter(db) {
  const router = express.Router();

  // Connexion
  router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(401).json({ error: "Utilisateur introuvable" });

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "2h" }
    );

    res.json({ token, role: user.role });
  });

  return router;
}
