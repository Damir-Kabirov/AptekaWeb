import { createElement } from '../utils/render.js';

// Шаблон для модального окна
const createPaModalTemplate = (pa = null) => `
  <div class="pa-modal modal fade modal-lg" id="paModal" tabindex="-1" aria-labelledby="paModalLabel" aria-hidden="true" data-pasId='${pa.pasId}'>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Наценить позицию</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body pas-modal-body">
          <!-- Поле для наименования препарата -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Наименование препарата</span>
            <input type="text" readonly class="form-control pas-name-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.prepname : ''}" data-is-jnv="${pa ? pa.isJnv : false}">
          </div>

          <!-- Поля для количества и серии -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Количество</span>
            <input type="text" readonly class="form-control pas-kol-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.kol : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Серия</span>
            <input type="text" readonly class="form-control pas-seria-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.seria : ''}">
          </div>

          <!-- Поля для цены производителя (НДС и без НДС) -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена производителя ндс</span>
            <input type="number" readonly class="form-control pas-cprnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.prnds : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена производителя без ндс</span>
            <input type="number" readonly class="form-control pas-cprbnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.prbnds : ''}">
          </div>

          <!-- Поля для цены поставщика (НДС и без НДС) -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена поставщика ндс</span>
            <input type="number" readonly class="form-control pas-cpnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.pnds : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена поставщика без ндс</span>
            <input type="number" readonly class="form-control pas-cpbnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.pbnds : ''}">
          </div>

          <!-- Поле для тарифа аптечного производства -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Тариф аптечного производства</span>
            <input type="number" readonly class="form-control pas-tarif-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.tarif : ''}">
          </div>

          <hr>

          <!-- Поле для наценки -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Наценка %</span>
            <input type="number" min="0" max="${pa ? (pa.isJnv ? 30 : 500) : 500}" class="form-control pas-rnac-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.rnac : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Мах % : <span class="max-rnac-span">${pa ? (pa.isJnv ? '30' : '500') : '500'}</span></span>
          </div>

          <!-- Поле для розничной цены -->
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Розничная цена</span>
            <input type="number" min="0" class="form-control pas-rcena-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${pa ? pa.rcena : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Мах цена : <span class="max-price-span">0.00</span></span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
`;

export default class PaModalView {
  constructor(pa = null) {
    this.pa = pa;
    this.element = null;
  }

  getTemplate() {
    return createPaModalTemplate(this.pa);
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