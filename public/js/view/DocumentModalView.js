import { createElement } from '../utils/render.js';

const createDocumentTemplate = () => {
  return `
    <div class="document-create-modal modal fade modal-xl" id="docCreathModal" tabindex="1" aria-labelledby="docCreatModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Создать документ расхода</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body tov-serch-modal-body">
            <div class="input-group input-group-lg">
              <label class="input-group-text" for="inputGroupSelect01">Тип документа</label>
              <select class="form-select document-type-select" id="inputGroupSelect01">
                <option value="5">Списание</option>
                <option value="7">Акт безналичного отпуска</option>
              </select>
              <span class="input-group-text" id="inputGroup-sizing-sm">Дата документа</span>
              <input type="date" class="form-control document-date-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            </div>

            <!-- Блок для Акта безналичного отпуска -->
            <div class="act-beznal-group" id="act-beznal-group">
              <div class="input-group input-group-lg">
                <span class="input-group-text" id="inputGroup-sizing-sm">ИНН</span>
                <input type="number" class="form-control agent-inn-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
                <span class="input-group-text" id="inputGroup-sizing-sm">КПП</span>
                <input type="number" class="form-control agent-kpp-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
                <button type="button" class="btn btn-primary btn-serch-agent">Найти контрагента</button>
              </div>
              <div class="input-group input-group-lg">
                <span class="input-group-text" id="inputGroup-sizing-sm">Контрагент</span>
                <input type="text" readonly class="form-control document-agent-input" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm" data-agent-id="">
              </div>
              <div class="input-group input-group-lg">
                <label class="input-group-text" for="inputGroupSelect01">Договор</label>
                <select class="form-select dogovor-select" id="inputGroupSelect01">
                </select>
              </div>
            </div>

            <!-- Блок для Списания -->
            <div class="act-spisan-group" id="act-spisan-group">
              <div class="input-group input-group-lg">
                <label class="input-group-text" for="inputGroupSelect01">Причина списания</label>
                <select class="form-select act-spisan-select" id="inputGroupSelect01">
                  <option value="Брак">Брак</option>
                  <option value="Вышел срок годности">Вышел срок годности</option>
                  <option value="Расход по аптечному производству">Расход по аптечному производству</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-primary" id="create-document-btn">Создать</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default class DocumentModalView {
  constructor() {
    this.element = null;
  }

  getTemplate() {
    return createDocumentTemplate();
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