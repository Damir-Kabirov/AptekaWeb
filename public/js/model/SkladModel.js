export default class SkladModel {
    async getSklads() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/sklad`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных договоров');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
}