export const sendToTelegram = async (recordedVideo: string) => {
  if (!recordedVideo) return;
  
  try {
    // Convert blob to file for sharing
    const response = await fetch(recordedVideo);
    const blob = await response.blob();
    const mimeType = blob.type || 'video/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    // Always download the video file first
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `telegram_video_${Date.now()}.${extension}`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    // Show instructions to user
    const fileName = `telegram_video_${Date.now()}.${extension}`;
    
    if (isMobile) {
      if (isIOS) {
        // iOS specific instructions
        alert(`Видео сохранено как "${fileName}"\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Нажмите кнопку прикрепления (📎)\n4. Выберите "Фото или видео"\n5. Найдите сохраненное видео в галерее\n6. Отправьте видео`);
        
        // Try to open Telegram app
        setTimeout(() => {
          window.location.href = 'tg://';
        }, 1000);
        
        // Fallback to App Store if needed
        setTimeout(() => {
          const openApp = confirm('Открыть Telegram?');
          if (openApp) {
            window.open('https://apps.apple.com/app/telegram-messenger/id686449807', '_blank');
          }
        }, 3000);
        
      } else if (isAndroid) {
        // Android specific instructions
        alert(`Видео загружено в папку "Загрузки" как "${fileName}"\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Нажмите кнопку прикрепления (📎)\n4. Выберите "Файл" или "Галерея"\n5. Найдите видео в папке "Загрузки"\n6. Отправьте видео`);
        
        // Try to open Telegram app using Intent
        setTimeout(() => {
          try {
            const intent = 'intent://send#Intent;package=org.telegram.messenger;end';
            window.location.href = intent;
          } catch (e) {
            // Fallback to Google Play
            window.open('https://play.google.com/store/apps/details?id=org.telegram.messenger', '_blank');
          }
        }, 1000);
      }
    } else {
      // Desktop instructions
      alert(`Видео загружено как "${fileName}"\n\n1. Откройте Telegram Web или приложение\n2. Выберите получателя\n3. Перетащите загруженный видеофайл в окно чата\nили\n3. Нажмите кнопку прикрепления и выберите видеофайл\n4. Отправьте видео`);
      
      // Open Telegram Web
      setTimeout(() => {
        window.open('https://web.telegram.org/', '_blank');
      }, 1000);
    }
    
  } catch (error) {
    console.error('Ошибка при подготовке видео:', error);
    alert('Произошла ошибка при подготовке видео. Попробуйте еще раз.');
  }
};