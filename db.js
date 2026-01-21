import mysql from 'mysql2/promise';

export async function initDb() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST || 'mysql-projetloto.alwaysdata.net',
    user: process.env.DB_USER || 'projetloto_1',
    password: process.env.DB_PASS || '1234AZERTYF',
    database: process.env.DB_NAME || 'projetloto_1',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  console.log("Connexion MySQL réussie !");
  return db;
}
