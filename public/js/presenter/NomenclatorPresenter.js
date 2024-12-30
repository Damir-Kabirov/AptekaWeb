// presenter/NomenclatorPresenter.js
import NomenclatorModel from '../model/NomenclatorModel.js';
import NomenclatorView from '../view/nomenclator-view.js';
import { render } from '../utils/render.js';

export default class NomenclatorPresenter {
  constructor(container) {
    this.container = container;
    this.model = new NomenclatorModel();
    this.view = null;
  }

  async init() {
    try {
      // Получаем данные из модели
      const data = await this.model.getNomenclator();

      // Создаем представление с данными
      this.view = new NomenclatorView(data);

      // Отрисовываем данные в контейнере
      render(this.view, this.container);

      // Добавляем обработчик для кнопки "Добавить позицию"
      this.setupAddButtonHandler();
    } catch (error) {
      console.error('Ошибка при загрузке номенклатора:', error);
      alert('Ошибка при загрузке данных номенклатора');
    }
  }

  setupAddButtonHandler() {
    // Находим кнопку "Добавить позицию"
    const addButton = this.container.querySelector('.nomenclator-btn');

    // Добавляем обработчик события
    addButton.addEventListener('click', () => {
      this.openModal();
    });
  }

  openModal() {
    // Создаем модальное окно
    const modalTemplate = `
      <div class="modal-nomenclator-overlay">
        <div class="modal-nomenclator">
          <a href="#" class="modal-nomenclator-close">Х</a>
          <h4 class="modal-nomenclator-title">Добавить позицию</h4>
          <form action="#" class="form-nomenclator">
            <label for="prepname">Наименование перпарата</label>
            <input type="text" class="form-nomenclator-prepname" name="prepname">
            <label for="jnv">Наличие категории ЖНВ</label>
            <input type="checkbox" class="form-nomenclator-jnv" name="jnv">
            <label for="manufacturer">Производитель</label>
            <input type="text" class="form-nomenclator-manufacturer" name="manufacturer">
            <button class="btn form-nomenclator-btn">Добавить</button>
          </form>
        </div>
      </div>
    `;

    // Добавляем модальное окно в DOM
    this.container.insertAdjacentHTML('beforeend', modalTemplate);

    // Добавляем обработчик для закрытия модального окна
    const closeButton = this.container.querySelector('.modal-nomenclator-close');
    closeButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeModal();
    });

    // Добавляем обработчик для отправки формы
    const form = this.container.querySelector('.form-nomenclator');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(form);
    });
  }

  closeModal() {
    // Удаляем модальное окно из DOM
    const modalOverlay = this.container.querySelector('.modal-nomenclator-overlay');
    modalOverlay.remove();
  }

  async handleFormSubmit(form) {
    // Собираем данные из формы
    const prepname = form.querySelector('.form-nomenclator-prepname').value;
    const jnv = form.querySelector('.form-nomenclator-jnv').checked;
    const manufacturer = form.querySelector('.form-nomenclator-manufacturer').value;

    // Создаем объект для отправки на сервер
    const newItem = {
      prepname,
      jnv,
      manufacturer,
    };
    console.log(newItem)
    try {
      // Отправляем данные на сервер
      const token = localStorage.getItem('token');
      const response = await fetch('/api/nomenclator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        // Если данные успешно добавлены, обновляем список номенклатора
        const data = await response.json();
        this.updateNomenclatorList(data);

        // Закрываем модальное окно
        this.closeModal();
      } else {
        console.error('Ошибка при добавлении позиции');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }

  updateNomenclatorList(data) {
    this.container.innerHTML = '';
    // Создаем новое представление с обновленными данными
    this.view = new NomenclatorView(data);

    // Отрисовываем обновленные данные в контейнере
    render(this.view, this.container);
  }
}