import { createElement } from '../utils/render.js';

const createTtnModalTemplate = (ttn, sklad, agent) => {
  const skladOptions = sklad
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');

  const agentOptions = agent
    .map((item) => `<option value="${item.id}">${item.name}</option>`)
    .join('');

  return `
    <div class="ttn-modal modal fade modal-xl" id="ttnModal" tabindex="-1" aria-labelledby="ttnModalLabel" aria-hidden="true" data-ttn-id="${ttn ? ttn.id : 0}">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">${ttn ? 'Редактировать ТТН' : 'Добавить ТТН'}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body ttn-modal-body">
            <form id="ttnForm">
              <div class="input-group input-group-lg ttn-input-group">
                <span class="input-group-text" id="inputGroup-sizing-sm">Номер накладной</span>
                <input type="text" class="form-control ttn-nomer-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
                <span class="input-group-text" id="inputGroup-sizing-sm">Дата накладной</span>
                <input type="date" class="form-control ttn-date-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
              </div>  
              <div class="input-group input-group-lg ttn-input-group">
                <label class="input-group-text" for="inputGroupSelect01">Склад</label>
                <select class="form-select ttn-sklad-select" id="inputGroupSelect01">
                  ${skladOptions}
                </select>
              </div>
              <div class="input-group input-group-lg ttn-input-group">
                <label class="input-group-text" for="inputGroupSelect01">Поставщик</label>
                <select class="form-select ttn-post-select" id="inputGroupSelect01">
                  ${agentOptions}
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-primary btn-ttn-save">Сохранить</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default class TtnModalView {
  constructor(ttn = null, sklad = [], agent = []) {
    this.ttn = ttn;
    this.sklad = sklad;
    this.agent = agent;
  }

  getTemplate() {
    return createTtnModalTemplate(this.ttn, this.sklad, this.agent);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }
  fillForm(ttn) {
    if (ttn) {
      const nomerInput = document.querySelector('.ttn-nomer-input');
      const dateInput = document.querySelector('.ttn-date-input');
      const skladSelect = document.querySelector('.ttn-sklad-select');
      const postSelect = document.querySelector('.ttn-post-select');
  
      if (nomerInput) nomerInput.value = ttn.nomer || '';
      if (dateInput) dateInput.value = ttn.date || '';
      if (skladSelect) {
        for (const option of skladSelect.options) {
          if (option.text === ttn.sklad) {
            option.selected = true;
            break;
          }
        }
      }
      if (postSelect) {
        for (const option of postSelect.options) {
          if (option.text === ttn.agent) {
            option.selected = true;
            break;
          }
        }
      }
  
      const ttnModal = document.getElementById('ttnModal');
      if (ttnModal) ttnModal.setAttribute('data-ttn-id', ttn.id || 0);
    }
  }

  removeElement() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}