import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_RECORDING_TIME = 300; // 5 minutes in seconds

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
        audio: true 
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

  const startRecording = () => {
    if (!stream) return;

    setRecordedVideo(null);
    chunksRef.current = [];
    
    let mediaRecorder;
    try {
      // Try MP4 format first
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/mp4'
      });
    } catch (e) {
      try {
        // Fallback to webm with H.264 if available
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=h264'
        });
      } catch (e2) {
        // Final fallback to default webm
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8,opus'
        });
      }
    }
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      // Determine the correct MIME type based on what was actually recorded
      const mimeType = mediaRecorderRef.current?.mimeType || 'video/mp4';
      const blob = new Blob(chunksRef.current, { type: mimeType });
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



  const saveVideo = () => {
    if (!recordedVideo) return;
    
    const a = document.createElement('a');
    a.href = recordedVideo;
    // Determine file extension based on blob type
    const videoBlob = recordedVideo.startsWith('blob:') ? recordedVideo : recordedVideo;
    const extension = videoBlob.includes('mp4') ? 'mp4' : 'webm';
    a.download = `video_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getUserLocation = () => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Геолокация не поддерживается'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  const sendToTelegram = async () => {
    if (!recordedVideo) return;
    
    try {
      // Get user location
      let locationText = '';
      try {
        const location = await getUserLocation();
        setUserLocation(location);
        locationText = `\n\n📍 Местоположение: https://maps.google.com/maps?q=${location.lat},${location.lng}`;
      } catch (error) {
        console.log('Не удалось получить местоположение:', error);
      }

      // Convert blob to file for sharing
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const mimeType = blob.type || 'video/mp4';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${extension}`, { type: mimeType });
      
      const shareText = `Посмотрите моё видео!${locationText}`;

      // Check if Web Share API is available
      if (navigator.share) {
        await navigator.share({
          title: 'Моё видео',
          text: shareText,
          files: [file]
        });
      } else {
        // Fallback: create a downloadable link and suggest manual sharing
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `video_${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Copy location to clipboard if available
        if (locationText && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(shareText);
            alert('Видео сохранено! Текст с местоположением скопирован в буфер обмена. Откройте Telegram и прикрепите файл.');
          } catch (clipboardError) {
            alert(`Видео сохранено! \n\nСкопируйте этот текст: ${shareText}`);
          }
        } else {
          alert('Видео сохранено! Откройте Telegram и прикрепите файл.');
        }
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      // Fallback to download
      saveVideo();
      alert('Видео сохранено в галерею. Откройте Telegram и прикрепите файл.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!recordedVideo) {
      startCamera();
    }
  }, [recordedVideo]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen lg:h-auto">
          
          {/* QR Code Block */}
          <Card className="p-8 flex flex-col items-center justify-center bg-white shadow-lg rounded-2xl">
            <div 
              className="w-64 h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowQRModal(true)}
            >
              <img 
                src="https://cdn.poehali.dev/files/2d351452-3abb-4f41-8daa-51aa366a4776.jpeg" 
                alt="QR код" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700 text-center">
              Отсканируйте QR-код для быстрого доступа
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Нажмите на QR-код для увеличения
            </p>
          </Card>

          {/* Video Recording Block */}
          <Card className="p-8 flex flex-col bg-white shadow-lg rounded-2xl">
            <div className="flex-1 flex flex-col">
              
              {/* Video Display */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-6 aspect-video">
                {recordedVideo ? (
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    REC {formatTime(recordingTime)}
                  </div>
                )}
                
                {/* Max Time Indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    {formatTime(MAX_RECORDING_TIME - recordingTime)} осталось
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-4">
                {!recordedVideo ? (
                  <div className="flex justify-center">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="lg"
                      className={`w-20 h-20 rounded-full ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      <Icon 
                        name={isRecording ? "Square" : "Video"} 
                        size={32} 
                        className="text-white"
                      />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Action Buttons */}
                    <div className="flex justify-center">
                      <Button
                        onClick={saveVideo}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                      >
                        <Icon name="Download" size={18} />
                        Сохранить
                      </Button>
                    </div>
                    
                    {/* Telegram Button */}
                    <div className="flex justify-center">
                      <Button
                        onClick={sendToTelegram}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Icon name="Send" size={18} />
                        Отправить в Telegram
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>Формат: MP4 • Качество: 360p • Максимум: 5 минут • Тыловая камера</p>
                {recordingTime > 0 && !isRecording && (
                  <p className="mt-1">Длительность: {formatTime(recordingTime)}</p>
                )}
              </div>
              
            </div>
          </Card>
          
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQRModal(false)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl p-6">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <Icon name="X" size={16} className="text-gray-600" />
            </button>
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">QR-код</h2>
              <div className="w-full max-w-md aspect-square">
                <img 
                  src="https://cdn.poehali.dev/files/2d351452-3abb-4f41-8daa-51aa366a4776.jpeg" 
                  alt="QR код" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-4 text-lg text-gray-700 text-center">
                Отсканируйте этот код камерой смартфона
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;