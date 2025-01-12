import { getAnom } from '../utils/utils.js'; // Импорт функции для получения anom
import OthetModel from '../model/OthetModel.js'; // Импорт модели
import OthetView from '../view/OthetView.js'; // Импорт View

export default class OthetPresenter {
    constructor(container) {
      this.container = container; // Контейнер для вставки View
      this.model = new OthetModel(); // Модель для работы с данными
      this.view = null; // Экземпляр View
      this.init();
    }
  
    // Инициализация Presenter
    init() {
      this.renderView({}); // Инициализация View с пустыми данными
      this.bindEvents(); // Привязка событий
    }
  
    // Рендеринг View с данными
    renderView(data) {
      // Запоминаем текущее выбранное значение в select
      const selectedDate = this.view ? this.view.getElement().querySelector('#date').value : null;
  
      if (this.view) {
        this.view.removeElement(); // Удаляем старый View, если он существует
      }
      this.view = new OthetView(data); // Создаем новый View с переданными данными
      this.container.innerHTML = ''; // Очищаем контейнер
      this.container.appendChild(this.view.getElement()); // Вставляем View в контейнер
  
      // Заполняем select и восстанавливаем выбранное значение
      this.fillDateSelect();
      if (selectedDate) {
        const select = this.view.getElement().querySelector('#date');
        select.value = selectedDate;
      }
    }
  
    // Заполнение выпадающего списка с периодами
    fillDateSelect() {
      const select = this.view.getElement().querySelector('#date'); // Находим элемент select
      const currentDate = new Date(); // Текущая дата
      const startDate = new Date(2024, 11, 1); // Начальная дата (декабрь 2024)
  
      // Очищаем select перед заполнением
      select.innerHTML = '';
  
      // Генерация опций для select
      while (startDate <= currentDate) {
        const option = document.createElement('option');
        option.value = `${startDate.getFullYear()}-${startDate.getMonth() + 1}`; // Формат: "год-месяц"
        option.textContent = `${startDate.toLocaleString('default', { month: 'long' })} ${startDate.getFullYear()}`; // Формат: "Месяц Год"
        select.appendChild(option);
  
        // Переход к следующему месяцу
        startDate.setMonth(startDate.getMonth() + 1);
      }
    }
  
    // Привязка событий
    bindEvents() {
        const formButton = this.view.getElement().querySelector('.otchet-create'); // Кнопка "Сформировать отчет"
        formButton.addEventListener('click', this.onFormButtonClick.bind(this)); // Обработчик клика
      
        const printButton = this.view.getElement().querySelector('.otchet-print'); // Кнопка "Распечатать отчет"
        printButton.addEventListener('click', this.onPrintButtonClick.bind(this)); // Обработчик клика
      }
      
      // Обработчик клика по кнопке "Распечатать отчет"
      async onPrintButtonClick() {
        const selectedDate = this.view.getElement().querySelector('#date').value; // Выбранный период
        const [year, month] = selectedDate.split('-'); // Разделяем период на год и месяц
      
        // Получаем anom с помощью функции getAnom
        const anom = getAnom();
      
        try {
          // Запрашиваем данные через модель для скачивания Excel-файла
          await this.model.downloadReportExcel(anom, year, month);
        } catch (error) {
          console.error('Ошибка при скачивании отчета:', error);
          // Можно добавить уведомление пользователю об ошибке
        }
      }
  
    // Обработчик клика по кнопке "Сформировать отчет"
    async onFormButtonClick() {
      const selectedDate = this.view.getElement().querySelector('#date').value; // Выбранный период
      const [year, month] = selectedDate.split('-'); // Разделяем период на год и месяц
  
      // Получаем anom с помощью функции getAnom
      const anom = getAnom();
  
      try {
        // Запрашиваем данные через модель
        const data = await this.model.getReportData(anom, year, month);
        console.log(data);
        this.renderView(data); // Обновляем View с новыми данными
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
        // Можно добавить уведомление пользователю об ошибке
      }
    }
  }