import AgentModel from '../model/AgentModel.js'; // Модель для работы с контрагентами
import AgentView from '../view/AgentView.js'; // Представление для отображения контрагентов
import AgentModal from '../view/AgentModal.js'; // Модальное окно для редактирования
import AddAgentModal from '../view/AddAgentModal.js'; // Модальное окно для добавления
import { render } from '../utils/render.js';

export default class AgentPresenter {
  constructor(container) {
    this.container = container;
    this.model = new AgentModel();
    this.view = null;
  }

  async init() {
    try {
      // Получаем данные о контрагентах из модели
      const data = await this.model.getAgents();

      // Создаем представление с данными
      this.view = new AgentView(data);

      // Отрисовываем данные в контейнере
      render(this.view, this.container);

      // Обработчик для ссылок на контрагентов
      this.setupAgentLinkHandlers();

      // Обработчик для кнопки "Добавить контрагента"
      this.setupAddAgentButtonHandler();
    } catch (error) {
      console.error('Ошибка при загрузке контрагентов:', error);
      alert('Ошибка при загрузке данных контрагентов');
    }
  }

  // Устанавливаем обработчики для ссылок на контрагентов
  setupAgentLinkHandlers() {
    const agentLinks = this.container.querySelectorAll('.agent_link');
    agentLinks.forEach(link => {
      link.addEventListener('click', this.handleAgentClick.bind(this));
    });
  }

  // Устанавливаем обработчик для кнопки "Добавить контрагента"
  setupAddAgentButtonHandler() {
    const addAgentButton = this.container.querySelector('.btn__standart');
    addAgentButton.addEventListener('click', () => {
      this.openAddAgentModal();
    });
  }

  // Обработчик клика на ссылку контрагента
  handleAgentClick(e) {
    e.preventDefault();
    const agentId = parseInt(e.currentTarget.dataset.agentId, 10);

    // Получаем данные о контрагенте
    this.model.getAgentById(agentId).then(agent => {
      this.openModal(agent);
    }).catch(error => {
      console.error('Ошибка при получении данных контрагента:', error);
    });
  }

  // Открываем модальное окно для редактирования контрагента
  openModal(agent) {
    // Создаем модальное окно
    const modal = new AgentModal(agent);

    // Устанавливаем обработчики для сохранения и удаления
    modal.onSave((updatedAgent) => {
      this.handleSaveAgent(updatedAgent);
    });

    modal.onDelete((agentId) => {
      this.handleDeleteAgent(agentId);
    });

    const agentContainer = this.container.querySelector('.agent-container');
    modal.open(agentContainer);
  }

  // Открываем модальное окно для добавления нового контрагента
  openAddAgentModal() {
    // Создаем модальное окно
    const modal = new AddAgentModal();

    // Устанавливаем обработчик для сохранения
    modal.onSave((newAgent) => {
      this.handleAddAgent(newAgent);
    });

    const agentContainer = this.container.querySelector('.agent-container');
    modal.open(agentContainer);
  }

  // Обработчик сохранения изменений контрагента
  handleSaveAgent(updatedAgent) {
    // Отправляем обновленные данные на сервер
    this.model.updateAgent(updatedAgent).then(() => {
      alert('Контрагент успешно обновлен');
      this.refreshAgentList();
    }).catch(error => {
      console.error('Ошибка при обновлении контрагента:', error);
    });
  }

  // Обработчик удаления контрагента
  handleDeleteAgent(agentId) {
    // Удаляем контрагента
    this.model.deleteAgent(agentId).then(() => {
      alert('Контрагент успешно удален');
      this.refreshAgentList();
    }).catch(error => {
      console.error('Ошибка при удалении контрагента:', error);
    });
  }

  // Обработчик добавления нового контрагента
  handleAddAgent(newAgent) {
    // Отправляем новые данные на сервер
    this.model.addAgent(newAgent).then(() => {
      alert('Контрагент успешно добавлен');
      this.refreshAgentList();
    }).catch(error => {
      console.error('Ошибка при добавлении контрагента:', error);
    });
  }

  // Обновляем список контрагентов
  refreshAgentList() {
    // Удаляем старый список контрагентов
    if (this.view) {
      this.view.removeElement();
    }

    // Обновляем список контрагентов
    this.init();
  }
}