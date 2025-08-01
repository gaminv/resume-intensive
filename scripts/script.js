// Главный файл приложения - импортируем все модули
import { autoSaveData, debouncedSave, resetAllChanges, showConfirmDialog } from './utils.js';
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
  
  // Добавляем обработчик для кнопки сброса
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function() {
      showConfirmDialog(
        'Вы уверены, что хотите сбросить все изменения? Это действие нельзя отменить.',
        () => resetAllChanges(),
        () => console.log('Сброс отменен')
      );
    });
  }
  
  // Отключаем автоматический переход по email ссылке
  const emailLink = document.querySelector('.contact__email');
  if (emailLink) {
    emailLink.addEventListener('click', function(e) {
      e.preventDefault(); // Предотвращаем переход по ссылке
      // Можно добавить копирование email в буфер обмена или другие действия
    });
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