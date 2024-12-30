import { createElement } from '../utils/render.js';

const createAgentTemplate = (agents) => {
  return `
    <div class="agent-container container">
      <div class="container-header">
        <h3 class="container_title">Контрагенты</h3>
        <button class="btn btn__standart">Добавить контрагента</button>
      </div>
      <div class="agent_content">
        <div class="agent-columns">
          <p class="agent-column">Наименование</p>
          <p class="agent-column">ИНН</p>
          <p class="agent-column">КПП</p>
          <p class="agent-column">Адрес</p>
        </div>
        <ul class="agent-list">
          ${agents.map(agent => `
            <li class="agent-items">
              <a href="#" class="agent_link" data-agent-id="${agent.id}">
                <p class="agent-name">${agent.name}</p>
                <p class="agent-inn">${agent.inn}</p>
                <p class="agent-kpp">${agent.kpp}</p>
                <p class="agent-adress">${agent.adress}</p>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
  `;
};

export default class AgentView {
  constructor(agents) {
    this.agents = agents;
  }

  getTemplate() {
    return createAgentTemplate(this.agents);
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement() {
    // Удаляем старый элемент из DOM
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
}