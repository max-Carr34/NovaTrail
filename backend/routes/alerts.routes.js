const express = require('express'); 
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

/* ---------- Middleware: verificar token ---------- */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('❌ Error JWT:', err.name, err.message);
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = decoded; // { userId, nombre, correo, rol }
    next();
  });
}

/* ---------- GET /api/alerts/my-alerts ---------- */
router.get('/my-alerts', verifyToken, (req, res) => {
  const isAdmin = req.user.rol === 'admin';

  const sql = isAdmin
    ? `SELECT * FROM notifications ORDER BY created_at DESC`
    : `
        SELECT n.* 
        FROM notifications n
        JOIN children c ON n.child_id = c.id
        WHERE c.parent_id = ?
        ORDER BY n.created_at DESC
      `;

  const params = isAdmin ? [] : [req.user.userId];

  console.log('📡 [GET] /api/alerts/my-alerts');
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo alertas:', err);
      return res.status(500).json({ error: 'Error en la base de datos', detail: err.message });
    }
    res.json(results || []);
  });
});

/* ---------- POST /api/alerts (solo admin) ---------- */
router.post('/', verifyToken, (req, res) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }

  const { child_id, type, message } = req.body;

  if (!child_id || !type || !message) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validar ENUM type
  const validTypes = ['registro', 'medica', 'comunicacion', 'login'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Tipo de alerta no válido' });
  }

  const sql = `
    INSERT INTO notifications (child_id, user_id, type, message)
    VALUES (?, ?, ?, ?)
  `;
  const values = [child_id, req.user.userId, type, message];

  console.log('📡 [POST] Creando alerta:', values);

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error('❌ Error al insertar alerta:', err);
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    res.status(201).json({
      id: result.insertId,
      child_id,
      user_id: req.user.userId,
      type,
      message,
      created_at: new Date()
    });
  });
});

module.exports = router;
