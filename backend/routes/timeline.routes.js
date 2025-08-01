const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

/* ---------- Middleware para verificar token ---------- */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
}

/* ✅ GET /api/timeline → Lista de niños (SOLO admin o staff) */
router.get('/', verifyToken, (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'staff') {
    return res.status(403).json({ error: 'Acceso restringido a admin o staff' });
  }

  const sql = `
    SELECT 
      c.id AS child_id,
      CONCAT(c.first_name, ' ', c.last_name) AS childName,
      YEAR(CURDATE()) - c.birth_year AS childAge,
      u.nombre AS parentName
    FROM children c
    JOIN usuarios u ON c.parent_id = u.id
    ORDER BY c.first_name ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error obteniendo niños:', err);
      return res.status(500).json({ message: 'Error al obtener lista de niños' });
    }
    res.json(results);
  });
});

/* ✅ GET /api/timeline/:childId → Obtener eventos de un niño */
router.get('/:childId', verifyToken, (req, res) => {
  const { childId } = req.params;

  if (req.user.rol === 'usuario') {
    // Validar que el hijo pertenece al padre
    const checkSql = 'SELECT id FROM children WHERE id = ? AND parent_id = ?';
    db.query(checkSql, [childId, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'No autorizado' });
      }
      getTimeline();
    });
  } else {
    getTimeline();
  }

  function getTimeline() {
    const sql = `
      SELECT t.id, t.child_id, t.title, t.description, t.event_date, t.created_at, t.creator_id
      FROM timeline t
      WHERE t.child_id = ?
      ORDER BY t.event_date ASC
    `;

    db.query(sql, [childId], (err, results) => {
      if (err) {
        console.error('❌ Error obteniendo timeline:', err);
        return res.status(500).json({ message: 'Error al obtener la línea de tiempo' });
      }
      res.json(results);
    });
  }
});

/* ✅ POST /api/timeline → Agregar nuevo evento */
router.post('/', verifyToken, (req, res) => {
  const { child_id, title, description, event_date } = req.body;

  if (!child_id || !title || !description || !event_date) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  if (req.user.rol === 'usuario') {
    // Validar que el hijo pertenece al padre
    const checkSql = 'SELECT id FROM children WHERE id = ? AND parent_id = ?';
    db.query(checkSql, [child_id, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'No autorizado para agregar evento a este niño' });
      }
      insertEvent();
    });
  } else {
    insertEvent();
  }

  function insertEvent() {
    const sql = `
      INSERT INTO timeline (child_id, title, description, event_date, creator_id) 
      VALUES (?, ?, ?, ?, ?)
    `;

    // Guardamos el usuario que crea el evento (admin o staff)
    db.query(sql, [child_id, title, description, event_date, req.user.userId], (err) => {
      if (err) {
        console.error('❌ Error agregando evento:', err);
        return res.status(500).json({ message: 'Error al agregar evento' });
      }
      res.json({ message: 'Evento agregado correctamente' });
    });
  }
});

module.exports = router;
