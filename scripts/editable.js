// utils-editable.js
import { getElementId, debouncedSave } from './utils.js';

function makeEditable(element) {
  if (element.classList.contains('editing')) return;
  element.classList.add('editable');  
  element.addEventListener('click', e => {
    e.stopPropagation();
    if (!element.classList.contains('editing')) {
      startEditing(element, element.textContent.trim());
    }
  });
}

function startEditing(element, originalText) {
  element.classList.add('editing');

  // гарантируем position: relative, чтобы абсолютный input был внутри
  const cs = getComputedStyle(element);
  if (cs.position === 'static') element.style.position = 'relative';

  // создаём input
  const input = document.createElement('input');
  input.type = 'text';
  input.value = originalText;
  input.className = 'edit-input';

  // стили прямо в JS или вынесите в CSS
  Object.assign(input.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    // растягиваем по контенту, минимум — ширина родителя
    width: 'max-content',
    minWidth: '100%',
    boxSizing: 'border-box',
    padding: '2px 6px',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    background: 'rgba(255,255,255,0.95)',
    border: '1px solid #007bff',
    borderRadius: '4px',
    outline: 'none',
    zIndex: 1000,
    whiteSpace: 'nowrap',
  });

  element.appendChild(input);
  input.focus();
  input.select();

  // сохранение/отмена
  const finish = () => saveEdit(element, input.value);
  const cancel = () => cancelEdit(element);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') finish();
    if (e.key === 'Escape') cancel();
  });
  input.addEventListener('blur', () => setTimeout(finish, 100));
}

function saveEdit(element, newText) {
  if (!element.classList.contains('editing')) return;
  element.classList.remove('editing');
  // убираем input
  const input = element.querySelector('.edit-input');
  if (input) element.removeChild(input);
  // заменяем текст
  element.textContent = newText;

  // сохраняем в localStorage
  const id = getElementId(element);
  if (id && newText.trim()) {
    localStorage.setItem(`resume_${id}`, newText);
    debouncedSave();
  }
}

function cancelEdit(element) {
  if (!element.classList.contains('editing')) return;
  element.classList.remove('editing');
  // просто убираем input, оставляем старый текст
  const input = element.querySelector('.edit-input');
  if (input) element.removeChild(input);
}

export function initializeEditableElements() {
  const selectors = [
    '.profile__name','.profile__title','.profile__hello',
    '.job__position','.job__company','.job__date',
    '.education__program','.education__org','.education__date','.education__tags',
    '.contact__text','.contact__email','.languages__name',
    '.interest-tag'
  ];
  selectors.forEach(sel =>
    document.querySelectorAll(sel)
      .forEach(el => makeEditable(el))
  );
  // обязанности
  document.querySelectorAll('.job__duties li')
    .forEach(el => makeEditable(el));
}
