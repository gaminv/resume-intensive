import { showNotification } from './utils.js';

// Функция для скачивания резюме в PDF
export function downloadResumeAsPDF() {
  const downloadBtn = document.getElementById('downloadBtn');
  const originalText = downloadBtn.innerHTML;
  
  // Показываем состояние загрузки
  downloadBtn.classList.add('loading');
  downloadBtn.innerHTML = '<span class="download-icon">⏳</span>Генерация PDF...';
  
  // Временно отключаем редактирование без удаления классов
  const editableElements = document.querySelectorAll('.editable');
  const toolIconWrappers = document.querySelectorAll('.tool-icon-wrapper');
  const originalCursors = [];
  const originalPointerEvents = [];
  
  editableElements.forEach((el, index) => {
    // Сохраняем оригинальные стили
    originalCursors[index] = el.style.cursor;
    originalPointerEvents[index] = el.style.pointerEvents;
    
    // Временно отключаем редактирование
    el.style.cursor = 'default';
    el.style.pointerEvents = 'none';
    el.classList.add('pdf-generation');
  });
  
  // Отключаем анимации для иконок инструментов
  toolIconWrappers.forEach(el => {
    el.classList.add('pdf-generation');
  });
  
  // Принудительно заполняем языковые полоски для PDF
  const languageBars = document.querySelectorAll('.languages__bar');
  languageBars.forEach(bar => {
    if (bar.classList.contains('languages__bar--high')) {
      bar.style.width = '100%';
      bar.style.opacity = '1';
    } else if (bar.classList.contains('languages__bar--medium')) {
      bar.style.width = '75%';
      bar.style.opacity = '1';
    }
    // Отключаем анимации для полосок
    bar.style.animation = 'none';
  });
  
  // Получаем элемент резюме и создаем клон без footer
  const resumeElement = document.querySelector('.resume');
  const resumeClone = resumeElement.cloneNode(true);
  
  // Удаляем footer из клона
  const footerClone = resumeClone.querySelector('.footer');
  if (footerClone) {
    footerClone.remove();
  }
  
  // Удаляем кнопку сброса из клона
  const resetBtnClone = resumeClone.querySelector('.reset-btn');
  if (resetBtnClone) {
    resetBtnClone.remove();
  }
  
  // Принудительно заполняем языковые полоски в клоне
  const languageBarsClone = resumeClone.querySelectorAll('.languages__bar');
  languageBarsClone.forEach(bar => {
    if (bar.classList.contains('languages__bar--high')) {
      bar.style.width = '100%';
      bar.style.opacity = '1';
    } else if (bar.classList.contains('languages__bar--medium')) {
      bar.style.width = '75%';
      bar.style.opacity = '1';
    }
    bar.style.animation = 'none';
  });
  
  // Временно добавляем клон в DOM для захвата
  resumeClone.style.position = 'absolute';
  resumeClone.style.left = '-9999px';
  resumeClone.style.top = '0';
  document.body.appendChild(resumeClone);
  
  // Используем новый подход с jsPDF и html2canvas
  const { jsPDF } = window.jspdf;
  
  html2canvas(resumeClone, { 
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff'
  }).then((canvas) => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Получаем размеры страницы A4
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Добавляем отступы (10мм с каждой стороны)
    const margin = 10;
    const availableWidth = pdfWidth - (margin * 2);
    const availableHeight = pdfHeight - (margin * 2);
    
    // Рассчитываем масштаб, чтобы контент поместился в доступную область
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Вычисляем соотношение сторон
    const imgAspectRatio = imgWidth / imgHeight;
    const availableAspectRatio = availableWidth / availableHeight;
    
    let finalWidth, finalHeight;
    
    if (imgAspectRatio > availableAspectRatio) {
      // Изображение шире - масштабируем по ширине
      finalWidth = availableWidth;
      finalHeight = availableWidth / imgAspectRatio;
    } else {
      // Изображение выше - масштабируем по высоте
      finalHeight = availableHeight;
      finalWidth = availableHeight * imgAspectRatio;
    }
    
    // Центрируем изображение на странице с учетом отступов
    const x = margin + (availableWidth - finalWidth) / 2;
    const y = margin + (availableHeight - finalHeight) / 2;
    
    // Добавляем изображение на страницу
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    // Сохраняем PDF
    pdf.save('resume.pdf');
    
    // Удаляем временный клон из DOM
    document.body.removeChild(resumeClone);
    
    // Восстанавливаем состояние после генерации
    downloadBtn.classList.remove('loading');
    downloadBtn.innerHTML = originalText;
    
    // Восстанавливаем редактируемость
    editableElements.forEach((el, index) => {
      el.style.cursor = originalCursors[index];
      el.style.pointerEvents = originalPointerEvents[index];
      el.classList.remove('pdf-generation');
    });
    
    // Восстанавливаем анимации для иконок инструментов
    toolIconWrappers.forEach(el => {
      el.classList.remove('pdf-generation');
    });
    
    // Восстанавливаем анимации языковых полосок
    languageBars.forEach(bar => {
      bar.style.width = '';
      bar.style.opacity = '';
      bar.style.animation = '';
    });
    
    // Показываем уведомление об успешной загрузке
    showNotification('PDF успешно скачан!', 'success');
  }).catch(error => {
    console.error('Ошибка при генерации PDF:', error);
    
    // Удаляем временный клон из DOM при ошибке
    if (document.body.contains(resumeClone)) {
      document.body.removeChild(resumeClone);
    }
    
    // Восстанавливаем состояние при ошибке
    downloadBtn.classList.remove('loading');
    downloadBtn.innerHTML = originalText;
    
    // Восстанавливаем редактируемость
    editableElements.forEach((el, index) => {
      el.style.cursor = originalCursors[index];
      el.style.pointerEvents = originalPointerEvents[index];
      el.classList.remove('pdf-generation');
    });
    
    // Восстанавливаем анимации для иконок инструментов
    toolIconWrappers.forEach(el => {
      el.classList.remove('pdf-generation');
    });
    
    // Восстанавливаем анимации языковых полосок
    languageBars.forEach(bar => {
      bar.style.width = '';
      bar.style.opacity = '';
      bar.style.animation = '';
    });
    
    // Показываем уведомление об ошибке
    showNotification('Ошибка при генерации PDF', 'error');
  });
} 