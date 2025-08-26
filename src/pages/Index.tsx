import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import CameraView from '@/components/CameraView';
import ShareButtons from '@/components/ShareButtons';
import QRModal from '@/components/QRModal';
import { useVideoRecording } from '@/hooks/useVideoRecording';
import { sendToTelegram, sendToWhatsApp } from '@/utils/shareUtils';

const Index = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  
  const {
    isRecording,
    recordedVideo,
    recordingTime,
    stream,
    videoRef,
    startRecording,
    stopRecording,
    formatTime,
    MAX_RECORDING_TIME
  } = useVideoRecording();

  const handleSendToTelegram = () => {
    sendToTelegram(recordedVideo!);
  };

  const handleSendToWhatsApp = () => {
    sendToWhatsApp(recordedVideo!);
  };

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
              <CameraView
                recordedVideo={recordedVideo}
                stream={stream}
                videoRef={videoRef}
                isRecording={isRecording}
                recordingTime={recordingTime}
                maxRecordingTime={MAX_RECORDING_TIME}
                formatTime={formatTime}
              />

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
                  <ShareButtons
                    recordedVideo={recordedVideo}
                    onSendToTelegram={handleSendToTelegram}
                    onSendToWhatsApp={handleSendToWhatsApp}
                  />
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
      <QRModal
        showQRModal={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
};

export default Index;