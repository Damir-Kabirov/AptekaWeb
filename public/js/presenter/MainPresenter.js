import HeaderView from '../view/header-view.js';
import WorkWindowView from '../view/work-window-view.js';
import NomenclatorPresenter from './NomenclatorPresenter.js';
import NavigationPresenter from './NavigationPresenter.js';
import AgentPresenter from './AgentPresenter.js';
import DogovorPresenter from './DogovorPresenter.js';
import AuthPresenter from './AuthPresenter.js';
import TTNPresenter from './TtnPresenter.js';
import { render } from '../utils/render.js';

export default class MainPresenter {
  constructor(container) {
    this.container = container;
    this.headerView = new HeaderView();
    this.workWindowView = new WorkWindowView();
  }

  init() {
    // Отрисовываем заголовок и рабочее окно
    this.container.innerHTML = '';
    render(this.headerView, this.container);
    render(this.workWindowView, this.container);

    // Инициализация NavigationPresenter
    const navigationPresenter = new NavigationPresenter(this.container);
    navigationPresenter.init();

    // Обработчики для ссылок
    const nomenclatorLink = this.container.querySelector('.load-nomenclator');
    if (nomenclatorLink) {
      nomenclatorLink.addEventListener('click', this.handleNomenclatorClick.bind(this));
    }

    const agentLink = this.container.querySelector('.load-agent');
    if (agentLink) {
      agentLink.addEventListener('click', this.handleAgentClick.bind(this));
    }

    const dogovorLink = this.container.querySelector('.load-dogovor'); // Добавляем ссылку на договоры
    if (dogovorLink) {
      dogovorLink.addEventListener('click', this.handleDogovorClick.bind(this));
    }

    // Обработчик для кнопки "Выйти"
    const logoutButton = this.headerView.getElement().querySelector('.btn-close-window');
    if (logoutButton) {
      logoutButton.addEventListener('click', this.handleLogout.bind(this));
    }

    const ttnLink = this.container.querySelector('.load-ttn');
    if (ttnLink) {
      ttnLink.addEventListener('click', this.handleTTNClick.bind(this));
    }
  }

  handleNomenclatorClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
    const nomenclatorPresenter = new NomenclatorPresenter(contentContainer);
    nomenclatorPresenter.init();
  }

  handleAgentClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
    const agentPresenter = new AgentPresenter(contentContainer);
    agentPresenter.init();
  }

  handleDogovorClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
    const dogovorPresenter = new DogovorPresenter(contentContainer);
    dogovorPresenter.init();
  }

  handleLogout() {
    // Удаляем токен и anom из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('anom');

    // Перерисовываем страницу на начальную страницу (AuthPresenter)
    const authPresenter = new AuthPresenter();
    authPresenter.init();
  }
  handleTTNClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
  
    // Создаем контейнер для таблицы ТТН
    const ttnContainer = document.createElement('div');
    ttnContainer.classList.add('ttn-block');
    contentContainer.appendChild(ttnContainer);
  
    // Создаем контейнер для спецификации ТТН
    const ttnSpecContainer = document.createElement('div');
    ttnSpecContainer.classList.add('ttn-spec-block');
    contentContainer.appendChild(ttnSpecContainer);
  
    // Инициализация TTNPresenter с двумя контейнерами
    const ttnPresenter = new TTNPresenter(ttnContainer, ttnSpecContainer);
    ttnPresenter.init();
  }
}