import {createElement} from '../utils/render.js'
import { getAnom } from '../utils/utils.js'; 
const createHeaderTemplate = ()=>{
  return `
    <header class="header">
      <div class="sidebar-toggle"></div>
      <div class="apt-num">Аптека№${getAnom()}</div>
      <button class="btn btn-close-window">Выйти</button>
    </header>
      `
}

export default class HeaderView {
  getTemplate() {
    return createHeaderTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}