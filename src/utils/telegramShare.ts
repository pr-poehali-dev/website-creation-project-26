export const sendToTelegram = async (recordedVideo: string) => {
  if (!recordedVideo) return;
  
  try {
    // Convert blob to file for sharing
    const response = await fetch(recordedVideo);
    const blob = await response.blob();
    const mimeType = blob.type || 'video/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    const file = new File([blob], `video_${Date.now()}.${extension}`, { type: mimeType });
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, try Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
          return;
        } catch (shareError) {
          console.log('Web Share failed, trying alternative methods:', shareError);
        }
      }
      
      // Alternative for mobile: create download link and open Telegram
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      // Open Telegram app with platform-specific methods
      if (isIOS) {
        // iOS - try to open Telegram app
        window.location.href = 'tg://';
        // Fallback to App Store if Telegram not installed
        setTimeout(() => {
          window.open('https://apps.apple.com/app/telegram-messenger/id686449807', '_blank');
        }, 1500);
      } else if (isAndroid) {
        // Android - use Intent to open Telegram
        const intent = 'intent://send#Intent;package=org.telegram.messenger;end';
        window.location.href = intent;
        // Fallback to Google Play if Telegram not installed
        setTimeout(() => {
          window.open('https://play.google.com/store/apps/details?id=org.telegram.messenger', '_blank');
        }, 1500);
      }
      
      // Final fallback to web Telegram
      setTimeout(() => {
        window.open('https://web.telegram.org/', '_blank');
      }, 2000);
      
    } else {
      // Desktop: try Web Share API or download
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
          return;
        } catch (shareError) {
          console.log('Desktop share failed, downloading file:', shareError);
        }
      }
      
      // Desktop download fallback
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.click();
      URL.revokeObjectURL(url);
      
      // Open Telegram Web
      window.open('https://web.telegram.org/', '_blank');
    }
    
    // Show success message
    alert('Видео подготовлено для отправки в Telegram!');
    
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
    alert('Произошла ошибка. Видео сохранено в загрузках - откройте Telegram для отправки.');
  }
};