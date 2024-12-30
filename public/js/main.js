import AuthPresenter from './presenter/AuthPresenter.js';

document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');

  // Создаем экземпляр AuthPresenter
  const authPresenter = new AuthPresenter();

  if (token) {
    // Если токен есть, переходим на защищенную страницу
    authPresenter.redirectToMainPresenter();
  } else {
    // Если токена нет, показываем форму входа
    authPresenter.init();
  }
});