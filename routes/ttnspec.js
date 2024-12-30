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

module.exports = router;