import { createElement } from '../utils/render.js';

const createModalTemplate = (agent) => {
  return `
    <div class="agent-modal">
      <h4 class="modal-title">Редактировать контрагента</h4>
      <a href="#" class="btn-modal-close">Х</a>
      <form action="" class="agent-form">
        <label class="form-label" for="name">Наименование</label>
        <input type="text" class="input agent-input-name" name="name" value="${agent.name}">
        <label class="form-label" for="inn">ИНН</label>
        <input type="number" class="input agent-input-inn" name="inn" value="${agent.inn}">
        <label class="form-label" for="kpp">КПП</label>
        <input type="text" class="input agent-input-kpp" name="kpp" value="${agent.kpp}">
        <label class="form-label" for="adress">Адрес</label>
        <textarea name="adress" class="agent-input-adress">${agent.adress}</textarea>
        <div class="form_btns">
          <button class="btn btn_save">Сохранить</button>
          <button class="btn btn_delet">Удалить</button>
        </div>
      </form>
    </div>
  `;
};
export default class AgentModal {
  constructor(agent) {
    this.agent = agent;
    this.element = null;
  }

  getTemplate() {
    return createModalTemplate(this.agent);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());

      // Добавляем обработчики событий
      this.element.querySelector('.btn-modal-close').addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });

      this.element.querySelector('.btn_save').addEventListener('click', (e) => {
        e.preventDefault();
        this.handleSave();
      });

      this.element.querySelector('.btn_delet').addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDelete();
      });
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

  handleSave() {
    const form = this.element.querySelector('.agent-form');
    const updatedAgent = {
      id: this.agent.id,
      name: form.querySelector('.agent-input-name').value,
      inn: form.querySelector('.agent-input-inn').value,
      kpp: form.querySelector('.agent-input-kpp').value,
      adress: form.querySelector('.agent-input-adress').value,
    };

    // Вызываем метод для сохранения данных
    this.onSave(updatedAgent);
    this.close();
  }

  handleDelete() {
    // Вызываем метод для удаления данных
    this.onDelete(this.agent.id);
    this.close();
  }

  onSave(callback) {
    this.onSave = callback;
  }

  onDelete(callback) {
    this.onDelete = callback;
  }
}