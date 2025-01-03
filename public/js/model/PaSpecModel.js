export default class PaSpecModel {
    async getPaSpecByPaId(paId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/paspec/${paId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных спецификации');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    async updatePaSpec(pasId, rnac, rcena) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/paspec/update/${pasId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rnac, rcena }),
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при обновлении данных спецификации');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  }