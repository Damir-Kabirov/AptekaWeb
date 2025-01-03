export default class TtnModel {
  async getTtns(anom) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ttns/${anom}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных ТТН');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

  async addTtn(ttn) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ttn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ttn),
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

  async deleteTtn(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ttn/${id}`, {
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

  async updateTtn(ttn) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ttn', {
        method: 'PUT', // Используем метод PUT для обновления
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ttn), // Отправляем обновленные данные ТТН
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении накладной');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

  async otrTtn(data) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ttn/otr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при отработке накладной');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }
}