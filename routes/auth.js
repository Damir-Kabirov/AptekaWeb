const express = require('express');
const mssql = require('mssql');
const jwt = require('jsonwebtoken');
const dbConfig = require('../config/db');
require('dotenv').config();
const router = express.Router();

// Секретный ключ для JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Маршрут для авторизации
router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    // Подключение к базе данных
    const pool = await mssql.connect(dbConfig);

    // Запрос к базе данных
    const result = await pool
      .request()
      .input('login', mssql.NVarChar, login)
      .input('password', mssql.NVarChar, password)
      .query('SELECT anom FROM Apt_user WHERE login = @login AND password = @password');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];

      // Генерация JWT-токена
      const token = jwt.sign({ login, anom: user.anom }, JWT_SECRET, { expiresIn: '1h' });

      res.json({ success: true, token, anom: user.anom });
    } else {
      res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
    }
  } catch (err) {
    console.error('Ошибка базы данных:', err);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;