const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/authMiddleware');
const nomenclatorRoutes = require('./routes/nomenclator');
const agentRoutes = require('./routes/agent');
const dogovorRoutes = require('./routes/dogovor');
const ttnRoutes = require('./routes/ttn');
const ttnSpecRoutes = require('./routes/ttnspec');
const skladRoutes = require('./routes/sklad');


const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, 'public')));

// Настройка body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Подключение маршрутов
app.use('/api', authRoutes);
app.use('/api', nomenclatorRoutes);
app.use('/api', agentRoutes);
app.use('/api', dogovorRoutes);
app.use('/api', ttnRoutes);
app.use('/api', ttnSpecRoutes);
app.use('/api', skladRoutes);
// Защищенный маршрут
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Доступ разрешен', user: req.user });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});