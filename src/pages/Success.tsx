import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Success = () => {
  const createNewLead = () => {
    // Clear any stored video data and refresh the page
    sessionStorage.clear();
    window.location.href = '/';
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="p-12 text-center bg-white shadow-lg rounded-2xl max-w-md w-full">
            
            {/* Success Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Check" size={40} className="text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Контакт успешно отправлен
              </h1>
              
              <p className="text-gray-600">
                Ваше видео было отправлено получателю
              </p>
            </div>

            {/* Create New Lead Button */}
            <Button
              onClick={createNewLead}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3"
            >
              <Icon name="Plus" size={20} className="mr-2" />
              Создать ещё один лид
            </Button>
            
            {/* Additional Info */}
            <p className="mt-6 text-sm text-gray-500">
              Нажмите кнопку выше, чтобы записать новое видео
            </p>
            
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Success;