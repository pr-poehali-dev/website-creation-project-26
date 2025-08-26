import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const Telegram = () => {
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [caption, setCaption] = useState('Видео с приложения');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Get video from sessionStorage
    const video = sessionStorage.getItem('recordedVideo');
    if (video) {
      setRecordedVideo(video);
    }
  }, []);

  const sendToTelegram = async () => {
    if (!recordedVideo || !botToken || !chatId) {
      alert('Заполните все поля');
      return;
    }

    setIsSending(true);
    setSendStatus('idle');

    try {
      // Convert blob URL to file
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });

      // Create FormData for Telegram API
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('video', file);
      formData.append('caption', caption);

      // Send to Telegram Bot API
      const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
        method: 'POST',
        body: formData,
      });

      if (telegramResponse.ok) {
        setSendStatus('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        const error = await telegramResponse.json();
        console.error('Telegram API error:', error);
        setSendStatus('error');
      }
    } catch (error) {
      console.error('Error sending to Telegram:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const goBack = () => {
    window.location.href = '/';
  };

  const openTelegramWebApp = () => {
    const telegramWebAppUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent('Посмотрите моё видео!')}`;
    window.open(telegramWebAppUrl, '_blank');
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

          {/* Quick Share Option */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-4">
              <div className="bg-blue-500 p-2 rounded-full">
                <Icon name="Share" size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Быстрая отправка</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Поделитесь ссылкой на приложение через Telegram
                </p>
                <Button
                  onClick={openTelegramWebApp}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Icon name="Send" size={16} className="mr-2" />
                  Поделиться в Telegram
                </Button>
              </div>
            </div>
          </Card>

          {/* Bot Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Bot" size={20} />
              Настройки Telegram Bot
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="botToken">Токен бота</Label>
                <Input
                  id="botToken"
                  type="password"
                  placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyz"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Получите токен у @BotFather в Telegram
                </p>
              </div>

              <div>
                <Label htmlFor="chatId">Chat ID или @username</Label>
                <Input
                  id="chatId"
                  placeholder="-1001234567890 или @channel_name"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID чата, канала или пользователя
                </p>
              </div>

              <div>
                <Label htmlFor="caption">Подпись к видео</Label>
                <Input
                  id="caption"
                  placeholder="Описание видео..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>

              <Button
                onClick={sendToTelegram}
                disabled={isSending || !recordedVideo || !botToken || !chatId}
                className="w-full bg-primary hover:bg-primary/90"
              >
                {isSending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Отправка...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Icon name="Send" size={16} />
                    Отправить видео
                  </div>
                )}
              </Button>

              {sendStatus === 'success' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  ✅ Видео успешно отправлено! Возвращаемся на главную...
                </div>
              )}

              {sendStatus === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  ❌ Ошибка отправки. Проверьте токен бота и Chat ID
                </div>
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="p-6 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Icon name="Info" size={18} />
              Как настроить отправку
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>1.</strong> Создайте бота у @BotFather в Telegram</p>
              <p><strong>2.</strong> Скопируйте токен бота</p>
              <p><strong>3.</strong> Узнайте Chat ID (через @userinfobot или добавьте бота в чат)</p>
              <p><strong>4.</strong> Заполните поля выше и отправьте видео</p>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Telegram;