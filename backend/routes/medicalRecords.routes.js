const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'ciremab12';

/* ---------- Middleware to verify JWT ---------- */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token required' });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

/* ---------- Helper: Create notification ---------- */
function createNotification(childId, userId, message) {
  const sql = `
    INSERT INTO notifications (child_id, user_id, type, message)
    VALUES (?, ?, 'medica', ?)
  `;
  db.query(sql, [childId, userId, message], (err) => {
    if (err) {
      console.error('❌ Notification insert error:', err);
    } else {
      console.log('✅ Notification added:', message);
    }
  });
}

/* ---------- POST /api/medical-records ---------- */
router.post('/', verifyToken, (req, res) => {
  const d = req.body;

  if (!d.child_id) {
    return res.status(400).json({ error: 'Child ID is required' });
  }

  const sqlInsert = `
    INSERT INTO medical_records (
      child_id, has_disability, disability_description,
      requires_treatment, treatment_description,
      current_medications, was_hospitalized, hospitalization_details,
      ambulance_transport, ambulance_details,
      surgery_recommended, surgery_details,
      psychological_treatment, recent_medical_consult, medical_consult_details,
      recent_conditions, known_allergies, medication_allergies, medication_allergies_details,
      physical_limitations, physical_limitations_details, other_conditions,
      has_seizures, seizure_details
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    d.child_id, d.has_disability, d.disability_description,
    d.requires_treatment, d.treatment_description,
    d.current_medications, d.was_hospitalized, d.hospitalization_details,
    d.ambulance_transport, d.ambulance_details,
    d.surgery_recommended, d.surgery_details,
    d.psychological_treatment, d.recent_medical_consult, d.medical_consult_details,
    d.recent_conditions, d.known_allergies, d.medication_allergies, d.medication_allergies_details,
    d.physical_limitations, d.physical_limitations_details, d.other_conditions,
    d.has_seizures, d.seizure_details
  ];

  db.query(sqlInsert, values, (err) => {
    if (err) {
      console.error('❌ Error inserting medical record:', err);
      return res.status(500).json({ error: 'Error creating medical record' });
    }

    db.query('SELECT first_name, last_name FROM children WHERE id = ?', [d.child_id], (err2, rows) => {
      const childName = !err2 && rows.length ? `${rows[0].first_name} ${rows[0].last_name}` : 'the child';
      const message = `Medical record created for ${childName}.`;

      createNotification(d.child_id, req.user.userId, message);

      res.status(201).json({ message: 'Medical record created and notification added' });
    });
  });
});

/* ---------- PUT /api/medical-records/child/:id ---------- */
router.put('/child/:id', verifyToken, (req, res) => {
  const childId = req.params.id;
  const data = req.body;

  function updateRecord() {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), childId];

    const sqlUpdate = `UPDATE medical_records SET ${fields} WHERE child_id = ?`;

    db.query(sqlUpdate, values, (err) => {
      if (err) return res.status(500).json({ error: 'Error updating medical record' });

      db.query('SELECT first_name, last_name FROM children WHERE id = ?', [childId], (err2, rows) => {
        const childName = !err2 && rows.length ? `${rows[0].first_name} ${rows[0].last_name}` : 'the child';
        const message = `Medical record updated for ${childName}.`;

        createNotification(childId, req.user.userId, message);

        res.json({ message: 'Medical record updated successfully and notification added' });
      });
    });
  }

  // Admin y Staff pueden editar cualquier registro
  if (req.user.rol === 'admin' || req.user.rol === 'staff') {
    updateRecord();
  } else {
    // Padre solo si el registro es de su hijo
    const checkSql = 'SELECT * FROM children WHERE id = ? AND parent_id = ?';
    db.query(checkSql, [childId, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      updateRecord();
    });
  }
});

/* ---------- GET /api/medical-records/child/:id ---------- */
router.get('/child/:id', verifyToken, (req, res) => {
  const childId = req.params.id;

  function getRecord() {
    db.query('SELECT * FROM medical_records WHERE child_id = ?', [childId], (err, result) => {
      if (err) return res.status(500).json({ error: 'Error fetching medical record' });
      if (result.length === 0) return res.status(404).json({ message: 'Medical record not found' });
      res.json(result[0]);
    });
  }

  if (req.user.rol !== 'admin' && req.user.rol !== 'staff') {
    const checkSql = 'SELECT * FROM children WHERE id = ? AND parent_id = ?';
    db.query(checkSql, [childId, req.user.userId], (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      getRecord();
    });
  } else {
    getRecord();
  }
});

/* ---------- DELETE /api/medical-records/child/:id ---------- */
router.delete('/child/:id', verifyToken, (req, res) => {
  const childId = req.params.id;

  // Solo admin y staff pueden eliminar
  if (req.user.rol !== 'admin' && req.user.rol !== 'staff') {
    return res.status(403).json({ error: 'Acceso restringido' });
  }

  const sqlDelete = 'DELETE FROM medical_records WHERE child_id = ?';
  db.query(sqlDelete, [childId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al eliminar expediente médico' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expediente médico no encontrado' });
    }
    res.json({ message: 'Expediente médico eliminado correctamente' });
  });
});


/* ---------- GET /api/medical-records (admin y staff) ---------- */
router.get('/', verifyToken, (req, res) => {
  if (req.user.rol !== 'admin' && req.user.rol !== 'staff') {
    return res.status(403).json({ error: 'Access restricted to admin or staff' });
  }

  const sql = `
    SELECT 
      mr.*, 
      CONCAT(c.first_name, ' ', c.last_name) AS childName,
      YEAR(CURDATE()) - c.birth_year AS childAge,
      u.nombre AS parentName,
      mr.created_at AS createdAt
    FROM medical_records mr
    JOIN children c ON mr.child_id = c.id
    JOIN usuarios u ON c.parent_id = u.id
    ORDER BY mr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching medical records:', err);
      return res.status(500).json({ error: 'Error fetching medical records' });
    }
    res.json(results);
  });
});

module.exports = router; 

