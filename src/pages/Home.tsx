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

      localStorage.setItem('userLocation', JSON.stringify({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      }));

      toast({
        title: "Местоположение получено",
        description: "Переходим к записи видео",
      });

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
    <div className="h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white relative overflow-hidden flex flex-col p-4">
      {/* Background geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large squares */}
        <div className="geometric-shape w-32 h-32 bg-blue-200 top-10 left-10 transform rotate-45 animate-float-geometric"></div>
        <div className="geometric-shape w-24 h-24 bg-blue-300 top-20 right-20 transform rotate-12 animate-float-geometric-delay-1"></div>
        <div className="geometric-shape w-40 h-40 bg-blue-100 bottom-20 left-16 transform -rotate-45 animate-float-geometric-reverse"></div>
        
        {/* Medium rectangles */}
        <div className="geometric-shape w-20 h-32 bg-blue-250 top-1/3 right-10 transform rotate-30 animate-float-geometric-delay-2"></div>
        <div className="geometric-shape w-28 h-20 bg-blue-200 bottom-1/3 right-1/4 transform -rotate-12 animate-float-geometric"></div>
        
        {/* Small diamonds */}
        <div className="geometric-shape w-16 h-16 bg-blue-300 top-1/2 left-5 transform rotate-45 animate-float-geometric-reverse"></div>
        <div className="geometric-shape w-12 h-12 bg-blue-200 top-3/4 right-8 transform rotate-45 animate-float-geometric-delay-1"></div>
        
        {/* Additional geometric elements */}
        <div className="geometric-shape w-36 h-18 bg-blue-150 top-40 left-1/3 transform rotate-60 animate-float-geometric-delay-2"></div>
        <div className="geometric-shape w-22 h-22 bg-blue-250 bottom-40 left-1/4 transform -rotate-30 animate-float-geometric"></div>
        
        {/* Corner elements */}
        <div className="geometric-shape w-28 h-28 bg-blue-100 top-5 right-1/3 transform rotate-45 animate-float-geometric-reverse"></div>
        <div className="geometric-shape w-18 h-18 bg-blue-300 bottom-10 right-5 transform rotate-45 animate-float-geometric-delay-1"></div>
      </div>

      {/* Main content - centered vertically and horizontally */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center ml-1.5">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-wider mb-1 animate-pulse-soft text-slate-800">
            IMPERIA
          </h1>
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-2">
            <div className="w-8 sm:w-16 h-0.5 bg-slate-700"></div>
            <h2 className="text-lg sm:text-2xl md:text-4xl font-normal tracking-[0.3em] animate-pulse-soft-delay text-slate-700">
              PROMO
            </h2>
            <div className="w-8 sm:w-16 h-0.5 bg-slate-700"></div>
          </div>
        </div>
      </div>

      {/* Button - positioned at bottom center */}
      <div className="relative z-10 flex justify-center mb-8 sm:mb-16 -ml-1.5">
        <Button
          onClick={handleNewLead}
          disabled={isGettingLocation}
          size="default"
          className="animate-gradient-shimmer text-white text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/20 font-bold tracking-wide uppercase"
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
      </div>

      {/* Subtle overlay geometric pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Home;