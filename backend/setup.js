const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    multipleStatements: true
  });

  const createDbAndTables = `
    CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;
    USE \`${DB_NAME}\`;

    CREATE TABLE IF NOT EXISTS cron_task (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message VARCHAR(255) NOT NULL,
      timestamp DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cron_status (
      id INT PRIMARY KEY,
      status VARCHAR(20)
    );

    INSERT INTO cron_status (id, status)
    VALUES (1, 'stopped')
    ON DUPLICATE KEY UPDATE status = 'stopped';
  `;

  try {
    await connection.query(createDbAndTables);
    console.log('Database and tables created or already exist.');
  } catch (err) {
    console.error('Error creating database/tables:', err);
  } finally {
    await connection.end();
  }
}

setupDatabase();
