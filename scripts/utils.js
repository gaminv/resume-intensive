// Функция для получения уникального ID элемента
export function getElementId(element) {
  // Создаем ID на основе структуры элемента
  const path = [];
  let current = element;
  
  while (current && current !== document.body) {
    const tag = current.tagName.toLowerCase();
    const className = current.className ? current.className.split(' ')[0] : '';
    path.unshift(`${tag}${className ? '.' + className : ''}`);
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

// Функция для автоматического сохранения данных
export function autoSaveData() {
  const editableElements = document.querySelectorAll('.editable');
  const savePromises = [];
  
  editableElements.forEach(element => {
    const elementId = getElementId(element);
    if (elementId) {
      const currentText = element.textContent.trim();
      const savedText = localStorage.getItem(`resume_${elementId}`);
      
      if (currentText !== savedText) {
        savePromises.push(
          new Promise((resolve) => {
            localStorage.setItem(`resume_${elementId}`, currentText);
            resolve();
          })
        );
      }
    }
  });
  
  return Promise.all(savePromises);
}

// Функция для оптимизированного сохранения с debounce
let saveTimeout;
export function debouncedSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    autoSaveData().then(() => {
      console.log('Данные автоматически сохранены');
    });
  }, 1000); // Сохраняем через 1 секунду после последнего изменения
}

// Функция для показа уведомлений
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification--${type}`;
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
      color: white;
      padding: 12px 20px;
      border-radius: 5px;
      font-size: 14px;
      z-index: 1001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideDown 0.3s ease-out;
    ">
      ${message}
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
} 