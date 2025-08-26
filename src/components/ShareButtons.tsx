import React from 'react';

interface ShareButtonsProps {
  recordedVideo: string | null;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  recordedVideo,
}) => {
  if (!recordedVideo) return null;

  return (
    <div className="space-y-3">
      <div className="text-center text-gray-600">
        <p>Видео записано успешно!</p>
      </div>
    </div>
  );
};

export default ShareButtons;