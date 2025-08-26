import React from 'react';
import Icon from '@/components/ui/icon';

interface VideoDisplayProps {
  recordedVideo: string | null;
  stream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
  recordingTime: number;
  maxRecordingTime: number;
  formatTime: (seconds: number) => string;
}

const VideoDisplay: React.FC<VideoDisplayProps> = ({
  recordedVideo,
  stream,
  videoRef,
  isRecording,
  recordingTime,
  maxRecordingTime,
  formatTime
}) => {
  return (
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
          {formatTime(maxRecordingTime - recordingTime)} осталось
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;