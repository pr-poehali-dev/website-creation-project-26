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
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,  // Standard for WebM/Opus
          channelCount: 1     // Mono for better Telegram compatibility
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
    // If no stream, request camera and microphone permissions first
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
            sampleRate: 48000,  // Standard for WebM/Opus
            channelCount: 1     // Mono for better Telegram compatibility
          }
        });
        
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
    
    let mediaRecorder;
    
    try {
      // WebM with VP8+Opus is more compatible with Telegram on Android
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp8,opus',
          audioBitsPerSecond: 96000,  // Lower bitrate for better compatibility
          videoBitsPerSecond: 1000000 // Lower bitrate for better compatibility
        });
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm;codecs=vp9,opus',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/webm',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else if (MediaRecorder.isTypeSupported('video/mp4;codecs=h264,aac')) {
        // MP4 as fallback
        mediaRecorder = new MediaRecorder(mediaStream, {
          mimeType: 'video/mp4;codecs=h264,aac',
          audioBitsPerSecond: 96000,
          videoBitsPerSecond: 1000000
        });
      } else {
        // Default format
        console.warn('Using default MediaRecorder format');
        mediaRecorder = new MediaRecorder(mediaStream);
      }
      
      console.log('MediaRecorder created with mimeType:', mediaRecorder.mimeType);
    } catch (e) {
      console.error('Failed to create MediaRecorder:', e);
      mediaRecorder = new MediaRecorder(mediaStream);
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







  const sendToTelegram = async () => {
    if (!recordedVideo) return;
    
    try {
      // Convert blob to file for sharing
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const mimeType = blob.type || 'video/webm';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${extension}`, { type: mimeType });
      
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile devices, try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Видео',
              files: [file]
            });
            window.location.href = '/success';
            return;
          } catch (shareError) {
            console.log('Web Share failed, trying alternative methods:', shareError);
          }
        }
        
        // Alternative for mobile: create download link and open Telegram
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `video_${Date.now()}.${extension}`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        // Open Telegram app
        if (isIOS) {
          window.location.href = 'tg://';
        } else {
          // Android
          const intent = 'intent://send#Intent;package=org.telegram.messenger;end';
          window.location.href = intent;
        }
        
        // Fallback to web Telegram
        setTimeout(() => {
          window.open('https://web.telegram.org/', '_blank');
        }, 1000);
        
        window.location.href = '/success';
      } else {
        // Desktop: try Web Share API or download
        if (navigator.share) {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
        } else {
          // Desktop download fallback
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = `video_${Date.now()}.${extension}`;
          downloadLink.click();
          URL.revokeObjectURL(url);
          
          // Open Telegram Web
          window.open('https://web.telegram.org/', '_blank');
        }
        window.location.href = '/success';
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Видео загружено. Откройте Telegram для отправки.');
      window.location.href = '/success';
    }
  };

  const sendToWhatsApp = async () => {
    if (!recordedVideo) return;
    
    try {
      // Convert blob to file for sharing
      const response = await fetch(recordedVideo);
      const blob = await response.blob();
      const mimeType = blob.type || 'video/webm';
      const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${extension}`, { type: mimeType });
      
      const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      if (isMobile) {
        // For mobile devices, try Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'Видео',
              files: [file]
            });
            window.location.href = '/success';
            return;
          } catch (shareError) {
            console.log('Web Share failed, trying alternative methods:', shareError);
          }
        }
        
        // Alternative for mobile: create download link and open WhatsApp
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `video_${Date.now()}.${extension}`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
        
        // Open WhatsApp app
        if (isIOS) {
          window.location.href = 'whatsapp://';
        } else {
          // Android
          const intent = 'intent://send#Intent;package=com.whatsapp;end';
          window.location.href = intent;
        }
        
        // Fallback to web WhatsApp
        setTimeout(() => {
          window.open('https://web.whatsapp.com/', '_blank');
        }, 1000);
        
        window.location.href = '/success';
      } else {
        // Desktop: try Web Share API or download
        if (navigator.share) {
          await navigator.share({
            title: 'Видео',
            files: [file]
          });
        } else {
          // Desktop download fallback
          const url = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = `video_${Date.now()}.${extension}`;
          downloadLink.click();
          URL.revokeObjectURL(url);
          
          // Open WhatsApp Web
          window.open('https://web.whatsapp.com/', '_blank');
        }
        window.location.href = '/success';
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Видео загружено. Откройте WhatsApp для отправки.');
      window.location.href = '/success';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Remove auto-start camera effect

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
                ) : stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Icon name="Video" size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Нажмите кнопку для записи</p>
                      <p className="text-sm opacity-75 mt-2">Потребуется доступ к камере и микрофону</p>
                    </div>
                  </div>
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
                    {/* Share Buttons */}
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button
                        onClick={sendToTelegram}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Icon name="Send" size={18} />
                        Отправить в Telegram
                      </Button>
                      
                      <Button
                        onClick={sendToWhatsApp}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Icon name="MessageCircle" size={18} />
                        Отправить в WhatsApp
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