export default class NomenclatorModel {
  async getNomenclator() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/nomenclator', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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

  async searchDrugs(query) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/nomenclator/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при поиске препаратов');
      }
      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }
}