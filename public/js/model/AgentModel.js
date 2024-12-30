export default class AgentModel {
    async getAgents() {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/agents', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных контрагентов');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
    
    async addAgent(agent) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(agent),
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при добавлении контрагента');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }

    async getAgentById(agentId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при получении данных контрагента');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  
    async updateAgent(agent) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/agents/${agent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(agent),
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при обновлении контрагента');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  
    async deleteAgent(agentId) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/agents/${agentId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при удалении контрагента');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }

    async findAgent(inn, kpp) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/agents/find?inn=${inn}&kpp=${kpp}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Ошибка при поиске контрагента');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Ошибка:', error);
        throw error;
      }
    }
  }