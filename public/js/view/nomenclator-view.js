import { createElement } from '../utils/render.js';

const createNomenclatorTemplate = (data) => {
  return `
    <div class="nomenclator">
      <div class="nomenclator-header">
        <h2 class="content-title">Номенклатор</h2>
        <button class="btn nomenclator-btn">Добавить позицию</button>
      </div>
      <div class="content-nomenclator">
        <div class="nomenclator-column">
          <p class="nomenclator-id">Id</p>
          <p class="nomenclator-name">Наименование</p>
          <p class="nomenclator-jnv">ЖНВ</p>
          <p class="nomenclator-manufacturer">Производитель</p>
        </div>
        <div class="nomenclator-row">
          ${data.map(item => `
            <div class="nomenclator-item">
              <p class="nomenclator-id">${item.id}</p>
              <p class="nomenclator-name">${item.name}</p>
              <p class="nomenclator-jnv">${item.jnv?'Да':'Нет'}</p>
              <p class="nomenclator-manufacturer">${item.manufacturer}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
};

export default class NomenclatorView {
  constructor(data) {
    this.element = null;
    this.data = data
  }

  getTemplate() {
    return createNomenclatorTemplate( this.data);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate(this.data));
    }
    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}