export default class DogovorModel {
  async getDogovors() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dogovors', {
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

  async addDogovor(dogovor) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dogovors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dogovor),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении договора');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

  async updateDogovor(dogovor) {
    try {
      const token = localStorage.getItem('token');
      const dogovorId = Number(dogovor.id);
      const response = await fetch(`/api/dogovors/${dogovorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dogovor),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении договора');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

  async deleteDogovor(dogovorId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dogovors/${dogovorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении договора');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

  async getDogovorById(dogovorId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dogovors/${dogovorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении данных договора');
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка:', error);
      throw error;
    }
  }

}