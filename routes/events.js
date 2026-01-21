import express from 'express';

export function eventsRouter(db) {
  const router = express.Router();

  // Liste des événements
  router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM events ORDER BY date ASC');
    res.json(rows);
  });

  // Un événement
  router.get('/:id', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });
    res.json(rows[0]);
  });

  // Créer un événement
  router.post('/', async (req, res) => {
    const { title, date, location, description, ticket_price, max_places } = req.body;
    if (!title || !date || !location || !ticket_price || !max_places) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const [result] = await db.query(
      `INSERT INTO events (title, date, location, description, ticket_price, max_places)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, date, location, description || '', ticket_price, max_places]
    );

    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  });

  // Modifier un événement
  router.put('/:id', async (req, res) => {
    const { title, date, location, description, ticket_price, max_places } = req.body;

    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const event = rows[0];

    await db.query(
      `UPDATE events
       SET title = ?, date = ?, location = ?, description = ?, ticket_price = ?, max_places = ?
       WHERE id = ?`,
      [
        title ?? event.title,
        date ?? event.date,
        location ?? event.location,
        description ?? event.description,
        ticket_price ?? event.ticket_price,
        max_places ?? event.max_places,
        req.params.id
      ]
    );

    const [updatedRows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
  });

  // Supprimer un événement
  router.delete('/:id', async (req, res) => {
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.status(204).end();
  });

  return router;
}
