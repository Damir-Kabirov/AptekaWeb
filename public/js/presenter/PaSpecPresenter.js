import { render } from '../utils/render.js';
import PaSpecModel from '../model/PaSpecModel.js';
import PaSpecView from '../view/PaSpecView.js';
import PaModalView from '../view/PaModalView.js'; // Импортируем модальное окно
import { removeClassFromChildren, getAnom } from '../utils/utils.js';

export default class PaSpecPresenter {
  constructor(container) {
    this.container = container;
    this.paSpecModel = new PaSpecModel();
    this.view = null;
    this.paId = null;
    this.modal = null; // Добавляем переменную для хранения модального окна
  }

  async refreshPaSpecList(paId) {
    try {
      this.paId = paId;
      if (this.view) {
        this.view.removeElement();
      }
      const data = await this.paSpecModel.getPaSpecByPaId(this.paId);
      this.view = new PaSpecView(data);
      render(this.view, this.container);
      this.bindEvents(); // Привязываем события после рендеринга
    } catch (error) {
      console.error('Ошибка при обновлении спецификации приемного акта:', error);
      alert('Ошибка при обновлении спецификации приемного акта');
    }
  }

  // Метод для открытия модального окна
  openPaModal(paSpecData = null) {
    this.paModal = new PaModalView(paSpecData); // Создаем модальное окно
    render(this.paModal, this.container); // Рендерим модальное окно
  
    // Проверяем, что элемент модального окна существует
    const paModalWindow = document.querySelector('.pa-modal');
    if (paModalWindow) {
      this.modal = new bootstrap.Modal(paModalWindow); // Инициализируем модальное окно
      this.modal.show(); // Открываем модальное окно
  
      // Обработчик для кнопки "Сохранить"
      const saveButton = paModalWindow.querySelector('.btn-primary');
      if (saveButton) {
        saveButton.addEventListener('click', this.savePaSpec.bind(this));
      }
  
      // Получаем элементы для работы
      const rcenaInput = paModalWindow.querySelector('.pas-rcena-input');
      const rnacInput = paModalWindow.querySelector('.pas-rnac-input');
      const maxPriceSpan = paModalWindow.querySelector('.max-price-span');
      const maxRnacSpan = paModalWindow.querySelector('.max-rnac-span');
      const prbndsInput = paModalWindow.querySelector('.pas-cprbnds-input');
      const pndsInput = paModalWindow.querySelector('.pas-cpnds-input');
      const tarifInput = paModalWindow.querySelector('.pas-tarif-input');
      const nameInput = paModalWindow.querySelector('.pas-name-input');
  
      // Определяем, является ли препарат ЖНВЛП
      const isJnv = nameInput.getAttribute('data-is-jnv') === 'true';
  
      // Устанавливаем максимальную наценку
      const maxRnac = isJnv ? 30 : 500;
      maxRnacSpan.textContent = maxRnac;
  
      // Функция для расчета максимальной розничной цены
      const calculateMaxRcena = (isJnv, prbnds, pnds, tarif) => {
        const basePrice = isJnv ? prbnds : pnds; // Используем цену производителя для ЖНВЛП, иначе цену поставщика
        const maxRcena = basePrice + tarif + (basePrice * (maxRnac / 100));
        return maxRcena;
      };
  
      // Обновляем максимальную цену при загрузке модального окна
      const prbnds = parseFloat(prbndsInput.value);
      const pnds = parseFloat(pndsInput.value);
      const tarif = parseFloat(tarifInput.value);
      if (!isNaN(prbnds) && !isNaN(pnds) && !isNaN(tarif)) {
        const maxRcena = calculateMaxRcena(isJnv, prbnds, pnds, tarif);
        maxPriceSpan.textContent = maxRcena.toFixed(2);
      }
  
      // При изменении розничной цены
      rcenaInput.addEventListener('input', () => {
        const rcena = parseFloat(rcenaInput.value);
        const basePrice = isJnv ? parseFloat(prbndsInput.value) : parseFloat(pndsInput.value);
        const tarif = parseFloat(tarifInput.value);
        const maxRcena = calculateMaxRcena(isJnv, prbnds, pnds, tarif);
  
        if (!isNaN(rcena) && !isNaN(basePrice) && basePrice > 0) {
          // Если цена превышает максимальную, корректируем её
          let correctedRcena = rcena;
          if (rcena > maxRcena) {
            correctedRcena = maxRcena;
            rcenaInput.value = correctedRcena.toFixed(2);
          }
  
          // Пересчитываем наценку на основе скорректированной цены
          const rnac = ((correctedRcena - basePrice - tarif) / basePrice) * 100;
          rnacInput.value = rnac.toFixed(2);
        }
      });
  
      // При изменении наценки
      rnacInput.addEventListener('input', () => {
        const rnac = parseFloat(rnacInput.value);
        const basePrice = isJnv ? parseFloat(prbndsInput.value) : parseFloat(pndsInput.value);
        const tarif = parseFloat(tarifInput.value);
  
        if (!isNaN(rnac) && !isNaN(basePrice) && basePrice > 0) {
          // Если наценка превышает максимальную, корректируем её
          let correctedRnac = rnac;
          if (rnac > maxRnac) {
            correctedRnac = maxRnac;
            rnacInput.value = correctedRnac.toFixed(2);
          }
  
          // Пересчитываем розничную цену на основе скорректированной наценки
          const rcena = basePrice + tarif + (basePrice * (correctedRnac / 100));
          rcenaInput.value = rcena.toFixed(2);
        }
      });
  
      // Обработчик для закрытия модального окна
      paModalWindow.addEventListener('hidden.bs.modal', () => {
        this.paModal.removeElement(); // Удаляем модальное окно из DOM
      });
    } else {
      console.error('Элемент модального окна не найден в DOM.');
    }
  }
  // Метод для сохранения данных из модального окна
 async savePaSpec() {
    try {
      const paSpecData = {
        rnac: document.querySelector('.pas-rnac-input').value,
        rcena: document.querySelector('.pas-rcena-input').value,
        pasId:Number(document.querySelector('.pa-modal').getAttribute('data-pasId'))
      };
      await this.paSpecModel.updatePaSpec(paSpecData.pasId, paSpecData.rnac, paSpecData.rcena);
      this.modal.hide();
      await this.refreshPaSpecList(this.paId);
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      alert('Ошибка при сохранении данных');
    }
  }

  // Привязка событий
  bindEvents() {
    const paSpecBody = document.querySelector('.pa-spec-body');
    if (paSpecBody) {
      // Обработчик для строк таблицы
      paSpecBody.addEventListener('click', async (evt) => {
        const row = evt.target.closest('.pa-spec-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');
        }
      });
  
      // Обработчик для кнопки "Наценить позицию"
      const btnUpdatePaSpec = document.querySelector('.pa_update');
      if (btnUpdatePaSpec) {
        btnUpdatePaSpec.addEventListener('click', () => {
          const activeRow = document.querySelector('.pa-spec-row.table-active');
          if (activeRow) {
            const paSpecData = this.getActiveRowData(); // Получаем данные активной строки
            const isProcessed = document.querySelector('.pa-row.table-active .pa-date-otr').textContent.trim() !== '';
            btnUpdatePaSpec.disabled = isProcessed; // Делаем кнопку неактивной, если накладная отработана
            if (!isProcessed) {
              this.openPaModal(paSpecData); // Открываем модальное окно с данными
            }
          } else {
            alert('Выберите позицию для наценки');
          }
        });
      }
    }
  }

  // Получение данных активной строки
  getActiveRowData() {
    const activeRow = document.querySelector('.pa-spec-row.table-active');
    if (activeRow) {
      return {
        pasId:activeRow.getAttribute('data-pas-id'),
        prepname: activeRow.querySelector('.pa-spec-name').textContent,
        isJnv:activeRow.querySelector('.pa-spec-jnv').textContent==='Да'?true:false,
        kol: activeRow.querySelector('.pa-spec-kol').textContent,
        seria: activeRow.querySelector('.pa-spec-seria').textContent,
        prnds: activeRow.querySelector('.pa-spec-prnds').textContent,
        prbnds: activeRow.querySelector('.pa-spec-prbnds').textContent,
        pnds: activeRow.querySelector('.pa-spec-pnds').textContent,
        pbnds: activeRow.querySelector('.pa-spec-pbnds').textContent,
        tarif: activeRow.querySelector('.pa-spec-tarif').textContent,
        rnac: activeRow.querySelector('.pa-spec-rnac').textContent,
        rcena: activeRow.querySelector('.pa-spec-rcena').textContent,
      };
    }
    return null;
  }
}