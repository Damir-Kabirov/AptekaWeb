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
                   <li class="submenu-item"><a class="load-tovar" href="#">Товарные запасы</a>
                   <li class="submenu-item"><a  class="load-otchet" href="#">Отчет</a>
              </ul>
              </li>
              <li class="nav-item"><a class="nav-item-link"  href="#">Справочники</a>
                <ul class="submenu">
                    <li class="submenu-item"><a class="load-nomenclator" href="#">Номенклатор</a>
                    <li class="submenu-item"><a  class="load-agent" href="#">Контрагенты</a>
                    <li class="submenu-item"><a  class="load-dogovor" href="#">Договоры</a>
                </ul>
            </li>
              <li class="nav-item"><a  class="nav-item-link" href="#">Отгрузка товара</a></li>
            </ul>
          </aside>
        
          <main class="content">
            <h1>Основной контент</h1>
            <p>Это пример страницы с боковой панелью.</p>
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