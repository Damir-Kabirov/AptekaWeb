import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const isActiveFilter = (pas) => {
  if (pas && pas.length > 0) {
    return pas[0].c_id!=3; // Пример фильтрации по статусу отработки
  }
  return false;
};

const createPaTemplate = (pas) => {
  return `
    <div class="pa-content">
      <div class="pa-header akt-header">
        <h3 class="container_title">Приемные акты</h3>
        <div class="ttn-btns">
          <button class="btn btn__standart pa_delet" disabled>Удалить ПА</button>
          <button class="btn btn__standart pa_otr" disabled>Отработать ПА</button>
          <button class="btn btn__standart pa_dow">Распечатать</button>
        </div>
      </div>
      <div class="pa-filter akt-filter">
        <button class="btn btn-filter btn-filter_nootr ${isActiveFilter(pas) ? '' : 'active-btn'}">Неотработанные ПА</button>
        <button class="btn btn-filter btn-filter_otr ${isActiveFilter(pas) ? 'active-btn' : ''}">Отработанные ПА</button>
      </div>
      <div class="table-responsive pa-container akt-container">
        <table class="table caption-top pa-table table-hover">
          <caption class="pa-title akt-title">Приемные акты</caption>
          <thead class="pa-thead">
            <tr class="pa-colums table-info">
              <th scope="col">Код акта</th>
              <th scope="col">Номер акта</th>
              <th scope="col">Дата акта</th>
              <th scope="col">Дата отработки акта</th>
              <th scope="col">Поставщик</th>
              <th scope="col">Склад</th>
              <th scope="col">ТТН</th>
            </tr>
          </thead>
          <tbody class="pa-body">
            ${pas && pas.length > 0 ? pas.map(pa => `
              <tr class="pa-row" data-paId="${pa.id}">
                <td class="pa-kod">${pa.id}</td>
                <td class="pa-nomer">${pa.number}</td>
                <td class="pa-date">${normalizeDate(pa.date)}</td>
                <td class="pa-date-otr">${pa.processed_date ? normalizeDate(pa.processed_date) : ''}</td>
                <td class="pa-post">${pa.supplier}</td>
                <td class="pa-sklad">${pa.warehouse}</td>
                <td class="pa-ttn">${pa.ttn_number}</td>
              </tr>
            `).join('') : `
              <tr class="pa-row">
                <td colspan="7" class="text-center">Приемных актов нет</td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export default class PaView {
    constructor(pas) {
      this.pas = pas;
    }
  
    getTemplate() {
      return createPaTemplate(this.pas);
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