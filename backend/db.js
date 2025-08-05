require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'panelcp',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Probar conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar al pool de MySQL:', err);
  } else {
    console.log('✅ Pool de conexiones MySQL listo');
    connection.release();
  }
});

module.exports = pool;
