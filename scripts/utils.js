// Функция для получения уникального ID элемента
export function getElementId(element) {
  // Сначала проверяем наличие data-id атрибута
  if (element.dataset && element.dataset.id) {
    return element.dataset.id;
  }
  
  // Если data-id нет, создаем ID на основе структуры элемента (fallback)
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

// Функция для сброса всех изменений
export function resetAllChanges() {
  // Получаем все элементы с data-id
  const editableElements = document.querySelectorAll('[data-id]');
  
  // Очищаем localStorage
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('resume_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Восстанавливаем оригинальные значения из HTML
  editableElements.forEach(element => {
    const originalText = element.getAttribute('data-original-text') || element.textContent;
    element.textContent = originalText;
  });
  
  showNotification('Все изменения сброшены!', 'success');
}

// Функция для показа модального окна подтверждения
export function showConfirmDialog(message, onConfirm, onCancel) {
  // Создаем overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease-out;
  `;
  
  // Создаем модальное окно
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease-out;
  `;
  
  // Содержимое модального окна
  modal.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        border-radius: 50%;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      ">⚠️</div>
      <h3 style="
        margin: 0 0 12px 0;
        color: #333;
        font-size: 18px;
        font-weight: 600;
      ">Подтверждение действия</h3>
      <p style="
        margin: 0;
        color: #666;
        font-size: 14px;
        line-height: 1.5;
      ">${message}</p>
    </div>
    <div style="
      display: flex;
      gap: 12px;
      justify-content: center;
    ">
      <button id="cancelBtn" style="
        background: #f8f9fa;
        color: #6c757d;
        border: 1px solid #dee2e6;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='#e9ecef'; this.style.borderColor='#adb5bd'" onmouseout="this.style.background='#f8f9fa'; this.style.borderColor='#dee2e6'">Отмена</button>
      <button id="confirmBtn" style="
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      " onmouseover="this.style.background='linear-gradient(135deg, #ee5a52, #ff6b6b)'" onmouseout="this.style.background='linear-gradient(135deg, #ff6b6b, #ee5a52)'">Сбросить</button>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Добавляем стили для анимаций
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  
  // Обработчики событий
  const confirmBtn = modal.querySelector('#confirmBtn');
  const cancelBtn = modal.querySelector('#cancelBtn');
  
  const closeModal = () => {
    document.body.removeChild(overlay);
    document.head.removeChild(style);
  };
  
  confirmBtn.addEventListener('click', () => {
    closeModal();
    if (onConfirm) onConfirm();
  });
  
  cancelBtn.addEventListener('click', () => {
    closeModal();
    if (onCancel) onCancel();
  });
  
  // Закрытие по клику на overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
      if (onCancel) onCancel();
    }
  });
  
  // Закрытие по Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
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