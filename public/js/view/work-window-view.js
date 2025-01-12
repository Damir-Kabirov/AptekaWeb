import {createElement} from '../utils/render.js'

const createWorkWindowTemplate = ()=>{
  return `
   <section class="work-window">
        <aside class="sidebar">
            <ul class="nav">
              <li class="nav-item"><a class="nav-item-link" href="#">Прием товара</a>
              <ul class="submenu">
                <li class="submenu-item"><a  class="submenu-item-link load-ttn" href="#">ТТН</a>
                <li class="submenu-item"><a  class="submenu-item-link load-pa" href="#">Приемный акт</a>
              </ul>
            </li>
              <li class="nav-item"><a class="nav-item-link" href="#">Склад</a>
              <ul class="submenu">
                   <li class="submenu-item"><a class="submenu-item-link load-tovar" href="#">Товарные запасы</a>
                   <li class="submenu-item"><a  class=" submenu-item-link load-othet" href="#">Отчет</a>
              </ul>
              </li>
              <li class="nav-item"><a class="nav-item-link"  href="#">Справочники</a>
                <ul class="submenu">
                    <li class="submenu-item"><a class="submenu-item-link load-nomenclator" href="#">Номенклатор</a>
                    <li class="submenu-item"><a  class="submenu-item-link load-agent" href="#">Контрагенты</a>
                    <li class="submenu-item"><a  class="submenu-item-link load-dogovor" href="#">Договоры</a>
                </ul>
            </li>
              <li class="nav-item"><a  class="nav-item-link" href="#">Расходные акты</a>
              <ul class="submenu">
                    <li class="submenu-item"><a class="submenu-item-link load-aktBo" href="#">Акты безналичного отпуска</a>
                    <li class="submenu-item"><a  class=" submenu-item-link load-aktSps" href="#">Акты списания</a>
                </ul>
              </li>
            </ul>
          </aside>
        
          <main class="content">
          
          </main>
    </section>
      `
}

export default class WorkWindowView {
  getTemplate() {
    return createWorkWindowTemplate();
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