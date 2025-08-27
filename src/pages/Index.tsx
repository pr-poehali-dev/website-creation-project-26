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
    
    // Определяем устройство для выбора оптимального кодека
    const isAndroid = /Android/.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    try {
      // КРИТИЧЕСКИ ВАЖНО: Android Telegram воспроизводит звук ТОЛЬКО с AAC!
      if (isAndroid && MediaRecorder.isTypeSupported('video/mp4;codecs=h264,mp4a.40.2')) {
        // Android: Строго AAC-LC для корректного звука в Telegram
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,mp4a.40.2',
          audioBitsPerSecond: 128000, // Стандарт AAC для Telegram
          videoBitsPerSecond: 1200000
        });
        console.log('✅ Android: AAC-LC кодек - звук в Telegram будет работать!');
      } else if (isAndroid && MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        // Android: Общий AAC
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1200000
        });
        console.log('✅ Android: AAC кодек - звук в Telegram должен работать');
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,mp4a.40.2')) {
        // Другие устройства: AAC-LC предпочтительнее
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,mp4a.40.2',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else {
        // Fallback для старых браузеров
        mediaRecorder = new MediaRecorder(mediaStream, {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      }
      
      console.log('📹 MediaRecorder создан:', mediaRecorder.mimeType);
      
      // Предупреждение для Android без AAC
      if (isAndroid && !mediaRecorder.mimeType.includes('mp4a.40') && !mediaRecorder.mimeType.includes('aac')) {
        console.warn('⚠️ Android: Нет AAC кодека - возможны проблемы со звуком в Telegram!');
      }
      
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
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const file = new File([blob], `video_${Date.now()}.mp4`, { type: blob.type });
      
      // Геолокация для сообщения
      const locationData = localStorage.getItem('userLocation');
      let locationText = '';
      if (locationData) {
        try {
          const location = JSON.parse(locationData);
          locationText = `\\n📍 ${location.latitude}, ${location.longitude}`;
        } catch (e) {
          console.error('Ошибка геолокации:', e);
        }
      }
      
      const message = `🎥 Новый лид IMPERIA PROMO!\\n📅 ${new Date().toLocaleString()}${locationText}`;
      
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