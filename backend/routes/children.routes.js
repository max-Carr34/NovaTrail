const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

/* Middleware para verificar token y normalizar rol */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = decoded;
    req.user.rol = req.user.rol.toLowerCase();
    next();
  });
}

/* Crear niño */
router.post('/', verifyToken, (req, res) => {
  const { firstName, lastName, gender, birthDay, birthMonth, birthYear, phoneNumber } = req.body;

  if (!firstName || !lastName || !gender || !birthDay || !birthMonth || !birthYear || !phoneNumber) {
    return res.status(400).json({ error: 'Campos requeridos incompletos' });
  }

  const parentId = req.user.userId;
  const parentName = req.user.nombre;

  const sql = `
    INSERT INTO children (
      first_name, last_name, gender, birth_day, birth_month, birth_year,
      phone_number, parent_name, parent_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [firstName, lastName, gender, birthDay, birthMonth, birthYear, phoneNumber, parentName, parentId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al registrar al niño', detail: err.sqlMessage });
    res.status(201).json({ message: 'Niño registrado exitosamente', childId: result.insertId });
  });
});

/* Ver todos los niños (solo admin/staff) */
router.get('/all', verifyToken, (req, res) => {
  if (!['admin', 'staff'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  db.query('SELECT * FROM children', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener niños' });
    res.json(results);
  });
});

/* Ver hijos del padre autenticado */
router.get('/my-children', verifyToken, (req, res) => {
  const parentId = req.user.userId;
  db.query('SELECT * FROM children WHERE parent_id = ?', [parentId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener niños' });
    res.json(results);
  });
});

/* Ver hijos por ID de padre (solo admin) */
router.get('/by-parent/:parentId', verifyToken, (req, res) => {
  if (!['admin', 'staff'].includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso denegado' });
  }

  const parentId = req.params.parentId;
  db.query('SELECT * FROM children WHERE parent_id = ?', [parentId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener hijos del padre' });
    res.json(results);
  });
});

/* Obtener niño por ID */
router.get('/:id', verifyToken, (req, res) => {
  const childId = req.params.id;

  const query = ['admin', 'staff'].includes(req.user.rol)
    ? 'SELECT * FROM children WHERE id = ?'
    : 'SELECT * FROM children WHERE id = ? AND parent_id = ?';

  const params = ['admin', 'staff'].includes(req.user.rol)
    ? [childId]
    : [childId, req.user.userId];

  db.query(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Error al obtener niño' });
    if (rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso o el niño no existe' });
    }
    res.json(rows[0]);
  });
});

/* Editar niño */
router.put('/:id', verifyToken, (req, res) => {
  const childId = req.params.id;
  const { firstName, lastName, gender, birthDay, birthMonth, birthYear, phoneNumber, parentName } = req.body;

  if (!firstName || !lastName || !gender || !birthDay || !birthMonth || !birthYear || !phoneNumber) {
    return res.status(400).json({ error: 'Todos los campos son requeridos para actualizar' });
  }

  const updateChild = (finalParentName) => {
    const sql = `
      UPDATE children SET
        first_name = ?, last_name = ?, gender = ?, birth_day = ?, birth_month = ?, birth_year = ?,
        phone_number = ?, parent_name = ?
      WHERE id = ?
    `;
    const values = [firstName, lastName, gender, birthDay, birthMonth, birthYear, phoneNumber, finalParentName, childId];

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar niño', detail: err.sqlMessage });
      res.json({ message: 'Niño actualizado correctamente' });
    });
  };

  if (['admin', 'staff'].includes(req.user.rol)) {
    updateChild(parentName || 'No asignado');
  } else {
    db.query('SELECT * FROM children WHERE id = ? AND parent_id = ?', [childId, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'No tienes permiso para editar este niño' });
      }
      updateChild(rows[0].parent_name);
    });
  }
});

/* Eliminar niño */
router.delete('/:id', verifyToken, (req, res) => {
  const childId = req.params.id;

  const deleteChild = () => {
    db.query('DELETE FROM children WHERE id = ?', [childId], (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar niño' });
      res.json({ message: 'Niño eliminado correctamente' });
    });
  };

  if (['admin', 'staff'].includes(req.user.rol)) {
    deleteChild();
  } else {
    db.query('SELECT * FROM children WHERE id = ? AND parent_id = ?', [childId, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este niño' });
      }
      deleteChild();
    });
  }
});

module.exports = router;
