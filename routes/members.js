import express from 'express';

export function membersRouter(db) {
  const router = express.Router();

  // Liste des membres
  router.get('/', async (req, res) => {
    const [rows] = await db.query('SELECT * FROM members ORDER BY name ASC');
    res.json(rows);
  });

  // Créer un membre
  router.post('/', async (req, res) => {
    const { name, role, phone, email } = req.body;
    if (!name || !role) return res.status(400).json({ error: 'Missing fields' });

    const [result] = await db.query(
      `INSERT INTO members (name, role, phone, email)
       VALUES (?, ?, ?, ?)`,
      [name, role, phone || '', email || '']
    );

    const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  });

  // Modifier un membre
  router.put('/:id', async (req, res) => {
    const { name, role, phone, email } = req.body;

    const [rows] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    const member = rows[0];

    await db.query(
      `UPDATE members
       SET name = ?, role = ?, phone = ?, email = ?
       WHERE id = ?`,
      [
        name ?? member.name,
        role ?? member.role,
        phone ?? member.phone,
        email ?? member.email,
        req.params.id
      ]
    );

    const [updatedRows] = await db.query('SELECT * FROM members WHERE id = ?', [req.params.id]);
    res.json(updatedRows[0]);
  });

  // Supprimer un membre
  router.delete('/:id', async (req, res) => {
    await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    res.status(204).end();
  });

  return router;
}
