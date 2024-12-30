import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';
const createTtnSpecTemplate = (ttnspec) => {
  return `
       <div class="ttn-spec-content">
                <div class="ttn-spec-btns">
                    <button class="btn btn__standart ttns_add">Добавить позицию</button>
                    <button class="btn btn__standart ttns_delet" disabled>Удалить позицию</button>
                    <button class="btn btn__standart ttns_update disable-btn" disabled >Корректировка</button>
                </div>
                <div class="table-responsive ttn-spec-container">
                    <table class="table caption-top ttn-spec-table table-bordered">
                        <caption class="ttn-title">Спецификация накладной</caption>
                         <thead class="ttn-spec-thead">
                             <tr class="ttn-spec-colums table-info">
                                <th scope="col">Активный</th>
                                <th scope="col">Код спецификация</th>
                                <th scope="col">Наименование</th>
                                <th scope="col">ЖНВ</th>
                                <th scope="col">Серия</th>
                                <th scope="col">Количество</th>
                                <th scope="col">Срок годности</th>
                                <th scope="col">Цена проз. ндс</th>
                                <th scope="col">Цена проз. бндс</th>
                                <th scope="col">Цена пост. ндс</th>
                                <th scope="col">Цена пост. бндс</th>
                                <th scope="col">Наценка %</th>
                                <th scope="col">Розничная цена</th>
                                <th scope="col">Тариф апт.произ</th>
                                <th scope="col">Склад</th>
                            </tr>
                         </thead>
                         <tbody class="ttn-spec-body">
                               ${ttnspec ?ttnspec.map(ttns => `
                    
                           <tr class="ttn-spec-row" data-ttns-id="${ttns.id}">
                                <td class="ttn-spec-active "><input type="checkbox" class="ttn-spec-check"${!ttns.isPas?'checked':''} ${ttns.isPas?'disabled':''}></td>
                                <td class="ttn-spec-id">${ttns.id}</td>
                                <td class="ttn-spec-name">${ttns.prepname}</td>
                                <td class="ttn-spec-jnv">${ttns.isJnv?'Да':'Нет'}</td>
                                <td class="ttn-spec-seria">${ttns.seria}</td>
                                <td class="ttn-spec-kol">${ttns.kol}</td>
                                <td class="ttn-spec-sroc">${ttns.srgod?normalizeDate(ttns.srgod):" "}</td>
                                <td class="ttn-spec-prbnds">${ttns.prbnds}</td>
                                <td class="ttn-spec-prnds">${ttns.prnds}</td>
                                <td class="ttn-spec-pbnds">${ttns.pbnds}</td>
                                <td class="ttn-spec-pnds">${ttns.pnds}</td>
                                <td class="ttn-spec-rnac">${ttns.rnac?ttns.rnac:"0"}</td>
                                <td class="ttn-spec-rcena">${ttns.rcena?ttns.rcena:"0"}</td>
                                <td class="ttn-spec-tarif">${ttns.tarif?ttns.tarif:"0"}</td>
                                <td class="ttn-spec-sklad">${ttns.sklad}</td>
                            </tr>
                              `).join(''):''}
                          </tbody>
                    </table>
                </div>
            </div>
    `
};

export default class TtnSpecView {
  constructor(ttnspec) {
    this.ttnspec = ttnspec;
  }

  getTemplate() {
    return createTtnSpecTemplate(this.ttnspec);
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