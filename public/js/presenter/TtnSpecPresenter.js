import { render } from '../utils/render.js';
import TtnSpecModel from '../model/TtnSpecModel.js';
import TtnSpecView from '../view/TtnSpecView.js';
import TtnsModalView from '../view/TtnSpecModalWindow.js';
import { removeClassFromChildren, getAnom } from '../utils/utils.js';
import NomenclatorModel from '../model/NomenclatorModel.js'; // Импортируем модель номенклатора

export default class TtnSpecPresenter {
  constructor(container, ttnId) {
    this.container = container;
    this.ttnSpecModel = new TtnSpecModel();
    this.nomenclatorModel = new NomenclatorModel(); // Инициализируем модель номенклатора
    this.view = null;
    this.ttnId = ttnId;
  }

  // Инициализация презентера
  async init() {
    try {
      this.container.innerHTML = '';
      const data = await this.ttnSpecModel.getTtnSpec(this.ttnId);
      this.view = new TtnSpecView(data);
      this.ttnsModal = new TtnsModalView();
      render(this.view, this.container);
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке спецификаций:', error);
      alert('Ошибка при загрузке данных спецификаций');
    }
  }

  ttnsSave = async () => {
    console.log('Метод ttnsSave вызван');
    console.log('Контекст this:', this);
    try {
      // Логика сохранения
      const ttnSpecData = {
        ttnId: Number(document.querySelector('.ttn-row.table-active').getAttribute('data-ttnId')),
        name: document.querySelector('.ttns-name-input').getAttribute('data-nomen-id'),
        kol_tov: Number(document.querySelector('.ttns-kol-input').value),
        seria: document.querySelector('.ttns-seria-input').value,
        pr_cena_bnds: Number(document.querySelector('.ttns-cprbnds-input').value),
        pr_cena_nds: Number(document.querySelector('.ttns-cprnds-input').value),
        pc_cena_bnds: Number(document.querySelector('.ttns-cpbnds-input').value),
        pc_cena_nds: Number(document.querySelector('.ttns-cpnds-input').value),
        tarif: Number(document.querySelector('.ttns-tarif-input').value),
        srok_god: document.querySelector('.ttns-srok-input').value,
        anom: getAnom(),
        sklad: document.querySelector('.ttn-row.table-active').querySelector('.ttn-sklad').textContent,
        isPas: false,
      };
      console.log('Данные для сохранения:', ttnSpecData);

      // Отправляем данные на сервер
      await this.ttnSpecModel.addTtnSpec(ttnSpecData);

      // Закрываем модальное окно
      this.modal.hide();

      // Сбрасываем форму
      this.resetForm();

      // Обновляем список спецификаций
      await this.refreshTtnSpecList(this.ttnId);

      console.log('Спецификация успешно добавлена.');
    } catch (error) {
      console.error('Ошибка при сохранении спецификации:', error);
      alert('Ошибка при сохранении спецификации');
    }
  };

  // Создание модального окна для добавления спецификации
  createModalTtn() {
    render(this.ttnsModal, this.container);
    const ttnsModalWindow = document.querySelector('.ttns-modal');
    if (ttnsModalWindow) {
      this.modal = new bootstrap.Modal(ttnsModalWindow);
      this.modal.show();
  
      // Обработчик для кнопки "Отмена"
      const cancelButton = ttnsModalWindow.querySelector('.btn-secondary');
      if (cancelButton) {
        cancelButton.addEventListener('click', () => {
          this.resetForm(); // Сбрасываем форму
        });
      }
  
      // Обработчик для кнопки "Сохранить"
      const btnTtnsSave = document.querySelector('.btn-ttnspes-save');
      if (btnTtnsSave) {
        console.log('Кнопка "Сохранить" найдена:', btnTtnsSave);
        console.log('Кнопка отключена:', btnTtnsSave.disabled);
  
        // Удаляем старый обработчик (если есть)
        btnTtnsSave.removeEventListener('click', this.ttnsSave);
  
        // Добавляем новый обработчик
        btnTtnsSave.addEventListener('click', this.ttnsSave);
      } else {
        console.error('Кнопка .btn-ttns-save не найдена в DOM.');
      }
  
      // Обработчик для закрытия модального окна
      ttnsModalWindow.addEventListener('hidden.bs.modal', () => {
        this.resetForm(); // Сбрасываем форму при закрытии
      });
    }
    this.bindSearchEvents(); // Привязываем события для поиска
  }
  // Сброс полей формы
  resetForm() {
    const searchInput = document.querySelector('.ttns-name-input');
    const quantityInput = document.querySelector('.ttns-kol-input');
    const seriesInput = document.querySelector('.ttns-seria-input');
    const manufacturerPriceVatInput = document.querySelector('.ttns-cprnds-input');
    const manufacturerPriceNoVatInput = document.querySelector('.ttns-cprbnds-input');
    const supplierPriceVatInput = document.querySelector('.ttns-cpnds-input');
    const supplierPriceNoVatInput = document.querySelector('.ttns-cpbnds-input');
    const tariffInput = document.querySelector('.ttns-tarif-input');
    const suggestionsDiv = document.querySelector('#suggestions');

    // Сбрасываем значения полей
    if (searchInput) searchInput.value = '';
    if (quantityInput) quantityInput.value = '';
    if (seriesInput) seriesInput.value = '';
    if (manufacturerPriceVatInput) manufacturerPriceVatInput.value = '';
    if (manufacturerPriceNoVatInput) manufacturerPriceNoVatInput.value = '';
    if (supplierPriceVatInput) supplierPriceVatInput.value = '';
    if (supplierPriceNoVatInput) supplierPriceNoVatInput.value = '';
    if (tariffInput) tariffInput.value = '';

    // Сбрасываем атрибуты
    if (searchInput) searchInput.removeAttribute('data-nomen-id');

    // Скрываем подсказки
    if (suggestionsDiv) suggestionsDiv.style.display = 'none';
  }

  // Привязка событий для поиска препаратов
  bindSearchEvents() {
    const searchInput = document.querySelector('.ttns-name-input');
    const suggestionsDiv = document.querySelector('#suggestions');

    if (searchInput && suggestionsDiv) {
      let timeoutId;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          const query = searchInput.value.trim();
          if (query.length > 0) {
            const results = await this.nomenclatorModel.searchDrugs(query); // Поиск препаратов
            this.showSuggestions(results, suggestionsDiv);
          } else {
            suggestionsDiv.style.display = 'none';
          }
        }, 300); // Задержка 300 мс
      });

      // Обработка выбора подсказки
      suggestionsDiv.addEventListener('click', (e) => {
        if (e.target.classList.contains('suggestion-item')) {
          const selectedId = e.target.getAttribute('data-nomen-id');
          const selectedName = e.target.getAttribute('data-nomen-name');
          searchInput.value = selectedName; // Заполняем поле ввода названием
          searchInput.setAttribute('data-nomen-id', selectedId); // Записываем ID в атрибут
          suggestionsDiv.style.display = 'none'; // Скрываем подсказки
        }
      });
    }
  }

  // Отображение подсказок
  showSuggestions(items, container) {
    if (items.length > 0) {
      container.innerHTML = items.map(item => `
        <div class="suggestion-item" data-nomen-id="${item.id}" data-nomen-name="${item.name}">
          ${item.name} (${item.manufacturer})
        </div>
      `).join('');
      container.style.display = 'block';
    } else {
      container.style.display = 'none';
    }
  }

  // Привязка основных событий
  bindEvents() {
    const ttnBody = document.querySelector('.ttn-spec-body');
    if (ttnBody) {
      ttnBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.ttn-spec-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');
          this.ttnBtnsControl();
        }
      });
    } else {
      console.error('Элемент .ttn-body не найден в DOM.');
    }

    // Обработчик для кнопки "Добавить ТТН"
    const btnAddTtns = document.querySelector('.ttns_add');
    if (btnAddTtns) {
      btnAddTtns.addEventListener('click', this.createModalTtn.bind(this));
    } else {
      console.error('Кнопка .ttns_add не найдена в DOM.');
    }
  }
  async deletTtns (){
    const activeRow = document.querySelector('.ttn-spec-row.table-active');
    if (activeRow) {
      const ttnsId = Number(activeRow.getAttribute('data-ttns-id'));
      try {
        await this.ttnSpecModel.deleteTtnSpec(ttnsId);

        await this.refreshTtnSpecList(this.ttnId);
      } catch (error) {
        console.error('Ошибка при удалении ТТН:', error);
        alert('Ошибка при удалении ТТН');
      }
    }
  }

  // Управление кнопками (активация/деактивация)
  ttnBtnsControl() {
    const ttnsContent = document.querySelector('.ttn-spec-content');
    const ttnsUpdateBtn = ttnsContent.querySelector('.ttns_update');
    const ttnsDeletBtn = ttnsContent.querySelector('.ttns_delet');
    ttnsUpdateBtn.removeAttribute('disabled');
    ttnsDeletBtn.removeAttribute('disabled');
    ttnsDeletBtn.addEventListener('click',this.deletTtns.bind(this))
  }

  // Обновление списка спецификаций
  async refreshTtnSpecList(ttnId) {
    this.ttnId = ttnId;
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