import { render } from '../utils/render.js';
import { removeClassFromChildren, getAnom } from '../utils/utils.js';
import TtnModel from '../model/TtnModel.js';
import TtnView from '../view/TtnView.js';
import TtnModalView from '../view/TtnModalWindow.js';
import TtnSpec from './TtnSpecPresenter.js';
import AgentModel from '../model/AgentModel.js';
import SkladModel from '../model/SkladModel.js';

export default class TtnPresenter {
  constructor(container) {
    this.container = container;
    this.ttnModel = new TtnModel();
    this.agentModel = new AgentModel();
    this.skladModel = new SkladModel();
    this.view = null;
    this.modal = null;
  }

  async init(filter=false) {
    try {
      const data = await this.ttnModel.getTtns(getAnom());
      const agentData = await this.agentModel.getAgents();
      const skladData = await this.skladModel.getSklads();
      console.log(data)
      this.container.innerHTML = '';
      if (this.ttnSpec) {
        this.ttnSpec = null; // Удаляем ссылку
      }
      if(!filter){
        const filterData = data.filter(ttn=>ttn.c_id==1)
        this.view = new TtnView(filterData);
        console.log(filterData)
      }
      else{
        const filterData = data.filter(ttn=>ttn.c_id==2)
        this.view = new TtnView(filterData);
      }
      this.ttnModal = new TtnModalView(null, skladData, agentData);
      this.ttnSpec = new TtnSpec(this.container, 0);
      this.ttnSpec.init();
  
      render(this.view, this.container);
  
      this.bindEvents();
    } catch (error) {
      console.error('Ошибка при загрузке ТТН:', error);
      alert('Ошибка при загрузке данных ТТН');
    }
  }

  ttnBtnsControl() {
    const ttnContent = document.querySelector('.ttn-content');
    const ttnUpdateBtn = ttnContent.querySelector('.ttn_update');
    const ttnDeletBtn = ttnContent.querySelector('.ttn_delet');
    const ttnOtrabotBtn = ttnContent.querySelector('.ttn_otr');
    ttnUpdateBtn.removeAttribute('disabled');
    ttnDeletBtn.removeAttribute('disabled');
    if (document.querySelector('.ttn-spec-body').children.length||!document.querySelector('.btn-filter_otr').classList.contains('active-btn')) {
      ttnOtrabotBtn.removeAttribute('disabled');
    } else {
      ttnOtrabotBtn.disabled = true;
    }
  }

  createModalTtn() {
    render(this.ttnModal, this.container);
    const ttnModalWindow = document.querySelector('.ttn-modal');
    if (ttnModalWindow) {
      this.modal = new bootstrap.Modal(ttnModalWindow);
      this.modal.show();
    }
    const btnSave = document.querySelector('.btn-ttn-save');
    btnSave.addEventListener('click', this.ttnSave.bind(this));
  }

  async ttnSave() {
    const ttnDate = {
      id: document.getElementById('ttnModal').getAttribute('data-ttn-id'),
      nomer: document.querySelector('.ttn-nomer-input').value,
      date: document.querySelector('.ttn-date-input').value,
      sklad: Number(document.querySelector('.ttn-sklad-select').value),
      agent: Number(document.querySelector('.ttn-post-select').value),
      anom: getAnom(),
    };
  
    try {
      if (ttnDate.id && ttnDate.id !== '0') {
        // Обновление ТТН
        await this.ttnModel.updateTtn(ttnDate);
      } else {
        // Добавление ТТН
        await this.ttnModel.addTtn(ttnDate);
      }
  
      // Закрываем модальное окно
      this.modal.hide();
  
      // Обновляем список ТТН
      await this.init();
    } catch (error) {
      console.error('Ошибка при сохранении ТТН:', error);
      alert('Ошибка при сохранении ТТН');
    }
  }

  async deletTtn() {
    const activeRow = document.querySelector('.ttn-row.table-active');
    if (activeRow) {
      const ttnId = Number(activeRow.getAttribute('data-ttnId'));
      try {
        await this.ttnModel.deleteTtn(ttnId);
  
        // Обновляем список ТТН
        await this.init();
      } catch (error) {
        console.error('Ошибка при удалении ТТН:', error);
        alert('Ошибка при удалении ТТН');
      }
    }
  }

  getActiveRowData() {
    const activeRow = document.querySelector('.ttn-row.table-active');
    if (activeRow) {
      return {
        id: activeRow.getAttribute('data-ttnId'),
        nomer: activeRow.querySelector('.ttn-nomer').textContent,
        date: activeRow.querySelector('.ttn-date').textContent,
        sklad: activeRow.querySelector('.ttn-sklad').textContent,
        agent: activeRow.querySelector('.ttn-post').textContent,
      };
    }
    return null;
  }

  updateTnn() {
    const activeRowData = this.getActiveRowData();
    if (activeRowData) {
      this.createModalTtn(); // Сначала открываем модальное окно
      this.ttnModal.fillForm(activeRowData); // Затем заполняем форму данными
    } else {
      alert('Выберите ТТН для редактирования');
    }
  }

  

  bindEvents() {
    document.querySelector('.ttn-body').addEventListener('click', async (evt) => {
      const row = evt.target.parentElement;
      if (row.classList.contains('ttn-row')) {
        removeClassFromChildren(row, 'table-active');
        row.classList.add('table-active');
        await this.ttnSpec.refreshTtnSpecList(Number(row.querySelector('.ttn-kod').textContent));
        this.ttnBtnsControl();
      }
    });

    const btnAddTtn = document.querySelector('.ttn_add');
    btnAddTtn.addEventListener('click', this.createModalTtn.bind(this));

    const btnDeletTtn = document.querySelector('.ttn_delet');
    btnDeletTtn.addEventListener('click', this.deletTtn.bind(this));

    const btnUpdate = document.querySelector('.ttn_update');
    btnUpdate.addEventListener('click', this.updateTnn.bind(this));

    const filtersTtn = document.querySelector('.ttn-filter')
    filtersTtn.addEventListener('click',(event)=>{
      if(event.target.classList.contains('btn-filter_nootr')){
        this.init(false);
      }
      if(event.target.classList.contains('btn-filter_otr')){
        this.init(true);
      }
    })
  }
}