ddimport mysql from 'mysql2/promise';



export async function initDb() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'mysql-projetloto.alwaysdata.net',
    user: process.env.DB_USER || 'projetloto_1',   // Vérifie ton user exact !
    password: process.env.DB_PASS || '1234AZERTYF',
    database: process.env.DB_NAME || 'projetloto_1', // Vérifie ton nom de base !
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log("Connexion MySQL réussie !");
  return db;
}


  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT,
      ticket_price REAL NOT NULL,
      max_places INTEGER NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      quantity INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY(event_id) REFERENCES events(id)
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT,
      email TEXT
    );
  `);

  return db;
}
