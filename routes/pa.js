const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/pas/:anom', authMiddleware, async (req, res) => {
    const { anom } = req.params;
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
        .input('anom', sql.Int, anom)
        .query(`
          SELECT 
            PRIEM_AKT.id, 
            PRIEM_AKT.pa_num AS number, 
            PRIEM_AKT.date, 
            PRIEM_AKT.otr_date AS processed_date, 
            Agent.name AS supplier, 
            Sklad.name AS warehouse, 
            TTN.nomnakl AS ttn_number,
            PRIEM_AKT.c_id,
            PRIEM_AKT.anom
          FROM PRIEM_AKT
          JOIN Agent ON Agent.id = PRIEM_AKT.agent_id
          JOIN Sklad ON Sklad.id = PRIEM_AKT.sklad_id
          LEFT JOIN TTN ON TTN.id = PRIEM_AKT.ttn_id
          WHERE PRIEM_AKT.anom = @anom
        `);
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Ошибка при получении приемных актов:', err);
      res.status(500).json({ error: 'Ошибка при получении приемных актов' });
    }
  });

// Удаление приемного акта
router.delete('/pa/delete/:paId', authMiddleware, async (req, res) => {
    const { paId } = req.params;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      // Начинаем транзакцию
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
  
      try {
        // Получаем данные приемного акта
        const paResult = await transaction.request()
          .input('paId', sql.Int, paId)
          .query('SELECT ttn_id FROM PRIEM_AKT WHERE id = @paId');
  
        if (paResult.recordset.length === 0) {
          return res.status(404).json({ error: 'Приемный акт не найден' });
        }
  
        const ttnId = paResult.recordset[0].ttn_id;
  
        // Получаем ttns_id из PRIEM_AKT_SPEC для удаленного приемного акта
        const ttnsIdsResult = await transaction.request()
          .input('paId', sql.Int, paId)
          .query('SELECT ttns_id FROM PRIEM_AKT_SPEC WHERE pa_id = @paId');
  
        const ttnsIds = ttnsIdsResult.recordset.map(row => row.ttns_id);
  
        // Удаляем спецификацию приемного акта
        await transaction.request()
          .input('paId', sql.Int, paId)
          .query('DELETE FROM PRIEM_AKT_SPEC WHERE pa_id = @paId');
  
        // Удаляем приемный акт
        await transaction.request()
          .input('paId', sql.Int, paId)
          .query('DELETE FROM PRIEM_AKT WHERE id = @paId');
  
        // Проверяем, есть ли другие приемные акты для этой TTN
        const otherPaResult = await transaction.request()
          .input('ttnId', sql.Int, ttnId)
          .query('SELECT COUNT(*) AS count FROM PRIEM_AKT WHERE ttn_id = @ttnId');
  
        const otherPaCount = otherPaResult.recordset[0].count;
  
        if (otherPaCount === 0) {
          // Если других приемных актов нет, обновляем TTN
          await transaction.request()
            .input('ttnId', sql.Int, ttnId)
            .input('c_id', sql.Int, 1) // Меняем статус на "Не отработано"
            .input('otr_date', sql.Date, null) // Убираем дату отработки
            .query(`
              UPDATE TTN
              SET c_id = @c_id, otr_date = @otr_date
              WHERE id = @ttnId;
            `);
        }
  
        // Обновляем поле isPas в TTN_SPEC для удаленных позиций
        if (ttnsIds.length > 0) {
          await transaction.request()
            .input('ttnsIds', sql.NVarChar, ttnsIds.join(',')) // Передаем список ttns_id
            .query(`
              UPDATE TTN_SPEC
              SET isPas = 0
              WHERE id IN (SELECT value FROM STRING_SPLIT(@ttnsIds, ','));
            `);
        }
  
        // Завершаем транзакцию
        await transaction.commit();
  
        res.json({ success: true, message: 'Приемный акт успешно удален' });
      } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await transaction.rollback();
        throw err;
      }
    } catch (err) {
      console.error('Ошибка при удалении приемного акта:', err);
      res.status(500).json({ error: 'Ошибка при удалении приемного акта' });
    }
  });
  

// Отработка приемного акта
router.post('/pa/process/:paId', authMiddleware, async (req, res) => {
    const { paId } = req.params;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      // Начинаем транзакцию
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
  
      try {
        console.log('Обновление статуса и даты отработки ПА...');
        await transaction.request()
          .input('paId', sql.Int, paId)
          .input('c_id', sql.Int, 4) // Статус "Отработано"
          .input('otr_date', sql.Date, new Date().toISOString().split('T')[0]) // Текущая дата
          .query(`
            UPDATE PRIEM_AKT
            SET c_id = @c_id, otr_date = @otr_date
            WHERE id = @paId;
          `);
  
        console.log('Получение данных из PRIEM_AKT_SPEC...');
        const pasSpecResult = await transaction.request()
          .input('paId', sql.Int, paId)
          .query(`
            SELECT id, pa_id, anom, kol_tov, sklad_id
            FROM PRIEM_AKT_SPEC
            WHERE pa_id = @paId;
          `);
  
        console.log('Создание записей в TOV_ZAP...');
        for (const spec of pasSpecResult.recordset) {
          await transaction.request()
            .input('pas_id', sql.Int, spec.id) // Используем id спецификации
            .input('pas_anom', sql.Int, spec.anom)
            .input('kol_tov', sql.Numeric(18, 2), spec.kol_tov)
            .input('sklad_id', sql.Int, spec.sklad_id)
            .query(`
              INSERT INTO TOV_ZAP (pas_id, pas_anom, kol_tov, sklad_id)
              VALUES (@pas_id, @pas_anom, @kol_tov, @sklad_id);
            `);
        }
  
        // Завершаем транзакцию
        await transaction.commit();
        console.log('Транзакция успешно завершена.');
  
        res.json({ success: true, message: 'Приемный акт успешно отработан' });
      } catch (err) {
        // Откатываем транзакцию в случае ошибки
        await transaction.rollback();
        console.error('Ошибка в транзакции:', err);
        res.status(500).json({ error: 'Ошибка при отработке приемного акта', details: err.message });
      }
    } catch (err) {
      console.error('Ошибка при отработке приемного акта:', err);
      res.status(500).json({ error: 'Ошибка при отработке приемного акта', details: err.message });
    }
  });

module.exports = router;