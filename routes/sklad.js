const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/sklad', authMiddleware, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`
        SELECT id, name
        FROM Sklad
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении склада:', err);
    res.status(500).json({ error: 'Ошибка при получении склада' });
  }
});

module.exports = router;