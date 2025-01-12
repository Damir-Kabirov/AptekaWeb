const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');
const ExcelJS = require('exceljs');

const getMonthName = (month) => {
    const months = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
      'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
    return months[month - 1] || 'неизвестный месяц';
  };

router.get('/report', authMiddleware, async (req, res) => {
  const { anom, year, month } = req.query;

  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool.request()
      .input('anom', sql.Int, anom)
      .input('year', sql.Int, year)
      .input('month', sql.Int, month)
      .query(`
WITH StartBalances AS (
  -- Остатки на начало месяца
  SELECT
    pa.sklad_id,
    SUM(pas.kol_tov * pas.rcena) AS startSum,
    SUM(pas.kol_tov) AS startKol
  FROM PRIEM_AKT_SPEC pas
  JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
  WHERE pas.anom = @anom
    AND pa.otr_date < DATEFROMPARTS(@year, @month, 1)
  GROUP BY pa.sklad_id
),
Prihod AS (
  -- Приход за текущий месяц
  SELECT
    pa.sklad_id,
    SUM(pas.kol_tov * pas.rcena) AS prihodSum,
    SUM(pas.kol_tov) AS prihodKol
  FROM PRIEM_AKT_SPEC pas
  JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
  WHERE pas.anom = @anom
    AND pa.c_id = 4
    AND pa.otr_date >= DATEFROMPARTS(@year, @month, 1)
    AND pa.otr_date < DATEADD(MONTH, 1, DATEFROMPARTS(@year, @month, 1))
  GROUP BY pa.sklad_id
),
Rashod AS (
  -- Расход за текущий месяц
  SELECT
    d.sklad_id,
    SUM(CASE WHEN d.c_id = 8 THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumAbo,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason = 'Расход по аптечному производству' THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumArap,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason != 'Расход по аптечному производству' THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumAktsps,
    SUM(CASE WHEN d.c_id = 8 THEN ds.kol_tov ELSE 0 END) AS rashodKolAbo,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason = 'Расход по аптечному производству' THEN ds.kol_tov ELSE 0 END) AS rashodKolArap,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason != 'Расход по аптечному производству' THEN ds.kol_tov ELSE 0 END) AS rashodKolAktsps
  FROM Document_spec ds
  JOIN Document d ON ds.document_id = d.id
  JOIN PRIEM_AKT_SPEC pas ON ds.pas_id = pas.id AND ds.pas_anom = pas.anom
  WHERE d.anom = @anom
    AND d.otr_date >= DATEFROMPARTS(@year, @month, 1)
    AND d.otr_date < DATEADD(MONTH, 1, DATEFROMPARTS(@year, @month, 1))
  GROUP BY d.sklad_id
),
CombinedData AS (
  -- Объединяем данные по складам
  SELECT
    COALESCE(sb.sklad_id, ph.sklad_id, r.sklad_id) AS sklad_id,
    COALESCE(sb.startSum, 0) AS startSum,
    COALESCE(sb.startKol, 0) AS startKol,
    COALESCE(ph.prihodSum, 0) AS prihodSum,
    COALESCE(ph.prihodKol, 0) AS prihodKol,
    COALESCE(r.rashodSumAbo, 0) AS rashodSumAbo,
    COALESCE(r.rashodSumArap, 0) AS rashodSumArap,
    COALESCE(r.rashodSumAktsps, 0) AS rashodSumAktsps,
    COALESCE(r.rashodKolAbo, 0) AS rashodKolAbo,
    COALESCE(r.rashodKolArap, 0) AS rashodKolArap,
    COALESCE(r.rashodKolAktsps, 0) AS rashodKolAktsps
  FROM StartBalances sb
  FULL OUTER JOIN Prihod ph ON sb.sklad_id = ph.sklad_id
  FULL OUTER JOIN Rashod r ON sb.sklad_id = r.sklad_id
)
SELECT
  -- Остатки на начало месяца
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startSum ELSE 0 END), 0) AS startSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startKol ELSE 0 END), 0) AS startKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startSum ELSE 0 END), 0) AS startSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startKol ELSE 0 END), 0) AS startKolApt,
  ISNULL(SUM(startSum), 0) AS startSum,
  ISNULL(SUM(startKol), 0) AS startKol,

  -- Приход за месяц
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN prihodSum ELSE 0 END), 0) AS prihodSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN prihodKol ELSE 0 END), 0) AS prihodKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN prihodSum ELSE 0 END), 0) AS prihodSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN prihodKol ELSE 0 END), 0) AS prihodKolApt,
  ISNULL(SUM(prihodSum), 0) AS prihodSum,
  ISNULL(SUM(prihodKol), 0) AS prihodKol,

  -- Расход за месяц
  ISNULL(SUM(rashodSumAbo), 0) AS rashodSumAbo,
  ISNULL(SUM(rashodSumArap), 0) AS rashodSumArap,
  ISNULL(SUM(rashodSumAktsps), 0) AS rashodSumAktsps,
  ISNULL(SUM(rashodKolAbo), 0) AS rashodKolAbo,
  ISNULL(SUM(rashodKolArap), 0) AS rashodKolArap,
  ISNULL(SUM(rashodKolAktsps), 0) AS rashodKolAktsps,
  ISNULL(SUM(rashodSumAbo + rashodSumArap + rashodSumAktsps), 0) AS rashodSum,
  ISNULL(SUM(rashodKolAbo + rashodKolArap + rashodKolAktsps), 0) AS rashodKol,

  -- Остатки на конец месяца
  ISNULL(SUM(startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps)), 0) AS endSum,
  ISNULL(SUM(startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps)), 0) AS endKol,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps) ELSE 0 END), 0) AS endSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps) ELSE 0 END), 0) AS endKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps) ELSE 0 END), 0) AS endSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps) ELSE 0 END), 0) AS endKolApt
FROM CombinedData;
      `);

    const reportData = result.recordset[0];
    res.json(reportData);
  } catch (err) {
    console.error('Ошибка при получении данных отчета:', err);
    res.status(500).json({ error: 'Ошибка при получении данных отчета' });
  }
});
router.get('/report/excel', authMiddleware, async (req, res) => {
    const { anom, year, month } = req.query;
  
    try {
      const pool = await sql.connect(dbConfig);
  
      const result = await pool.request()
        .input('anom', sql.Int, anom)
        .input('year', sql.Int, year)
        .input('month', sql.Int, month)
        .query(`
          WITH StartBalances AS (
  -- Остатки на начало месяца
  SELECT
    pa.sklad_id,
    SUM(pas.kol_tov * pas.rcena) AS startSum,
    SUM(pas.kol_tov) AS startKol
  FROM PRIEM_AKT_SPEC pas
  JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
  WHERE pas.anom = @anom
    AND pa.otr_date < DATEFROMPARTS(@year, @month, 1)
  GROUP BY pa.sklad_id
),
Prihod AS (
  -- Приход за текущий месяц
  SELECT
    pa.sklad_id,
    SUM(pas.kol_tov * pas.rcena) AS prihodSum,
    SUM(pas.kol_tov) AS prihodKol
  FROM PRIEM_AKT_SPEC pas
  JOIN PRIEM_AKT pa ON pas.pa_id = pa.id
  WHERE pas.anom = @anom
    AND pa.c_id = 4
    AND pa.otr_date >= DATEFROMPARTS(@year, @month, 1)
    AND pa.otr_date < DATEADD(MONTH, 1, DATEFROMPARTS(@year, @month, 1))
  GROUP BY pa.sklad_id
),
Rashod AS (
  -- Расход за текущий месяц
  SELECT
    d.sklad_id,
    SUM(CASE WHEN d.c_id = 8 THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumAbo,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason = 'Расход по аптечному производству' THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumArap,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason != 'Расход по аптечному производству' THEN ds.kol_tov * pas.rcena ELSE 0 END) AS rashodSumAktsps,
    SUM(CASE WHEN d.c_id = 8 THEN ds.kol_tov ELSE 0 END) AS rashodKolAbo,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason = 'Расход по аптечному производству' THEN ds.kol_tov ELSE 0 END) AS rashodKolArap,
    SUM(CASE WHEN d.c_id = 6 AND d.spis_reason != 'Расход по аптечному производству' THEN ds.kol_tov ELSE 0 END) AS rashodKolAktsps
  FROM Document_spec ds
  JOIN Document d ON ds.document_id = d.id
  JOIN PRIEM_AKT_SPEC pas ON ds.pas_id = pas.id AND ds.pas_anom = pas.anom
  WHERE d.anom = @anom
    AND d.otr_date >= DATEFROMPARTS(@year, @month, 1)
    AND d.otr_date < DATEADD(MONTH, 1, DATEFROMPARTS(@year, @month, 1))
  GROUP BY d.sklad_id
),
CombinedData AS (
  -- Объединяем данные по складам
  SELECT
    COALESCE(sb.sklad_id, ph.sklad_id, r.sklad_id) AS sklad_id,
    COALESCE(sb.startSum, 0) AS startSum,
    COALESCE(sb.startKol, 0) AS startKol,
    COALESCE(ph.prihodSum, 0) AS prihodSum,
    COALESCE(ph.prihodKol, 0) AS prihodKol,
    COALESCE(r.rashodSumAbo, 0) AS rashodSumAbo,
    COALESCE(r.rashodSumArap, 0) AS rashodSumArap,
    COALESCE(r.rashodSumAktsps, 0) AS rashodSumAktsps,
    COALESCE(r.rashodKolAbo, 0) AS rashodKolAbo,
    COALESCE(r.rashodKolArap, 0) AS rashodKolArap,
    COALESCE(r.rashodKolAktsps, 0) AS rashodKolAktsps
  FROM StartBalances sb
  FULL OUTER JOIN Prihod ph ON sb.sklad_id = ph.sklad_id
  FULL OUTER JOIN Rashod r ON sb.sklad_id = r.sklad_id
)
SELECT
  -- Остатки на начало месяца
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startSum ELSE 0 END), 0) AS startSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startKol ELSE 0 END), 0) AS startKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startSum ELSE 0 END), 0) AS startSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startKol ELSE 0 END), 0) AS startKolApt,
  ISNULL(SUM(startSum), 0) AS startSum,
  ISNULL(SUM(startKol), 0) AS startKol,

  -- Приход за месяц
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN prihodSum ELSE 0 END), 0) AS prihodSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN prihodKol ELSE 0 END), 0) AS prihodKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN prihodSum ELSE 0 END), 0) AS prihodSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN prihodKol ELSE 0 END), 0) AS prihodKolApt,
  ISNULL(SUM(prihodSum), 0) AS prihodSum,
  ISNULL(SUM(prihodKol), 0) AS prihodKol,

  -- Расход за месяц
  ISNULL(SUM(rashodSumAbo), 0) AS rashodSumAbo,
  ISNULL(SUM(rashodSumArap), 0) AS rashodSumArap,
  ISNULL(SUM(rashodSumAktsps), 0) AS rashodSumAktsps,
  ISNULL(SUM(rashodKolAbo), 0) AS rashodKolAbo,
  ISNULL(SUM(rashodKolArap), 0) AS rashodKolArap,
  ISNULL(SUM(rashodKolAktsps), 0) AS rashodKolAktsps,
  ISNULL(SUM(rashodSumAbo + rashodSumArap + rashodSumAktsps), 0) AS rashodSum,
  ISNULL(SUM(rashodKolAbo + rashodKolArap + rashodKolAktsps), 0) AS rashodKol,

  -- Остатки на конец месяца
  ISNULL(SUM(startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps)), 0) AS endSum,
  ISNULL(SUM(startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps)), 0) AS endKol,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps) ELSE 0 END), 0) AS endSumRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 1 THEN startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps) ELSE 0 END), 0) AS endKolRozn,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startSum + prihodSum - (rashodSumAbo + rashodSumArap + rashodSumAktsps) ELSE 0 END), 0) AS endSumApt,
  ISNULL(SUM(CASE WHEN sklad_id = 2 THEN startKol + prihodKol - (rashodKolAbo + rashodKolArap + rashodKolAktsps) ELSE 0 END), 0) AS endKolApt
FROM CombinedData;
        `);
        const reportData = result.recordset[0];

        // Создаем новый Excel-файл
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Отчет');
    
        // Устанавливаем ширину столбца A
        worksheet.getColumn('A').width = 50; // Ширина столбца A
    
        // Добавляем заголовок отчета
        const monthName = getMonthName(month); // Получаем название месяца
        const headerRow = worksheet.addRow([`Отчет аптеки №${anom} за ${monthName} ${year}`]);
        headerRow.font = { bold: true, size: 16 };
        headerRow.alignment = { horizontal: 'center' };
        worksheet.mergeCells('A1:B1'); // Объединяем ячейки для заголовка
    
        // Добавляем пустую строку для отступа
        worksheet.addRow([]);
    
        // Основные поля (жирный шрифт, увеличенный размер, с нумерацией)
        const mainFields = [
          { indicator: '1. Остаток суммы на начало месяца', value: reportData.startSum || 0 },
          { indicator: '2. Остаток количества на начало месяца', value: reportData.startKol || 0 },
        ];
    
        mainFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.font = { bold: true, size: 12 };
          row.getCell(1).alignment = { indent: 1 }; // Отступ для нумерации
        });
    
        // Дополнительные поля для остатков на начало
        const startAdditionalFields = [
          { indicator: 'в т.ч. Склад розница сумма (начало)', value: reportData.startSumRozn || 0 },
          { indicator: 'в т.ч. Склад розница количество (начало)', value: reportData.startKolRozn || 0 },
          { indicator: 'в т.ч. Склад Апт.произ сумма (начало)', value: reportData.startSumApt || 0 },
          { indicator: 'в т.ч. Склад Апт.произ количество (начало)', value: reportData.startKolApt || 0 },
        ];
    
        startAdditionalFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.getCell(1).alignment = { indent: 4 }; // Увеличенный отступ
        });
    
        // Основные поля для прихода
        const prihodFields = [
          { indicator: '3. Приход сумма', value: reportData.prihodSum || 0 },
          { indicator: '4. Приход количество', value: reportData.prihodKol || 0 },
        ];
    
        prihodFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.font = { bold: true, size: 12 };
          row.getCell(1).alignment = { indent: 1 }; // Отступ для нумерации
        });
    
        // Дополнительные поля для прихода
        const prihodAdditionalFields = [
          { indicator: 'в т.ч. Склад розница сумма (приход)', value: reportData.prihodSumRozn || 0 },
          { indicator: 'в т.ч. Склад розница количество (приход)', value: reportData.prihodKolRozn || 0 },
          { indicator: 'в т.ч. Склад Апт.произ сумма (приход)', value: reportData.prihodSumApt || 0 },
          { indicator: 'в т.ч. Склад Апт.произ количество (приход)', value: reportData.prihodKolApt || 0 },
        ];
    
        prihodAdditionalFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.getCell(1).alignment = { indent: 4 }; // Увеличенный отступ
        });
    
        // Основные поля для расхода
        const rashodFields = [
          { indicator: '5. Расход сумма', value: reportData.rashodSum || 0 },
          { indicator: '6. Расход количество', value: reportData.rashodKol || 0 },
        ];
    
        rashodFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.font = { bold: true, size: 12 };
          row.getCell(1).alignment = { indent: 1 }; // Отступ для нумерации
        });
    
        // Дополнительные поля для расхода
        const rashodAdditionalFields = [
          { indicator: 'в т.ч. Акты безналичного отпуска (сумма)', value: reportData.rashodSumAbo || 0 },
          { indicator: 'в т.ч. Акты списания (сумма)', value: reportData.rashodSumAktsps || 0 },
          { indicator: 'в т.ч. Акты расхода аптечного производства (сумма)', value: reportData.rashodSumArap || 0 },
          { indicator: 'в т.ч. Акты безналичного отпуска (кол.)', value: reportData.rashodKolAbo || 0 },
          { indicator: 'в т.ч. Акты списания (кол.)', value: reportData.rashodKolAktsps || 0 },
          { indicator: 'в т.ч. Акты расхода аптечного производства (кол.)', value: reportData.rashodKolArap || 0 },
        ];
    
        rashodAdditionalFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.getCell(1).alignment = { indent: 4 }; // Увеличенный отступ
        });
    
        // Основные поля для остатков на конец
        const endFields = [
          { indicator: '7. Остаток суммы на конец', value: reportData.endSum || 0 },
          { indicator: '8. Остаток количества на конец', value: reportData.endKol || 0 },
        ];
    
        endFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.font = { bold: true, size: 12 };
          row.getCell(1).alignment = { indent: 1 }; // Отступ для нумерации
        });
    
        // Дополнительные поля для остатков на конец
        const endAdditionalFields = [
          { indicator: 'в т.ч. Остаток суммы на конец месяца', value: reportData.endSumRozn || 0 },
          { indicator: 'в т.ч. Остаток количества на конец месяца', value: reportData.endKolRozn || 0 },
          { indicator: 'в т.ч. Склад Апт.произ сумма (конец)', value: reportData.endSumApt || 0 },
          { indicator: 'в т.ч. Склад Апт.произ количество (конец)', value: reportData.endKolApt || 0 },
        ];
    
        endAdditionalFields.forEach((field) => {
          const row = worksheet.addRow([field.indicator, field.value]);
          row.getCell(1).alignment = { indent: 4 }; // Увеличенный отступ
        });
    
        // Устанавливаем заголовки для скачивания файла
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=report_${year}_${month}.xlsx`
        );
    
        // Отправляем файл клиенту
        await workbook.xlsx.write(res);
        res.end();
      } catch (err) {
        console.error('Ошибка при формировании Excel-файла:', err);
        res.status(500).json({ error: 'Ошибка при формировании Excel-файла' });
      }
  });

module.exports = router;