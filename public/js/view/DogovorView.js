import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const createDogovorTemplate = (dogovors) => {
  console.log(dogovors);
  return `
    <div class="dogovor-container container">
      <div class="container-header">
        <h3 class="container_title">Договоры</h3>
        <button class="btn btn__standart">Добавить договор</button>
      </div>
      <div class="dogovor-content">
        <div class="dogovor-columns">
          <p class="dogovor-column">Номер</p>
          <p class="dogovor-column">Контрагент</p>
          <p class="dogovor-column">Сумма</p>
          <p class="dogovor-column">Дата договора</p>
        </div>
        <ul class="dogovor-list">
          ${dogovors.map(dogovor => `
            <li class="dogovor-items">
              <a href="#" class="dogovor_link" data-dogovor-id="${dogovor.id}">
                <p class="dogovor-nomer">${dogovor.nomer}</p>
                <p class="dogovor-agent">${dogovor.agent_name}</p>
                <p class="dogovor-sum">${dogovor.sum}</p>
                <p class="dogovor-date">${normalizeDate(dogovor.date)}</p>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
};

export default class DogovorView {
  constructor(dogovors) {
    this.dogovors = dogovors;
    this.element = null;
  }

  getTemplate() {
    return createDogovorTemplate(this.dogovors);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    if (this.element) {
      this.element.remove(); // Удаляем старый элемент из DOM
      this.element = null; // Сбрасываем ссылку на элемент
    }
  }
}