import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import VideoDisplay from '@/components/VideoDisplay';
import RecordingControls from '@/components/RecordingControls';
import QRModal from '@/components/QRModal';
import QRCode from '@/components/QRCode';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 300;

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 480 },
          height: { ideal: 360 },
          frameRate: { ideal: 15 },
          facingMode: 'environment'
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, // Telegram предпочитает 48kHz для AAC
          channelCount: 2
        }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      alert('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  const startRecording = async () => {
    if (!stream) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 480 },
            height: { ideal: 360 },
            frameRate: { ideal: 15 },
            facingMode: 'environment'
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000, // Telegram предпочитает 48kHz для AAC
            channelCount: 2
          }
        });
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        startRecordingWithStream(mediaStream);
      } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        alert('Не удалось получить доступ к камере и микрофону. Проверьте разрешения.');
        return;
      }
    } else {
      startRecordingWithStream(stream);
    }
  };

  const startRecordingWithStream = (mediaStream: MediaStream) => {
    setRecordedVideo(null);
    chunksRef.current = [];
    
    const audioTracks = mediaStream.getAudioTracks();
    const videoTracks = mediaStream.getVideoTracks();
    
    console.log('Audio tracks:', audioTracks.length);
    console.log('Video tracks:', videoTracks.length);
    
    audioTracks.forEach(track => {
      track.enabled = true;
      console.log('Audio track enabled:', track.enabled, 'ready state:', track.readyState);
    });
    
    let mediaRecorder;
    
    try {
      // Приоритет для Telegram - AAC аудиокодек
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,mp4a.40.2')) {
        // mp4a.40.2 это AAC-LC (наиболее совместимый профиль AAC)
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,mp4a.40.2',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        // Fallback для браузеров без MP4/AAC поддержки
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
      } else {
        console.warn('Оптимальные форматы не поддерживаются, используем стандартный');
        mediaRecorder = new MediaRecorder(mediaStream, {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 2500000
        });
      }
      
      console.log('MediaRecorder создан с mimeType:', mediaRecorder.mimeType);
      console.log('Поддержка AAC (mp4a.40.2):', MediaRecorder.isTypeSupported('video/mp4;codecs=h264,mp4a.40.2'));
      console.log('Поддержка AAC (aac):', MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac'));
    } catch (e) {
      console.error('Ошибка создания MediaRecorder:', e);
      mediaRecorder = new MediaRecorder(mediaStream);
    }
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorderRef.current?.mimeType || 'video/mp4';
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= MAX_RECORDING_TIME - 1) {
          stopRecording();
          return MAX_RECORDING_TIME;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const shareVideo = async () => {
    if (!recordedVideo) {
      alert('Нет записанного видео для отправки');
      return;
    }
    
    try {
      // Получаем геолокацию из localStorage
      const locationData = localStorage.getItem('userLocation');
      let locationText = '';
      let googleMapsLink = '';
      
      if (locationData) {
        try {
          const location = JSON.parse(locationData);
          locationText = `\n\n📍 Геолокация:\nШирота: ${location.latitude}\nДолгота: ${location.longitude}\nВремя: ${new Date(location.timestamp).toLocaleString()}`;
          googleMapsLink = `\n🗺️ Карты: https://maps.google.com/?q=${location.latitude},${location.longitude}`;
        } catch (error) {
          console.error('Ошибка парсинга геолокации:', error);
        }
      }
      
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const mimeType = blob.type || 'video/mp4';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${extension}`, { type: mimeType });
      
      // Сохраняем видео в sessionStorage для страницы Telegram
      sessionStorage.setItem('recordedVideo', recordedVideo);
      sessionStorage.setItem('videoBlob', URL.createObjectURL(blob));
      sessionStorage.setItem('videoMessage', `🎥 Новый лид IMPERIA PROMO!\n\n📅 Время записи: ${new Date().toLocaleString()}${locationText}${googleMapsLink}`);
      
      // Определяем устройство
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      // Попробуем Web Share API только если поддерживается
      if (navigator.share && navigator.canShare) {
        try {
          // Проверяем поддержку файлов
          const canShareFiles = navigator.canShare({ files: [file] });
          console.log('Can share files:', canShareFiles);
          
          if (canShareFiles) {
            await navigator.share({
              title: '🎥 Новый лид IMPERIA PROMO',
              text: `🎥 Новый лид IMPERIA PROMO!\n\n📅 Время записи: ${new Date().toLocaleString()}${locationText}${googleMapsLink}`,
              files: [file]
            });
            
            setTimeout(() => {
              window.location.href = '/success';
            }, 500);
            
            return;
          } else {
            console.log('Файлы не поддерживаются, используем альтернативный способ');
          }
        } catch (shareError) {
          console.error('Web Share ошибка:', shareError);
          if (shareError.name === 'AbortError') {
            return; // Пользователь отменил
          }
        }
      }
      
      // Альтернативные способы для мобильных устройств
      if (isMobile) {
        // Попробуем Telegram URL scheme (работает лучше на мобильных)
        const message = encodeURIComponent(`🎥 Новый лид IMPERIA PROMO!\n\n📅 Время: ${new Date().toLocaleString()}${locationText}${googleMapsLink}\n\n📎 Видео прикреплено отдельно`);
        
        if (isAndroid) {
          // Android: используем intent для Telegram
          const telegramIntent = `intent://msg?text=${message}#Intent;scheme=tg;package=org.telegram.messenger;end`;
          window.location.href = telegramIntent;
          
          // Fallback через обычную ссылку
          setTimeout(() => {
            window.open(`https://t.me/share/url?url=${message}`, '_blank');
          }, 1000);
          
        } else if (isIOS) {
          // iOS: используем URL scheme для Telegram
          const telegramUrl = `tg://msg?text=${message}`;
          window.location.href = telegramUrl;
          
          // Fallback через Safari
          setTimeout(() => {
            window.open(`https://t.me/share/url?url=${message}`, '_blank');
          }, 1000);
        }
        
        // Показываем инструкции пользователю
        alert(`📱 Открываем Telegram...\n\n1. Выберите получателя\n2. Отправьте сообщение\n3. Прикрепите видео вручную (кнопка скрепки)\n\nВидео автоматически скачается в галерею.`);
      } else {
        // Десктоп: переходим на специальную страницу Telegram
        window.location.href = '/telegram';
        return;
      }
      
      // Fallback: принудительное скачивание (на случай если все остальное не сработало)
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      const fileName = `video_${Date.now()}.${extension}`;
      
      if (isMobile) {
        alert(`🎥 Новый лид IMPERIA PROMO!\n\nВидео сохранено: "${fileName}"\n📅 Время: ${new Date().toLocaleString()}${locationText}${googleMapsLink}\n\nДля отправки в Telegram:\n1. Откройте Telegram\n2. Выберите получателя\n3. Нажмите кнопку прикрепления\n4. Выберите сохраненное видео\n5. Добавьте это сообщение в качестве подписи`);
      } else {
        alert(`🎥 Новый лид IMPERIA PROMO!\n\nВидео загружено: "${fileName}"\n📅 Время: ${new Date().toLocaleString()}${locationText}${googleMapsLink}\n\nДля отправки в Telegram:\n1. Откройте Telegram Web\n2. Перетащите файл в окно чата\n3. Добавьте данные как подпись к видео`);
      }
      
      setTimeout(() => {
        window.location.href = '/success';
      }, 2000);
      
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка при подготовке видео. Попробуйте ещё раз.');
    }
  };

  const handleRetake = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    setIsRecording(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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