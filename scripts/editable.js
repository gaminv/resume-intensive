// utils-editable.js
import { getElementId, debouncedSave } from './utils.js';

/**
 * При загрузке страницы подгружаем из localStorage
 * именно ту версию текста, что там хранится.
 */
function loadSavedValue(element) {
  const id = getElementId(element);
  if (!id) return;
  const saved = localStorage.getItem(`resume_${id}`);
  if (saved !== null) {
    element.textContent = saved;
  }
}

/**
 * Делает элемент «кликабельным» для редактирования
 */
function makeEditable(element) {
  if (element.classList.contains('editable')) return;
  element.classList.add('editable');
  
  // Блокируем контекстное меню браузера
  element.addEventListener('contextmenu', e => {
    e.preventDefault();
    return false;
  });
  
  // Блокируем выделение текста (но оставляем возможность редактирования)
  element.addEventListener('selectstart', e => {
    if (!element.classList.contains('editing')) {
      e.preventDefault();
      return false;
    }
  });
  
  element.addEventListener('click', e => {
    e.stopPropagation();
    if (!element.classList.contains('editing')) {
      startEditing(element);
    }
  });
}

/**
 * Запускает режим редактирования — делает элемент редактируемым inline
 */
function startEditing(element) {
  element.classList.add('editing');

  // Сохраняем оригинальный текст
  const originalText = element.textContent.trim();
  
  // Делаем элемент редактируемым
  element.contentEditable = true;
  element.focus();
  
  // Выделяем весь текст
  const range = document.createRange();
  const selection = window.getSelection();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  // Добавляем обработчики для завершения редактирования
  const finish = () => {
    const newText = element.textContent.trim();
    element.contentEditable = false;
    element.classList.remove('editing');
    
    if (newText !== originalText && newText !== '') {
      const id = getElementId(element);
      if (id) {
        localStorage.setItem(`resume_${id}`, newText);
        debouncedSave();
      }
    } else {
      element.textContent = originalText;
    }
  };

  const cancel = () => {
    element.contentEditable = false;
    element.classList.remove('editing');
    element.textContent = originalText;
  };

  // Обработчики событий
  element.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finish();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  });

  // При потере фокуса сохраняем
  element.addEventListener('blur', () => {
    setTimeout(finish, 100);
  });
}

/**
 * Сохраняет новый текст в элемент и в localStorage
 */
function saveEdit(element, newText) {
  // Эта функция теперь используется только для совместимости
  // Основная логика сохранения происходит в finish() функции
  if (!element.classList.contains('editing')) return;
  
  element.classList.remove('editing');
  element.textContent = newText;

  const id = getElementId(element);
  if (id && newText.trim() !== '') {
    localStorage.setItem(`resume_${id}`, newText);
    debouncedSave();
  }
}

/**
 * Отменяет редактирование без сохранения
 */
function cancelEdit(element) {
  if (!element.classList.contains('editing')) return;
  element.classList.remove('editing');
  const input = element.querySelector('.edit-input');
  if (input) element.removeChild(input);
}

/**
 * Основная инициализация:
 * 1) Для каждого элемента сначала сохраняем оригинальное значение
 * 2) Затем загружаем saved-value
 * 3) Потом превращаем в редактируемый
 */
export function initializeEditableElements() {
  // Блокируем контекстное меню для всего документа
  document.addEventListener('contextmenu', e => {
    // Разрешаем контекстное меню только для элементов, которые не являются редактируемыми
    if (e.target.classList.contains('editable') || e.target.closest('.editable')) {
      e.preventDefault();
      return false;
    }
  });

  const selectors = [
    // Profile
    '.profile__name', '.profile__title', '.profile__hello',
    
    // Languages
    '.languages__name', '.languages__title',
    
    // Experience
    '.experience__title', '.job__position', '.job__company', '.job__date', '.job__badge',
    
    // Tools
    '.tools__title', '.tools__category-title',
    
    // Education
    '.education__title', '.education__program', '.education__org', '.education__date', '.education__tags',
    
    // Interests
    '.interests__title', '.interest-tag',
    
    // Contact
    '.contact__text', '.contact__email'
  ];

  selectors.forEach(sel =>
    document.querySelectorAll(sel).forEach(el => {
      // Сохраняем оригинальное значение
      if (!el.getAttribute('data-original-text')) {
        el.setAttribute('data-original-text', el.textContent);
      }
      
      // Загружаем сохраненное значение
      loadSavedValue(el);
      
      // Делаем редактируемым
      makeEditable(el);
      
      // Отладочная информация для contact__text
      if (el.classList.contains('contact__text')) {
        console.log('contact__text найден и инициализирован:', el);
      }
    })
  );

  // Job duties (списки)
  document.querySelectorAll('.job__duties li').forEach(el => {
    // Сохраняем оригинальное значение
    if (!el.getAttribute('data-original-text')) {
      el.setAttribute('data-original-text', el.textContent);
    }
    loadSavedValue(el);
    makeEditable(el);
  });
}
