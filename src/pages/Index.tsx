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
      // Приоритет AAC для оптимальной совместимости с Telegram
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,mp4a.40.2')) {
        // AAC-LC (Low Complexity) - лучший выбор для мобильных
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,mp4a.40.2',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        // Общий AAC кодек
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        // MP4 с любым доступным аудиокодеком
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        // WebM с Opus (для старых браузеров)
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else {
        // Стандартный MediaRecorder без указания формата
        mediaRecorder = new MediaRecorder(mediaStream, {
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      }
      
      console.log('📹 MediaRecorder создан с форматом:', mediaRecorder.mimeType);
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
      const isAndroid = /Android/.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      console.log('Исходный тип видео:', blob.type);
      console.log('Устройство - Android:', isAndroid, 'iOS:', isIOS);
      
      // Проверяем аудиокодек для Android устройств
      if (isAndroid) {
        const hasAAC = blob.type.includes('mp4a.40.2') || blob.type.includes('aac') || blob.type.includes('mp4');
        
        if (!hasAAC || !blob.type.includes('mp4')) {
          // Android требует MP4+AAC для Telegram
          alert('⚠️ Для отправки в Telegram с Android требуется формат MP4 с AAC аудио.\n\nВаше видео записано в формате: ' + (blob.type || 'неизвестный') + '\n\nПопробуйте перезаписать видео или используйте другое устройство.');
          return;
        } else {
          console.log('✅ Android: Видео совместимо с Telegram (MP4+AAC)');
        }
      }
      
      // Создаем файл для скачивания
      const extension = blob.type.includes('mp4') ? 'mp4' : (blob.type.includes('webm') ? 'webm' : 'mp4');
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `video_${Date.now()}.${extension}`;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      // Открываем Telegram
      const message = encodeURIComponent('🎥 Новый лид IMPERIA PROMO!');
      
      if (isAndroid || isIOS) {
        // Мобильные устройства: открываем Telegram напрямую
        window.location.href = `tg://msg?text=${message}`;
        
        // Fallback через веб-версию
        setTimeout(() => {
          window.open(`https://t.me/share/url?url=${message}`, '_blank');
        }, 2000);
        
        if (isAndroid) {
          alert('📱 Android: Видео скачано в формате MP4+AAC!\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Прикрепите скачанное видео\n4. Отправьте сообщение\n\n✅ Формат совместим с Telegram');
        } else {
          alert('📱 Видео скачано!\n\n1. Откройте Telegram\n2. Выберите получателя\n3. Прикрепите скачанное видео\n4. Отправьте сообщение');
        }
      } else {
        // Десктоп: открываем Telegram Web
        window.open(`https://web.telegram.org/a/#?text=${message}`, '_blank');
        alert('💻 Видео скачано!\n\n1. Откройте Telegram Web\n2. Перетащите видеофайл в чат\n3. Добавьте сообщение');
      }
      
      setTimeout(() => {
        window.location.href = '/success';
      }, 3000);
      
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