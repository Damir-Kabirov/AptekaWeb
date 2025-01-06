import { render } from '../utils/render.js';
import { removeClassFromChildren, getAnom } from '../utils/utils.js';
import PaModel from '../model/PaModel.js';
import PaView from '../view/PaView.js';
import PaSpecPresenter from './PaSpecPresenter.js'; // Импортируем презентер для спецификации

export default class PaPresenter {
  constructor(paContainer, paSpecContainer) {
    this.paContainer = paContainer;
    this.paSpecContainer = paSpecContainer;
    this.paModel = new PaModel();
    this.view = null;
    this.filter = false;
    this.paSpecPresenter = new PaSpecPresenter(this.paSpecContainer);
  }

  async init(filter = false) {
    try {
      // Загрузка данных
      const data = await this.paModel.getPas(getAnom()); // Получаем данные приемных актов
      console.log('Данные приемных актов загружены:', data);

      // Очищаем контейнеры
      this.paContainer.innerHTML = '';
      this.paSpecContainer.innerHTML = '';

      // Фильтрация данных
      const filterData = this.filter ? data.filter(pa => pa.c_id === 4) : data.filter(pa => pa.c_id === 3);
      console.log('Отфильтрованные данные:', filterData);

      // Создаем представление для таблицы приемных актов
      this.view = new PaView(filterData);

      // Рендерим таблицу приемных актов
      render(this.view, this.paContainer);

      // Привязываем события
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке приемных актов:', error);
      alert('Ошибка при загрузке данных приемных актов');
    }
  }

  bindEvents() {
    // Обработчик для выбора строки в таблице
    const paBody = document.querySelector('.pa-body');
    if (paBody) {
      paBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.pa-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');
          this.paBtnsControl();

          // Получаем ID приемного акта
          const paId = Number(row.getAttribute('data-paId'));
          await this.paSpecPresenter.refreshPaSpecList(paId);
        }
      });
    } else {
      console.error('Элемент .pa-body не найден в DOM.');
    }

    // Обработчик для кнопки "Удалить ПА"
    const btnDeletePa = document.querySelector('.pa_delet');
    if (btnDeletePa) {
      btnDeletePa.addEventListener('click', this.deletePa.bind(this));
    } else {
      console.error('Кнопка .pa_delet не найдена в DOM.');
    }

    // Обработчик для кнопки "Отработать ПА"
    const btnProcessPa = document.querySelector('.pa_otr');
    if (btnProcessPa) {
      btnProcessPa.addEventListener('click', this.processPa.bind(this));
    } else {
      console.error('Кнопка .pa_otr не найдена в DOM.');
    }

    // Обработчик для кнопки "Распечатать"
    const btnPrintPa = document.querySelector('.pa_dow');
    if (btnPrintPa) {
      btnPrintPa.addEventListener('click', this.printPa.bind(this));
    } else {
      console.error('Кнопка .pa_dow не найдена в DOM.');
    }

    // Обработчик для фильтра "Неотработанные ПА" и "Отработанные ПА"
    const filtersPa = document.querySelector('.pa-filter');
    if (filtersPa) {
      filtersPa.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-filter_nootr')) {
          this.filter = false;
          this.init();
        } else if (event.target.classList.contains('btn-filter_otr')) {
          this.filter = true;
          this.init();
        }
      });
    } else {
      console.error('Элемент .pa-filter не найден в DOM.');
    }
  }

  paBtnsControl() {
    const paContent = document.querySelector('.pa-content');
    const paDeleteBtn = paContent.querySelector('.pa_delet');
    const paProcessBtn = paContent.querySelector('.pa_otr');
  
    const activeRow = document.querySelector('.pa-row.table-active');
    if (activeRow) {
      const isProcessed = activeRow.querySelector('.pa-date-otr').textContent.trim() !== '';
      paDeleteBtn.disabled = isProcessed;
      paProcessBtn.disabled = isProcessed;
    } else {
      paDeleteBtn.disabled = true;
      paProcessBtn.disabled = true;
    }
  }

  async deletePa() {
    const activeRow = document.querySelector('.pa-row.table-active');
    if (activeRow) {
      const paId = Number(activeRow.getAttribute('data-paId'));
      try {
        await this.paModel.deletePa(paId); // Удаляем приемный акт
        await this.init(); // Обновляем данные
      } catch (error) {
        console.error('Ошибка при удалении приемного акта:', error);
        alert('Ошибка при удалении приемного акта');
      }
    }
  }

  async processPa() {
    const activeRow = document.querySelector('.pa-row.table-active');
    if (activeRow) {
      const paId = Number(activeRow.getAttribute('data-paId'));
      try {
        await this.paModel.processPa(paId); // Отрабатываем приемный акт
        await this.init(); // Обновляем данные
      } catch (error) {
        console.error('Ошибка при отработке приемного акта:', error);
        alert('Ошибка при отработке приемного акта');
      }
    }
  }

  async printPa() {
    const activeRow = document.querySelector('.pa-row.table-active');
    if (activeRow) {
      const paId = Number(activeRow.getAttribute('data-paId'));
      try {
        await this.paModel.downloadPaExcel(paId); // Скачиваем Excel-файл
      } catch (error) {
        console.error('Ошибка при скачивании файла:', error);
        alert('Ошибка при скачивании файла');
      }
    } else {
      alert('Выберите приемный акт для скачивания.');
    }
  }
}