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
                animation: `enhanced-twinkle ${twinkleSpeed}s infinite, upward-drift ${driftSpeed}s linear infinite`,
                animationDelay: `${Math.random() * 3}s, ${resetDelay}s`,
                boxShadow: sizeType > 0.9 ? '0 0 12px rgba(255,255,255,0.5), 0 0 24px rgba(255,255,255,0.3)' : 
                          sizeType > 0.7 ? '0 0 6px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2)' :
                          '0 0 3px rgba(255,255,255,0.3)'
              }}
            />
          );
        })}








        {/* Созвездия */}
        <div className="absolute inset-0">
          {/* Большая медведица */}
          <svg className="absolute" style={{ left: '20%', top: '30%', width: '200px', height: '120px' }}>
            <g className="constellation opacity-60">
              <line x1="20" y1="30" x2="60" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="60" y1="20" x2="100" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="100" y1="25" x2="140" y2="35" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="140" y1="35" x2="120" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="120" y1="70" x2="80" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="80" y1="75" x2="40" y2="65" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="40" y1="65" x2="20" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <circle cx="20" cy="30" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="60" cy="20" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="100" cy="25" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="140" cy="35" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="120" cy="70" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="80" cy="75" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="40" cy="65" r="2" fill="rgba(255,255,255,0.8)" />
            </g>
          </svg>

          {/* Орион */}
          <svg className="absolute" style={{ left: '70%', top: '50%', width: '150px', height: '180px' }}>
            <g className="constellation opacity-60">
              <line x1="30" y1="20" x2="60" y2="30" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="60" y1="30" x2="90" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="30" y1="80" x2="60" y2="70" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="60" y1="70" x2="90" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="45" y1="120" x2="60" y2="140" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <line x1="60" y1="140" x2="75" y2="120" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              <circle cx="30" cy="20" r="2" fill="rgba(255,255,255,0.9)" />
              <circle cx="60" cy="30" r="3" fill="rgba(255,255,255,0.9)" />
              <circle cx="90" cy="20" r="2" fill="rgba(255,255,255,0.9)" />
              <circle cx="30" cy="80" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="60" cy="70" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="90" cy="80" r="2" fill="rgba(255,255,255,0.8)" />
              <circle cx="45" cy="120" r="1.5" fill="rgba(255,255,255,0.7)" />
              <circle cx="60" cy="140" r="1.5" fill="rgba(255,255,255,0.7)" />
              <circle cx="75" cy="120" r="1.5" fill="rgba(255,255,255,0.7)" />
            </g>
          </svg>
        </div>

        {/* Комета */}
        <div className="absolute comet" style={{
          left: '-100px',
          top: '20%',
          animation: 'comet-flight 25s linear infinite'
        }}>
          <div className="relative">
            <div className="w-3 h-3 bg-white rounded-full opacity-90 shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            <div className="absolute top-1/2 left-full w-32 h-0.5 bg-gradient-to-r from-white/60 via-blue-200/40 to-transparent transform -translate-y-1/2" />
          </div>
        </div>

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