import { render } from '../utils/render.js';
import { getAnom } from '../utils/utils.js';
import TovarModel from '../model/TovarModel.js';
import TovarView from '../view/TovarView.js';

export default class TovarPresenter {
  constructor(container) {
    this.container = container;
    this.tovarModel = new TovarModel();
    this.view = null;
    this.originalData = null;
    this.filteredData = null;
  }

  async init() {
    try {
      const data = await this.tovarModel.getTovars(getAnom());
      console.log('Оригинальные данные:', data);
      this.originalData = data;
      this.filteredData = data;
      this.renderView(data);
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке товарных запасов:', error);
      alert('Ошибка при загрузке товарных запасов. Проверьте консоль для подробностей.');
    }
  }

  renderView(data) {
    // Сохраняем текущее значение селекта для срока годности
    const expiryFilterSelect = this.container.querySelector('.srok-type');
    const selectedExpiryValue = expiryFilterSelect ? expiryFilterSelect.value : 'all';

    // Сохраняем текущее значение селекта для типа поиска
    const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
    const selectedSearchType = searchTypeSelect ? searchTypeSelect.value : 'name';

    // Рендерим новое представление
    this.view = new TovarView(data);
    this.container.replaceChildren(this.view.getElement());

    // Восстанавливаем значение селекта для срока годности
    const newExpiryFilterSelect = this.container.querySelector('.srok-type');
    if (newExpiryFilterSelect) {
      newExpiryFilterSelect.value = selectedExpiryValue;
    }

    // Восстанавливаем значение селекта для типа поиска
    const newSearchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
    if (newSearchTypeSelect) {
      newSearchTypeSelect.value = selectedSearchType;
    }
  }

  bindEvents() {
    const container = this.container;

    // Делегирование события на кнопку поиска
    container.addEventListener('click', async (event) => {
      if (event.target.closest('.btn_serch_tovar')) {
        const searchInput = this.container.querySelector('.tovar-search-input');
        const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
        let query = searchInput.value.trim();
        const searchType = searchTypeSelect.value;

        if (query) {
          try {
            if (searchType === 'strih-kod') {
              // Передаем штрих-код как строку
              query = query.trim();
            }

            const data = await this.tovarModel.searchTovars(query, searchType, getAnom());
            console.log('Результаты поиска:', data);
            this.filteredData = data;
            this.renderView(data);
          } catch (error) {
            console.error('Ошибка при поиске товаров:', error);
            alert('Ошибка при поиске товаров. Проверьте консоль для подробностей.');
          }
        } else {
          alert('Введите запрос для поиска.');
        }
      }
    });

    // Делегирование события на фильтр по сроку годности
    container.addEventListener('change', async (event) => {
      if (event.target.closest('.srok-type')) {
        const filterType = event.target.value;

        try {
          let data;
          if (filterType === 'all') {
            data = this.originalData; // Возвращаем оригинальные данные
          } else {
            data = await this.tovarModel.filterTovarsByExpiry(filterType, getAnom());
          }
          console.log('Результаты фильтрации:', data);
          this.filteredData = data;
          this.renderView(data);
        } catch (error) {
          console.error('Ошибка при фильтрации товаров:', error);
          alert('Ошибка при фильтрации товаров. Проверьте консоль для подробностей.');
        }
      }
    });

    // Делегирование события на кнопку "Очистить фильтры"
    container.addEventListener('click', async (event) => {
      if (event.target.closest('.tovar_clear_filter')) {
        try {
          this.filteredData = this.originalData;
          this.renderView(this.originalData);

          // Сбрасываем значения фильтров
          const searchInput = this.container.querySelector('.tovar-search-input');
          const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
          const expiryFilterSelect = this.container.querySelector('.srok-type');

          if (searchInput) searchInput.value = '';
          if (searchTypeSelect) searchTypeSelect.value = 'name';
          if (expiryFilterSelect) expiryFilterSelect.value = 'all';
        } catch (error) {
          console.error('Ошибка при сбросе фильтров:', error);
          alert('Ошибка при сбросе фильтров. Проверьте консоль для подробностей.');
        }
      }
    });
  }
}