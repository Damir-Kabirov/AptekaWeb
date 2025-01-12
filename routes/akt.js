const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Получение актов безналичного отпуска
router.get('/aktbo/:anom', authMiddleware, async (req, res) => {
  const { anom } = req.params;

  try {
    // Подключение к базе данных
    const pool = await sql.connect(dbConfig);

    // Запрос данных актов безналичного отпуска
    const result = await pool.request()
      .input('anom', sql.Int, anom)
      .query(`
        SELECT 
          Document.id, 
          Document.name, 
          Document.date, 
          Document.otr_date AS processed_date, 
          Document.nom_rec AS number, 
          Document.sklad_id, 
          Document.c_id, 
          Document.dogovor_id, 
          Document.agent_id,
          Document.spis_reason,
          Dogovor.nomer AS dogovor_number, -- Номер договора
          Agent.name AS agent_name, -- Название контрагента
          Agent.adress as adress
        FROM Document
        LEFT JOIN Dogovor ON Dogovor.id = Document.dogovor_id -- Соединяем с таблицей договоров
        LEFT JOIN Agent ON Agent.id = Document.agent_id -- Соединяем с таблицей контрагентов
        WHERE Document.anom = @anom AND (Document.c_id = 7 OR Document.c_id = 8) -- Фильтр по c_id
      `);

    // Отправляем данные клиенту
    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении актов безналичного отпуска:', err);
    res.status(500).json({ error: 'Ошибка при получении актов безналичного отпуска' });
  }
});
router.get('/aktsps/:anom', authMiddleware, async (req, res) => {
  const { anom } = req.params;

  try {
    // Подключение к базе данных
    const pool = await sql.connect(dbConfig);

    // Запрос данных актов безналичного отпуска
    const result = await pool.request()
      .input('anom', sql.Int, anom)
      .query(`
        SELECT 
          Document.id, 
          Document.name, 
          Document.date, 
          Document.otr_date AS processed_date, 
          Document.nom_rec AS number, 
          Document.sklad_id, 
          Document.c_id, 
          Document.dogovor_id, 
          Document.agent_id,
          Document.spis_reason
        FROM Document
        WHERE Document.anom = @anom AND (Document.c_id = 5 OR Document.c_id = 6) -- Фильтр по c_id
      `);

    // Отправляем данные клиенту
    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении актов безналичного отпуска:', err);
    res.status(500).json({ error: 'Ошибка при получении актов безналичного отпуска' });
  }
});
router.delete('/aktbo/delete/:aktBoId', authMiddleware, async (req, res) => {
  const { aktBoId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // Начинаем транзакцию
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Удаляем спецификацию акта
      await transaction.request()
        .input('aktBoId', sql.Int, aktBoId)
        .query('DELETE FROM Document_spec WHERE document_id = @aktBoId');

      // Удаляем акт
      await transaction.request()
        .input('aktBoId', sql.Int, aktBoId)
        .query('DELETE FROM Document WHERE id = @aktBoId');

      // Завершаем транзакцию
      await transaction.commit();

      res.json({ success: true });
    } catch (err) {
      // Откатываем транзакцию в случае ошибки
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Ошибка при удалении акта безналичного отпуска:', err);
    res.status(500).json({ error: 'Ошибка при удалении акта безналичного отпуска' });
  }
});

// Отработка акта безналичного отпуска
router.post('/aktbo/:id/process', authMiddleware, async (req, res) => {
  const documentId = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);

    // Начинаем транзакцию
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Получаем спецификацию акта и розничные цены
      const specQuery = `
        SELECT 
          ds.tov_zap_id, 
          ds.kol_tov, 
          pas.rcena
        FROM Document_spec ds
        LEFT JOIN PRIEM_AKT_SPEC pas ON ds.pas_id = pas.id AND ds.pas_anom = pas.anom
        WHERE ds.document_id = @documentId;
      `;
      const specResult = await transaction.request()
        .input('documentId', sql.Int, documentId)
        .query(specQuery);

      const spec = specResult.recordset;

      if (spec.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Спецификация акта не найдена.' });
      }

      // 2. Рассчитываем общую сумму товаров в акте
      let totalSum = 0;
      for (const item of spec) {
        const { kol_tov, rcena } = item;
        totalSum += kol_tov * rcena;
      }

      // 3. Получаем сумму договора
      const dogovorQuery = `
        SELECT d.sum
        FROM Document doc
        LEFT JOIN Dogovor d ON doc.dogovor_id = d.id
        WHERE doc.id = @documentId;
      `;
      const dogovorResult = await transaction.request()
        .input('documentId', sql.Int, documentId)
        .query(dogovorQuery);

      const dogovorSum = dogovorResult.recordset[0]?.sum || 0;

      // 4. Проверяем, превышает ли сумма товаров сумму договора
      if (totalSum > dogovorSum) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Сумма товаров в акте превышает сумму договора.',
        });
      }

      // 5. Проверяем остатки для каждого товара
      for (const item of spec) {
        const { tov_zap_id, kol_tov } = item;

        // Получаем остаток товара на складе
        const stockQuery = `
          SELECT tz.kol_tov
          FROM TOV_ZAP tz
          WHERE tz.id = @tov_zap_id;
        `;
        const stockResult = await transaction.request()
          .input('tov_zap_id', sql.Int, tov_zap_id)
          .query(stockQuery);

        const stock = stockResult.recordset[0]?.kol_tov || 0;

        if (stock < kol_tov) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Недостаточно товара на складе для товара с ID ${tov_zap_id}.`,
          });
        }
      }

      // 6. Списание товаров со склада
      for (const item of spec) {
        const { tov_zap_id, kol_tov } = item;

        // Уменьшаем остаток товара на складе
        const updateStockQuery = `
          UPDATE TOV_ZAP
          SET kol_tov = kol_tov - @kol_tov
          WHERE id = @tov_zap_id;
        `;
        await transaction.request()
          .input('kol_tov', sql.Decimal(18, 2), kol_tov)
          .input('tov_zap_id', sql.Int, tov_zap_id)
          .query(updateStockQuery);
      }

      // 7. Обновляем сумму договора
      const newDogovorSum = dogovorSum - totalSum;
      const updateDogovorQuery = `
        UPDATE Dogovor
        SET sum = @newSum
        WHERE id = (SELECT dogovor_id FROM Document WHERE id = @documentId);
      `;
      await transaction.request()
        .input('newSum', sql.Decimal(18, 2), newDogovorSum)
        .input('documentId', sql.Int, documentId)
        .query(updateDogovorQuery);

      // 8. Обновляем акт: устанавливаем дату отработки и меняем c_id на 8
      const updateDocumentQuery = `
        UPDATE Document
        SET otr_date = GETDATE(), c_id = 8
        WHERE id = @documentId;
      `;
      await transaction.request()
        .input('documentId', sql.Int, documentId)
        .query(updateDocumentQuery);

      // Завершаем транзакцию
      await transaction.commit();

      // Возвращаем успешный результат
      res.json({ success: true, message: 'Акт успешно отработан.' });
    } catch (err) {
      // Откатываем транзакцию в случае ошибки
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Ошибка при отработке акта:', err);
    res.status(500).json({ success: false, message: 'Ошибка при отработке акта.' });
  }
});



router.post('/aktsps/:id/process', authMiddleware, async (req, res) => {
  const documentId = req.params.id;

  try {
    const pool = await sql.connect(dbConfig);

    // Начинаем транзакцию
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // 1. Получаем спецификацию акта
      const specQuery = `
        SELECT ds.tov_zap_id, ds.kol_tov
        FROM Document_spec ds
        WHERE ds.document_id = @documentId;
      `;
      const specResult = await transaction.request()
        .input('documentId', sql.Int, documentId)
        .query(specQuery);

      const spec = specResult.recordset;

      if (spec.length === 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, message: 'Спецификация акта не найдена.' });
      }

      // 2. Проверяем остатки для каждого товара
      for (const item of spec) {
        const { tov_zap_id, kol_tov } = item;

        // Получаем остаток товара на складе
        const stockQuery = `
          SELECT tz.kol_tov
          FROM TOV_ZAP tz
          WHERE tz.id = @tov_zap_id;
        `;
        const stockResult = await transaction.request()
          .input('tov_zap_id', sql.Int, tov_zap_id)
          .query(stockQuery);

        const stock = stockResult.recordset[0]?.kol_tov || 0;

        if (stock < kol_tov) {
          await transaction.rollback();
          return res.status(400).json({
            success: false,
            message: `Недостаточно товара на складе для товара с ID ${tov_zap_id}.`,
          });
        }
      }

      // 3. Списание товаров со склада
      for (const item of spec) {
        const { tov_zap_id, kol_tov } = item;

        // Уменьшаем остаток товара на складе
        const updateStockQuery = `
          UPDATE TOV_ZAP
          SET kol_tov = kol_tov - @kol_tov
          WHERE id = @tov_zap_id;
        `;
        await transaction.request()
          .input('kol_tov', sql.Decimal(18, 2), kol_tov)
          .input('tov_zap_id', sql.Int, tov_zap_id)
          .query(updateStockQuery);
      }

      // 4. Обновляем акт: устанавливаем дату отработки и меняем c_id на 8
      const updateDocumentQuery = `
        UPDATE Document
        SET otr_date = GETDATE(), c_id = 6
        WHERE id = @documentId;
      `;
      await transaction.request()
        .input('documentId', sql.Int, documentId)
        .query(updateDocumentQuery);

      // Завершаем транзакцию
      await transaction.commit();

      // Возвращаем успешный результат
      res.json({ success: true, message: 'Акт успешно отработан.' });
    } catch (err) {
      // Откатываем транзакцию в случае ошибки
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Ошибка при отработке акта:', err);
    res.status(500).json({ success: false, message: 'Ошибка при отработке акта.' });
  }
});


module.exports = router;