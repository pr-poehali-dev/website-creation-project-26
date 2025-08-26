import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
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
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15 }
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
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
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

  const retakeVideo = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    startCamera();
  };

  const saveVideo = () => {
    if (!recordedVideo) return;
    
    const a = document.createElement('a');
    a.href = recordedVideo;
    a.download = `video_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const sendToTelegram = () => {
    if (!recordedVideo) return;
    
    fetch(recordedVideo)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
        
        // Create telegram share URL (limited functionality in web)
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent('Видео записано с помощью приложения')}&text=${encodeURIComponent('Смотрите мое видео!')}`;
        window.open(telegramUrl, '_blank');
      });
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
            <div className="w-64 h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <img 
                src="https://cdn.poehali.dev/files/2d351452-3abb-4f41-8daa-51aa366a4776.jpeg" 
                alt="QR код" 
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-6 text-lg font-medium text-gray-700 text-center">
              Отсканируйте QR-код для быстрого доступа
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
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button
                        onClick={retakeVideo}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Icon name="RotateCcw" size={18} />
                        Переснять
                      </Button>
                      
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
                <p>Качество: 240p • Максимум: 5 минут</p>
                {recordingTime > 0 && !isRecording && (
                  <p className="mt-1">Длительность: {formatTime(recordingTime)}</p>
                )}
              </div>
              
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  );
};

export default Index;