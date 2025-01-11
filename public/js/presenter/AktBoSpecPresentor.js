import { render } from '../utils/render.js';
import AktBoSpecModel from '../model/AktBoSpecModel.js';
import AktBoSpecView from '../view/AktBoSpecView.js';
import AktSpecModallView from '../view/AktSpecModallView.js'; // Импортируем модальное окно
import { removeClassFromChildren } from '../utils/utils.js';

export default class AktBoSpecPresenter {
  constructor(container) {
    this.container = container;
    this.aktBoSpecModel = new AktBoSpecModel();
    this.view = null;
    this.aktBoId = null;
    this.modal = null;
    this.modalInstance = null;
    this.isProcessed = false; // Флаг для отслеживания состояния накладной (отработана или нет)
    this.isFilterActive = false; // Флаг для отслеживания активного фильтра
  }

  // Обновление списка спецификации
  async refreshAktBoSpecList(aktBoId) {
    try {
      this.aktBoId = aktBoId;
      if (this.view) {
        this.view.removeElement();
      }

      const data = await this.aktBoSpecModel.getAktBoSpecByAktBoId(this.aktBoId);
      this.view = new AktBoSpecView(data);
      render(this.view, this.container);

      // Проверяем, отработана ли накладная
      this.isProcessed = this.checkIfProcessed();
      // Проверяем, активен ли фильтр "Отработанные"
      this.isFilterActive = this.checkIfFilterActive();
      this.bindEvents();
      this.updateButtonsState(); // Обновляем состояние кнопок
    } catch (error) {
      console.error('Ошибка при обновлении спецификации акта безналичного отпуска:', error);
      alert('Ошибка при обновлении спецификации акта безналичного отпуска');
    }
  }

  // Проверка, отработана ли накладная
  checkIfProcessed() {
    const activeRow = document.querySelector('.aktBo-row.table-active');
    if (activeRow) {
      const otrDate = activeRow.querySelector('.aktBo-date-otr').textContent.trim();
      return otrDate !== ''; // Если дата отработки не пустая, накладная отработана
    }
    return false;
  }

  // Проверка, активен ли фильтр "Отработанные"
  checkIfFilterActive() {
    const filterButton = document.querySelector('.btn-filter_otr.active-btn');
    return filterButton !== null; // Если кнопка фильтра "Отработанные" активна, фильтр включен
  }

  // Обновление состояния кнопок
  updateButtonsState() {
    const btnUpdateAktSpec = document.querySelector('.aktBoSpec_update');
    const btnDeleteAktSpec = document.querySelector('.aktBoSpec_delet');
    const activeRow = document.querySelector('.aktBo-spec-row.table-active');

    if (btnUpdateAktSpec && btnDeleteAktSpec) {
      if (this.isProcessed || this.isFilterActive || !activeRow) {
        // Если накладная отработана, активен фильтр "Отработанные" или нет выбранной строки, блокируем кнопки
        btnUpdateAktSpec.disabled = true;
        btnDeleteAktSpec.disabled = true;
      } else {
        // Иначе разблокируем кнопки
        btnUpdateAktSpec.disabled = false;
        btnDeleteAktSpec.disabled = false;
      }
    }
  }

  // Метод для открытия модального окна
  openAktSpecModal(aktSpecData = null) {
    this.modal = new AktSpecModallView(aktSpecData);
    render(this.modal, document.body);

    const aktSpecModalElement = document.querySelector('.aktBoSpecModal');
    if (aktSpecModalElement) {
      this.modalInstance = new bootstrap.Modal(aktSpecModalElement);
      this.modalInstance.show();

      this.bindModalEvents();

      aktSpecModalElement.addEventListener('hidden.bs.modal', () => {
        this.modal.removeElement();
      });
    } else {
      console.error('Элемент модального окна не найден в DOM.');
    }
  }

  // Привязка событий для модального окна
  bindModalEvents() {
    const saveButton = this.modal.getElement().querySelector('.aktBoSpec-save');
    if (saveButton) {
      saveButton.addEventListener('click', () => this.handleSave());
    }
  }

  // Обработчик для кнопки "Сохранить" в модальном окне
  async handleSave() {
    try {
      const pasId = this.modal.getElement().querySelector('.aktspec-name-input').getAttribute('data-pasId');
      const newKol = this.modal.getElement().querySelector('.pas-rcena-input').value;
      const aktBoId = document.querySelector('.aktBo-row.table-active').getAttribute('data-aktboid');

      if (isNaN(newKol) || newKol < 0) {
        alert('Некорректное количество');
        return;
      }

      await this.aktBoSpecModel.updateAktBoSpec(pasId, newKol, aktBoId);

      this.modalInstance.hide();
      await this.refreshAktBoSpecList(this.aktBoId);

      alert('Данные успешно сохранены');
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      alert('Ошибка при сохранении данных');
    }
  }

  // Обработчик для кнопки "Удалить позицию"
  async handleDelete() {
    try {
      const activeRow = document.querySelector('.aktBo-spec-row.table-active');
      if (!activeRow) {
        alert('Выберите позицию для удаления');
        return;
      }

      const pasId = activeRow.getAttribute('data-aktBoSpec-id');
      const aktBoId = document.querySelector('.aktBo-row.table-active').getAttribute('data-aktboid');

      // Подтверждение удаления
      const isConfirmed = confirm('Вы уверены, что хотите удалить эту позицию?');
      if (!isConfirmed) {
        return;
      }

      // Отправляем запрос на удаление
      await this.aktBoSpecModel.deleteAktBoSpec(pasId, aktBoId);

      // Обновляем список спецификации
      await this.refreshAktBoSpecList(this.aktBoId);

      alert('Позиция успешно удалена');
    } catch (error) {
      console.error('Ошибка при удалении позиции:', error);
      alert('Ошибка при удалении позиции');
    }
  }

  // Привязка событий
  bindEvents() {
    const aktBoSpecBody = document.querySelector('.aktBo-spec-body');
    if (aktBoSpecBody) {
      aktBoSpecBody.addEventListener('click', (evt) => {
        const row = evt.target.closest('.aktBo-spec-row');
        if (row) {
          removeClassFromChildren(row, 'table-active');
          row.classList.add('table-active');
          this.updateButtonsState(); // Обновляем состояние кнопок при выборе строки
        }
      });
    }

    // Обработчик для кнопки "Изменить количество"
    const btnUpdateAktSpec = document.querySelector('.aktBoSpec_update');
    if (btnUpdateAktSpec) {
      btnUpdateAktSpec.addEventListener('click', () => {
        const activeRow = document.querySelector('.aktBo-spec-row.table-active');
        if (activeRow) {
          const aktSpecData = this.getActiveRowData();
          this.openAktSpecModal(aktSpecData);
        } else {
          alert('Выберите позицию для изменения количества');
        }
      });
    }

    // Обработчик для кнопки "Удалить позицию"
    const btnDeleteAktSpec = document.querySelector('.aktBoSpec_delet');
    if (btnDeleteAktSpec) {
      btnDeleteAktSpec.addEventListener('click', () => this.handleDelete());
    }
  }

  // Получение данных активной строки
  getActiveRowData() {
    const activeRow = document.querySelector('.aktBo-spec-row.table-active');
    if (activeRow) {
      return {
        pasId: activeRow.getAttribute('data-aktBoSpec-id'),
        name: activeRow.querySelector('.aktBo-spec-name').textContent,
        kol: activeRow.querySelector('.aktBo-spec-kol').textContent,
        kolOst: activeRow.querySelector('.aktBo-spec-kol-ost').textContent,
      };
    }
    return null;
  }
}