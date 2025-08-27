import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Telegram = () => {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  useEffect(() => {
    // Get video from sessionStorage
    const video = sessionStorage.getItem('recordedVideo');
    if (video) {
      setRecordedVideo(video);
    }
  }, []);

  const goBack = () => {
    window.location.href = '/';
  };

  const sendToTelegramUser = async () => {
    if (!recordedVideo) return;
    
    try {
      // Получаем сохраненное сообщение
      const savedMessage = sessionStorage.getItem('videoMessage') || `🎥 Новый лид IMPERIA PROMO!\n\n📅 Время записи: ${new Date().toLocaleString()}`;
      
      // Получаем blob видео для скачивания
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
      
      // Скачиваем видео
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      // Определяем устройство для правильного URL scheme
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      const message = encodeURIComponent(savedMessage);
      
      if (isMobile) {
        if (isAndroid) {
          // Android: используем Telegram intent
          const telegramIntent = `intent://msg?text=${message}#Intent;scheme=tg;package=org.telegram.messenger;end`;
          window.location.href = telegramIntent;
          
          // Fallback через веб версию
          setTimeout(() => {
            window.open(`https://t.me/share/url?url=${message}`, '_blank');
          }, 1000);
          
        } else if (isIOS) {
          // iOS: используем URL scheme
          const telegramUrl = `tg://msg?text=${message}`;
          window.location.href = telegramUrl;
          
          // Fallback через веб версию
          setTimeout(() => {
            window.open(`https://t.me/share/url?url=${message}`, '_blank');
          }, 1000);
        }
        
        alert('📱 Видео скачано!\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Прикрепите скачанное видео\n4. Отправьте сообщение');
        
      } else {
        // Десктоп: открываем Telegram Web
        const telegramWebUrl = `https://web.telegram.org/a/#?text=${message}`;
        window.open(telegramWebUrl, '_blank');
        
        alert('💻 Видео скачано в папку загрузок!\n\n1. Откройте Telegram Web\n2. Перетащите видеофайл в чат\n3. Добавьте сообщение как подпись');
      }
      
      // Переходим на страницу успеха через 2 секунды
      setTimeout(() => {
        window.location.href = '/success';
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert('Ошибка при подготовке видео. Попробуйте ещё раз.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={goBack}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Icon name="ArrowLeft" size={16} />
            Назад
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Отправка в Telegram</h1>
        </div>

        <div className="space-y-6">
          
          {/* Video Preview */}
          {recordedVideo && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Предпросмотр видео</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={recordedVideo}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
          )}

          {/* Direct User Share */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 p-2 rounded-full">
                <Icon name="Send" size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Отправить пользователю</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Отправьте сообщение напрямую пользователю Telegram
                </p>
                <Button
                  onClick={sendToTelegramUser}
                  disabled={!recordedVideo}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Отправить в Telegram
                </Button>
              </div>
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Info" size={18} />
              Как отправить видео
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1.</strong> Нажмите кнопку "Отправить в Telegram"</p>
              <p><strong>2.</strong> Видео автоматически скачается</p>
              <p><strong>3.</strong> Откроется Telegram с готовым сообщением</p>
              <p><strong>4.</strong> Прикрепите скачанное видео к сообщению</p>
              <p className="text-xs text-gray-500 mt-3">
                💡 На мобильных устройствах видео сохранится в галерее
              </p>
              <p className="text-xs text-gray-500">
                💻 На компьютере видео загрузится в папку загрузок
              </p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Telegram;