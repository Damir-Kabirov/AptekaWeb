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

    // Удаляем спецификации, связанные с накладной
    await pool.request()
      .input('ttnId', sql.Int, id)
      .query(`
        DELETE FROM TTN_SPEC
        WHERE ttn_id = @ttnId
      `);

    // Удаляем накладную
    await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM TTN
        WHERE id = @id
      `);

    res.json({ message: 'Накладная и связанные спецификации успешно удалены' });
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

router.post('/ttn/otr', authMiddleware, async (req, res) => {
  const { ttnId, ttnData, checkedSpecs } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // Начинаем транзакцию
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Находим agent_id по наименованию агента
      const agentResult = await transaction.request()
        .input('agentName', sql.NVarChar, ttnData.agent)
        .query('SELECT id FROM AGENT WHERE name = @agentName');

      if (agentResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Агент не найден' });
      }
      const agentId = agentResult.recordset[0].id;

      // Находим sklad_id по наименованию склада
      const skladResult = await transaction.request()
        .input('skladName', sql.NVarChar, ttnData.sklad)
        .query('SELECT id FROM SKLAD WHERE name = @skladName');

      if (skladResult.recordset.length === 0) {
        return res.status(400).json({ error: 'Склад не найден' });
      }
      const skladId = skladResult.recordset[0].id;

      // Обновляем TTN
      await transaction.request()
        .input('id', sql.Int, ttnId)
        .input('otr_date', sql.Date, new Date().toISOString().split('T')[0]) // Текущая дата
        .input('c_id', sql.Int, 2) // Меняем статус на "Отработано"
        .query(`
          UPDATE TTN
          SET otr_date = @otr_date, c_id = @c_id
          WHERE id = @id;
        `);

      // Создаем PRIEM_AKT
      const paResult = await transaction.request()
        .input('pa_num', sql.VarChar, `${new Date().getFullYear()}-${ttnId}`) // pa_num = текущий год + id накладной
        .input('date', sql.Date, new Date().toISOString().split('T')[0]) // Текущая дата
        .input('agent_id', sql.Int, agentId)
        .input('sklad_id', sql.Int, skladId)
        .input('c_id', sql.Int, 3) // Статус для приемного акта
        .input('ttn_id', sql.Int, ttnId)
        .input('anom', sql.Int, ttnData.anom)
        .query(`
          INSERT INTO PRIEM_AKT (pa_num, date, agent_id, sklad_id, c_id, ttn_id, anom)
          VALUES (@pa_num, @date, @agent_id, @sklad_id, @c_id, @ttn_id, @anom);
          SELECT SCOPE_IDENTITY() AS id;
        `);

      const paId = paResult.recordset[0].id; // ID созданного приемного акта

      // Обновляем TTN_SPEC и создаем PRIEM_AKT_SPEC
      for (const spec of checkedSpecs) {
        // Обновляем TTN_SPEC
        await transaction.request()
          .input('id', sql.Int, spec.id)
          .input('isPas', sql.Bit, 1) // Меняем статус на "Отработано"
          .query(`
            UPDATE TTN_SPEC
            SET isPas = @isPas
            WHERE id = @id;
          `);

        // Создаем PRIEM_AKT_SPEC
        await transaction.request()
          .input('pa_id', sql.Int, paId)
          .input('prep_id', sql.Int, spec.prep_id)
          .input('seria', sql.VarChar, spec.seria)
          .input('pr_cena_bnds', sql.Decimal(18, 2), spec.pr_cena_bnds)
          .input('pr_cena_nds', sql.Decimal(18, 2), spec.pr_cena_nds)
          .input('pc_cena_bnds', sql.Decimal(18, 2), spec.pc_cena_bnds)
          .input('pc_cena_nds', sql.Decimal(18, 2), spec.pc_cena_nds)
          .input('kol_tov', sql.Int, spec.kol_tov)
          .input('tarif', sql.Decimal(18, 2), spec.tarif)
          .input('sklad_id', sql.Int, skladId) // Используем skladId из найденного склада
          .input('ttns_id', sql.Int, spec.id)
          .input('anom', sql.Int, ttnData.anom) // Добавляем поле anom
          .query(`
            INSERT INTO PRIEM_AKT_SPEC (pa_id, prep_id, seria, pr_cena_bnds, pr_cena_nds, pc_cena_bnds, pc_cena_nds, kol_tov, tarif, sklad_id, ttns_id, anom)
            VALUES (@pa_id, @prep_id, @seria, @pr_cena_bnds, @pr_cena_nds, @pc_cena_bnds, @pc_cena_nds, @kol_tov, @tarif, @sklad_id, @ttns_id, @anom);
          `);
      }

      // Завершаем транзакцию
      await transaction.commit();

      res.json({ success: true, message: 'Накладная успешно отработана' });
    } catch (err) {
      // Откатываем транзакцию в случае ошибки
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Ошибка при отработке накладной:', err);
    res.status(500).json({ error: 'Ошибка при отработке накладной' });
  }
});

module.exports = router;