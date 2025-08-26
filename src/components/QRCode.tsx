import React from 'react';
import { Card } from '@/components/ui/card';

interface QRCodeProps {
  onShowModal: () => void;
}

const QRCode: React.FC<QRCodeProps> = ({ onShowModal }) => {
  return (
    <Card className="p-8 flex flex-col items-center justify-center bg-white shadow-lg rounded-2xl">
      <div 
        className="w-64 h-64 bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onShowModal}
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
  );
};

export default QRCode;