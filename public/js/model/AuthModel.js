export default class AuthModel {
    async login(login, password) {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ login, password }),
        });
  
        const data = await response.json();
  
        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('anom', data.anom);
          return data;
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        throw new Error('Ошибка сервера: ' + err.message);
      }
    }
  }