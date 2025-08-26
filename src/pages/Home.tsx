import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Home = () => {
  const navigate = useNavigate();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleNewLead = async () => {
    setIsGettingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        toast({
          title: "Геолокация недоступна",
          description: "Ваш браузер не поддерживает геолокацию",
          variant: "destructive"
        });
        return;
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      // Сохраняем геолокацию в localStorage для использования на странице записи
      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      }));

      toast({
        title: "Местоположение получено",
        description: "Переходим к записи видео",
      });

      // Переходим на страницу записи видео
      navigate('/record');
      
    } catch (error) {
      console.error('Ошибка получения геолокации:', error);
      toast({
        title: "Ошибка геолокации",
        description: "Не удалось получить местоположение. Разрешите доступ к геолокации в настройках браузера",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
      {/* Пульсирующий заголовок */}
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-pulse-soft">
          <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
            IMPERIA
          </span>
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold animate-pulse-soft-delay">
          <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 bg-clip-text text-transparent">
            PROMO
          </span>
        </h2>
      </div>

      {/* Кнопка "Новый лид" */}
      <Button
        onClick={handleNewLead}
        disabled={isGettingLocation}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl px-12 py-6 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGettingLocation ? (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Получение местоположения...
          </div>
        ) : (
          'Новый лид'
        )}
      </Button>

      {/* Декоративные элементы */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400 rounded-full blur-xl opacity-20 animate-bounce-slow"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500 rounded-full blur-xl opacity-20 animate-bounce-slow-delay"></div>
      <div className="absolute top-1/2 left-5 w-16 h-16 bg-blue-300 rounded-full blur-xl opacity-20 animate-bounce-slow-delay-2"></div>
    </div>
  );
};

export default Home;