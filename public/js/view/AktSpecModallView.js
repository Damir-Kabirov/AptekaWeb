import { createElement } from '../utils/render.js';

const createAktSpecModalTemplate = (aktSpec = null) => `
  <div class="aktBoSpecModal modal fade modal-xl show">
    <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Изменить количество</h1>
        <button type="button" class="btn-close btn-close-aktBoSpecModal" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
          <div class="input-group input-group-lg aktspec-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Препарат</span>
            <input type="text"  class="form-control aktspec-name-input" aria-label="Sizing example input" data-pasId='${aktSpec.pasId}' aria-describedby="inputGroup-sizing-sm" value="${aktSpec ? aktSpec.name : ' '}">
          </div>
          <div class="input-group input-group-lg pas-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Количество</span>
            <input type="number" min="0" max="${aktSpec ? aktSpec.kolOst : ''}" class="form-control pas-rcena-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" value="${aktSpec ? aktSpec.kol : ''}">
            <span class="input-group-text" id="inputGroup-sizing-sm">Количество на складе : <span class="max-price-span">${aktSpec ? aktSpec.kolOst : ''}</span></span>
          </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary aktBoSpec-save">Сохранить</button>
      </div>
    </div>
  </div>
  </div>
`;

export default class AktSpecModallView {
  constructor(aktSpec = null) {
    this.aktSpec = aktSpec;
    this.element = null;
  }

  getTemplate() {
    return createAktSpecModalTemplate(this.aktSpec);
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