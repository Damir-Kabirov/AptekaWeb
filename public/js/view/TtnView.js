import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';
const isActiveFilter = (ttns)=>{
  if(ttns){
    if(ttns[0].c_id==1){
      return false
    }
    else{
      return true
    }
}
}

const createTtnTemplate = (ttns) => {
  return `
       <div class="ttn-content">
                <div class="ttn-header">
                    <h3 class="container_title">Приходные накладные</h3>
                    <div class="ttn-btns">
                        <button class="btn btn__standart ttn_add">Добавить ТТН</button>
                        <button class="btn btn__standart ttn_delet"  disabled>Удалить ТТН</button>
                        <button class="btn btn__standart ttn_update" disabled >Корректировка</button>
                        <button class="btn btn__standart ttn_otr" disabled>Отработать ТТН</button>
                    </div>
                </div>
                <div class="ttn-filter">
                    <button class="btn btn-filter btn-filter_nootr ${isActiveFilter(ttns)?'':'active-btn'}">Неотработанные ТТН</button>
                    <button class="btn btn-filter btn-filter_otr ${isActiveFilter(ttns)?'active-btn':''}">Отработанные ТТН</button>
                </div>
                <div class="table-responsive ttn-container">
                    <table class="table caption-top ttn-table  table-hover ">
                        <caption class="ttn-title">Товарно транспортные накладные</caption>
                         <thead class="ttn-thead">
                             <tr class="ttn-colums table-info">
                                <th scope="col">Код накладной</th>
                                <th scope="col">Номер накладной</th>
                                <th scope="col">Дата накладной</th>
                                <th scope="col">Дата отработки</th>
                                <th scope="col">Поставщик</th>
                                <th scope="col">Склад</th>
                            </tr>
                         </thead>
                         <tbody class='ttn-body'>
                            <tr class="ttn-row">
                                <td class="ttn-kod ">1442</td>
                                <td class="ttn-nomer">КЗН015256156</td>
                                <td class="ttn-date">01.08.2024</td>
                                <td class="ttn-date-otr">01.08.2024</td>
                                <td class="ttn-post">Кантрен</td>
                                <td class="ttn-sklad">Розница</td>
                            </tr>
                            ${ttns? ttns.map(ttn => `
                            <tr class="ttn-row" data-ttnId="${ttn.id}">
                                <td class="ttn-kod ">${ttn.id}</td>
                                <td class="ttn-nomer">${ttn.nomnakl}</td>
                                <td class="ttn-date">${normalizeDate(ttn.date)}</td>
                                <td class="ttn-date-otr">${ttn.otr_date?normalizeDate(ttn.otr_date):''}</td>
                                <td class="ttn-post">${ttn.agent}</td>
                                <td class="ttn-sklad">${ttn.sklad}</td>
                            </tr>
                              `).join(''):''}
                          </tbody>
                    </table>
                </div>
          </div>

    `
};

export default class TtnView {
  constructor(ttns) {
    this.ttns = ttns;
  }

  getTemplate() {
    return createTtnTemplate(this.ttns);
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