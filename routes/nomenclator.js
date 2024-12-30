const express = require('express');
const sql = require('mssql');
const dbConfig = require('../config/db');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
router.use(authMiddleware);
// Функция для получения данных номенклатора
async function getNomenclator() {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        id AS id, 
        prep_name AS name, 
        manufacturer AS manufacturer, 
        jnv AS jnv 
      FROM Nomenclator
    `);
    return result.recordset; // Возвращает данные в формате JSON
  } catch (err) {
    console.error('Ошибка при выполнении запроса:', err);
    throw err;
  }
}
 
// Маршрут для получения данных номенклатора
router.get('/nomenclator', async (req, res) => {
  try {
    const nomenclatorData = await getNomenclator();
    res.json(nomenclatorData); // Возвращает данные в формате JSON
  } catch (err) {
    res.status(500).json({ error: 'Ошибка при получении данных номенклатора' });
  }
});

router.get('/nomenclator/search', async (req, res) => {
  const { query } = req.query;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('query', sql.NVarChar, `%${query}%`)
      .query(`
        SELECT 
          id AS id, 
          prep_name AS name, 
          manufacturer AS manufacturer 
        FROM Nomenclator
        WHERE prep_name LIKE @query
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error('Ошибка при поиске препаратов:', err);
    res.status(500).json({ error: 'Ошибка при поиске препаратов' });
  }
});

// Маршрут для добавления новой позиции
router.post('/nomenclator', async (req, res) => {
  const { prepname, jnv, manufacturer } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
    .input('prep_name', sql.NVarChar, prepname) // Исправлено на prep_name
    .input('jnv', sql.Bit, jnv)
    .input('manufacturer', sql.NVarChar, manufacturer)
    .query(`
      INSERT INTO Nomenclator (prep_name, jnv, manufacturer)
      VALUES (@prep_name, @jnv, @manufacturer)
    `);
    // Возвращаем обновленный список номенклатора
    const updatedData = await getNomenclator();
    res.json(updatedData);
  } catch (err) {
    console.error('Ошибка при добавлении позиции:', err);
    res.status(500).json({ error: 'Ошибка при добавлении позиции' });
  }
});

module.exports = router;