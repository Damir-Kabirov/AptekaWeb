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
    async addTtnSpec(ttns) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/ttnspec', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(ttns),
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при добавлении накладной');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    async deleteTtnSpec(id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/ttnspec/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при удалении накладной');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
}