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
    
    return await navigator.mediaDevices.getUserMedia({ 
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
        // Для Android используем настройки совместимые с AAC
        sampleRate: isAndroid ? 44100 : 48000,  // AAC предпочитает 44.1kHz
        channelCount: isAndroid ? 2 : 1,        // Stereo для лучшей совместимости на Android
        sampleSize: 16,
        latency: 0.01
      }
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
      
      // Для Android используем MP4 с AAC аудио для 100% совместимости с Telegram
      if (isAndroid && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1.42E01E,mp4a.40.2')) {
        console.log('Android: Используем MP4 с H.264 + AAC');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 + AAC
          audioBitsPerSecond: 128000,  // Стандартный битрейт AAC для Telegram
          videoBitsPerSecond: 1500000
        });
      } else if (isAndroid && MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        console.log('Android: Используем MP4 с H.264 + AAC (альтернативный)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
        });
      } else if (isAndroid && MediaRecorder.isTypeSupported('video/mp4')) {
        console.log('Android: Используем MP4 (общий)');
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 1500000
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
    MAX_RECORDING_TIME
  };
};