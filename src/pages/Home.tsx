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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden flex flex-col p-4">
      {/* Space background with natural starfield */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static stars */}
        {Array.from({ length: 200 }, (_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const sizeType = Math.random();
          let size, brightness, twinkleSpeed;
          
          if (sizeType < 0.7) {
            // Tiny stars (70%)
            size = 'w-px h-px';
            brightness = 0.4 + Math.random() * 0.4;
            twinkleSpeed = 3 + Math.random() * 4;
          } else if (sizeType < 0.9) {
            // Small stars (20%)
            size = 'w-0.5 h-0.5';
            brightness = 0.6 + Math.random() * 0.3;
            twinkleSpeed = 2 + Math.random() * 3;
          } else {
            // Bright stars (10%)
            size = 'w-1 h-1';
            brightness = 0.8 + Math.random() * 0.2;
            twinkleSpeed = 1.5 + Math.random() * 2;
          }
          
          return (
            <div
              key={i}
              className={`absolute ${size} bg-white rounded-full`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                opacity: brightness,
                animation: `twinkle ${twinkleSpeed}s infinite`,
                animationDelay: `${Math.random() * 3}s`,
                boxShadow: sizeType > 0.95 ? '0 0 4px rgba(255,255,255,0.8)' : 'none'
              }}
            />
          );
        })}

        {/* Shooting stars */}
        {Array.from({ length: 5 }, (_, i) => {
          const startDelay = Math.random() * 10;
          const duration = 1 + Math.random() * 2;
          
          return (
            <div
              key={`shooting-${i}`}
              className="absolute w-0.5 h-0.5 bg-white rounded-full shooting-star opacity-0"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 30}%`,
                animation: `shooting-star ${duration}s linear infinite`,
                animationDelay: `${startDelay}s`,
                boxShadow: '0 0 6px rgba(255,255,255,1), 0 0 12px rgba(173,216,230,0.8)'
              }}
            />
          );
        })}

        {/* Spaceship */}
        <div className="absolute w-32 h-16 spaceship-container">
          <svg 
            viewBox="0 0 128 64" 
            className="w-full h-full drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' }}
          >
            {/* Main body */}
            <ellipse cx="64" cy="32" rx="45" ry="12" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1"/>
            
            {/* Cockpit */}
            <ellipse cx="85" cy="32" rx="20" ry="8" fill="#3b82f6" stroke="#1e40af" strokeWidth="1"/>
            <ellipse cx="85" cy="32" rx="15" ry="6" fill="#60a5fa" opacity="0.8"/>
            
            {/* Wings */}
            <ellipse cx="45" cy="20" rx="15" ry="4" fill="#d1d5db"/>
            <ellipse cx="45" cy="44" rx="15" ry="4" fill="#d1d5db"/>
            
            {/* Engine glow */}
            <ellipse cx="25" cy="32" rx="8" ry="3" fill="#ef4444" opacity="0.8"/>
            <ellipse cx="20" cy="32" rx="12" ry="2" fill="#fbbf24" opacity="0.6"/>
            
            {/* Details */}
            <circle cx="75" cy="28" r="2" fill="#1e40af"/>
            <circle cx="80" cy="36" r="1.5" fill="#1e40af"/>
          </svg>
        </div>
      </div>

      {/* Main content - centered vertically and horizontally */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="text-center ml-1.5">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider mb-2 animate-pulse-soft text-slate-800">
            IMPERIA
          </h1>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-0.5 bg-slate-700"></div>
            <h2 className="text-2xl md:text-4xl font-normal tracking-[0.3em] animate-pulse-soft-delay text-slate-700">
              PROMO
            </h2>
            <div className="w-16 h-0.5 bg-slate-700"></div>
          </div>
        </div>
      </div>

      {/* Button - positioned at bottom center */}
      <div className="relative z-10 flex justify-center mb-32 -ml-1.5">
        <Button
          onClick={handleNewLead}
          disabled={isGettingLocation}
          size="default"
          className="animate-gradient-shimmer text-white text-lg px-8 py-4 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/20 font-bold tracking-wide uppercase"
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