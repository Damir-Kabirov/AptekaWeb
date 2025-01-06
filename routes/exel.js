const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const ExcelJS = require('exceljs');
const authMiddleware = require('../middleware/authMiddleware');

// Маршрут для формирования Excel-файла
router.get('/pas/export/:paId', authMiddleware, async (req, res) => {
  const { paId } = req.params;

  try {
    // Подключение к базе данных
    const pool = await sql.connect(dbConfig);

    // Запрос данных о приемном акте
    const paResult = await pool.request()
      .input('anom', sql.Int, paId)
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

    // Запрос данных о спецификациях приемного акта
    const specResult = await pool.request()
      .input('paId', sql.Int, paId)
      .query(`
        SELECT 
          pas.id, 
          pas.anom, 
          pas.pa_id, 
          n.prep_name, -- Наименование из таблицы номенклатуры
          pas.seria, 
          pas.pr_cena_bnds, 
          pas.pr_cena_nds, 
          pas.pc_cena_bnds, 
          pas.pc_cena_nds, 
          pas.kol_tov, 
          pas.rnac, 
          pas.rcena, 
          pas.tarif,
          n.jnv as isJnv,
          s.name AS sklad_name -- Наименование из таблицы складов
        FROM PRIEM_AKT_SPEC pas
        LEFT JOIN Nomenclator n ON pas.prep_id = n.id -- Соединяем с таблицей номенклатуры
        LEFT JOIN Sklad s ON pas.sklad_id = s.id -- Соединяем с таблицей складов
        WHERE pas.pa_id = @paId
      `);

    // Проверка наличия данных
    if (paResult.recordset.length === 0 || specResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Данные не найдены' });
    }

    const paData = paResult.recordset[0]; // Данные о приемном акте
    const specData = specResult.recordset; // Данные о спецификациях

    // Создание нового Excel-файла
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Приемный акт');

    // Оформление заголовков
    worksheet.columns = [
      { header: 'Номер приемного акта', key: 'number', width: 20 },
      { header: 'Дата', key: 'date', width: 15 },
      { header: 'Дата обработки', key: 'processed_date', width: 15 },
      { header: 'Поставщик', key: 'supplier', width: 30 },
      { header: 'Склад', key: 'warehouse', width: 20 },
      { header: 'Номер ТТН', key: 'ttn_number', width: 15 },
    ];

    // Добавление данных о приемном акте
    worksheet.addRow({
      number: paData.number,
      date: paData.date.toLocaleDateString(),
      processed_date: paData.processed_date.toLocaleDateString(),
      supplier: paData.supplier,
      warehouse: paData.warehouse,
      ttn_number: paData.ttn_number,
    });

    // Добавление пустой строки для разделения
    worksheet.addRow([]);

    // Оформление таблицы спецификаций
    worksheet.addRow(['Спецификации:']);
    worksheet.addRow([
      'Наименование',
      'Серия',
      'Цена без НДС (приход)',
      'Цена с НДС (приход)',
      'Цена без НДС (расход)',
      'Цена с НДС (расход)',
      'Количество',
      'РНЦ',
      'Розничная цена',
      'Тариф',
      'Склад',
    ]);

    // Добавление данных о спецификациях
    specData.forEach(spec => {
      worksheet.addRow([
        spec.prep_name,
        spec.seria,
        spec.pr_cena_bnds,
        spec.pr_cena_nds,
        spec.pc_cena_bnds,
        spec.pc_cena_nds,
        spec.kol_tov,
        spec.rnac,
        spec.rcena,
        spec.tarif,
        spec.sklad_name,
      ]);
    });

    // Добавление итоговой суммы
    const totalAmount = specData.reduce((sum, spec) => sum + (spec.pc_cena_nds * spec.kol_tov), 0);
    worksheet.addRow([]);
    worksheet.addRow(['Итого:', '', '', '', '', '', '', '', '', '', totalAmount]);

    // Настройка стилей
    worksheet.getRow(1).font = { bold: true }; // Жирный шрифт для заголовков
    worksheet.getRow(3).font = { bold: true }; // Жирный шрифт для заголовков спецификаций
    worksheet.getRow(worksheet.rowCount).font = { bold: true }; // Жирный шрифт для итоговой суммы

    // Генерация файла и отправка клиенту
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Приемный акт ${paData.number}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Ошибка при формировании Excel-файла:', err);
    res.status(500).json({ error: 'Ошибка при формировании Excel-файла' });
  }
});

module.exports = router;