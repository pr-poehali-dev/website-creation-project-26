import React from 'react';
import Icon from '@/components/ui/icon';

interface QRModalProps {
  showQRModal: boolean;
  onClose: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ showQRModal, onClose }) => {
  if (!showQRModal) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-2xl p-6">
        <button
          onClick={onClose}
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
  );
};

export default QRModal;