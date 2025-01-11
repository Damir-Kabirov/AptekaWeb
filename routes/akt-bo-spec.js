const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

function generateEAN13(pas_id, anom) {
    const padded = `${pas_id}${anom}`.padStart(12, '0').slice(0, 12);
    const checksum = (10 - (padded.split('').reduce((sum, digit, index) => 
      sum + (index % 2 === 0 ? +digit : +digit * 3), 0) % 10)) % 10;
    return `${padded}${checksum}`;
  }
  
// Получение спецификации акта безналичного отпуска
router.get('/aktbo/spec/:aktBoId', authMiddleware, async (req, res) => {
  const { aktBoId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    // Запрос данных спецификации
    const result = await pool.request()
      .input('aktBoId', sql.Int, aktBoId)
      .query(`
        SELECT 
          ds.pas_id as pas_id,
          ds.pas_anom as pas_anom,
          ds.document_id, 
          pas.prep_id, 
          pas.seria, 
          pas.pr_cena_bnds, 
          pas.pr_cena_nds, 
          pas.pc_cena_bnds, 
          pas.pc_cena_nds, 
          ds.kol_tov, 
          pas.rnac, 
          pas.rcena, 
          pas.tarif, 
          pas.sklad_id, 
          pas.ttns_id, 
          pas.srok_god,
          n.prep_name,
          s.name AS sklad_name, -- Наименование из таблицы складов
          tz.kol_tov AS kol_tov_ost -- Остаток на складе из таблицы TOV_ZAP
        FROM Document_spec ds
        LEFT JOIN TOV_ZAP tz ON tz.pas_id = ds.pas_id AND tz.pas_anom = ds.pas_anom
        LEFT JOIN PRIEM_AKT_SPEC pas ON pas.id = ds.pas_id AND pas.anom = ds.pas_anom
        LEFT JOIN Sklad s ON pas.sklad_id = s.id -- Соединяем с таблицей складов
        LEFT JOIN Nomenclator n ON pas.prep_id = n.id 
        WHERE ds.document_id = @aktBoId
      `);
      const spec = result.recordset.map(item => (
        
        {
        pasId: item.pas_id, // ID спецификации (дублируем для удобства)
        pasAnom:item.pas_anom,
        barcode: generateEAN13(item.pas_id, item.pas_anom), // Генерируем штрих-код
        name: item.prep_name, // Наименование товара
        seria: item.seria, // Серия
        pr_cena_bnds: item.pr_cena_bnds, // Цена производителя без НДС
        pr_cena_nds: item.pr_cena_nds, // Цена производителя с НДС
        pc_cena_bnds: item.pc_cena_bnds, // Цена поставщика без НДС
        pc_cena_nds: item.pc_cena_nds, // Цена поставщика с НДС
        quantity: item.kol_tov, // Количество
        rnac: item.rnac, // Наценка
        rcena: item.rcena, // Розничная цена
        tarif: item.tarif, // Тариф
        sklad_id: item.sklad_id, // ID склада
        sklad_name: item.sklad_name, // Название склада
        ttns_id: item.ttns_id, // ID TTN
        expiryDate: item.srok_god, // Срок годности
        kol_tov_ost: item.kol_tov_ost, // Остаток на складе
      }));

    res.json(spec);
  } catch (err) {
    console.error('Ошибка при получении спецификации акта безналичного отпуска:', err);
    res.status(500).json({ error: 'Ошибка при получении спецификации акта безналичного отпуска' });
  }
});

// Обновление спецификации акта безналичного отпуска
router.put('/aktbo/spec/update/:pasId', authMiddleware, async (req, res) => {
  const { pasId } = req.params; // ID позиции
  const { kol_tov, document_id } = req.body; // Новое количество и ID документа

  try {
    const pool = await sql.connect(dbConfig);

    // Проверяем, что все необходимые поля переданы
    if (!kol_tov || !document_id) {
      return res.status(400).json({ error: 'Недостаточно данных для обновления' });
    }

    // Обновляем количество товара в таблице Document_spec
    const result = await pool.request()
      .input('pasId', sql.Int, pasId)
      .input('document_id', sql.Int, document_id)
      .input('kol_tov', sql.Decimal(18, 2), kol_tov)
      .query(`
        UPDATE Document_spec
        SET kol_tov = @kol_tov
        WHERE pas_id = @pasId
          AND document_id = @document_id
      `);

    // Проверяем, была ли обновлена хотя бы одна строка
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Позиция не найдена' });
    }

    // Возвращаем успешный ответ
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при обновлении количества товара:', err);
    res.status(500).json({ error: 'Ошибка при обновлении количества товара' });
  }
});
router.delete('/aktbo/spec/delete/:pasId', authMiddleware, async (req, res) => {
  const { pasId } = req.params; // ID позиции
  const { document_id } = req.body; // ID документа

  try {
    const pool = await sql.connect(dbConfig);

    // Проверяем, что document_id передан
    if (!document_id) {
      return res.status(400).json({ error: 'Недостаточно данных для удаления' });
    }

    // Удаляем позицию из таблицы Document_spec
    const result = await pool.request()
      .input('pasId', sql.Int, pasId)
      .input('document_id', sql.Int, document_id)
      .query(`
        DELETE FROM Document_spec
        WHERE pas_id = @pasId
          AND document_id = @document_id
      `);

    // Проверяем, была ли удалена хотя бы одна строка
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Позиция не найдена' });
    }

    // Возвращаем успешный ответ
    res.json({ success: true });
  } catch (err) {
    console.error('Ошибка при удалении позиции:', err);
    res.status(500).json({ error: 'Ошибка при удалении позиции' });
  }
});

module.exports = router;