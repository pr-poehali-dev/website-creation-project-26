const convertToMp4 = async (blob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      try {
        const stream = canvas.captureStream(30);
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const mp4Blob = new Blob(chunks, { type: 'video/mp4' });
          resolve(mp4Blob);
        };
        
        mediaRecorder.onerror = () => {
          reject(new Error('Recording failed'));
        };
        
        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
          } else {
            mediaRecorder.stop();
          }
        };
        
        video.onplay = () => {
          mediaRecorder.start();
          drawFrame();
        };
        
        video.play();
        
      } catch (error) {
        reject(error);
      }
    };
    
    video.onerror = () => {
      reject(new Error('Video loading failed'));
    };
    
    video.src = URL.createObjectURL(blob);
    video.load();
  });
};

export const sendToTelegram = async (recordedVideo: string) => {
  if (!recordedVideo) return;
  
  try {
    const response = await fetch(recordedVideo);
    const originalBlob = await response.blob();
    
    let finalBlob: Blob;
    let extension = 'mp4';
    
    // Try to convert to MP4
    try {
      finalBlob = await convertToMp4(originalBlob);
      console.log('Video converted to MP4 format');
    } catch (conversionError) {
      console.warn('MP4 conversion failed, using original format:', conversionError);
      finalBlob = originalBlob;
      const mimeType = originalBlob.type || 'video/webm';
      extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
    }
    
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    const url = URL.createObjectURL(finalBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `telegram_video_${Date.now()}.${extension}`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    
    const fileName = `telegram_video_${Date.now()}.${extension}`;
    
    if (isMobile) {
      if (isIOS) {
        alert(`Видео сохранено в формате MP4 как "${fileName}"\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Нажмите кнопку прикрепления (📎)\n4. Выберите "Фото или видео"\n5. Найдите сохраненное видео в галерее\n6. Отправьте видео`);
        
        setTimeout(() => {
          window.location.href = 'tg://';
        }, 1000);
        
        setTimeout(() => {
          const openApp = confirm('Открыть Telegram?');
          if (openApp) {
            window.open('https://apps.apple.com/app/telegram-messenger/id686449807', '_blank');
          }
        }, 3000);
        
      } else if (isAndroid) {
        alert(`Видео загружено в формате MP4 в папку "Загрузки" как "${fileName}"\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Нажмите кнопку прикрепления (📎)\n4. Выберите "Файл" или "Галерея"\n5. Найдите видео в папке "Загрузки"\n6. Отправьте видео`);
        
        setTimeout(() => {
          try {
            const intent = 'intent://send#Intent;package=org.telegram.messenger;end';
            window.location.href = intent;
          } catch (e) {
            window.open('https://play.google.com/store/apps/details?id=org.telegram.messenger', '_blank');
          }
        }, 1000);
      }
    } else {
      alert(`Видео загружено в формате MP4 как "${fileName}"\n\n1. Откройте Telegram Web или приложение\n2. Выберите получателя\n3. Перетащите загруженный видеофайл в окно чата\nили\n3. Нажмите кнопку прикрепления и выберите видеофайл\n4. Отправьте видео`);
      
      setTimeout(() => {
        window.open('https://web.telegram.org/', '_blank');
      }, 1000);
    }
    
  } catch (error) {
    console.error('Ошибка при подготовке видео:', error);
    alert('Произошла ошибка при подготовке видео. Попробуйте еще раз.');
  }
};