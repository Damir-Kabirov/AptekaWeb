const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Получение списка ТТН
router.get('/ttns/:anom', authMiddleware, async (req, res) => {
  const { anom } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('anom', sql.Int, anom)
      .query(`
        SELECT TTN.id, nomnakl, date, otr_date, Agent.name as agent, Sklad.name as sklad, c_id, anom
        FROM TTN
        JOIN Agent ON Agent.id = agent_id
        JOIN Sklad ON Sklad.id = sklad_id
        WHERE TTN.anom = @anom
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении ТТН:', err);
    res.status(500).json({ error: 'Ошибка при получении ТТН' });
  }
});

// Добавление новой ТТН
router.post('/ttn', authMiddleware, async (req, res) => {
  const { nomer, date, sklad, agent, anom } = req.body;

  if (!nomer || !date || !sklad || !agent) {
    return res.status(400).json({ error: 'Необходимо заполнить все поля' });
  }
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('nomer', sql.NVarChar, nomer)
      .input('date', sql.Date, date)
      .input('sklad', sql.Int, sklad)
      .input('agent', sql.Int, agent)
      .input('anom', sql.Int, anom)
      .query(`
        INSERT INTO TTN (nomnakl, date, agent_id, sklad_id, anom, c_id)
        OUTPUT INSERTED.id
        VALUES (@nomer, @date, @agent, @sklad, @anom, 1)
      `);

    res.status(201).json({ message: 'Накладная успешно добавлена' });
  } catch (err) {
    console.error('Ошибка при добавлении накладной:', err);
    res.status(500).json({ error: 'Ошибка при добавлении накладной' });
  }
});

// Удаление ТТН
router.delete('/ttn/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM TTN
        WHERE id = @id
      `);

    res.json({ message: 'Накладная успешно удалена' });
  } catch (err) {
    console.error('Ошибка при удалении накладной:', err);
    res.status(500).json({ error: 'Ошибка при удалении накладной' });
  }
});

// Обновление ТТН
router.put('/ttn', authMiddleware, async (req, res) => {
  const { id, nomer, date, sklad, agent } = req.body;

  if (!id || !nomer || !date || !sklad || !agent) {
    return res.status(400).json({ error: 'Необходимо заполнить все поля' });
  }

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('nomer', sql.NVarChar, nomer)
      .input('date', sql.Date, date)
      .input('sklad', sql.Int, sklad)
      .input('agent', sql.Int, agent)
      .query(`
        UPDATE TTN
        SET nomnakl = @nomer,
            date = @date,
            agent_id = @agent,
            sklad_id = @sklad
        WHERE id = @id
      `);

    res.json({ message: 'Накладная успешно обновлена' });
  } catch (err) {
    console.error('Ошибка при обновлении накладной:', err);
    res.status(500).json({ error: 'Ошибка при обновлении накладной' });
  }
});

module.exports = router;