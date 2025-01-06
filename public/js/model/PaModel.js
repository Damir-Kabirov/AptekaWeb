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
    async downloadPaExcel(paId) {
      try {
        // Отправляем GET-запрос на сервер
        const response = await fetch(`/api/pas/export/${paId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // Добавляем токен авторизации
          },
        });
    
        // Проверяем статус ответа
        if (!response.ok) {
          throw new Error('Ошибка при загрузке файла');
        }
    
        // Получаем данные в виде Blob (бинарные данные)
        const blob = await response.blob();
    
        // Создаем ссылку для скачивания файла
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Приемный акт ${paId}.xlsx`; // Имя файла
        document.body.appendChild(a);
        a.click(); // Программно кликаем по ссылке для скачивания
    
        // Убираем ссылку из DOM
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url); // Освобождаем память
      } catch (error) {
        console.error('Ошибка при скачивании файла:', error);
        alert('Ошибка при скачивании файла. Проверьте консоль для подробностей.');
      }
    }
}