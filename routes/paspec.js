const express = require('express');
const router = express.Router();
const sql = require('mssql');
const dbConfig = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/paspec/:paId', authMiddleware, async (req, res) => {
    const { paId } = req.params;
    try {
      const pool = await sql.connect(dbConfig);
      const result = await pool.request()
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
  
      res.json(result.recordset);
    } catch (err) {
      console.error('Ошибка при получении данных ', err);
      res.status(500).json({ error: 'Ошибка при получении данных ' });
    }
  });
  router.put('/paspec/update/:pasId', authMiddleware, async (req, res) => {
    const { pasId } = req.params;
    const { rnac, rcena } = req.body;
  
    try {
      const pool = await sql.connect(dbConfig);
      await pool.request()
        .input('pasId', sql.Int, pasId)
        .input('rnac', sql.Decimal(18, 2), rnac)
        .input('rcena', sql.Decimal(18, 2), rcena)
        .query(`
          UPDATE PRIEM_AKT_SPEC
          SET rnac = @rnac, rcena = @rcena
          WHERE id = @pasId
        `);
  
      res.json({ success: true });
    } catch (err) {
      console.error('Ошибка при обновлении спецификации:', err);
      res.status(500).json({ error: 'Ошибка при обновлении спецификации' });
    }
  });

module.exports = router;