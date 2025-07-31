// Главный файл приложения - импортируем все модули
import { autoSaveData, debouncedSave } from './utils.js';
import { initializeEditableElements } from './editable.js';
import { downloadResumeAsPDF } from './pdf.js';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Инициализируем редактируемые элементы
  initializeEditableElements();
  
  // Добавляем обработчик для кнопки скачивания
  const downloadBtn = document.getElementById('downloadBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadResumeAsPDF);
  }
  
  // Сохраняем данные при закрытии страницы
  window.addEventListener('beforeunload', function() {
    autoSaveData();
  });
  
  // Сохраняем данные при потере фокуса (переключении вкладок)
  window.addEventListener('blur', function() {
    debouncedSave();
  });
}); 