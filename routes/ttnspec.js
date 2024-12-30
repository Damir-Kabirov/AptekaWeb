const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/ttnspec/:ttnId', authMiddleware, async (req, res) => {
  const { ttnId } = req.params;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('ttnId', sql.Int, ttnId)
      .query(`
        SELECT TTN_SPEC.id, TTN_SPEC.seria,TTN_SPEC.kol_tov as kol,TTN_SPEC.srok_god as srgod,isPas,
        TTN_SPEC.pr_cena_bnds as prbnds,
        TTN_SPEC.pr_cena_nds as prnds,
        TTN_SPEC.pc_cena_bnds as pbnds,
        TTN_SPEC.pc_cena_nds as pnds,
        TTN_SPEC.rnac,
        TTN_SPEC.tarif,
        TTN_SPEC.rcena,
        Sklad.name as sklad,
        Nomenclator.prep_name as prepname,
        Nomenclator.jnv as isJnv
        FROM TTN_SPEC
        join Sklad on Sklad.id=TTN_SPEC.sklad_id
        join Nomenclator on Nomenclator.id=TTN_SPEC.prep_id
        WHERE TTN_SPEC.ttn_id = @ttnId;
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при получении ТТН:', err);
    res.status(500).json({ error: 'Ошибка при получении ТТН' });
  }
});

router.post('/ttnspec', authMiddleware, async (req, res) => {
  const {
    ttnId, // ID ТТН
    name, // ID препарата
    kol_tov, // Количество
    seria, // Серия
    pr_cena_bnds, // Цена производителя без НДС
    pr_cena_nds, // Цена производителя с НДС
    pc_cena_bnds, // Цена поставщика без НДС
    pc_cena_nds, // Цена поставщика с НДС
    tarif, // Тариф
    srok_god, // Срок годности
    anom, // АНОМ
    sklad, // Название склада
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    // Находим ID склада по его названию
    const skladResult = await pool.request()
      .input('skladName', sql.NVarChar, sklad)
      .query('SELECT id FROM Sklad WHERE name = @skladName');

    if (skladResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Склад не найден' });
    }

    const skladId = skladResult.recordset[0].id;

    // Добавляем запись в таблицу TTN_SPEC
    const result = await pool.request()
      .input('ttnId', sql.Int, ttnId) // ID ТТН
      .input('prepId', sql.Int, name)
      .input('seria', sql.NVarChar, seria)
      .input('pr_cena_bnds', sql.Decimal(18, 2), pr_cena_bnds)
      .input('pr_cena_nds', sql.Decimal(18, 2), pr_cena_nds)
      .input('pc_cena_bnds', sql.Decimal(18, 2), pc_cena_bnds)
      .input('pc_cena_nds', sql.Decimal(18, 2), pc_cena_nds)
      .input('kol_tov', sql.Int, kol_tov)
      .input('tarif', sql.Decimal(18, 2), tarif)
      .input('srok_god', sql.Date, srok_god)
      .input('anom', sql.Int, anom)
      .input('skladId', sql.Int, skladId)
      .query(`
        INSERT INTO TTN_SPEC (
          ttn_id, prep_id, seria, pr_cena_bnds, pr_cena_nds, pc_cena_bnds, pc_cena_nds, kol_tov, tarif, srok_god, anom, sklad_id
        ) VALUES (
          @ttnId, @prepId, @seria, @pr_cena_bnds, @pr_cena_nds, @pc_cena_bnds, @pc_cena_nds, @kol_tov, @tarif, @srok_god, @anom, @skladId
        );
      `);

    res.json({ success: true, message: 'Спецификация успешно добавлена' });
  } catch (err) {
    console.error('Ошибка при добавлении спецификации:', err);
    res.status(500).json({ error: 'Ошибка при добавлении спецификации' });
  }
});

router.delete('/ttnspec/:id', authMiddleware, async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM TTN_SPEC
        WHERE id = @id
      `);

    res.json({ message: 'Позиция успешно удалена' });
  } catch (err) {
    console.error('Ошибка при удалении позиции:', err);
    res.status(500).json({ error: 'Ошибка при удалении позиции' });
  }
});


module.exports = router;