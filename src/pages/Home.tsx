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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black relative overflow-hidden flex flex-col p-4">
      {/* Enhanced space background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static stars with center drift effect */}
        {Array.from({ length: 800 }, (_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const sizeType = Math.random();
          let size, brightness, twinkleSpeed;
          
          if (sizeType < 0.7) {
            // Tiny stars (70%)
            size = 'w-px h-px';
            brightness = 0.8 + Math.random() * 0.2;
            twinkleSpeed = 2 + Math.random() * 3;
          } else if (sizeType < 0.9) {
            // Medium stars (20%)
            size = 'w-0.5 h-0.5';
            brightness = 0.9 + Math.random() * 0.1;
            twinkleSpeed = 1.5 + Math.random() * 2.5;
          } else {
            // Bright stars (10%)
            size = 'w-1 h-1';
            brightness = 0.95 + Math.random() * 0.05;
            twinkleSpeed = 1 + Math.random() * 2;
          }
          
          const driftSpeed = 60 + Math.random() * 80;
          const resetDelay = Math.random() * driftSpeed;
          
          return (
            <div
              key={i}
              className={`absolute ${size} bg-white rounded-full star-glow center-drift`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                opacity: brightness,
                animation: `enhanced-twinkle ${twinkleSpeed}s infinite, infinite-drift ${driftSpeed}s linear infinite`,
                animationDelay: `${Math.random() * 3}s, ${resetDelay}s`,
                boxShadow: sizeType > 0.95 ? '0 0 10px rgba(255,255,255,1), 0 0 20px rgba(255,255,255,0.5)' : 'none'
              }}
            />
          );
        })}








      </div>

      {/* Main content - centered vertically and horizontally */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center ml-1.5">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-2 animate-pulse-soft text-gray-300 drop-shadow-[0_0_8px_rgba(156,163,175,0.3)]">
            IMPERIA
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-60"></div>
            <h2 className="text-2xl md:text-4xl font-normal tracking-[0.3em] animate-pulse-soft-delay text-gray-400 drop-shadow-[0_0_6px_rgba(156,163,175,0.2)]">
              PROMO
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gray-500 to-transparent opacity-60"></div>
          </div>
        </div>
      </div>

      {/* Button - positioned at bottom center */}
      <div className="relative z-10 flex justify-center mb-32 -ml-1.5">
        <Button
          onClick={handleNewLead}
          disabled={isGettingLocation}
          size="default"
          className="bg-gradient-to-r from-gray-800/60 via-gray-900/60 to-gray-800/60 backdrop-blur-sm text-gray-300 text-lg px-8 py-4 rounded-2xl shadow-[0_0_12px_rgba(156,163,175,0.2)] transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_18px_rgba(156,163,175,0.3)] hover:from-gray-700/70 hover:via-gray-800/70 hover:to-gray-700/70 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-500/20 font-bold tracking-wide uppercase relative overflow-hidden group"
        >
          {isGettingLocation ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Получение местоположения...
            </div>
          ) : (
            <>
              <span className="relative z-10 drop-shadow-[0_0_4px_rgba(156,163,175,0.2)]">Новый лид</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </>
          )}
        </Button>
      </div>

      {/* Cosmic fog overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-gray-900/40 to-black/30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none"></div>
    </div>
  );
};

export default Home;