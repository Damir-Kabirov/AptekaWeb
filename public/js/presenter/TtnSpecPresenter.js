import { render } from '../utils/render.js';
import TtnSpecModel from '../model/TtnSpecModel.js';
import TtnSpecView from '../view/TtnSpecView.js';

export default class TtnSpecPresenter {
  constructor(container,ttnId) {
    this.container = container;
    this.ttnSpecModel = new TtnSpecModel(); // Модель для работы с договорами
    this.view = null;
    this.ttnId=ttnId
  }

  async init() {
    try {
      this.container.innerHTML = '';
      // Получаем данные о договорах из модели
      const data = await this.ttnSpecModel.getTtnSpec(this.ttnId);

      // Создаем представление с данными
      this.view = new TtnSpecView(data);

      // Отрисовываем данные в контейнере
      render(this.view, this.container);

      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке договоров:', error);
      alert('Ошибка при загрузке данных договоров');
    }
  }

  bindEvents() {
    
  }
  async refreshTtnSpecList(ttnId) {
        this.ttnId=ttnId
        try {
          if (this.view) {
            this.view.removeElement();
          }
          const data = await this.ttnSpecModel.getTtnSpec(this.ttnId);
          this.view = new TtnSpecView(data);
          render(this.view, this.container);
          this.bindEvents();
        } catch (error) {
          console.error('Ошибка при обновлении спецификации ТТН:', error);
          alert('Ошибка при обновлении спецификации ТТН');
        }
  }
}