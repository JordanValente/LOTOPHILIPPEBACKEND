import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "Token manquant" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token invalide" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
}

export function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé aux administrateurs" });
  }
  next();
}
