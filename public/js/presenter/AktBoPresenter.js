import { render } from '../utils/render.js';
import { getAnom, removeClassFromChildren } from '../utils/utils.js';
import AktModel from '../model/AktModel.js';
import AktBoView from '../view/AktBoView.js';
import AktBoSpecPresenter from './AktBoSpecPresentor.js'; // Импортируем презентер для спецификации

export default class AktBoPresenter {
  constructor(aktBoContainer, aktBoSpecContainer,type) {
    this.aktBoContainer = aktBoContainer; // Контейнер для актов
    this.aktBoSpecContainer = aktBoSpecContainer; // Контейнер для спецификации
    this.aktModel = new AktModel(); // Модель для работы с данными актов
    this.view = null; // Представление
    this.filter = false; // Флаг фильтра
    this.aktBoSpecPresenter = new AktBoSpecPresenter(this.aktBoSpecContainer); // Презентер для спецификации
  }

  async init(filter = false) {
    try {
      // Загрузка данных
      const data = await this.aktModel.getAktBo(getAnom());
      console.log('Данные актов безналичного отпуска загружены:', data);

      // Очищаем контейнеры
      this.aktBoContainer.innerHTML = '';
      this.aktBoSpecContainer.innerHTML = '';

      // Фильтрация данных
      const filterData = this.filter ? data.filter(akt => akt.c_id === 8) : data.filter(akt => akt.c_id === 7);
      console.log('Отфильтрованные данные:', filterData);

      // Создаем представление для таблицы актов
      this.view = new AktBoView(filterData);

      // Рендерим таблицу актов
      render(this.view, this.aktBoContainer);

      // Привязываем события
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке актов безналичного отпуска:', error);
      alert('Ошибка при загрузке данных актов безналичного отпуска');
    }
  }

  bindEvents() {
    const aktBoBody = document.querySelector('.aktBo-body');
    if (aktBoBody) {
      aktBoBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.aktBo-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');

          // Получаем ID акта
          const aktBoId = Number(row.getAttribute('data-aktBoId'));
          await this.aktBoSpecPresenter.refreshAktBoSpecList(aktBoId);

          // Управление состоянием кнопок
          this.aktBoBtnsControl();
        }
      });
    }

    // Обработчик для кнопки "Удалить акт"
    const btnDeleteAktBo = document.querySelector('.aktBo_delet');
    if (btnDeleteAktBo) {
      btnDeleteAktBo.addEventListener('click', this.deleteAktBo.bind(this));
    } else {
      console.error('Кнопка .aktBo_delet не найдена в DOM.');
    }

    // Обработчик для кнопки "Отработать акт"
    const btnProcessAktBo = document.querySelector('.aktBo_otr');
    if (btnProcessAktBo) {
      btnProcessAktBo.addEventListener('click', this.processAktBo.bind(this));
    } else {
      console.error('Кнопка .aktBo_otr не найдена в DOM.');
    }

    // Обработчик для фильтра
    const filtersAktBo = document.querySelector('.aktBo-filter');
    if (filtersAktBo) {
      filtersAktBo.addEventListener('click', (event) => {
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
  aktBoBtnsControl() {
    const aktBoContent = document.querySelector('.aktBo-content');
    const aktBoDeleteBtn = aktBoContent.querySelector('.aktBo_delet');
    const aktBoProcessBtn = aktBoContent.querySelector('.aktBo_otr');

    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const isProcessed = activeRow.querySelector('.aktBo-date-otr').textContent.trim() !== '';
      const isFilterActive = this.checkIfFilterActive(); // Проверяем, активен ли фильтр "Отработанные"

      // Блокируем кнопки, если накладная отработана, активен фильтр "Отработанные" или нет выбранной строки
      aktBoDeleteBtn.disabled = isProcessed || isFilterActive;
      aktBoProcessBtn.disabled = isProcessed || isFilterActive;
    } else {
      // Если нет выбранной строки, блокируем кнопки
      aktBoDeleteBtn.disabled = true;
      aktBoProcessBtn.disabled = true;
    }
  }

  // Проверка, активен ли фильтр "Отработанные"
  checkIfFilterActive() {
    const filterButton = document.querySelector('.btn-filter_otr.active-btn');
    return filterButton !== null; // Если кнопка фильтра "Отработанные" активна, фильтр включен
  }

  // Удаление акта безналичного отпуска
  async deleteAktBo() {
    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const aktBoId = Number(activeRow.getAttribute('data-aktBoId'));
      try {
        await this.aktModel.deleteAkt(aktBoId); // Удаляем акт
        await this.init(); // Обновляем данные
      } catch (error) {
        console.error('Ошибка при удалении акта безналичного отпуска:', error);
        alert('Ошибка при удалении акта безналичного отпуска');
      }
    }
  }

  // Отработка акта безналичного отпуска
  async processAktBo() {
    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const aktBoId = Number(activeRow.getAttribute('data-aktBoId'));

      try {
        // Выполняем отработку накладной через сервер
        const result = await this.aktModel.processAktBo(aktBoId);

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