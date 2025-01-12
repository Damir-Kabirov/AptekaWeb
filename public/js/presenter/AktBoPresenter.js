import { render } from '../utils/render.js';
import { getAnom, removeClassFromChildren } from '../utils/utils.js';
import AktModel from '../model/AktModel.js';
import AktBoView from '../view/AktBoView.js';
import AktSpSView from '../view/AktSpsView.js';
import AktBoSpecPresenter from './AktBoSpecPresentor.js'; // Импортируем презентер для спецификации

export default class AktPresenter {
  constructor(aktContainer, aktSpecContainer, type) {
    this.aktContainer = aktContainer; // Контейнер для актов
    this.aktSpecContainer = aktSpecContainer; // Контейнер для спецификации
    this.type = type; // Тип представления: 'BO' или 'SPS'
    this.aktModel = new AktModel(); // Модель для работы с данными актов
    this.view = null; // Представление
    this.filter = false; // Флаг фильтра
    this.aktBoSpecPresenter = new AktBoSpecPresenter(this.aktSpecContainer); // Презентер для спецификации
  }

  async init(filter = false) {
    try {
      // Загрузка данных в зависимости от типа
      const data = this.type === 'BO' 
        ? await this.aktModel.getAktBo(getAnom()) 
        : await this.aktModel.getAktSps(getAnom());

      console.log('Данные актов загружены:', data);

      // Очищаем контейнеры
      this.aktContainer.innerHTML = '';
      this.aktSpecContainer.innerHTML = '';

      // Фильтрация данных в зависимости от типа
      const filterData = this.filter
        ? data.filter(akt => this.type === 'BO' ? akt.c_id === 8 : akt.c_id === 6) // Для BO: 8, для SPS: 6
        : data.filter(akt => this.type === 'BO' ? akt.c_id === 7 : akt.c_id === 5); // Для BO: 7, для SPS: 5

      console.log('Отфильтрованные данные:', filterData);

      // Создаем представление в зависимости от типа
      this.view = this.type === 'BO' 
        ? new AktBoView(filterData) 
        : new AktSpSView(filterData);

      // Рендерим таблицу актов
      render(this.view, this.aktContainer);

      // Привязываем события
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке актов:', error);
      alert('Ошибка при загрузке данных актов');
    }
  }

  bindEvents() {
    const aktBody = document.querySelector('.aktBo-body');
    if (aktBody) {
      aktBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.aktBo-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');

          // Получаем ID акта
          const aktId = Number(row.getAttribute('data-aktBoId'));
          await this.aktBoSpecPresenter.refreshAktBoSpecList(aktId);

          // Управление состоянием кнопок
          this.aktBtnsControl();
        }
      });
    }

    // Обработчик для кнопки "Удалить акт"
    const btnDeleteAkt = document.querySelector('.aktBo_delet');
    if (btnDeleteAkt) {
      btnDeleteAkt.addEventListener('click', this.deleteAkt.bind(this));
    } else {
      console.error('Кнопка .aktBo_delet не найдена в DOM.');
    }

    // Обработчик для кнопки "Отработать акт"
    const btnProcessAkt = document.querySelector('.aktBo_otr');
    if (btnProcessAkt) {
      btnProcessAkt.addEventListener('click', this.processAkt.bind(this));
    } else {
      console.error('Кнопка .aktBo_otr не найдена в DOM.');
    }

    // Обработчик для фильтра
    const filtersAkt = document.querySelector('.aktBo-filter');
    if (filtersAkt) {
      filtersAkt.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-filter_nootr')) {
          this.filter = false;
          this.init();
        } else if (event.target.classList.contains('btn-filter_otr')) {
          this.filter = true;
          this.init();
        }
      });
    }
  }

  // Управление состоянием кнопок
  aktBtnsControl() {
    const aktContent = document.querySelector('.aktBo-content');
    const aktDeleteBtn = aktContent.querySelector('.aktBo_delet');
    const aktProcessBtn = aktContent.querySelector('.aktBo_otr');

    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const isProcessed = activeRow.querySelector('.aktBo-date-otr').textContent.trim() !== '';
      const isFilterActive = this.checkIfFilterActive(); // Проверяем, активен ли фильтр "Отработанные"

      // Блокируем кнопки, если накладная отработана, активен фильтр "Отработанные" или нет выбранной строки
      aktDeleteBtn.disabled = isProcessed || isFilterActive;
      aktProcessBtn.disabled = isProcessed || isFilterActive;
    } else {
      // Если нет выбранной строки, блокируем кнопки
      aktDeleteBtn.disabled = true;
      aktProcessBtn.disabled = true;
    }
  }

  // Проверка, активен ли фильтр "Отработанные"
  checkIfFilterActive() {
    const filterButton = document.querySelector('.btn-filter_otr.active-btn');
    return filterButton !== null; // Если кнопка фильтра "Отработанные" активна, фильтр включен
  }

  // Удаление акта
  async deleteAkt() {
    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const aktId = Number(activeRow.getAttribute('data-aktBoId'));
      try {
        await this.aktModel.deleteAkt(aktId); // Удаляем акт
        await this.init(); // Обновляем данные
      } catch (error) {
        console.error('Ошибка при удалении акта:', error);
        alert('Ошибка при удалении акта');
      }
    }
  }

  // Отработка акта
  async processAkt() {
    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const aktId = Number(activeRow.getAttribute('data-aktBoId'));

      try {
        // Выполняем отработку накладной через сервер
        const result = this.type === 'BO' 
          ? await this.aktModel.processAktBo(aktId) 
          : await this.aktModel.processAktSps(aktId);

        if (result.success) {
          // Если отработка прошла успешно, обновляем данные
          await this.init();
          alert('Накладная успешно отработана.');
        } else {
          // Если возникла ошибка, выводим сообщение
          alert(result.message || 'Ошибка при отработке накладной.');
        }
      } catch (error) {
        console.error('Ошибка при отработке накладной:', error);
        alert(error.message || 'Ошибка при отработке накладной');
      }
    }
  }
}