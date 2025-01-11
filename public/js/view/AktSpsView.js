import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const isActiveFilter = (akts) => {
  if (akts && akts.length > 0) {
    return akts[0].c_id!=5;
  }
  return false;
};

const createAktSpSTemplate = (akts) => {
    return `
      <div class="aktBo-content">
        <div class="aktBo-header akt-header">
          <h3 class="container_title">Акты безналичного отпуска</h3>
          <div class="ttn-btns">
            <button class="btn btn__standart aktBo_delet" disabled>Удалить акт</button>
            <button class="btn btn__standart aktBo_otr" disabled>Отработать акт</button>
            <button class="btn btn__standart aktBo_dow">Распечатать акт</button>
          </div>
        </div>
        <div class="aktBo-filter akt-filter">
          <button class="btn btn-filter btn-filter_nootr ${isActiveFilter(akts) ? '' : 'active-btn'}">Неотработанные</button>
          <button class="btn btn-filter btn-filter_otr ${isActiveFilter(akts) ? 'active-btn' : ''}">Отработанные</button>
        </div>
        <div class="table-responsive aktBo-container akt-container">
          <table class="table caption-top aktBo-table table-hover">
            <caption class="aktBo-title akt-title">Акты безналичного отпуска</caption>
            <thead class="aktBo-thead">
              <tr class="aktBo-colums table-info">
                <th scope="col">Код акта</th>
                <th scope="col">Номер акта</th>
                <th scope="col">Дата акта</th>
                <th scope="col">Дата отработки акта</th>
                <th scope="col">Причина списания</th>
              </tr>
            </thead>
            <tbody class="aktBo-body">
              ${akts && akts.length > 0 ? akts.map(akt => `
                <tr class="aktBo-row" data-aktBoId="${akt.id}">
                  <td class="aktBo-kod">${akt.id}</td>
                  <td class="aktBo-nomer">${akt.number}</td>
                  <td class="aktBo-date">${normalizeDate(akt.date)}</td>
                  <td class="aktBo-date-otr">${akts.otr_date ? normalizeDate(akt.otr_date) : ''}</td>
                  <td class="aktSps-prichina">${akt.prichina}</td>
                </tr>
              `).join('') : `
                <tr class="aktBo-row">
                  <td colspan="7" class="text-center">Акты безналичного отпуска отсутствуют</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

export default class AktSpcView {
    constructor(akts) {
      this.akts = akts;
    }
  
    getTemplate() {
      return createAktSpSTemplate(this.akts);
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