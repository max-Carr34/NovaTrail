const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

/* Middleware: verificar token y que sea admin */
function verifyAdminOrStaff(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    if (decoded.rol !== 'admin' && decoded.rol !== 'staff') {
      return res.status(403).json({ error: 'Acceso solo para administradores o staff' });
    }
    req.user = decoded;
    next();
  });
}


/* GET /api/parents/all - Obtener todos los padres */
router.get('/all', verifyAdminOrStaff, (req, res) => {
  const sql = "SELECT id, nombre, correo FROM usuarios WHERE rol = 'usuario'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener padres:', err);
      return res.status(500).json({ error: 'Error al obtener los padres' });
    }
    res.json(results);
  });
});

module.exports = router;
