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

  app.use("/api/auth", authRouter(db));

// Routes protégées admin
  app.use("/api/events", authRequired, adminOnly, eventsRouter(db));
  app.use("/api/reservations", authRequired, adminOnly, reservationsRouter(db));
  app.use("/api/members", authRequired, adminOnly, membersRouter(db));




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
