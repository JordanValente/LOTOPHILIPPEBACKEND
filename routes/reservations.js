import express from 'express';

export function reservationsRouter(db) {
  const router = express.Router();

  // Liste des réservations (optionnel: filtrer par event_id)
  router.get('/', async (req, res) => {
    const { event_id } = req.query;
    let rows;

    if (event_id) {
      [rows] = await db.query(
        'SELECT * FROM reservations WHERE event_id = ? ORDER BY created_at DESC',
        [event_id]
      );
    } else {
      [rows] = await db.query('SELECT * FROM reservations ORDER BY created_at DESC');
    }

    res.json(rows);
  });

  // Créer une réservation (public)
  router.post('/', async (req, res) => {
    const { event_id, name, phone, email, quantity } = req.body;
    if (!event_id || !name || !quantity) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const [eventRows] = await db.query('SELECT * FROM events WHERE id = ?', [event_id]);
    if (eventRows.length === 0) return res.status(404).json({ error: 'Event not found' });

    const created_at = new Date();

    const [result] = await db.query(
      `INSERT INTO reservations (event_id, name, phone, email, quantity, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [event_id, name, phone || '', email || '', quantity, created_at]
    );

    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  });

  // Modifier le statut (admin)
  router.patch('/:id/status', async (req, res) => {
    const { status } = req.body; // pending, confirmed, paid, cancelled
    if (!status) return res.status(400).json({ error: 'Missing status' });

    const [rows] = await db.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });

    await db.query('UPDATE reservations SET status = ? WHERE id = ?', [status, req.params.id]);

    const [updatedRows] = await db.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
  });

  return router;
}
