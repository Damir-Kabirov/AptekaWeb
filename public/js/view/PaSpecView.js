import { createElement } from '../utils/render.js';
import { generateEAN13 } from '../utils/utils.js';



const createPaSpecTemplate = (paspec) => {
    return `
      <div class="pa-spec-content">
        <div class="pa-spec-btns">
          <button class="btn btn__standart pa_update" data-bs-toggle="modal" data-bs-target="#paModal">Наценить позицию</button>
        </div>
        <div class="table-responsive pa-spec-container">
          <table class="table caption-top pa-spec-table table-bordered">
            <caption class="pa-title">Спецификация приемного акта</caption>
            <thead class="pa-thead">
              <tr class="pa-colums table-info">
                <th scope="col">Штрих код</th>
                <th scope="col">Наименование</th>
                <th scope="col">ЖНВ</th>
                <th scope="col">Серия</th>
                <th scope="col">Количество</th>
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
            <tbody class="pa-spec-body">
              ${paspec ? paspec.map(pas => `
                <tr class="pa-spec-row" data-pas-id="${pas.id}">
                  <td class="pa-spec-strih">${generateEAN13(pas.id,pas.anom)}</td>
                  <td class="pa-spec-name">${pas.prep_name || ''}</td> <!-- Используем prep_name -->
                  <td class="pa-spec-jnv">${pas.isJnv ? 'Да' : 'Нет'}</td>
                  <td class="pa-spec-seria">${pas.seria || ''}</td>
                  <td class="pa-spec-kol">${pas.kol_tov || ''}</td>
                  <td class="pa-spec-prbnds">${pas.pr_cena_bnds || ''}</td>
                  <td class="pa-spec-prnds">${pas.pr_cena_nds || ''}</td>
                  <td class="pa-spec-pbnds">${pas.pc_cena_bnds || ''}</td>
                  <td class="pa-spec-pnds">${pas.pc_cena_nds || ''}</td>
                  <td class="pa-spec-rnac">${pas.rnac || '0'}</td>
                  <td class="pa-spec-rcena">${pas.rcena || '0'}</td>
                  <td class="pa-spec-tarif">${pas.tarif || '0'}</td>
                  <td class="pa-spec-sklad">${pas.sklad_name || ''}</td> <!-- Используем sklad_name -->
                </tr>
              `).join('') : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

export default class PaSpecView {
  constructor(paspec) {
    this.paspec = paspec;
  }

  getTemplate() {
    return createPaSpecTemplate(this.paspec);
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