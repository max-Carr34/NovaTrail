const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'maxi1407',
  database: 'panelcp',
  waitForConnections: true,
  connectionLimit: 10,  // Número máximo de conexiones simultáneas
  queueLimit: 0         // Sin límite de cola
});

// Probar conexión inicial
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error al conectar al pool de MySQL:', err);
  } else {
    console.log('✅ Pool de conexiones MySQL listo');
    connection.release(); // Liberar conexión al pool
  }
});

module.exports = pool;
