import HeaderView from '../view/header-view.js';
import WorkWindowView from '../view/work-window-view.js';
import NomenclatorPresenter from './NomenclatorPresenter.js';
import NavigationPresenter from './NavigationPresenter.js';
import AgentPresenter from './AgentPresenter.js';
import DogovorPresenter from './DogovorPresenter.js';
import AuthPresenter from './AuthPresenter.js';
import TTNPresenter from './TtnPresenter.js';
import PaPresenter from './PaPresenter.js';
import TovarPresenter from './TovarPresentor.js';
import AktBoPresenter from './AktBoPresenter.js';
import OthetPresenter from './OthetPresentor.js';
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

    const PaLink = this.container.querySelector('.load-pa');
    if (PaLink) {
      PaLink.addEventListener('click', this.handlePaClick.bind(this));
    }
    const tovarLink = this.container.querySelector('.load-tovar');
    if (tovarLink) {
      tovarLink.addEventListener('click', this.handleTovarClick.bind(this));
    }
    const aktBoLink = this.container.querySelector('.load-aktBo');
    if (aktBoLink) {
      aktBoLink.addEventListener('click', this.handleAktBoClick.bind(this));
    }
    const aktSPSLink = this.container.querySelector('.load-aktSps');
    if (aktSPSLink) {
      aktSPSLink.addEventListener('click', this.handleAktSpsClick.bind(this));
    }
    const othetLink = this.container.querySelector('.load-othet');
    if (othetLink) {
      othetLink.addEventListener('click', this.handleOthetClick.bind(this));
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
  handleOthetClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
    const othetPresenter = new OthetPresenter (contentContainer);
    othetPresenter.init();
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
  handlePaClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
  
    // Создаем контейнер для таблицы ТТН
    const paContainer = document.createElement('div');
    paContainer.classList.add('pa-block');
    contentContainer.appendChild(paContainer);
  
    // Создаем контейнер для спецификации ТТН
    const paSpecContainer = document.createElement('div');
    paSpecContainer.classList.add('pas-spec-block');
    contentContainer.appendChild(paSpecContainer);
  
    // Инициализация TTNPresenter с двумя контейнерами
    const paPresenter = new PaPresenter(paContainer, paSpecContainer);
    paPresenter.init();
  }
  handleAktBoClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
  
    
    const aktContainer = document.createElement('div');
    aktContainer.classList.add('akt-block');
    contentContainer.appendChild(aktContainer);
  
 
    const aktSpecContainer = document.createElement('div');
    aktSpecContainer.classList.add('akt-spec-block');
    contentContainer.appendChild(aktSpecContainer);
  
    
    const paPresenter = new AktBoPresenter(aktContainer, aktSpecContainer,'BO');
    paPresenter.init();
  }
  handleTovarClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
    const tovarPresenter = new TovarPresenter(contentContainer);
    tovarPresenter.init();
  }
  handleAktSpsClick(e) {
    e.preventDefault();
    const contentContainer = this.container.querySelector('.content');
    contentContainer.innerHTML = '';
  
    
    const aktContainer = document.createElement('div');
    aktContainer.classList.add('akt-block');
    contentContainer.appendChild(aktContainer);
  
 
    const aktSpecContainer = document.createElement('div');
    aktSpecContainer.classList.add('akt-spec-block');
    contentContainer.appendChild(aktSpecContainer);
  
    
    const paPresenter = new AktBoPresenter(aktContainer, aktSpecContainer,'SPS');
    paPresenter.init();
  }
}