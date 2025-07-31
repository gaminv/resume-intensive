import { showNotification } from './utils.js';

// Функция для скачивания резюме в PDF
export function downloadResumeAsPDF() {
  const downloadBtn = document.getElementById('downloadBtn');
  const originalText = downloadBtn.innerHTML;
  
  // Показываем состояние загрузки
  downloadBtn.classList.add('loading');
  downloadBtn.innerHTML = '<span class="download-icon">⏳</span>Генерация PDF...';
  
  // Убираем классы редактирования для чистого PDF
  const editableElements = document.querySelectorAll('.editable');
  editableElements.forEach(el => {
    el.classList.remove('editable');
    el.style.cursor = 'default';
  });
  
  // Настройки для html2pdf
  const opt = {
    margin: [10, 10, 10, 10],
    filename: 'resume_karthik_sr.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  };
  
  // Получаем элемент резюме и создаем клон без footer
  const resumeElement = document.querySelector('.resume');
  const resumeClone = resumeElement.cloneNode(true);
  
  // Удаляем footer из клона
  const footerClone = resumeClone.querySelector('.footer');
  if (footerClone) {
    footerClone.remove();
  }
  
  // Генерируем PDF из клона
  html2pdf().set(opt).from(resumeClone).save().then(() => {
    // Восстанавливаем состояние после генерации
    downloadBtn.classList.remove('loading');
    downloadBtn.innerHTML = originalText;
    
    // Восстанавливаем редактируемость
    editableElements.forEach(el => {
      el.classList.add('editable');
      el.style.cursor = 'pointer';
    });
    
    // Показываем уведомление об успешной загрузке
    showNotification('PDF успешно скачан!', 'success');
  }).catch(error => {
    console.error('Ошибка при генерации PDF:', error);
    
    // Восстанавливаем состояние при ошибке
    downloadBtn.classList.remove('loading');
    downloadBtn.innerHTML = originalText;
    
    // Восстанавливаем редактируемость
    editableElements.forEach(el => {
      el.classList.add('editable');
      el.style.cursor = 'pointer';
    });
    
    // Показываем уведомление об ошибке
    showNotification('Ошибка при генерации PDF', 'error');
  });
} 