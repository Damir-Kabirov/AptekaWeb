export default class AktBoSpecModel {
    async getAktBoSpecByAktBoId(aktBoId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/spec/${aktBoId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении спецификации акта безналичного отпуска');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    async updateAktBoSpec(pasId, newKol, documentId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/spec/update/${pasId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kol_tov: newKol, // Новое количество
            document_id: documentId, // ID документа
          }),
        });
    
        if (!response.ok) {
          throw new Error('Ошибка при обновлении спецификации акта безналичного отпуска');
        }
    
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    async deleteAktBoSpec(pasId, aktBoId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/aktbo/spec/delete/${pasId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            document_id: aktBoId,
          }),
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при удалении позиции');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  }