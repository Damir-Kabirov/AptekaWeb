// presenter/DogovorPresenter.js
import DogovorModel from '../model/DogovorModel.js';
import DogovorView from '../view/DogovorView.js';
import DogovorModalView from '../view/DogovorModalView.js';
import AgentModel from '../model/AgentModel.js';
import { render } from '../utils/render.js';

export default class DogovorPresenter {
  constructor(container) {
    this.container = container;
    this.dogovorModel = new DogovorModel(); // Модель для работы с договорами
    this.agentModel = new AgentModel(); // Модель для работы с контрагентами
    this.view = null;
  }

  async init() {
    try {
      // Получаем данные о договорах из модели
      const data = await this.dogovorModel.getDogovors();

      // Создаем представление с данными
      this.view = new DogovorView(data);

      // Отрисовываем данные в контейнере
      render(this.view, this.container);

      // Привязываем события
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке договоров:', error);
      alert('Ошибка при загрузке данных договоров');
    }
  }

  bindEvents() {
    // Открытие модального окна для редактирования договора
    document.querySelectorAll('.dogovor_link').forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const dogovorId = parseInt(link.dataset.dogovorId, 10);
        console.log(dogovorId)
        const dogovor = await this.dogovorModel.getDogovorById(dogovorId); // Получаем данные о договоре
        const modalView = new DogovorModalView(dogovor); // Передаем данные в модальное окно
        modalView.open(this.container);

        // Привязываем обработчики событий
        modalView.onFindAgent(async (inn, kpp) => {
          
          const agent = await this.agentModel.findAgent(inn, kpp); // Используем AgentModel
          modalView.setAgent(agent);
        });

        modalView.onSave(async (dogovorData) => {
          await this.dogovorModel.updateDogovor(dogovorData);
          alert('Договор успешно обновлен');
          this.refreshDogovorList();
        });
        
        modalView.onDelete(async (dogovorId) => {
          await this.dogovorModel.deleteDogovor(dogovorId);
          alert('Договор успешно удален');
          this.refreshDogovorList();
        });
      });
    });

    document.querySelector('.btn__standart').addEventListener('click', (e) => {
      e.preventDefault();
      const modalView = new DogovorModalView(); // Создаем модальное окно для добавления
      modalView.open(this.container);
  
      // Привязываем обработчики событий
      modalView.onFindAgent(async (inn, kpp) => {
        const agent = await this.agentModel.findAgent(inn, kpp); // Используем AgentModel
        modalView.setAgent(agent);
      });
  
      modalView.onSave(async (dogovorData) => {
        await this.dogovorModel.addDogovor(dogovorData); // Добавляем новый договор
        alert('Договор успешно добавлен');
        this.refreshDogovorList();
      });
    });
  }
  async refreshDogovorList() {
    try {
      // Удаляем старый список договоров
      if (this.view) {
        this.view.removeElement();
      }

      // Получаем обновленные данные о договорах из модели
      const data = await this.dogovorModel.getDogovors();

      // Создаем новое представление с обновленными данными
      this.view = new DogovorView(data);

      // Отрисовываем обновленные данные в контейнере
      render(this.view, this.container);

      // Привязываем события заново
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при обновлении списка договоров:', error);
      alert('Ошибка при обновлении списка договоров');
    }
  }
}