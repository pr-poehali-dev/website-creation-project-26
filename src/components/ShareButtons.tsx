import React from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ShareButtonsProps {
  recordedVideo: string | null;
  onSendToTelegram: () => void;
  onSendToWhatsApp: () => void;
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  recordedVideo,
  onSendToTelegram,
  onSendToWhatsApp,
}) => {
  if (!recordedVideo) return null;

  return (
    <div className="space-y-3">
      {/* Share Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        <Button
          onClick={onSendToTelegram}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Icon name="Send" size={18} />
          Отправить в Telegram
        </Button>
        
        <Button
          onClick={onSendToWhatsApp}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
        >
          <Icon name="MessageCircle" size={18} />
          Отправить в WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default ShareButtons;