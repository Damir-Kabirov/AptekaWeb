import AuthModel from '../model/AuthModel.js';
import MainPresenter from './MainPresenter.js';

export default class AuthPresenter {
  constructor() {
    this.model = new AuthModel();
    this.body = document.querySelector('body');
  }

  init() {
    // Отрисовываем форму входа
    this.body.innerHTML = `
      <div class="auth-main">
        <form action="#" class="auth-form">
          <h3 class="auth-title">Авторизация</h3>
          <label for="login">Логин</label>
          <input id="input-login" type="text" class="input input-auth" name="login">
          <label for="password">Пароль</label>
          <input id="input-password" type="password" class="input input-auth" name="password">
          <button class="btn auth-btn">Войти</button>
        </form>
      </div>
    `;

    // Обработчик для формы входа
    document.querySelector('.auth-form').addEventListener('submit', this.handleSubmit.bind(this));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const login = document.getElementById('input-login').value;
    const password = document.getElementById('input-password').value;

    try {
      const data = await this.model.login(login, password);
      this.redirectToMainPresenter(); // Перенаправляем на MainPresenter
    } catch (err) {
      document.querySelector('.auth-title').textContent = err.message;
    }
  }

  redirectToMainPresenter() {
    // Инициализируем MainPresenter
    const mainPresenter = new MainPresenter(this.body);
    mainPresenter.init();
  }
}