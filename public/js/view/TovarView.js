import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

// Функция для определения класса в зависимости от срока годности
function getExpiryClass(expiryDate) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const timeDiff = expiry - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff < 0) {
    return 'table-danger'; // Просрочен
  } else if (daysDiff <= 7) {
    return 'table-warning'; // Истекает через неделю
  } else if (daysDiff <= 30) {
    return 'table-primary'; // Истекает через месяц
  }
  return ''; // Нет класса
}

const createTovarTemplate = (tovars, quantityInputValues = {}) => {
  return `
    <div class="tovar-content">
      <div class="tovar-header">
        <h3 class="container_title">Товарные запасы</h3>
        <div class="tovar-btns">
          <button class="btn btn__standart tovar_creat_document">Создать расход</button>
          <button class="btn btn__standart tovar_clear_filter">Очистить фильтры</button>
        </div>
      </div>
      <div class="tovar-actions">
        <div class="tovar-serch">
          <input type="text" class="tovar-search-input" placeholder="Поиск по наименованию">
          <select class="tovar-serch-type-select">
            <option value="name">Наименованию</option>
            <option value="strih-kod">Штрих коду</option>
          </select>
          <button class="btn btn_serch_tovar">Поиск</button>
        </div>
        <div class="tovar-filter">
          <h5>Срок годности:</h5>
          <select class="srok-type">
            <option value="all">Все</option>
            <option value="overdue">Просрочен</option>
            <option value="week">Истечет через неделю</option>
            <option value="month">Истечет через месяц</option>
          </select>
        </div>
      </div>
      <div class="table-responsive tovar-container">
        <table class="table caption-top tovar-table table-hover">
          <caption class="tovar-title">Товарные запасы</caption>
          <thead class="tovar-thead">
            <tr class="tovar-colums table-info">
              <th scope="col">Штрих код</th>
              <th scope="col">Наименование</th>
              <th scope="col">Количество</th>
              <th scope="col">Срок годности</th>
              <th scope="col">Склад</th>
              <th scope="col">ПА №</th>
              <th scope="col">Выбр.Кол</th>
            </tr>
          </thead>
          <tbody class="tovar-body">
            ${tovars && tovars.length > 0 ? tovars.map(tovar => `
              <tr class="tovar-row ${getExpiryClass(tovar.expiryDate)}" data-tovarId="${tovar.id}" data-pas-id="${tovar.pasId}">
                <td class="tovar-strih">${tovar.barcode}</td>
                <td class="tovar-name">${tovar.name}</td>
                <td class="tovar-kol">${tovar.quantity}</td>
                <td class="tovar-srgod">${normalizeDate(tovar.expiryDate)}</td>
                <td class="tovar-sklad">${tovar.warehouse}</td>
                <td class="tovar-pa-number">${tovar.paNumber}</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="${tovar.quantity}"
                    class="form-control tovar-kol-input"
                    aria-label="Sizing example input"
                    aria-describedby="inputGroup-sizing-sm"
                    value="${quantityInputValues[tovar.id] || 0}"
                    data-tovar-id="${tovar.id}">
                </td>
              </tr>
            `).join('') : `
              <tr class="tovar-row">
                <td colspan="7" class="text-center">Товарные запасы отсутствуют</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export default class TovarView {
  constructor(tovars, quantityInputValues = {}) {
    this.tovars = tovars;
    this.quantityInputValues = quantityInputValues; // Сохраненные значения полей ввода
  }

  getTemplate() {
    return createTovarTemplate(this.tovars, this.quantityInputValues);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}