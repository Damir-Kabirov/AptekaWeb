import { render } from '../utils/render.js';
import { removeClassFromChildren, getAnom } from '../utils/utils.js';
import TtnModel from '../model/TtnModel.js';
import TtnView from '../view/TtnView.js';
import TtnModalView from '../view/TtnModalWindow.js';
import TtnSpec from './TtnSpecPresenter.js';
import AgentModel from '../model/AgentModel.js';
import SkladModel from '../model/SkladModel.js';

export default class TtnPresenter {
  constructor(ttnContainer, ttnSpecContainer) {
    this.ttnContainer = ttnContainer; // Контейнер для таблицы ТТН
    this.ttnSpecContainer = ttnSpecContainer; // Контейнер для спецификации ТТН
    this.ttnModel = new TtnModel();
    this.agentModel = new AgentModel();
    this.skladModel = new SkladModel();
    this.view = null;
    this.modal = null;
    this.ttnSpec = new TtnSpec(this.ttnSpecContainer, 0); // Передаем контейнер для спецификации
  }

  async init(filter = false) {
    try {
      // Загрузка данных
      const data = await this.ttnModel.getTtns(getAnom());
      const agentData = await this.agentModel.getAgents();
      const skladData = await this.skladModel.getSklads();
      console.log('Данные ТТН загружены:', data);

      // Очищаем контейнеры
      this.ttnContainer.innerHTML = '';
      this.ttnSpecContainer.innerHTML = '';

      // Фильтрация данных
      const filterData = filter ? data.filter(ttn => ttn.c_id === 2) : data.filter(ttn => ttn.c_id === 1);
      console.log('Отфильтрованные данные:', filterData);

      // Создаем представление для таблицы ТТН
      this.view = new TtnView(filterData);
      this.ttnModal = new TtnModalView(null, skladData, agentData);

      // Рендерим таблицу ТТН
      render(this.view, this.ttnContainer);

      // Инициализация спецификации ТТН
      await this.ttnSpec.init();

      // Привязываем события
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке ТТН:', error);
      alert('Ошибка при загрузке данных ТТН');
    }
  }

  ttnBtnsControl() {
    const ttnContent = document.querySelector('.ttn-content');
    const ttnUpdateBtn = ttnContent.querySelector('.ttn_update');
    const ttnDeletBtn = ttnContent.querySelector('.ttn_delet');
    const ttnOtrabotBtn = ttnContent.querySelector('.ttn_otr');
    ttnUpdateBtn.removeAttribute('disabled');
    ttnDeletBtn.removeAttribute('disabled');
    if (document.querySelector('.ttn-spec-body').children.length || !document.querySelector('.btn-filter_otr').classList.contains('active-btn')) {
      ttnOtrabotBtn.removeAttribute('disabled');
    } else {
      ttnOtrabotBtn.disabled = true;
    }
  }

  createModalTtn() {
    render(this.ttnModal, this.ttnContainer);
    const ttnModalWindow = document.querySelector('.ttn-modal');
    if (ttnModalWindow) {
      this.modal = new bootstrap.Modal(ttnModalWindow);
      this.modal.show();
    }
    const btnSave = document.querySelector('.btn-ttn-save');
    if (btnSave) {
      btnSave.addEventListener('click', this.ttnSave.bind(this));
    } else {
      console.error('Кнопка .btn-ttn-save не найдена в DOM.');
    }
  }

  async ttnSave() {
    const ttnDate = {
      id: document.getElementById('ttnModal').getAttribute('data-ttn-id'),
      nomer: document.querySelector('.ttn-nomer-input').value,
      date: document.querySelector('.ttn-date-input').value,
      sklad: Number(document.querySelector('.ttn-sklad-select').value),
      agent: Number(document.querySelector('.ttn-post-select').value),
      anom: getAnom(),
    };

    try {
      if (ttnDate.id && ttnDate.id !== '0') {
        // Обновление ТТН
        await this.ttnModel.updateTtn(ttnDate);
      } else {
        // Добавление ТТН
        await this.ttnModel.addTtn(ttnDate);
      }

      // Закрываем модальное окно
      this.modal.hide();

      // Обновляем список ТТН
      await this.init();
    } catch (error) {
      console.error('Ошибка при сохранении ТТН:', error);
      alert('Ошибка при сохранении ТТН');
    }
  }

  async deletTtn() {
    const activeRow = document.querySelector('.ttn-row.table-active');
    if (activeRow) {
      const ttnId = Number(activeRow.getAttribute('data-ttnId'));
      try {
        await this.ttnModel.deleteTtn(ttnId);

        // Обновляем список ТТН
        await this.init();
      } catch (error) {
        console.error('Ошибка при удалении ТТН:', error);
        alert('Ошибка при удалении ТТН');
      }
    }
  }

  getActiveRowData() {
    const activeRow = document.querySelector('.ttn-row.table-active');
    if (activeRow) {
      return {
        id: activeRow.getAttribute('data-ttnId'),
        nomer: activeRow.querySelector('.ttn-nomer').textContent,
        date: activeRow.querySelector('.ttn-date').textContent,
        sklad: activeRow.querySelector('.ttn-sklad').textContent,
        agent: activeRow.querySelector('.ttn-post').textContent,
      };
    }
    return null;
  }

  updateTnn() {
    const activeRowData = this.getActiveRowData();
    if (activeRowData) {
      this.createModalTtn(); // Открываем модальное окно
      this.ttnModal.fillForm(activeRowData); // Заполняем форму данными
    } else {
      alert('Выберите ТТН для редактирования');
    }
  }

  bindEvents() {
    // Обработчик для выбора строки в таблице
    const ttnBody = document.querySelector('.ttn-body');
    if (ttnBody) {
      ttnBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.ttn-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');
          await this.ttnSpec.refreshTtnSpecList(Number(row.querySelector('.ttn-kod').textContent));
          this.ttnBtnsControl();
        }
      });
    } else {
      console.error('Элемент .ttn-body не найден в DOM.');
    }

    // Обработчик для кнопки "Добавить ТТН"
    const btnAddTtn = document.querySelector('.ttn_add');
    if (btnAddTtn) {
      btnAddTtn.addEventListener('click', this.createModalTtn.bind(this));
    } else {
      console.error('Кнопка .ttn_add не найдена в DOM.');
    }

    // Обработчик для кнопки "Удалить ТТН"
    const btnDeletTtn = document.querySelector('.ttn_delet');
    if (btnDeletTtn) {
      btnDeletTtn.addEventListener('click', this.deletTtn.bind(this));
    } else {
      console.error('Кнопка .ttn_delet не найдена в DOM.');
    }

    // Обработчик для кнопки "Корректировка"
    const btnUpdate = document.querySelector('.ttn_update');
    if (btnUpdate) {
      btnUpdate.addEventListener('click', this.updateTnn.bind(this));
    } else {
      console.error('Кнопка .ttn_update не найдена в DOM.');
    }

    // Обработчик для фильтра "Неотработанные ТТН" и "Отработанные ТТН"
    const filtersTtn = document.querySelector('.ttn-filter');
    if (filtersTtn) {
      filtersTtn.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-filter_nootr')) {
          this.init(false);
        } else if (event.target.classList.contains('btn-filter_otr')) {
          this.init(true);
        }
      });
    } else {
      console.error('Элемент .ttn-filter не найден в DOM.');
    }
  }
}