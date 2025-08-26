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

  const sendToTelegramUser = () => {
    if (!recordedVideo) return;
    
    // Получаем геолокацию из localStorage
    const locationData = localStorage.getItem('userLocation');
    let locationText = '';
    
    if (locationData) {
      try {
        const location = JSON.parse(locationData);
        locationText = `Геолокация: ${location.latitude}, ${location.longitude}`;
      } catch (error) {
        console.error('Ошибка парсинга геолокации:', error);
      }
    }
    
    // Create a simple telegram share URL for direct user messaging
    const message = `Новый лид IMPERIA PROMO!\n\nВидео записано: ${new Date().toLocaleString()}\n${locationText}\n\nСсылка на видео: ${recordedVideo}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
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
              <p><strong>2.</strong> Выберите пользователя из списка контактов</p>
              <p><strong>3.</strong> Добавьте видео как вложение к сообщению</p>
              <p className="text-xs text-gray-500 mt-3">
                💡 Видео сохранено локально и готово для отправки
              </p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Telegram;