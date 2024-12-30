import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const createModalTemplate = (dogovor) => {
  return `
    <div class="dogovor-modal">
      <h4 class="modal-title">${dogovor ? 'Редактировать договор' : 'Добавить договор'}</h4>
      <a href="#" class="btn-modal-close">Х</a>
      <form action="" class="dogovor-form">
        <input type="hidden" name="id" value="${dogovor ? dogovor.id : ''}">
        <div class="form-dogovor-agent">
          <label class="form-label" for="inn">ИНН</label>
          <input type="number" class="input agent-input-name" name="inn" value="${dogovor ? dogovor.agent_inn : ''}">
          <label class="form-label" for="kpp">КПП</label>
          <input type="text" class="input agent-input-name" name="kpp" value="${dogovor ? dogovor.agent_kpp : ''}">
          <button class="btn btn__standart btn-dogovor-agent">Найти контрагента</button>
        </div>

        <label class="form-label" for="agent">Контрагент</label>
        <input type="text" class="input dogovor-input-agent" data-agent-id="${dogovor ? dogovor.agent_id : ''}" name="agent" readonly value="${dogovor ? dogovor.agent_name : ''}">

        <label class="form-label" for="nomer">Номер</label>
        <input type="text" class="input dogovor-input-numer" name="nomer" value="${dogovor ? dogovor.nomer : ''}">

        <label class="form-label" for="sum">Сумма</label>
        <input type="number" class="input dogovor-input-sum" name="sum" value="${dogovor ? dogovor.sum : ''}">

        <label class="form-label" for="date">Дата договора</label>
        <input type="date" class="input dogovor-input-date" name="date" value="${dogovor ? normalizeDate(dogovor.date) : ''}">

        <div class="form_btns">
          <button class="btn btn_save">Сохранить</button>
          ${dogovor ? '<button class="btn btn_delet">Удалить</button>' : ''}
        </div>
      </form>
    </div>
  `;
};

export default class DogovorModalView {
  constructor(dogovor = null) {
    this.dogovor = dogovor; // Данные о договоре
    this.element = null;
  }

  getTemplate() {
    return createModalTemplate(this.dogovor);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());

      // Добавляем обработчики событий
      this.element.querySelector('.btn-modal-close').addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });

      this.element.querySelector('.btn-dogovor-agent').addEventListener('click', (e) => {
        e.preventDefault();
        const inn = this.element.querySelector('.agent-input-name[name="inn"]').value.toString().trim();
        const kpp = this.element.querySelector('.agent-input-name[name="kpp"]').value.toString().trim();
        this.onFindAgent(inn, kpp);
      });

      this.element.querySelector('.btn_save').addEventListener('click', (e) => {
        e.preventDefault();
        const form = this.element.querySelector('.dogovor-form');
        const formData = new FormData(form);
        const dogovorData = Object.fromEntries(formData.entries());
        this.onSave(dogovorData);
        this.close();
      });

      if (this.dogovor) {
        this.element.querySelector('.btn_delet').addEventListener('click', (e) => {
          e.preventDefault();
          this.onDelete(this.dogovor.id); // Передаем ID договора для удаления
          this.close();
        });
      }
    }
    return this.element;
  }

  open(container) {
    // Добавляем модальное окно в DOM
    container.appendChild(this.getElement());
  }

  close() {
    // Удаляем модальное окно из DOM
    this.element.remove();
  }

  setAgent(agent) {
    const inputElement = this.element.querySelector('.dogovor-input-agent');
    inputElement.value = agent.name;
    inputElement.setAttribute('data-agent-id', agent.id);
  }

  onFindAgent(callback) {
    this.onFindAgent = callback;
  }

  onSave(callback) {
    this.onSave = callback;
  }

  onDelete(callback) {
    this.onDelete = callback;
  }
}