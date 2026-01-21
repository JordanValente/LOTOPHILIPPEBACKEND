import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import { eventsRouter } from './routes/events.js';
import { reservationsRouter } from './routes/reservations.js';
import { membersRouter } from './routes/members.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = await initDb();

app.use('/api/events', eventsRouter(db));
app.use('/api/reservations', reservationsRouter(db));
app.use('/api/members', membersRouter(db));

app.get('/', (req, res) => {
  res.json({ message: 'API Loto Association OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
