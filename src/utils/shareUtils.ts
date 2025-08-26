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
    
    if (isMobile) {
      // For mobile devices, try Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
          window.location.href = '/success';
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
      
      // Open Telegram app
      if (isIOS) {
        window.location.href = 'tg://';
      } else {
        // Android
        const intent = 'intent://send#Intent;package=org.telegram.messenger;end';
        window.location.href = intent;
      }
      
      // Fallback to web Telegram
      setTimeout(() => {
        window.open('https://web.telegram.org/', '_blank');
      }, 1000);
      
      window.location.href = '/success';
    } else {
      // Desktop: try Web Share API or download
      if (navigator.share) {
        await navigator.share({
          title: 'Видео',
          files: [file]
        });
      } else {
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
      window.location.href = '/success';
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Видео загружено. Откройте Telegram для отправки.');
    window.location.href = '/success';
  }
};

export const sendToWhatsApp = async (recordedVideo: string) => {
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
    
    if (isMobile) {
      // For mobile devices, try Web Share API first
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
          window.location.href = '/success';
          return;
        } catch (shareError) {
          console.log('Web Share failed, trying alternative methods:', shareError);
        }
      }
      
      // Alternative for mobile: create download link and open WhatsApp
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      // Open WhatsApp app
      if (isIOS) {
        window.location.href = 'whatsapp://';
      } else {
        // Android
        const intent = 'intent://send#Intent;package=com.whatsapp;end';
        window.location.href = intent;
      }
      
      // Fallback to web WhatsApp
      setTimeout(() => {
        window.open('https://web.whatsapp.com/', '_blank');
      }, 1000);
      
      window.location.href = '/success';
    } else {
      // Desktop: try Web Share API or download
      if (navigator.share) {
        await navigator.share({
          title: 'Видео',
          files: [file]
        });
      } else {
        // Desktop download fallback
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `video_${Date.now()}.${extension}`;
        downloadLink.click();
        URL.revokeObjectURL(url);
        
        // Open WhatsApp Web
        window.open('https://web.whatsapp.com/', '_blank');
      }
      window.location.href = '/success';
    }
  } catch (error) {
    console.error('Ошибка отправки:', error);
    alert('Видео загружено. Откройте WhatsApp для отправки.');
    window.location.href = '/success';
  }
};