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
          <div className="flex justify-center gap-4">
            <Button
              onMouseDown={handleRetakeMouseDown}
              onClick={handleRetake}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-gray-400"
              size="lg"
              type="button"
            >
              <Icon name="RotateCcw" size={20} />
              Пересъемка
            </Button>
            <Button
              onClick={onShareVideo}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3"
              size="lg"
            >
              <Icon name="Share" size={20} />
              Отправить
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Формат: MP4/WebM • Качество: 360p • Максимум: 5 минут</p>
        {recordingTime > 0 && !isRecording && (
          <p className="mt-1">Длительность: {formatTime(recordingTime)}</p>
        )}
        <p className="mt-1 text-xs text-amber-600">⚠️ Android Telegram: требуется AAC аудио</p>
      </div>
    </div>
  );
};

export default RecordingControls;