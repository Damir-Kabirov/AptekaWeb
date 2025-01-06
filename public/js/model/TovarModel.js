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
  
    async searchTovars(query, searchType, anom, filterType = 'all') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/tovars/search/${anom}?query=${query}&type=${searchType}&filter=${filterType}`, {
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
  
      async filterTovarsByExpiry(filterType, anom, query = '', searchType = 'name') {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`/api/tovars/filter-expiry/${anom}?type=${filterType}&query=${query}&searchType=${searchType}`, {
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

      async createDocumentWithSpec(documentData, documentSpecs) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch('/api/documents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ documentData, documentSpecs }),
          });
      
          const result = await response.json(); // Парсим ответ сервера
      
          if (!response.ok) {
            // Если сервер вернул ошибку, выбрасываем её с сообщением
            throw new Error(result.error || 'Ошибка при создании документа и спецификации');
          }
      
          return result; // Возвращаем результат, если всё успешно
        } catch (error) {
          console.error('Ошибка:', error);
          throw error; // Пробрасываем ошибку дальше
        }
      }
  }