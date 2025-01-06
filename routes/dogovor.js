const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Маршрут для получения списка договоров
router.get('/dogovors', authMiddleware, async (req, res) => {
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request().query(`
        SELECT 
          Dogovor.id, 
          Dogovor.nomer, 
          Agent.name AS agent_name, 
          Dogovor.sum, 
          Dogovor.date
        FROM Dogovor
        JOIN Agent ON Dogovor.agent_id = Agent.id
      `);
      res.json(result.recordset);
    } catch (err) {
      console.error('Ошибка при получении данных договоров:', err);
      res.status(500).json({ error: 'Ошибка при получении данных договоров' });
    }
  });

  router.post('/dogovors', authMiddleware, async (req, res) => {
    try {
      const { nomer, agent, sum, date } = req.body; // Теперь используем agent (название контрагента)
  
      // Проверка входных данных
      if (!nomer || !agent || !sum || !date) {
        return res.status(400).json({ error: 'Необходимо заполнить все поля' });
      }
  
      // Подключение к базе данных
      const pool = await sql.connect(dbConfig);
  
      // Запрос для получения agent_id по названию контрагента
      const agentResult = await pool.request()
        .input('name', sql.NVarChar, agent)
        .query(`
          SELECT id AS agent_id
          FROM Agent
          WHERE name = @name
        `);
  
      // Проверка, найден ли контрагент
      if (agentResult.recordset.length === 0) {
        return res.status(404).json({ error: 'Контрагент не найден' });
      }
  
      const agentId = agentResult.recordset[0].agent_id; // Получаем agent_id
  
      // Выполнение запроса на добавление договора
      const result = await pool.request()
        .input('nomer', sql.NVarChar, nomer) // Номер договора
        .input('agent_id', sql.Int, agentId) // Используем agent_id
        .input('sum', sql.Decimal(18, 2), sum) // Сумма договора
        .input('date', sql.Date, date) // Дата договора
        .query(`
          INSERT INTO Dogovor (nomer, agent_id, sum, date)
          OUTPUT INSERTED.id
          VALUES (@nomer, @agent_id, @sum, @date)
        `);
  
      // Возвращаем успешный ответ с идентификатором добавленного договора
      res.status(201).json({ id: result.recordset[0].id });
    } catch (err) {
      console.error('Ошибка при добавлении договора:', err);
      res.status(500).json({ error: 'Ошибка при добавлении договора' });
    }
  });
  
  // Маршрут для обновления договора
  router.put('/dogovors/:id', authMiddleware, async (req, res) => {
    console.log(req.body); // Логируем тело запроса для отладки
  try {
    const { id } = req.params; // Идентификатор договора
    const { nomer, agent, sum, date } = req.body; // Теперь используем agent (название контрагента)

    // Проверка входных данных
    if (!nomer || !agent || !sum || !date) {
      return res.status(400).json({ error: 'Необходимо заполнить все поля' });
    }

    // Подключение к базе данных
    const pool = await sql.connect(dbConfig);

    // Запрос для получения agent_id по названию контрагента
    const agentResult = await pool.request()
      .input('name', sql.NVarChar, agent)
      .query(`
        SELECT id AS agent_id
        FROM Agent
        WHERE name = @name
      `);

    // Проверка, найден ли контрагент
    if (agentResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Контрагент не найден' });
    }

    const agentId = agentResult.recordset[0].agent_id; // Получаем agent_id

    // Выполнение запроса на обновление договора
    const result = await pool.request()
      .input('id', sql.Int, id) // Идентификатор договора
      .input('nomer', sql.NVarChar, nomer) // Номер договора
      .input('agent_id', sql.Int, agentId) // Используем agent_id
      .input('sum', sql.Decimal(18, 2), sum) // Сумма договора
      .input('date', sql.Date, date) // Дата договора
      .query(`
        UPDATE Dogovor
        SET nomer = @nomer, agent_id = @agent_id, sum = @sum, date = @date
        WHERE id = @id
      `);

    // Проверка, был ли договор обновлен
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Договор не найден' });
    }

    // Возвращаем успешный ответ
    res.json({ message: 'Договор успешно обновлен' });
  } catch (err) {
    console.error('Ошибка при обновлении договора:', err);
    res.status(500).json({ error: 'Ошибка при обновлении договора' });
  }
  });
  
  // Маршрут для удаления договора
  router.delete('/dogovors/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
  
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
          DELETE FROM Dogovor
          WHERE id = @id
        `);
  
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ error: 'Договор не найден' });
      }
  
      res.json({ message: 'Договор успешно удален' });
    } catch (err) {
      console.error('Ошибка при удалении договора:', err);
      res.status(500).json({ error: 'Ошибка при удалении договора' });
    }
  });

  router.get('/dogovors/:id', authMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
  
      // Проверяем, что id является числом
      const dogovorId = parseInt(id, 10);
      if (isNaN(dogovorId)) {
        return res.status(400).json({ error: 'Некорректный ID договора' });
      }
  
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('id', sql.Int, dogovorId) // Указываем тип данных sql.Int
        .query(`
          SELECT 
            Dogovor.id, 
            Dogovor.nomer, 
            Agent.name AS agent_name, 
            Dogovor.sum, 
            Dogovor.date,
            Agent.inn as agent_inn,
            Agent.kpp as agent_kpp,
            Agent.id as agent_id
          FROM Dogovor
          JOIN Agent ON Dogovor.agent_id = Agent.id
          WHERE Dogovor.id = @id
        `);
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ error: 'Договор не найден' });
      }
  
      res.json(result.recordset[0]);
    } catch (err) {
      console.error('Ошибка при получении данных договора:', err);
      res.status(500).json({ error: 'Ошибка при получении данных договора', details: err.message });
    }
  });

  router.get('/dogovory', authMiddleware, async (req, res) => {
    try {
      const { agentId } = req.query; // Получаем agentId из query-параметров
      if (!agentId || isNaN(agentId)) {
        return res.status(400).json({ error: 'Некорректный ID контрагента' });
      }
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('agentId', sql.Int, agentId)
        .query(`
          SELECT 
            Dogovor.id, 
            Dogovor.nomer, 
            Agent.name AS agent_name, 
            Dogovor.sum, 
            Dogovor.date
          FROM Dogovor
          JOIN Agent ON Dogovor.agent_id = Agent.id
          WHERE Dogovor.agent_id = @agentId
        `);
  
      // Возвращаем результат
      res.json(result.recordset);
    } catch (err) {
      console.error('Ошибка при получении данных договоров:', err);
      res.status(500).json({ error: 'Ошибка при получении данных договоров', details: err.message });
    }
  });

module.exports = router;