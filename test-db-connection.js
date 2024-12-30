const mssql = require('mssql');
const dbConfig = require('./config/db'); // Путь к вашему файлу конфигурации

async function testDatabaseConnection() {
  try {
    const pool = await mssql.connect(dbConfig);
    console.log('Подключение к базе данных успешно установлено');

    // Выполнение тестового запроса
    const result = await pool.request().query('SELECT GETDATE() AS CurrentDateTime');
    console.log('Результат запроса:', result.recordset);

    // Закрытие соединения
    await pool.close();
  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err);
  }
}

testDatabaseConnection();