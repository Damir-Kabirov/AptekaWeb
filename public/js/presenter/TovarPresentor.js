import { render } from '../utils/render.js';
import { getAnom,createAlert } from '../utils/utils.js';
import TovarModel from '../model/TovarModel.js';
import TovarView from '../view/TovarView.js';
import DocumentModalView from '../view/DocumentModalView.js';
import DogovorModel from '../model/DogovorModel.js';
import AgentModel from '../model/AgentModel.js'; 

export default class TovarPresenter {
  constructor(container) {
    this.container = container;
    this.tovarModel = new TovarModel();
    this.agentModel = new AgentModel();
    this.dogovorModel = new DogovorModel(); // Создаем экземпляр DogovorModel
    this.view = null;
    this.originalData = null;
    this.filteredData = null;
    this.quantityInputValues = {};
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
    // Сохраняем текущие значения фильтров
    const expiryFilterSelect = this.container.querySelector('.srok-type');
    const selectedExpiryValue = expiryFilterSelect ? expiryFilterSelect.value : 'all';

    const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
    const selectedSearchType = searchTypeSelect ? searchTypeSelect.value : 'name';

    const searchInput = this.container.querySelector('.tovar-search-input');
    const searchInputValue = searchInput ? searchInput.value : '';

    // Сохраняем значения полей ввода количества
    this.saveQuantityInputValues();

    // Рендерим новое представление
    this.view = new TovarView(data, this.quantityInputValues);
    this.container.replaceChildren(this.view.getElement());

    // Восстанавливаем значения фильтров
    const newExpiryFilterSelect = this.container.querySelector('.srok-type');
    if (newExpiryFilterSelect) {
      newExpiryFilterSelect.value = selectedExpiryValue;
    }

    const newSearchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
    if (newSearchTypeSelect) {
      newSearchTypeSelect.value = selectedSearchType;
    }

    const newSearchInput = this.container.querySelector('.tovar-search-input');
    if (newSearchInput) {
      newSearchInput.value = searchInputValue;
    }

    // Восстанавливаем значения полей ввода количества
    this.restoreQuantityInputValues(data);
  }

  saveQuantityInputValues() {
    const quantityInputs = this.container.querySelectorAll('.tovar-kol-input');

    quantityInputs.forEach(input => {
      const tovarId = input.dataset.tovarId; // Предполагаем, что у каждого input есть data-tovar-id
      const value = input.value;
      if (tovarId) {
        this.quantityInputValues[tovarId] = value; // Сохраняем значение
      }
    });

    console.log('Сохраненные значения полей ввода:', this.quantityInputValues);
  }

  restoreQuantityInputValues(data) {
    const quantityInputs = this.container.querySelectorAll('.tovar-kol-input');

    quantityInputs.forEach(input => {
      const tovarId = input.dataset.tovarId; // Предполагаем, что у каждого input есть data-tovar-id
      if (tovarId && this.quantityInputValues[tovarId] !== undefined) {
        input.value = this.quantityInputValues[tovarId]; // Восстанавливаем значение
      } else {
        input.value = 0; // Если значение не сохранено, сбрасываем на 0
      }
    });
  }

  bindEvents() {
    const container = this.container;

    // Делегирование события на кнопку "Создать расход"
    container.addEventListener('click', async (event) => {
      if (event.target.closest('.tovar_creat_document')) {
        this.handleCreateDocument();
      }
    });

    // Делегирование события на кнопку поиска
    container.addEventListener('click', async (event) => {
      if (event.target.closest('.btn_serch_tovar')) {
        // Сохраняем значения полей ввода количества
        this.saveQuantityInputValues();

        const searchInput = this.container.querySelector('.tovar-search-input');
        const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');
        const expiryFilterSelect = this.container.querySelector('.srok-type');

        let query = searchInput.value.trim();
        const searchType = searchTypeSelect.value;
        const filterType = expiryFilterSelect.value;

        if (query) {
          try {
            if (searchType === 'strih-kod') {
              query = query.trim();
            }

            const data = await this.tovarModel.searchTovars(query, searchType, getAnom(), filterType);
            console.log('Результаты поиска:', data);
            this.filteredData = data;
            this.renderView(data);
          } catch (error) {
            createAlert('Ошибка при поиске товаров.','danger');
          }
        } else {
          createAlert('Введите запрос для поиска.','primary')
          
        }
      }
    });

    // Делегирование события на фильтр по сроку годности
    container.addEventListener('change', async (event) => {
      if (event.target.closest('.srok-type')) {
        // Сохраняем значения полей ввода количества
        this.saveQuantityInputValues();

        const filterType = event.target.value;
        const searchInput = this.container.querySelector('.tovar-search-input');
        const searchTypeSelect = this.container.querySelector('.tovar-serch-type-select');

        const query = searchInput.value.trim();
        const searchType = searchTypeSelect.value;

        try {
          const data = await this.tovarModel.filterTovarsByExpiry(filterType, getAnom(), query, searchType);
          console.log('Результаты фильтрации:', data);
          this.filteredData = data;
          this.renderView(data);
        } catch (error) {
          createAlert('Ошибка при фильтрации товаров.','danger');
        }
      }
    });

    // Делегирование события на кнопку "Очистить фильтры"
    container.addEventListener('click', async (event) => {
      if (event.target.closest('.tovar_clear_filter')) {
        try {
          // Сохраняем значения полей ввода количества
          this.saveQuantityInputValues();

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
          createAlert('Ошибка при сбросе фильтров','danger');
        }
      }
    });
  }

  handleCreateDocument() {
    // Сохраняем значения полей ввода количества
    this.saveQuantityInputValues();

    // Получаем все поля ввода количества
    const quantityInputs = this.container.querySelectorAll('.tovar-kol-input');

    // Проверяем, есть ли хотя бы одно поле с значением больше 0
    const hasValidInput = Array.from(quantityInputs).some(input => {
      const value = parseInt(input.value, 10);
      return value > 0;
    });

    if (hasValidInput) {
      // Открываем модальное окно
      const modal = new DocumentModalView();
      document.body.appendChild(modal.getElement());
      const modalElement = document.getElementById('docCreathModal');
      const modalInstance = new bootstrap.Modal(modalElement);
      modalInstance.show();

      // Добавляем обработчики событий для модального окна
      this.initModalEventListeners(modalElement);

      // Устанавливаем начальное состояние блоков в модальном окне
      const documentTypeSelect = modalElement.querySelector('.document-type-select');
      const actBeznalGroup = modalElement.querySelector('#act-beznal-group');
      const actSpisanGroup = modalElement.querySelector('#act-spisan-group');

      this.toggleDocumentTypeBlocks(documentTypeSelect.value, actBeznalGroup, actSpisanGroup);
    } else {
      createAlert('Выберите хотя бы один товар с количеством больше 0.');
    }
  }

  initModalEventListeners(modalElement) {
    // Обработчик для кнопки "Создать"
    const createButton = modalElement.querySelector('#create-document-btn');
    createButton.addEventListener('click', () => {
      this.createDocument();
    });
  
    // Обработчик для изменения типа документа
    const documentTypeSelect = modalElement.querySelector('.document-type-select');
    const actBeznalGroup = modalElement.querySelector('#act-beznal-group');
    const actSpisanGroup = modalElement.querySelector('#act-spisan-group');
  
    documentTypeSelect.addEventListener('change', (event) => {
      const selectedValue = event.target.value;
      this.toggleDocumentTypeBlocks(selectedValue, actBeznalGroup, actSpisanGroup);
    });
  
    // Обработчик для кнопки "Найти контрагента"
    const searchAgentButton = modalElement.querySelector('.btn-serch-agent');
    searchAgentButton.addEventListener('click', async () => {
      const innInput = modalElement.querySelector('.agent-inn-input');
      const kppInput = modalElement.querySelector('.agent-kpp-input');
      const agentInput = modalElement.querySelector('.document-agent-input');
      const dogovorSelect = modalElement.querySelector('.dogovor-select');
  
      const inn = innInput.value.trim();
      const kpp = kppInput.value.trim();
  
      if (!inn || !kpp) {
        createAlert('Введите ИНН и КПП контрагента.')
        return;
      }
  
      try {
        // 1. Поиск контрагента через AgentModel
        const agent = await this.agentModel.findAgent(inn, kpp);
        agentInput.value = agent.name;
        agentInput.dataset.agentId = agent.id;
  
        // 2. Загрузка договоров через DogovorModel
        const dogovory = await this.dogovorModel.getDogovoryByAgentId(agent.id);
        dogovorSelect.innerHTML = dogovory.map(dogovor => `
          <option value="${dogovor.id}">${dogovor.nomer}</option>
        `).join('');
      } catch (error) {
        createAlert('Ошибка при поиске контрагента или загрузке договоров. Проверьте консоль для подробностей.','danger');
      }
    });
  }

  toggleDocumentTypeBlocks(selectedValue, actBeznalGroup, actSpisanGroup) {
    if (selectedValue === '7') {
      // Акт безналичного отпуска
      actBeznalGroup.style.display = 'block';
      actSpisanGroup.style.display = 'none';
    } else if (selectedValue === '5') {
      // Списание
      actBeznalGroup.style.display = 'none';
      actSpisanGroup.style.display = 'block';
    }
  }
  clearForm(modalElement) {
    // Очищаем поля ввода количества
    const quantityInputs = this.container.querySelectorAll('.tovar-kol-input');
    quantityInputs.forEach(input => {
      input.value = 0;
    });
  
    // Очищаем значения в модальном окне
    const documentTypeSelect = modalElement.querySelector('.document-type-select');
    const agentInput = modalElement.querySelector('.document-agent-input');
    const dogovorSelect = modalElement.querySelector('.dogovor-select');
    const spisReasonSelect = modalElement.querySelector('.act-spisan-select');
    const innInput = modalElement.querySelector('.agent-inn-input');
    const kppInput = modalElement.querySelector('.agent-kpp-input');
  
    if (documentTypeSelect) documentTypeSelect.value = '';
    if (agentInput) {
      agentInput.value = '';
      agentInput.dataset.agentId = '';
    }
    if (dogovorSelect) dogovorSelect.innerHTML = '';
    if (spisReasonSelect) spisReasonSelect.value = '';
    if (innInput) innInput.value = '';
    if (kppInput) kppInput.value = '';
  
    // Очищаем сохраненные значения полей ввода количества
    this.quantityInputValues = {};
  }
  async createDocument() {
    try {
      // Получаем выбранные товары с количеством больше 0
      const selectedTovars = this.filteredData.filter(tovar => {
        const quantity = this.quantityInputValues[tovar.id] || 0;
        return quantity > 0;
      });
   
      if (selectedTovars.length === 0) {
        createAlert('Выберите хотя бы один товар с количеством больше 0.');
        return;
      }
  
      // Проверяем, что все товары из одного склада
      const warehouseIds = [...new Set(selectedTovars.map(tovar => tovar.warehouse.trim()))]; // Удаляем лишние пробелы
      if (warehouseIds.length > 1) {
        createAlert('Все товары должны быть из одного склада.');
        return;
      }
  
      const sklad_name = warehouseIds[0]; // Название склада
  
      if (!sklad_name) {
        createAlert('Название склада не найдено.');
        return;
      }
  
      // Проверяем, что количество товаров не уходит в минус
      for (const tovar of selectedTovars) {
        const quantity = this.quantityInputValues[tovar.id] || 0;
        if (tovar.quantity - quantity < 0) {
          createAlert(`Количество товара "${tovar.name}" не может быть отрицательным.`);
          return;
        }
      }
  
      // Получаем данные из модального окна
      const modalElement = document.getElementById('docCreathModal');
      const documentTypeSelect = modalElement.querySelector('.document-type-select');
      const documentType = documentTypeSelect.value;
  
      // Определяем название документа в зависимости от типа
      const documentName = documentType === '5' 
        ? 'Акт списания' 
        : 'Акт безналичного отпуска';
  
      // Подготавливаем данные для документа
      const documentData = {
        name: documentName, // Название документа
        date: new Date().toISOString().split('T')[0], // Текущая дата
        sklad_name, // Название склада
        privoz: 1, // Расход
        anom: getAnom(), // anom из текущего контекста
        c_id: documentType, // Тип документа (5 или 7)
        spis_reason: null, // По умолчанию null
        agent_id: null, // По умолчанию null
        dogovor_id: null, // По умолчанию null
      };
  
      // Добавляем данные в зависимости от типа документа
      if (documentType === '7') { // Акт безналичного отпуска
        const agentInput = modalElement.querySelector('.document-agent-input');
        const dogovorSelect = modalElement.querySelector('.dogovor-select');
        console.log(agentInput)
        console.log(dogovorSelect)
        if (agentInput && agentInput.dataset.agentId) {
          console.log(agentInput.dataset.agentId)
          documentData.agent_id = agentInput.dataset.agentId;
        } else {
          console.error('Agent ID is missing');
          return;
        }
        
        if (dogovorSelect && dogovorSelect.value) {
          console.log( dogovorSelect.value)
          documentData.dogovor_id = dogovorSelect.value;
        } else {
          console.error('Dogovor ID is missing');
          return;
        }
      } else if (documentType === '5') { // Списание
        const spisReasonSelect = modalElement.querySelector('.act-spisan-select');
        documentData.spis_reason = spisReasonSelect.value || null; // Причина списания
      }
  
  
      // Подготавливаем данные для спецификаций
      const documentSpecs = selectedTovars.map(tovar => {
        // Получаем pasId из атрибута data-pas-id
        const row = this.container.querySelector(`tr[data-tovarId="${tovar.id}"]`);
        const pasId = row ? parseInt(row.dataset.pasId, 10) : null;
  
        // Извлекаем pas_anom из штрих-кода, используя pasId
        const pas_anom = extractPasAnomFromBarcode(tovar.barcode, pasId);
  
        return {
          tov_zap_id: tovar.id,
          kol_tov: this.quantityInputValues[tovar.id] || 0,
          pas_id: pasId, // Используем pasId из атрибута
          pas_anom, // Используем pas_anom, извлеченный из штрих-кода
        };
      });
  
   
  
      // Создаем документ и спецификации
      const result = await this.tovarModel.createDocumentWithSpec(documentData, documentSpecs);
  
      // Очищаем форму и закрываем модальное окно
      this.clearForm(modalElement); // Очистка формы
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      modalInstance.hide(); // Закрытие модального окна
      createAlert(`Документ успешно создан. Номер документа: ${result.nom_rec}`,'success');
    } catch (error) {
      console.error('Ошибка при создании документа:', error);
  
      // Отображаем сообщение об ошибке пользователю
      if (error.message) {
        createAlert(error.message,'danger'); // Показываем конкретное сообщение об ошибке
      } else {
        alert('Ошибка при создании документа. Проверьте консоль для подробностей.');
      }
    }
  }
}

// Функция для извлечения pas_anom из штрих-кода
function extractPasAnomFromBarcode(barcode, pasId) {
  // 1. Убираем ведущие нули
  const trimmedBarcode = barcode.replace(/^0+/, '');

  // 2. Убираем pasId
  const pasIdStr = String(pasId);
  if (!trimmedBarcode.startsWith(pasIdStr)) {
    return null;
  }
  const withoutPasId = trimmedBarcode.slice(pasIdStr.length);

  // 3. Убираем последнее число
  const pasAnomStr = withoutPasId.slice(0, -1);
  const pas_anom = parseInt(pasAnomStr, 10);
  return pas_anom;
}


