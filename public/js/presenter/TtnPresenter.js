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
    this.ttnSpec = new TtnSpec(this.ttnSpecContainer, 0);
    this.filter = false
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
      const filterData = this.filter ? data.filter(ttn => ttn.c_id === 2) : data.filter(ttn => ttn.c_id === 1);
      console.log(filterData)
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

  hasEnabledInput() {
    const tbody = document.querySelector('tbody.ttn-spec-body');
    const inputs = tbody.querySelectorAll('input.ttn-spec-check');
    return Array.from(inputs).some(input => !input.disabled);
}

ttnBtnsControl() {
  const ttnContent = document.querySelector('.ttn-content');
  const ttnUpdateBtn = ttnContent.querySelector('.ttn_update');
  const ttnDeletBtn = ttnContent.querySelector('.ttn_delet');
  const ttnOtrabotBtn = ttnContent.querySelector('.ttn_otr');

  const activeRow = document.querySelector('.ttn-row.table-active');
  if (activeRow) {
    const isProcessed = activeRow.querySelector('.ttn-date-otr').textContent.trim() !== '';
    ttnUpdateBtn.disabled = isProcessed;
    ttnDeletBtn.disabled = isProcessed;

    // Кнопка "Отработать ТТН" активна, если есть хотя бы одна активная позиция
    const hasActiveInputs = this.hasCheckedInputs();
    ttnOtrabotBtn.disabled = !hasActiveInputs;
  } else {
    ttnUpdateBtn.disabled = true;
    ttnDeletBtn.disabled = true;
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

  async otrTtn() {
    const activeRow = document.querySelector('.ttn-row.table-active');
    if (!activeRow) {
      alert('Выберите накладную для отработки');
      return;
    }
  
    const ttnId = Number(activeRow.getAttribute('data-ttnId')); // ID накладной
    const ttnData = this.getActiveRowData(); // Данные накладной
  
    // Получаем все спецификации с checked
    const checkedSpecs = Array.from(document.querySelectorAll('.ttn-spec-check:checked'))
      .map(input => {
        const row = input.closest('.ttn-spec-row');
        return {
          id: Number(row.querySelector('.ttn-spec-id').textContent), // ID спецификации
          prep_id: Number(row.querySelector('.ttn-spec-name').getAttribute('data-prep-id')), // ID препарата
          seria: row.querySelector('.ttn-spec-seria').textContent, // Серия
          pr_cena_bnds: parseFloat(row.querySelector('.ttn-spec-prbnds').textContent), // Цена производителя без НДС
          pr_cena_nds: parseFloat(row.querySelector('.ttn-spec-prnds').textContent), // Цена производителя с НДС
          pc_cena_bnds: parseFloat(row.querySelector('.ttn-spec-pbnds').textContent), // Цена поставщика без НДС
          pc_cena_nds: parseFloat(row.querySelector('.ttn-spec-pnds').textContent), // Цена поставщика с НДС
          kol_tov: parseInt(row.querySelector('.ttn-spec-kol').textContent), // Количество
          tarif: parseFloat(row.querySelector('.ttn-spec-tarif').textContent), // Тариф
          sklad_id: Number(row.querySelector('.ttn-spec-sklad').getAttribute('data-sklad-id')), // ID склада
          srok_god: row.querySelector('.ttn-spec-sroc').textContent, // Срок годности
        };
      });
  
    if (checkedSpecs.length === 0) {
      alert('Выберите хотя бы одну спецификацию для отработки');
      return;
    }
  
    try {
      // Отправляем данные на сервер
      const response = await this.ttnModel.otrTtn({
        ttnId,
        ttnData,
        checkedSpecs,
      });
  
      if (response.success) {
        alert('Накладная успешно отработана');
        await this.init(); // Обновляем данные
      } else {
        alert('Ошибка при отработке накладной');
      }
    } catch (error) {
      console.error('Ошибка при отработке накладной:', error);
      alert('Ошибка при отработке накладной');
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
        anom:Number(getAnom())
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

  hasCheckedInputs() {
    const ttnSpecBody = document.querySelector('.ttn-spec-body');
    if (ttnSpecBody) {
      const checkedInputs = ttnSpecBody.querySelectorAll('.ttn-spec-check:not(:disabled):checked');
      return checkedInputs.length > 0;
    }
    return false;
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

    const ttnSpecBody = document.querySelector('.ttn-spec-body');
    if (ttnSpecBody) {
      ttnSpecBody.addEventListener('change', (evt) => {
        if (evt.target.classList.contains('ttn-spec-check')) {
          this.ttnBtnsControl();
        }
      });
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
    
    const btnOtrabotka = document.querySelector('.ttn_otr')
    if (btnOtrabotka) {
      btnOtrabotka.addEventListener('click', this.otrTtn.bind(this));
    } else {
      console.error('Кнопка .ttn_otr не найдена в DOM.');
    }


    // Обработчик для фильтра "Неотработанные ТТН" и "Отработанные ТТН"
    const filtersTtn = document.querySelector('.ttn-filter');
    if (filtersTtn) {
      filtersTtn.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-filter_nootr')) {
          this.filter=false
          this.init();
          this.ttnSpec.refreshTtnSpecList()
        } else if (event.target.classList.contains('btn-filter_otr')) {
          this.filter=true
          this.init();
          this.ttnSpec.refreshTtnSpecList()
        }
      });
    } else {
      console.error('Элемент .ttn-filter не найден в DOM.');
    }
  }
}