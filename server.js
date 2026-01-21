import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { eventsRouter } from './routes/events.js';
import { reservationsRouter } from './routes/reservations.js';
import { membersRouter } from './routes/members.js';
import { authRouter } from "./routes/auth.js";
import { authRequired, adminOnly } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

async function startServer() {
  const db = await initDb();

  // 🔐 Authentification (login + register)
  app.use("/api/auth", authRouter(db));

  // 👤 Utilisateur connecté : créer + voir SES réservations
  app.use(
    "/api/user/reservations",
    authRequired,
    reservationsRouter(db, { userMode: true })
  );

  // 🛡️ Admin : gérer tout
  app.use(
    "/api/events",
    authRequired,
    adminOnly,
    eventsRouter(db)
  );

  app.use(
    "/api/reservations",
    authRequired,
    adminOnly,
    reservationsRouter(db, { adminMode: true })
  );

  app.use(
    "/api/members",
    authRequired,
    adminOnly,
    membersRouter(db)
  );

  // Test API
  app.get('/', (req, res) => {
    res.json({ message: 'API Loto Association OK' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Erreur au démarrage du serveur :", err);
});
