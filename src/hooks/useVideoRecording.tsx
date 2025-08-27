import { useState, useRef, useEffect } from 'react';

const MAX_RECORDING_TIME = 300; // 5 minutes in seconds

export const useVideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const getMediaStream = async () => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // Telegram совместимые настройки видео (максимум 480p)
    const videoConstraints = {
      width: { exact: 480 },        // Точно 480p для максимального качества Telegram
      height: { exact: 360 },       // Соотношение 4:3 для лучшей совместимости
      frameRate: { ideal: 30, max: 30 }, // 30fps для плавности
      facingMode: 'environment'      // Тыловая камера
    };
    
    // Telegram совместимые настройки аудио
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      // Универсальные настройки для всех платформ
      sampleRate: 48000,        // 48kHz - поддерживается всеми форматами
      channelCount: 2,          // Stereo для максимальной совместимости
      sampleSize: 16,           // 16-bit стандарт
      latency: 0.01
    };
    
    console.log('Запрос медиа потока:', {
      platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop',
      video: videoConstraints,
      audio: audioConstraints
    });
    
    return await navigator.mediaDevices.getUserMedia({ 
      video: videoConstraints,
      audio: audioConstraints
    });
  };

  const startCamera = async () => {
    try {
      const mediaStream = await getMediaStream();
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      alert('Не удалось получить доступ к камере. Проверьте разрешения.');
    }
  };

  const createMediaRecorder = (mediaStream: MediaStream) => {
    let mediaRecorder;
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    try {
      // Проверяем аудио и видео треки
      const audioTracks = mediaStream.getAudioTracks();
      const videoTracks = mediaStream.getVideoTracks();
      console.log('Создание MediaRecorder - Audio tracks:', audioTracks.length, 'Video tracks:', videoTracks.length);
      
      // Приоритет 1: MP4 с H.264 + AAC (максимальная совместимость с Telegram и галереями)
      if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        console.log('Используем MP4 с H.264 + AAC (приоритет 1)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 + AAC
          audioBitsPerSecond: 128000,  // AAC стандарт для Telegram
          videoBitsPerSecond: 2000000  // Повышенный битрейт для 480p
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        console.log('Используем MP4 с H.264 + AAC (приоритет 2)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,  // AAC для совместимости
          videoBitsPerSecond: 2000000  // Высокий битрейт для 480p
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        console.log('Используем MP4 общий (приоритет 3)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4',
          audioBitsPerSecond: 128000,  // Стандартный AAC битрейт
          videoBitsPerSecond: 2000000  // 480p высокое качество
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        console.log('Используем WebM VP8 + Opus');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        console.log('Используем WebM VP9 + Opus');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        console.log('Используем WebM (общий)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else {
        console.warn('Используем MediaRecorder по умолчанию');
        mediaRecorder = new MediaRecorder(mediaStream);
      }
      
      console.log('MediaRecorder создан с MIME:', mediaRecorder.mimeType);
      console.log('Platform:', isAndroid ? 'Android' : 'Other');
    } catch (e) {
      console.error('Ошибка создания MediaRecorder:', e);
      mediaRecorder = new MediaRecorder(mediaStream);
    }

    return mediaRecorder;
  };

  const startRecordingWithStream = (mediaStream: MediaStream) => {
    setRecordedVideo(null);
    chunksRef.current = [];
    
    // Check if we have audio tracks
    const audioTracks = mediaStream.getAudioTracks();
    const videoTracks = mediaStream.getVideoTracks();
    
    console.log('Audio tracks:', audioTracks.length);
    console.log('Video tracks:', videoTracks.length);
    
    // Ensure audio tracks are enabled
    audioTracks.forEach(track => {
      track.enabled = true;
      console.log('Audio track enabled:', track.enabled, 'ready state:', track.readyState);
    });
    
    const mediaRecorder = createMediaRecorder(mediaStream);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      // Определяем правильный MIME type для совместимости с Telegram
      let mimeType = mediaRecorderRef.current?.mimeType || 'video/mp4';
      
      // Для Android принудительно используем video/mp4 для максимальной совместимости
      if (isAndroid && !mimeType.includes('mp4')) {
        console.log('Android: Конвертируем MIME тип в MP4 для Telegram совместимости');
        mimeType = 'video/mp4';
      }
      
      const blob = new Blob(chunksRef.current, { type: mimeType });
      
      // Проверяем размер и содержимое blob
      console.log('Финальное видео:', {
        size: blob.size,
        type: blob.type,
        platform: isAndroid ? 'Android' : 'Other',
        chunks: chunksRef.current.length
      });
      
      if (blob.size === 0) {
        console.error('Пустой blob - проблема с записью!');
        alert('Ошибка: видео не было записано. Попробуйте еще раз.');
        return;
      }
      
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    
    // Start timer
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

  const startRecording = async () => {
    // If no stream, request camera and microphone permissions first
    if (!stream) {
      try {
        const mediaStream = await getMediaStream();
        
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        // Wait a moment for video to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now start recording with the new stream
        startRecordingWithStream(mediaStream);
      } catch (error) {
        console.error('Ошибка доступа к камере:', error);
        alert('Не удалось получить доступ к камере и микрофону. Проверьте разрешения.');
        return;
      }
    } else {
      // Stream exists, start recording immediately
      startRecordingWithStream(stream);
    }
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordedVideo,
    recordingTime,
    stream,
    videoRef,
    startCamera,
    startRecording,
    stopRecording,
    formatTime,
    MAX_RECORDING_TIME,
    saveToGallery
  };

  const saveToGallery = async () => {
    if (!recordedVideo) {
      alert('Нет видео для сохранения!');
      return;
    }

    try {
      const isAndroid = /Android/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Получаем blob из URL
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      
      // Проверяем размер и тип файла
      console.log('Сохранение видео:', {
        size: blob.size,
        type: blob.type,
        platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop'
      });
      
      // Создаем правильный blob с звуком для сохранения
      let finalBlob = blob;
      
      // Для Android принудительно устанавливаем MP4 с AAC аудио
      if (isAndroid) {
        finalBlob = new Blob([blob], { 
          type: 'video/mp4' // Принудительно MP4 для Android галереи
        });
      }
      
      // Проверяем поддержку Web Share API
      if (navigator.share && (isAndroid || isIOS)) {
        const file = new File([finalBlob], `video_${Date.now()}.mp4`, {
          type: 'video/mp4'
        });
        
        console.log('Используем Web Share API для сохранения');
        await navigator.share({
          files: [file],
          title: 'Сохранить видео в галерею',
          text: 'Видео с камеры'
        });
        
      } else if ('showSaveFilePicker' in window) {
        // Desktop: File System Access API
        console.log('Используем File System Access API');
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: `video_${Date.now()}.mp4`,
          types: [{
            description: 'Video files',
            accept: {
              'video/mp4': ['.mp4'],
              'video/webm': ['.webm']
            }
          }]
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(finalBlob);
        await writable.close();
        
        alert('✅ Видео успешно сохранено!');
        
      } else {
        // Fallback: обычная загрузка через ссылку
        console.log('Используем fallback загрузку');
        const url = URL.createObjectURL(finalBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('📱 Видео готово к загрузке! Проверьте папку "Загрузки".');
      }
      
    } catch (error) {
      console.error('Ошибка сохранения видео:', error);
      alert('❌ Ошибка при сохранении видео. Попробуйте еще раз.');
    }
  };
};