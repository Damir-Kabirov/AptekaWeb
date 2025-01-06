const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Маршрут для создания документа и его спецификации
router.post('/documents', authMiddleware, async (req, res) => {
  const { documentData, documentSpecs } = req.body;

  // Деструктуризация данных
  const { name, date, sklad_name, privoz, c_id, spis_reason, anom, agent_id, dogovor_id } = documentData;

  const transaction = new sql.Transaction();
  try {
    await transaction.begin();

    // Получаем id склада по его названию
    const skladRequest = new sql.Request(transaction);
    const skladResult = await skladRequest
      .input('sklad_name', sql.VarChar, sklad_name)
      .query('SELECT id FROM Sklad WHERE name = @sklad_name');

    if (skladResult.recordset.length === 0) {
      throw new Error('Склад с указанным названием не найден');
    }

    const sklad_id = skladResult.recordset[0].id; // Получаем id склада

    // Для акта безналичного отпуска проверяем сумму контракта
    if (c_id === '7') {
      const contractRequest = new sql.Request(transaction);
      const contractResult = await contractRequest
        .input('dogovor_id', sql.Int, dogovor_id)
        .query('SELECT sum FROM Dogovor WHERE id = @dogovor_id');

      if (contractResult.recordset.length === 0) {
        throw new Error('Контракт с указанным ID не найден');
      }

      const contractSum = contractResult.recordset[0].sum; // Сумма контракта

      // Рассчитываем общую стоимость товаров
      let totalCost = 0;
      for (const spec of documentSpecs) {
        const { tov_zap_id, kol_tov, pas_id, pas_anom } = spec;

        // Получаем цену товара (rcena) из таблицы PRIEM_AKT_SPEC
        const tovarRequest = new sql.Request(transaction);
        const tovarResult = await tovarRequest
          .input('pas_id', sql.Int, pas_id) // Используем pas_id
          .input('pas_anom', sql.Int, pas_anom) // Используем pas_anom
          .query('SELECT rcena FROM PRIEM_AKT_SPEC WHERE id = @pas_id AND anom = @pas_anom');

        if (tovarResult.recordset.length === 0) {
          throw new Error(`Цена товара с ID ${pas_id} и anom ${pas_anom} не найдена в таблице PRIEM_AKT_SPEC`);
        }

        const rcena = tovarResult.recordset[0].rcena; // Цена товара
        totalCost += rcena * kol_tov; // Увеличиваем общую стоимость
      }

      // Проверяем, достаточно ли суммы контракта
      if (totalCost > contractSum) {
        throw new Error('Сумма товаров превышает сумму контракта');
      }
    }

    // Получаем текущий год
    const currentYear = new Date().getFullYear();

    // Получаем последний номер акта для текущего года
    const lastDocRequest = new sql.Request(transaction);
    const lastDocResult = await lastDocRequest.query(`
      SELECT MAX(CAST(SUBSTRING(nom_rec, LEN(nom_rec) - 3, 4) AS INT)) AS lastNumber
      FROM Document
      WHERE nom_rec LIKE '${anom}/${currentYear}-%'
    `);

    const lastNumber = lastDocResult.recordset[0].lastNumber || 0;
    const nextNumber = lastNumber + 1; // Следующий порядковый номер
    const paddedNumber = nextNumber.toString().padStart(4, '0'); // Дополняем нулями до 4 знаков

    const nom_rec = `${anom}/${currentYear}-${paddedNumber}`; // Формируем nom_rec

    // Создаем запись в таблице Document
    const documentRequest = new sql.Request(transaction);

    let query;
    let inputs;

    if (c_id === '5') {
      // Для списания не передаем agent_id и dogovor_id
      query = `
        INSERT INTO Document (name, date, sklad_id, privoz, c_id, spis_reason, nom_rec)
        OUTPUT INSERTED.id
        VALUES (@name, @date, @sklad_id, @privoz, @c_id, @spis_reason, @nom_rec)
      `;
      inputs = [
        { name: 'name', type: sql.VarChar, value: name },
        { name: 'date', type: sql.Date, value: date },
        { name: 'sklad_id', type: sql.Int, value: sklad_id },
        { name: 'privoz', type: sql.Bit, value: privoz },
        { name: 'c_id', type: sql.Int, value: c_id },
        { name: 'spis_reason', type: sql.VarChar, value: spis_reason },
        { name: 'nom_rec', type: sql.VarChar, value: nom_rec },
      ];
    } else {
      // Для акта безналичного отпуска передаем agent_id и dogovor_id
      query = `
        INSERT INTO Document (name, date, sklad_id, privoz, c_id, spis_reason, nom_rec, agent_id, dogovor_id)
        OUTPUT INSERTED.id
        VALUES (@name, @date, @sklad_id, @privoz, @c_id, @spis_reason, @nom_rec, @agent_id, @dogovor_id)
      `;
      inputs = [
        { name: 'name', type: sql.VarChar, value: name },
        { name: 'date', type: sql.Date, value: date },
        { name: 'sklad_id', type: sql.Int, value: sklad_id },
        { name: 'privoz', type: sql.Bit, value: privoz },
        { name: 'c_id', type: sql.Int, value: c_id },
        { name: 'spis_reason', type: sql.VarChar, value: spis_reason },
        { name: 'nom_rec', type: sql.VarChar, value: nom_rec },
        { name: 'agent_id', type: sql.Int, value: agent_id },
        { name: 'dogovor_id', type: sql.Int, value: dogovor_id },
      ];
    }

    // Добавляем параметры в запрос
    inputs.forEach(input => {
      documentRequest.input(input.name, input.type, input.value);
    });

    // Выполняем запрос
    const documentResult = await documentRequest.query(query);

    const documentId = documentResult.recordset[0].id;

    // Создаем записи в таблице Document_spec
    for (const spec of documentSpecs) {
      const { tov_zap_id, kol_tov, pas_id, pas_anom } = spec;
      const specRequest = new sql.Request(transaction);
      await specRequest
        .input('document_id', sql.Int, documentId)
        .input('tov_zap_id', sql.Int, tov_zap_id)
        .input('kol_tov', sql.Decimal(18, 2), kol_tov)
        .input('pas_id', sql.Int, pas_id)
        .input('pas_anom', sql.Int, pas_anom)
        .query(`
          INSERT INTO Document_spec (document_id, tov_zap_id, kol_tov, pas_id, pas_anom)
          VALUES (@document_id, @tov_zap_id, @kol_tov, @pas_id, @pas_anom)
        `);
    }

    // Фиксируем транзакцию
    await transaction.commit();

    res.json({ success: true, documentId, nom_rec });
  } catch (err) {
    // Откатываем транзакцию в случае ошибки
    await transaction.rollback();
    console.error('Ошибка при создании документа и спецификации:', err);
    res.status(500).json({ error: err.message || 'Ошибка при создании документа и спецификации' });
  }
});

module.exports = router;