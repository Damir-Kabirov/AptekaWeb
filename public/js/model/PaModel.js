export default class PaModel {
    async getPas(anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pas/${anom}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных акта');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    async deletePa(paId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pa/delete/${paId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при удалении приемного акта');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }

    async processPa(paId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pa/process/${paId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при отработке приемного акта');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
}