export default class AktModel {
    async getAktBo(anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/${anom}`, {
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
    async getAktSps(anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api//aktsps/${anom}`, {
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
    async deleteAkt(aktId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/delete/${aktId}`, {
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

    async processAktBo(aktBoId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/${aktBoId}/process`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('Ошибка при отработке накладной');
        }
    
        const result = await response.json();
    
        if (result.success) {
          return result; // Успешная отработка
        } else {
          throw new Error(result.message || 'Недостаточно товара на складе');
        }
      } catch (error) {
        console.error('Ошибка при отработке накладной:', error);
        throw error;
      }
    }
    async processAktSps(aktBoId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktsps/${aktBoId}/process`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error('Ошибка при отработке накладной');
        }
    
        const result = await response.json();
    
        if (result.success) {
          return result; // Успешная отработка
        } else {
          throw new Error(result.message || 'Недостаточно товара на складе');
        }
      } catch (error) {
        console.error('Ошибка при отработке накладной:', error);
        throw error;
      }
    }
}