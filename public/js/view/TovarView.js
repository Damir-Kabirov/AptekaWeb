import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const createTovarTemplate = (tovars) => {
  return `
    <div class="tovar-content">
      <div class="tovar-header">
        <h3 class="container_title">Товарные запасы</h3>
        <button class="btn btn__standart tovar_clear_filter">Очистить фильтры</button>
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
            </tr>
          </thead>
          <tbody class="tovar-body">
            ${tovars && tovars.length > 0 ? tovars.map(tovar => `
              <tr class="tovar-row" data-tovarId="${tovar.id}">
                <td class="tovar-strih">${tovar.barcode}</td>
                <td class="tovar-name">${tovar.name}</td>
                <td class="tovar-kol">${tovar.quantity}</td>
                <td class="tovar-srgod">${normalizeDate(tovar.expiryDate)}</td>
                <td class="tovar-sklad">${tovar.warehouse}</td>
                <td class="tovar-pa-number">${tovar.paNumber}</td>
              </tr>
            `).join('') : `
              <tr class="tovar-row">
                <td colspan="6" class="text-center">Товарные запасы отсутствуют</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export default class TovarView {
  constructor(tovars) {
    this.tovars = tovars;
  }

  getTemplate() {
    return createTovarTemplate(this.tovars);
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