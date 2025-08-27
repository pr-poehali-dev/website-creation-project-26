import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface RecordingControlsProps {
  recordedVideo: string | null;
  isRecording: boolean;
  recordingTime: number;
  stream: MediaStream | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onRetake: () => void;
  onShareVideo: () => void;
  onSaveToGallery: () => void;
  formatTime: (seconds: number) => string;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  recordedVideo,
  isRecording,
  recordingTime,
  stream,
  onStartRecording,
  onStopRecording,
  onRetake,
  onShareVideo,
  onSaveToGallery,
  formatTime
}) => {
  const handleRetake = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRetake();
  };

  const handleRetakeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      {!recordedVideo ? (
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? onStopRecording : onStartRecording}
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
          <div className="flex justify-center gap-3">
            <Button
              onMouseDown={handleRetakeMouseDown}
              onClick={handleRetake}
              variant="outline"
              className="flex items-center gap-2 px-4 py-3 border-2 border-gray-300 hover:border-gray-400"
              size="lg"
              type="button"
            >
              <Icon name="RotateCcw" size={18} />
              Пересъемка
            </Button>
            <Button
              onClick={onSaveToGallery}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3"
              size="lg"
            >
              <Icon name="Download" size={18} />
              В галерею
            </Button>
            <Button
              onClick={onShareVideo}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3"
              size="lg"
            >
              <Icon name="Send" size={18} />
              Telegram
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Формат: MP4 • Качество: 480p • Тыловая камера • Максимум: 5 минут</p>
        {recordingTime > 0 && !isRecording && (
          <p className="mt-1">Длительность: {formatTime(recordingTime)}</p>
        )}
        <p className="mt-1 text-xs text-blue-600">🎵 Stereo AAC звук • 💾 Сохранение в галерею • 📱 Telegram совместимость</p>
      </div>
    </div>
  );
};

export default RecordingControls;