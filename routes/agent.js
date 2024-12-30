const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Маршрут для получения данных о контрагентах
router.get('/agents', authMiddleware, async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT id, name, inn, kpp, adress
      FROM Agent
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении данных контрагентов:', err);
    res.status(500).json({ error: 'Ошибка при получении данных контрагентов' });
  }
});

router.get('/agents/find', authMiddleware, async (req, res) => {
  console.log('Запрос получен:', req.url); // Логируем URL запроса
  console.log('Параметры запроса:', req.query); // Логируем все параметры запроса
  try {
    const { inn, kpp } = req.query;
    console.log('ИНН:', inn);
    console.log('КПП:', kpp);
    if (!inn || !kpp) {
      return res.status(400).json({ error: 'Необходимо указать ИНН и КПП' });
    }

    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('inn', sql.NVarChar, inn)
      .input('kpp', sql.NVarChar, kpp)
      .query(`
        SELECT id, name
        FROM Agent
        WHERE inn = @inn AND kpp = @kpp
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Контрагент не найден' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Ошибка при поиске контрагента:', err);
    res.status(500).json({ error: 'Ошибка при поиске контрагента' });
  }
});

// Маршрут для получения данных о конкретном контрагенте по ID
router.get('/agents/:id', authMiddleware, async (req, res) => {
  const agentId = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, agentId)
      .query(`
        SELECT id, name, inn, kpp, adress
        FROM Agent
        WHERE id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Контрагент не найден' });
    }

    res.json(result.recordset[0]);
  } catch (err) {
    console.error('Ошибка при получении данных контрагента:', err);
    res.status(500).json({ error: 'Ошибка при получении данных контрагента' });
  }
});

// Маршрут для обновления данных контрагента
router.put('/agents/:id', authMiddleware, async (req, res) => {
  const agentId = req.params.id;
  const { name, inn, kpp, adress } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, agentId)
      .input('name', sql.NVarChar, name)
      .input('inn', sql.NVarChar, inn)
      .input('kpp', sql.NVarChar, kpp)
      .input('adress', sql.NVarChar, adress)
      .query(`
        UPDATE Agent
        SET name = @name, inn = @inn, kpp = @kpp, adress = @adress
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Контрагент не найден' });
    }

    res.json({ message: 'Контрагент успешно обновлен' });
  } catch (err) {
    console.error('Ошибка при обновлении контрагента:', err);
    res.status(500).json({ error: 'Ошибка при обновлении контрагента' });
  }
});

// Маршрут для удаления контрагента
router.delete('/agents/:id', authMiddleware, async (req, res) => {
  const agentId = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, agentId)
      .query(`
        DELETE FROM Agent
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Контрагент не найден' });
    }

    res.json({ message: 'Контрагент успешно удален' });
  } catch (err) {
    console.error('Ошибка при удалении контрагента:', err);
    res.status(500).json({ error: 'Ошибка при удалении контрагента' });
  }
});

router.post('/agents', authMiddleware, async (req, res) => {
  const { name, inn, kpp, adress } = req.body;

  // Проверяем, что все обязательные поля переданы
  if (!name || !inn || !kpp || !adress) {
    return res.status(400).json({ error: 'Необходимо заполнить все поля' });
  }

  try {
    const pool = await sql.connect(dbConfig);

    // Вставляем новый контрагент в базу данных
    const result = await pool.request()
      .input('name', sql.NVarChar, name)
      .input('inn', sql.NVarChar, inn)
      .input('kpp', sql.NVarChar, kpp)
      .input('adress', sql.NVarChar, adress)
      .query(`
        INSERT INTO Agent (name, inn, kpp, adress)
        OUTPUT INSERTED.id
        VALUES (@name, @inn, @kpp, @adress)
      `);

    // Возвращаем ID созданного контрагента
    const newAgentId = result.recordset[0].id;
    res.status(201).json({ id: newAgentId, message: 'Контрагент успешно добавлен' });
  } catch (err) {
    console.error('Ошибка при добавлении контрагента:', err);
    res.status(500).json({ error: 'Ошибка при добавлении контрагента' });
  }
});



module.exports = router;