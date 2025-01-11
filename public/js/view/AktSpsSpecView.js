import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const createAktSpecSpecTemplate = (paspec) => {
    return `
      <div class="aktBo-spec-content akt-spec-content">
        <div class="pa-spec-btns akt-spec-btns">
          <button class="btn btn__standart aktBoSpec_update">Изменить количество</button>
          <button class="btn btn__standart aktBoSpec_delet">Удалить позицию</button>
        </div>
        <div class="table-responsive pa-spec-container akt-spec-container">
          <table class="table caption-top pa-spec-table table-bordered">
            <caption class="aktBo-title akt-title">Спецификация акта списания</caption>
            <thead class="aktBo-thead">
              <tr class="aktBo-colums table-info">
                <th scope="col">Штрих код</th>
                <th scope="col">Наименование</th>
                <th scope="col">Серия</th>
                <th scope="col">Остаток на складе</th>
                <th scope="col">Количество</th>
                <th scope="col">Цена проз. ндс</th>
                <th scope="col">Цена проз. бндс</th>
                <th scope="col">Цена пост. ндс</th>
                <th scope="col">Цена пост. бндс</th>
                <th scope="col">Наценка %</th>
                <th scope="col">Розничная цена</th>
                <th scope="col">Тариф апт.произ</th>
                <th scope="col">Срок годности</th>
                <th scope="col">Склад</th>
              </tr>
            </thead>
            <tbody class="aktBo-spec-body">
              ${paspec ? paspec.map(pas => `
                <tr class="aktBo-spec-row" data-aktBoSpec-id="${pas.pasId}">
                  <td class="aktBo-spec-strih">${pas.barcode}</td>
                  <td class="aktBo-spec-name">${pas.name || ''}</td>
                  <td class="aktBo-spec-seria">${pas.seria || ''}</td>
                  <td class="aktBo-spec-kol-ost">${pas.kol_tov_ost || ''}</td>
                  <td class="aktBo-spec-kol">${pas.quantity || ''}</td>
                  <td class="aktBo-spec-prbnds">${pas.pr_cena_bnds || ''}</td>
                  <td class="aktBo-spec-prnds">${pas.pr_cena_nds || ''}</td>
                  <td class="aktBo-spec-pbnds">${pas.pc_cena_bnds || ''}</td>
                  <td class="aktBo-spec-pnds">${pas.pc_cena_nds || ''}</td>
                  <td class="aktBo-spec-rnac">${pas.rnac || '0'}</td>
                  <td class="aktBo-spec-rcena">${pas.rcena || '0'}</td>
                  <td class="aktBo-spec-tarif">${pas.tarif || '0'}</td>
                  <td class="aktBo-spec-sroc">${normalizeDate(pas.expiryDate )|| ''}</td>
                  <td class="aktBo-spec-sklad">${pas.sklad_name || ''}</td>
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

export default class aktSpesSpecView {
  constructor(paspec) {
    this.paspec = paspec;
  }

  getTemplate() {
    return createAktSpecSpecTemplate(this.paspec);
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