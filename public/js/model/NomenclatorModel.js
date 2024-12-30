export default class NomenclatorModel {
  async getNomenclator() {
    try {
      const token = localStorage.getItem('token'); // Получаем токен из localStorage
      console.log(token)
      const response = await fetch('/api/nomenclator', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных номенклатора');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }
}