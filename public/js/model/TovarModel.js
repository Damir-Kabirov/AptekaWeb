export default class TovarModel {
    async getTovars(anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tovars/${anom}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных товарных запасов');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  
    async searchTovars(query, searchType, anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tovars/search/${anom}?query=${query}&type=${searchType}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при поиске товаров');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  
    async filterTovarsByExpiry(filterType, anom) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/tovars/filter-expiry/${anom}?type=${filterType}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при фильтрации товаров по сроку годности');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  }