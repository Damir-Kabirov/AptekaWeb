function normalizeDate(dateString) {
    // Создаем объект Date
    const date = new Date(dateString);
    
    // Проверяем, корректна ли дата
    if (isNaN(date.getTime())) {
        console.error("Некорректная дата:", dateString);
        return null; // Возвращаем null, если дата некорректна
    }
    
    // Получаем день, месяц и год
    const day = String(date.getDate()).padStart(2, '0'); // День с ведущим нулем
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяц (нумерация с 0, поэтому +1)
    const year = date.getFullYear(); // Полный год
    
    // Форматируем в yyyy-MM-dd
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}


function removeClassFromChildren(element, className) {
    if (!element) {
        console.error('Элемент не найден');
        return;
    }
    const parent = element.parentElement;
    if (!parent) {
        console.error('Родительский элемент не найден');
        return;
    }
    const children = parent.children;
    for (let i = 0; i < children.length; i++) {
        children[i].classList.remove(className);
    }
}

function getAnom (){
    const anom = Number(localStorage.getItem('anom'));
    return anom
}

function generateEAN13(pas_id, anom) {
    const padded = `${pas_id}${anom}`.padStart(12, '0').slice(0, 12);
    const checksum = (10 - (padded.split('').reduce((sum, digit, index) => 
      sum + (index % 2 === 0 ? +digit : +digit * 3), 0) % 10)) % 10;

    return `${padded}${checksum}`;
  }

export {normalizeDate,removeClassFromChildren,getAnom,generateEAN13}