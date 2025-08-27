import React from 'react';
import { Card } from '@/components/ui/card';
import VideoDisplay from '@/components/VideoDisplay';
import RecordingControls from '@/components/RecordingControls';
import QRModal from '@/components/QRModal';
import QRCode from '@/components/QRCode';
import { useVideoRecording } from '@/hooks/useVideoRecording';

const Index = () => {
  const {
    isRecording,
    recordedVideo,
    recordingTime,
    stream,
    videoRef,
    startRecording,
    stopRecording,
    formatTime,
    MAX_RECORDING_TIME,
    saveToGallery
  } = useVideoRecording();
  
  const [showQRModal, setShowQRModal] = React.useState(false);



  const shareVideo = async () => {
    if (!recordedVideo) {
      alert('Нет записанного видео для отправки');
      return;
    }
    
    try {
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const file = new File([blob], `video_${Date.now()}.mp4`, { type: blob.type });
      
      // Геолокация для сообщения
      const locationData = localStorage.getItem('userLocation');
      let locationText = '';
      if (locationData) {
        try {
          const location = JSON.parse(locationData);
          const lat = parseFloat(location.latitude).toFixed(6);
          const lng = parseFloat(location.longitude).toFixed(6);
          const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
          locationText = `\n📍 ${lat}, ${lng}\n🗺️ ${mapsUrl}`;
        } catch (e) {
          console.error('Ошибка геолокации:', e);
        }
      }
      
      const message = `🎥 Новый лид IMPERIA PROMO!\n📅 ${new Date().toLocaleString()}${locationText}`;
      
      // Попробуем Web Share API для прямой отправки
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: '🎥 Новый лид IMPERIA PROMO',
            text: message,
            files: [file]
          });
          
          // Переход на страницу успеха
          setTimeout(() => {
            window.location.href = '/success';
          }, 500);
          return;
          
        } catch (shareError) {
          console.log('Web Share отменен или не удался:', shareError.name);
          if (shareError.name === 'AbortError') {
            return; // Пользователь отменил
          }
        }
      }
      
      // Fallback: открытие Telegram с текстом + инструкции
      const encodedMessage = encodeURIComponent(message);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // Мобильные: открываем Telegram
        window.location.href = `tg://msg?text=${encodedMessage}`;
        
        // Fallback через веб
        setTimeout(() => {
          window.open(`https://t.me/share/url?url=${encodedMessage}`, '_blank');
        }, 1000);
        
        alert('📱 Откроется Telegram\n\n1. Выберите получателя\n2. Нажмите кнопку прикрепления (📎)\n3. Выберите видео из галереи\n4. Отправьте сообщение');
      } else {
        // Desktop: Telegram Web
        window.open(`https://web.telegram.org/a/#?text=${encodedMessage}`, '_blank');
        alert('💻 Откроется Telegram Web\n\n1. Выберите чат\n2. Перетащите видеофайл в окно чата\n3. Добавьте сообщение как подпись');
      }
      
      setTimeout(() => {
        window.location.href = '/success';
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при отправке видео. Попробуйте ещё раз.');
    }
  };

  const handleRetake = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    window.location.reload(); // Простая перезагрузка для сброса
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen lg:h-auto">
          
          <QRCode onShowModal={() => setShowQRModal(true)} />

          <Card className="p-8 flex flex-col bg-white shadow-lg rounded-2xl">
            <div className="flex-1 flex flex-col">
              
              <VideoDisplay 
                recordedVideo={recordedVideo}
                stream={stream}
                videoRef={videoRef}
                isRecording={isRecording}
                recordingTime={recordingTime}
                maxRecordingTime={MAX_RECORDING_TIME}
                formatTime={formatTime}
              />

              <RecordingControls
                recordedVideo={recordedVideo}
                isRecording={isRecording}
                recordingTime={recordingTime}
                stream={stream}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onRetake={handleRetake}
                onShareVideo={shareVideo}
                onSaveToGallery={saveToGallery}
                formatTime={formatTime}
              />
              
            </div>
          </Card>
          
        </div>
      </div>

      <QRModal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)} 
      />
    </div>
  );
};

export default Index;