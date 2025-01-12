import { createElement } from '../utils/render.js';
import { normalizeDate } from '../utils/utils.js';

const createOthetTemplate = (data) => {
  return `
    <div class="othet-conteiner">
      <div class="othet-header">
        <h2 class="container_title">Материальный отчет</h2>
        <div class="othet_action">
          <div class="input-group input-group-lg othet-input-group othet-periud-select">
            <label class="input-group-text" for="inputGroupSelect01">Периуд</label>
            <select name="date" id="date" class="form-select othet-date-select"></select>
          </div>
          <div class="othet-btns">
            <button class="btn btn__standart otchet-create">Cформировать отчет</button>
            <button class="btn btn__standart otchet-print">Распечатать отчет</button>
          </div>
        </div>
      </div>
      <div class="other-body">
        <div class="othet-section section-ost-start">
          <h4 class="othet-subtitle">Остаток на начало</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Остаток суммы на начало</span>
            <input readonly type="text" class="form-control start-ost-input-sum" value="${data.startSum || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Остаток колличества на начало</span>
            <input readonly type="number" class="form-control start-ost-input-kol" value="${data.startKol || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>
          <h4 class="othet-subtitle othet-subtitle_min">В том числе:</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница сумма</span>
            <input readonly type="text" class="form-control start-ost-input-sum-rozn" value="${data.startSumRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница количество</span>
            <input readonly type="number" class="form-control start-ost-input-kol-rozn" value="${data.startKolRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ сумма</span>
            <input readonly type="text" class="form-control start-ost-input-sum-apt" value="${data.startSumApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ количество</span>
            <input readonly type="number" class="form-control start-ost-input-kol-apt" value="${data.startKolApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>  
        </div>
        <div class="othet-section section-prihod">
          <h4 class="othet-subtitle">Приход</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Приход сумма</span>
            <input readonly type="text" class="form-control prihod-input-sum" value="${data.prihodSum || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Приход количество</span>
            <input readonly type="number" class="form-control prihod-input-kol" value="${data.prihodKol || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>
          <h4 class="othet-subtitle othet-subtitle_min">В том числе:</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница сумма</span>
            <input readonly type="text" class="form-control prihod-input-sum-rozn" value="${data.prihodSumRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница количество</span>
            <input readonly type="number" class="form-control prihod-input-kol-rozn" value="${data.prihodKolRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ сумма</span>
            <input readonly type="text" class="form-control prihod-input-sum-apt" value="${data.prihodSumApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ количество</span>
            <input readonly type="number" class="form-control prihod-input-kol-apt" value="${data.prihodKolApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>  
        </div>
        <div class="othet-section section-rashod">
          <h4 class="othet-subtitle">Расход</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Расход сумма</span>
            <input readonly type="text" class="form-control rashod-input-sum" value="${data.rashodSum || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Расход количество</span>
            <input readonly type="number" class="form-control rashod-input-kol" value="${data.rashodKol || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>
          <h4 class="othet-subtitle othet-subtitle_min">В том числе:</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты безналичного отпуска(сумма)</span>
            <input readonly type="text" class="form-control rashod-input-sum-abo" value="${data.rashodSumAbo || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты списания (сумма)</span>
            <input readonly type="number" class="form-control rashod-input-sum-aktsps" value="${data.rashodSumAktsps || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты расхода аптечного производства (сумма)</span>
            <input readonly type="text" class="form-control rashod-input-sum-arap" value="${data.rashodSumArap || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты безналичного отпуска(кол.)</span>
            <input readonly type="text" class="form-control rashod-input-kol-abo" value="${data.rashodKolAbo || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты списания (кол.)</span>
            <input readonly type="number" class="form-control rashod-input-kol-aktsps" value="${data.rashodKolAktsps || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Акты расхода аптечного производства (кол.)</span>
            <input readonly type="text" class="form-control rashod-input-kol-arap" value="${data.rashodKolArap || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>  
        </div>
        <div class="othet-section section-ost-end">
          <h4 class="othet-subtitle">Остаток на конец</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Остаток суммы на конец</span>
            <input readonly type="text" class="form-control end-ost-input-sum" value="${data.endSum || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Остаток колличества на конец</span>
            <input readonly type="number" class="form-control end-ost-input-kol" value="${data.endKol || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>
          <h4 class="othet-subtitle othet-subtitle_min">В том числе:</h4>
          <div class="input-group input-group-lg otchet-input-group">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница сумма</span>
            <input readonly type="text" class="form-control end-ost-input-sum-rozn" value="${data.endSumRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад розница количество</span>
            <input readonly type="number" class="form-control end-ost-input-kol-rozn" value="${data.endKolRozn || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ сумма</span>
            <input readonly type="text" class="form-control end-ost-input-sum-apt" value="${data.endSumApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
            <span class="input-group-text" id="inputGroup-sizing-sm">Склад Апт.произ количество</span>
            <input readonly type="number" class="form-control end-ost-input-kol-apt" value="${data.endKolApt || '0'}" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
          </div>  
        </div>
      </div>
    </div>
  `;
};

export default class PaView {
  constructor(data) {
    this.data = data;
  }

  getTemplate() {
    return createOthetTemplate(this.data);
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