export default class OthetModel {

    async getReportData(anom, year, month) {
        try {
          // Получаем токен из localStorage
          const token = localStorage.getItem('token');
    
          // Формируем URL с параметрами
          const url = `/api/report?anom=${anom}&year=${year}&month=${month}`;
    
          // Отправляем GET-запрос с токеном в заголовке
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
            },
          });
    
          // Проверяем статус ответа
          if (!response.ok) {
            throw new Error('Ошибка при получении данных отчета');
          }
    
          // Парсим JSON-ответ
          const data = await response.json();
    
          // Возвращаем данные
          return data;
        } catch (error) {
          console.error('Ошибка в OthetModel:', error);
          throw error; // Пробрасываем ошибку для обработки в Presenter
        }
      }
      async downloadReportExcel(anom, year, month) {
        try {
          // Получаем токен из localStorage
          const token = localStorage.getItem('token');
      
          // Формируем URL с параметрами
          const url = `/api/report/excel?anom=${anom}&year=${year}&month=${month}`;
      
          // Отправляем GET-запрос с токеном в заголовке
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`, // Добавляем токен в заголовок
            },
          });
      
          // Проверяем статус ответа
          if (!response.ok) {
            throw new Error('Ошибка при скачивании Excel-файла');
          }
      
          // Получаем blob из ответа
          const blob = await response.blob();
      
          // Создаем ссылку для скачивания файла
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `report_${year}_${month}.xlsx`; // Имя файла
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      
          // Освобождаем URL
          window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
          console.error('Ошибка в OthetModel:', error);
          throw error; // Пробрасываем ошибку для обработки в Presenter
        }
      }
  }