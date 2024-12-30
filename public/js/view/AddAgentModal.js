import { createElement } from '../utils/render.js';
const createAddAgentModalTemplate = () => {
    return `
      <div class="agent-modal">
        <h4 class="modal-title">Добавить контрагента</h4>
        <a href="#" class="btn-modal-close">Х</a>
        <form action="" class="agent-form">
          <label class="form-label" for="name">Наименование</label>
          <input type="text" class="input agent-input-name" name="name">
          <label class="form-label" for="inn">ИНН</label>
          <input type="number" class="input agent-input-inn" name="inn">
          <label class="form-label" for="kpp">КПП</label>
          <input type="text" class="input agent-input-kpp" name="kpp">
          <label class="form-label" for="adress">Адрес</label>
          <textarea name="adress" class="agent-input-adress"></textarea>
          <div class="form_btns">
            <button class="btn btn_save">Сохранить</button>
          </div>
        </form>
      </div>
    `;
  };

  export default class AddAgentModal {
    constructor() {
      this.element = null;
    }
  
    getTemplate() {
      return createAddAgentModalTemplate();
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
      const newAgent = {
        name: form.querySelector('.agent-input-name').value,
        inn: form.querySelector('.agent-input-inn').value,
        kpp: form.querySelector('.agent-input-kpp').value,
        adress: form.querySelector('.agent-input-adress').value,
      };
  
      // Вызываем метод для сохранения данных
      this.onSave(newAgent);
      this.close();
    }
  
    onSave(callback) {
      this.onSave = callback;
    }
  }