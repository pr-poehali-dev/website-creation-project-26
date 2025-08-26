import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ShareButtonsProps {
  recordedVideo: string | null;
  onSendToTelegram: () => void;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  recordedVideo,
  onSendToTelegram,
}) => {
  if (!recordedVideo) return null;

  return (
    <div className="space-y-3">
      <div className="text-center text-gray-600 mb-3">
        <p>Видео записано успешно!</p>
      </div>
      
      {/* Telegram Share Button */}
      <div className="flex justify-center">
        <Button
          onClick={onSendToTelegram}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3"
        >
          <Icon name="Send" size={18} />
          Отправить в Telegram
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;