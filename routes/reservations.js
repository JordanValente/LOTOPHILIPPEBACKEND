import express from 'express';

export function reservationsRouter(db, options = {}) {
  const router = express.Router();
  const isAdminMode = options.adminMode === true;
  const isUserMode = options.userMode === true;

  // GET
  router.get('/', async (req, res) => {
    // ADMIN : toutes les réservations + infos user
    if (isAdminMode) {
      const [result] = await db.query(`
        SELECT r.*, u.username, u.email AS user_email, u.phone AS user_phone
        FROM reservations r
               LEFT JOIN users u ON r.user_id = u.id
        ORDER BY r.created_at DESC
      `);
      return res.json(result);
    }

    // USER : ses réservations
    if (isUserMode) {
      const userId = req.user.id;
      const [result] = await db.query(
        `SELECT * FROM reservations WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
      return res.json(result);
    }

    // Public (si jamais utilisé)
    const [result] = await db.query(
      `SELECT * FROM reservations ORDER BY created_at DESC`
    );
    res.json(result);
  });

  // POST
  router.post('/', async (req, res) => {
    const { event_id, quantity, name, phone, email } = req.body;

    if (!event_id || !quantity) {
      return res.status(400).json({ error: "event_id et quantity requis" });
    }

    const [eventRows] = await db.query(
      `SELECT * FROM events WHERE id = ?`,
      [event_id]
    );
    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const created_at = new Date();

    // USER MODE : lié au compte
    if (isUserMode) {
      const userId = req.user.id;

      const [result] = await db.query(
        `INSERT INTO reservations (event_id, quantity, user_id, status, created_at)
         VALUES (?, ?, ?, 'pending', ?)`,
        [event_id, quantity, userId, created_at]
      );

      const [rows] = await db.query(
        `SELECT * FROM reservations WHERE id = ?`,
        [result.insertId]
      );
      return res.status(201).json(rows[0]);
    }

    // PUBLIC : invité
    if (!name) {
      return res.status(400).json({ error: "name requis pour une réservation invitée" });
    }

    const [result] = await db.query(
      `INSERT INTO reservations (event_id, name, phone, email, quantity, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [event_id, name, phone || '', email || '', quantity, created_at]
    );

    const [rows] = await db.query(
      `SELECT * FROM reservations WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  });

  // PATCH statut (admin only)
  router.patch('/:id/status', async (req, res) => {
    if (!isAdminMode) {
      return res.status(403).json({ error: "Admins only" });
    }

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Missing status" });

    const [rows] = await db.query(
      `SELECT * FROM reservations WHERE id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    await db.query(
      `UPDATE reservations SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );

    const [updatedRows] = await db.query(
      `SELECT * FROM reservations WHERE id = ?`,
      [req.params.id]
    );
    res.json(updatedRows[0]);
  });

  return router;
}
