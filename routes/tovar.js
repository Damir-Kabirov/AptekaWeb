const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

// Функция для генерации штрих-кода
function generateEAN13(pas_id, anom) {
  const padded = `${pas_id}${anom}`.padStart(12, '0').slice(0, 12);
  const checksum = (10 - (padded.split('').reduce((sum, digit, index) => 
    sum + (index % 2 === 0 ? +digit : +digit * 3), 0) % 10)) % 10;
  return `${padded}${checksum}`;
}

router.get('/tovars/:anom', authMiddleware, async (req, res) => {
  const { anom } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // Запрос для получения данных о товарных запасах
    const result = await pool.request()
      .input('anom', sql.Int, anom)
      .query(`
        SELECT 
          tz.id, 
          tz.pas_id, 
          tz.pas_anom, 
          tz.kol_tov, 
          tz.sklad_id, 
          pas.srok_god, -- Срок годности из таблицы PRIEM_AKT_SPEC
          n.prep_name, -- Наименование из таблицы номенклатуры
          s.name AS sklad_name, -- Наименование из таблицы складов
          pa.pa_num -- Номер приемного акта из таблицы PRIEM_AKT
        FROM TOV_ZAP tz
        LEFT JOIN PRIEM_AKT_SPEC pas ON tz.pas_id = pas.id -- Соединяем с таблицей спецификации приемного акта
        LEFT JOIN Nomenclator n ON pas.prep_id = n.id -- Соединяем с таблицей номенклатуры
        LEFT JOIN Sklad s ON tz.sklad_id = s.id -- Соединяем с таблицей складов
        LEFT JOIN PRIEM_AKT pa ON pas.pa_id = pa.id -- Соединяем с таблицей приемных актов
        WHERE tz.pas_anom = @anom
      `);

    // Формируем ответ с добавлением штрих-кода
    const tovars = result.recordset.map(item => ({
      id: item.id,
      barcode: generateEAN13(item.pas_id, item.pas_anom), // Генерируем штрих-код
      name: item.prep_name, // Наименование товара
      quantity: item.kol_tov, // Количество
      expiryDate: item.srok_god, // Срок годности
      warehouse: item.sklad_name, // Название склада
      paNumber: item.pa_num, // Номер приемного акта
    }));

    res.json(tovars);
  } catch (err) {
    console.error('Ошибка при получении данных:', err);
    res.status(500).json({ error: 'Ошибка при получении данных' });
  }
});

router.get('/tovars/search/:anom', authMiddleware, async (req, res) => {
    const { anom } = req.params;
    const { query, type } = req.query;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      let sqlQuery = `
        SELECT 
          tz.id, 
          tz.pas_id, 
          tz.pas_anom, 
          tz.kol_tov, 
          tz.sklad_id, 
          pas.srok_god, 
          n.prep_name, 
          s.name AS sklad_name, 
          pa.pa_num 
        FROM TOV_ZAP tz
        LEFT JOIN PRIEM_AKT_SPEC pas ON tz.pas_id = pas.id
        LEFT JOIN Nomenclator n ON pas.prep_id = n.id
        LEFT JOIN Sklad s ON tz.sklad_id = s.id
        LEFT JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
        WHERE tz.pas_anom = @anom
      `;
  
      const result = await pool.request()
        .input('anom', sql.Int, anom)
        .query(sqlQuery);
  
      // Фильтруем результаты на стороне сервера
      let tovars = result.recordset.map(item => ({
        id: item.id,
        barcode: generateEAN13(item.pas_id, item.pas_anom), // Генерируем штрих-код
        name: item.prep_name,
        quantity: item.kol_tov,
        expiryDate: item.srok_god,
        warehouse: item.sklad_name,
        paNumber: item.pa_num,
      }));
  
      if (type === 'name') {
        // Поиск по наименованию
        tovars = tovars.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
      } else if (type === 'strih-kod') {
        // Поиск по штрих-коду
        tovars = tovars.filter(item => item.barcode === query);
      }
  
      res.json(tovars);
    } catch (err) {
      console.error('Ошибка при поиске товаров:', err);
      res.status(500).json({ error: 'Ошибка при поиске товаров' });
    }
  });
  
  router.get('/tovars/filter-expiry/:anom', authMiddleware, async (req, res) => {
    const { anom } = req.params;
    const { type } = req.query;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      let sqlQuery = `
        SELECT 
          tz.id, 
          tz.pas_id, 
          tz.pas_anom, 
          tz.kol_tov, 
          tz.sklad_id, 
          pas.srok_god, 
          n.prep_name, 
          s.name AS sklad_name, 
          pa.pa_num 
        FROM TOV_ZAP tz
        LEFT JOIN PRIEM_AKT_SPEC pas ON tz.pas_id = pas.id
        LEFT JOIN Nomenclator n ON pas.prep_id = n.id
        LEFT JOIN Sklad s ON tz.sklad_id = s.id
        LEFT JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
        WHERE tz.pas_anom = @anom
      `;
  
      const today = new Date().toISOString().split('T')[0]; // Текущая дата
  
      if (type === 'overdue') {
        sqlQuery += ` AND pas.srok_god < '${today}'`;
      } else if (type === 'week') {
        const weekLater = new Date();
        weekLater.setDate(weekLater.getDate() + 7);
        sqlQuery += ` AND pas.srok_god BETWEEN '${today}' AND '${weekLater.toISOString().split('T')[0]}'`;
      } else if (type === 'month') {
        const monthLater = new Date();
        monthLater.setMonth(monthLater.getMonth() + 1);
        sqlQuery += ` AND pas.srok_god BETWEEN '${today}' AND '${monthLater.toISOString().split('T')[0]}'`;
      }
  
      const result = await pool.request()
        .input('anom', sql.Int, anom)
        .query(sqlQuery);
  
      const tovars = result.recordset.map(item => ({
        id: item.id,
        barcode: generateEAN13(item.pas_id, anom), // Генерируем штрих-код на сервере
        name: item.prep_name,
        quantity: item.kol_tov,
        expiryDate: item.srok_god,
        warehouse: item.sklad_name,
        paNumber: item.pa_num,
      }));
  
      res.json(tovars);
    } catch (err) {
      console.error('Ошибка при фильтрации товаров:', err);
      res.status(500).json({ error: 'Ошибка при фильтрации товаров' });
    }
  });

module.exports = router;