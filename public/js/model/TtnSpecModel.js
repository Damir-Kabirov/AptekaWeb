export default class TtnSpecModel {
    async getTtnSpec(ttnId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/ttnspec/${ttnId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных спецификации накладной');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
}