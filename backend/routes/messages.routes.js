const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

// ✅ Middleware para verificar token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded; // { userId, nombre, correo, rol }
    next();
  });
}

// ✅ 1. Listar admins y staff
router.get('/users', verifyToken, (req, res) => {
  const sql = `
    SELECT id, nombre, rol
    FROM usuarios
    WHERE rol IN ('admin', 'staff')
    ORDER BY FIELD(rol, 'admin', 'staff'), nombre ASC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener lista de usuarios' });
    res.json({
      admins: results.filter(user => user.rol === 'admin'),
      staff: results.filter(user => user.rol === 'staff')
    });
  });
});

// ✅ 2. Obtener conversación
router.get('/conversation/:userId', verifyToken, (req, res) => {
  const loggedUser = req.user.userId;
  const { userId } = req.params;

  const sql = `
    SELECT m.*, sender.nombre AS sender_name, receiver.nombre AS receiver_name
    FROM messages m
    JOIN usuarios sender ON sender.id = m.sender_id
    JOIN usuarios receiver ON receiver.id = m.receiver_id
    WHERE (m.sender_id = ? AND m.receiver_id = ?)
       OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `;

  db.query(sql, [loggedUser, userId, userId, loggedUser], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener conversación' });
    res.json(results || []);
  });
});

// ✅ 3. Enviar mensaje + insertar notificación
router.post('/send', verifyToken, (req, res) => {
  const sender_id = req.user.userId;
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ message: 'Faltan campos obligatorios' });
  }

  const sqlMsg = `
    INSERT INTO messages (sender_id, receiver_id, content, created_at)
    VALUES (?, ?, ?, NOW())
  `;

  db.query(sqlMsg, [sender_id, receiver_id, content], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al enviar mensaje' });

    // ✅ Insertar notificación
    const sqlNotif = `
      INSERT INTO notifications (type, message, user_id, created_at)
      VALUES ('message', ?, ?, NOW())
    `;
    const notifMsg = `Nuevo mensaje recibido de ${req.user.nombre}`;
    db.query(sqlNotif, [notifMsg, receiver_id]);

    res.json({ message: 'Mensaje enviado correctamente', messageId: result.insertId });
  });
});

// ✅ 4. Eliminar mensaje (solo el remitente puede borrar)
router.delete('/delete/:messageId', verifyToken, (req, res) => {
  const { messageId } = req.params;
  const loggedUser = req.user.userId;

  const sql = `DELETE FROM messages WHERE id = ? AND sender_id = ?`;
  db.query(sql, [messageId, loggedUser], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar mensaje' });
    if (result.affectedRows === 0) {
      return res.status(403).json({ message: 'No autorizado para eliminar este mensaje' });
    }
    res.json({ message: 'Mensaje eliminado correctamente' });
  });
});

module.exports = router;
