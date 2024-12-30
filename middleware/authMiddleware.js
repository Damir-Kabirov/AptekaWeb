const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ success: false, message: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Добавляем данные пользователя в запрос
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Неверный токен' });
  }
};