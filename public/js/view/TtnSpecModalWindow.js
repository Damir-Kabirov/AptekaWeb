import { createElement } from '../utils/render.js';

// Шаблон для модального окна
const createTtnsModalTemplate = (ttns = null) => `
  <div class="ttns-modal modal fade modal-xl" id="ttnsModal" tabindex="-1" aria-labelledby="ttnsModalLabel" aria-hidden="true" data-ttns-id="${ttns ? ttns.id : 0}">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">${ttns ? 'Редактировать спецификацию' : 'Добавить спецификацию'}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body ttns-modal-body">
          <!-- Поле для поиска наименования препарата -->
          <div class="input-group input-group-lg ttns-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Наименование препарата</span>
            <input type="text" class="form-control ttns-name-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" data-nomen-id="${ttns ? ttns.nomenId : ''}" value="${ttns ? ttns.prepname : ''}">
            <div id="suggestions" class="suggestions-container"></div>
          </div>

          <!-- Поля для количества и серии -->
          <div class="input-group input-group-lg ttns-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Количество</span>
            <input type="text" class="form-control ttns-kol-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.kol : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Серия</span>
            <input type="text" class="form-control ttns-seria-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.seria : ''}">
          </div>

          <!-- Поля для цены производителя ( НДС и без НДС) -->
          <div class="input-group input-group-lg ttns-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена производителя  НДС</span>
            <input type="number" class="form-control ttns-cprnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.prnds : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена производителя без НДС</span>
            <input type="number" class="form-control ttns-cprbnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.prbnds : ''}">
          </div>

          <!-- Поля для цены поставщика ( НДС и без НДС) -->
          <div class="input-group input-group-lg ttns-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена поставщика  НДС</span>
            <input type="number" class="form-control ttns-cpnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.pnds : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Цена поставщика без НДС</span>
            <input type="number" class="form-control ttns-cpbnds-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.pbnds : ''}">
          </div>

          <!-- Поле для тарифа аптечного производства и срока годности-->
          <div class="input-group input-group-lg ttns-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Тариф аптечного производства</span>
            <input type="number" class="form-control ttns-tarif-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.tarif : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Срок годности</span>
            <input type="date" class="form-control ttns-srok-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${ttns ? ttns.srgod : ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
          <button type="button" class="btn btn-primary btn-ttnspes-save">Сохранить</button>
        </div>
      </div>
    </div>
  </div>
`;

export default class TtnsModalView {
  constructor(ttns = null) {
    this.ttns = ttns;
    this.element = null;
  }

  getTemplate() {
    return createTtnsModalTemplate(this.ttns);
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