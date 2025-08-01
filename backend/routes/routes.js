const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');

const router = express.Router();
const SECRET_KEY = 'ciremab12';

// Configuración Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'carranzamax75@gmail.com',
    pass: 'fkgajgldpmiheqia' // Contraseña de aplicación
  }
});

/* ======================== MIDDLEWARE ======================== */

// Middleware genérico para roles
function verifyRole(roles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token requerido' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      if (!roles.includes(decoded.rol)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      req.user = decoded;
      next();
    });
  };
}

/* ======================== RUTAS DE AUTENTICACIÓN ======================== */

// Registro de usuario
router.post('/usuarios', (req, res) => {
  const { nombre, correo, password, rol = 'usuario' } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Error al procesar la contraseña' });

    const sql = 'INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, correo, hashedPassword, rol], (dbErr, result) => {
      if (dbErr) return res.status(500).json({ error: 'Error al registrar usuario' });

      const token = jwt.sign(
        { userId: result.insertId, nombre, correo, rol },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      res.status(201).json({
        mensaje: 'Usuario registrado exitosamente',
        token,
        usuario: { id: result.insertId, nombre, correo, rol }
      });
    });
  });
});

// Login
router.post('/login', (req, res) => {
  const { correo, password } = req.body;
  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const sql = 'SELECT id, nombre, correo, password, rol FROM usuarios WHERE correo = ?';
  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error interno de base de datos' });
    if (results.length === 0) return res.status(401).json({ error: 'Correo no registrado' });

    const user = results[0];
    bcrypt.compare(password, user.password, (bcryptErr, isValid) => {
      if (bcryptErr) return res.status(500).json({ error: 'Error al validar contraseña' });
      if (!isValid) return res.status(401).json({ error: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { userId: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      console.log(`✅ Usuario ${user.nombre} (${user.rol}) inició sesión.`);

      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        token,
        usuario: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol }
      });
    });
  });
});

/* ======================== RECUPERAR CONTRASEÑA ======================== */

// Solicitar restablecimiento
router.post('/request-reset-password', (req, res) => {
  const { correo } = req.body;
  if (!correo) return res.status(400).json({ message: 'Correo requerido' });

  db.query('SELECT id FROM usuarios WHERE correo = ?', [correo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error base de datos' });
    if (results.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const userId = results[0].id;
    const token = crypto.randomBytes(32).toString('hex');
    const expire = Date.now() + 3600000; // 1 hora

    db.query('UPDATE usuarios SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE id = ?', [token, expire, userId], (updateErr) => {
      if (updateErr) return res.status(500).json({ message: 'Error al guardar token' });

      const resetLink = `http://localhost:8100/change-password?token=${token}`;
      const mailOptions = {
        from: '"Tu App" <carranzamax75@gmail.com>',
        to: correo,
        subject: 'Recupera tu contraseña',
        html: `
          <p>Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña.</p>
          <p>Este enlace es válido por 1 hora.</p>
          <p>Si no solicitaste esto, puedes ignorar este mensaje.</p>
        `
      };

      transporter.sendMail(mailOptions, (mailErr) => {
        if (mailErr) return res.status(500).json({ message: 'Error al enviar correo' });
        res.json({ message: 'Correo de recuperación enviado' });
      });
    });
  });
});

// Cambiar contraseña con token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Datos faltantes' });

  db.query('SELECT id, resetPasswordExpires FROM usuarios WHERE resetPasswordToken = ?', [token], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error de base de datos' });

    if (
      results.length === 0 ||
      !results[0].resetPasswordExpires ||
      results[0].resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    const userId = results[0].id;
    bcrypt.hash(newPassword, 10, (hashErr, hashedPassword) => {
      if (hashErr) return res.status(500).json({ message: 'Error al procesar contraseña' });

      const sql = 'UPDATE usuarios SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE id = ?';
      db.query(sql, [hashedPassword, userId], (updateErr) => {
        if (updateErr) return res.status(500).json({ message: 'Error al guardar nueva contraseña' });
        res.json({ message: 'Contraseña actualizada correctamente' });
      });
    });
  });
});

/* ======================== CHILDREN ROUTES ======================== */
const childRoutes = require('./children.routes');
router.use('/children', childRoutes);

/* ======================== PARENT ROUTES ======================== */
const parentRoutes = require('./parent.routes');
router.use('/parents', parentRoutes);

const alertsRoutes = require('./alerts.routes');
router.use('/alerts', alertsRoutes);

const medicalRecordRoutes = require('./medicalRecords.routes');
router.use('/medical-records', medicalRecordRoutes);

const timelineRoutes = require('./timeline.routes');
router.use('/timeline', timelineRoutes);

const messagesRoutes = require('./messages.routes');
router.use('/messages', messagesRoutes); 

module.exports = router;
