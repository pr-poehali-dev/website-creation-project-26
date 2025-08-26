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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-black relative overflow-hidden flex flex-col p-4">
      {/* Enhanced space background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static stars - more contrasted */}
        {Array.from({ length: 300 }, (_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const sizeType = Math.random();
          let size, brightness, twinkleSpeed, color;
          
          if (sizeType < 0.6) {
            // Tiny stars (60%)
            size = 'w-px h-px';
            brightness = 0.6 + Math.random() * 0.4;
            twinkleSpeed = 2 + Math.random() * 3;
            color = 'bg-white';
          } else if (sizeType < 0.85) {
            // Medium stars (25%)
            size = 'w-0.5 h-0.5';
            brightness = 0.7 + Math.random() * 0.3;
            twinkleSpeed = 1.5 + Math.random() * 2.5;
            color = Math.random() > 0.7 ? 'bg-blue-100' : 'bg-white';
          } else {
            // Bright stars (15%)
            size = 'w-1 h-1';
            brightness = 0.8 + Math.random() * 0.2;
            twinkleSpeed = 1 + Math.random() * 2;
            color = Math.random() > 0.5 ? 'bg-blue-200' : 'bg-yellow-100';
          }
          
          return (
            <div
              key={i}
              className={`absolute ${size} ${color} rounded-full star-glow`}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                opacity: brightness,
                animation: `enhanced-twinkle ${twinkleSpeed}s infinite`,
                animationDelay: `${Math.random() * 3}s`,
                boxShadow: sizeType > 0.9 ? '0 0 8px rgba(255,255,255,0.9), 0 0 16px rgba(147,197,253,0.6)' : 'none'
              }}
            />
          );
        })}

        {/* Enhanced Milky Way */}
        <div className="absolute inset-0 opacity-40">
          <div 
            className="absolute milky-way"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(147,197,253,0.2) 5%, rgba(255,255,255,0.15) 20%, rgba(147,197,253,0.4) 35%, rgba(255,255,255,0.3) 50%, rgba(147,197,253,0.4) 65%, rgba(255,255,255,0.15) 80%, rgba(147,197,253,0.2) 95%, transparent 100%)',
              top: '10%',
              left: '-30%',
              width: '160%',
              height: '300px',
              transform: 'rotate(-25deg)',
              filter: 'blur(3px)',
              animation: 'milky-way-shimmer 8s ease-in-out infinite'
            }}
          />
        </div>

        {/* Enhanced Constellation Leo */}
        <div className="absolute constellation-leo" style={{ top: '20%', left: '15%' }}>
          {/* Regulus - α Leonis - brightest star */}
          <div className="absolute w-2 h-2 bg-blue-100 rounded-full constellation-star-bright" style={{ top: '50px', left: '70px' }} />
          {/* Algieba - γ Leonis */}
          <div className="absolute w-1.5 h-1.5 bg-yellow-100 rounded-full constellation-star-bright" style={{ top: '25px', left: '50px' }} />
          {/* Denebola - β Leonis */}
          <div className="absolute w-1.5 h-1.5 bg-white rounded-full constellation-star-bright" style={{ top: '55px', left: '140px' }} />
          {/* Zosma - δ Leonis */}
          <div className="absolute w-1 h-1 bg-white rounded-full constellation-star" style={{ top: '40px', left: '115px' }} />
          {/* Adhafera - ζ Leonis */}
          <div className="absolute w-1 h-1 bg-white rounded-full constellation-star" style={{ top: '18px', left: '90px' }} />
          {/* Ras Elased - μ Leonis */}
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '8px', left: '25px' }} />
          {/* Alterf - λ Leonis */}
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '12px', left: '8px' }} />
          {/* Chertan - θ Leonis */}
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '70px', left: '95px' }} />
          
          {/* Leo constellation lines - brighter */}
          <svg className="absolute inset-0 w-36 h-24 pointer-events-none" style={{ opacity: 0.6 }}>
            <line x1="25" y1="8" x2="50" y2="25" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
            <line x1="50" y1="25" x2="70" y2="50" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
            <line x1="70" y1="50" x2="90" y2="18" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
            <line x1="90" y1="18" x2="115" y2="40" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
            <line x1="115" y1="40" x2="140" y2="55" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
            <line x1="70" y1="50" x2="95" y2="70" stroke="rgba(147,197,253,0.8)" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Enhanced Constellation Scorpius */}
        <div className="absolute constellation-scorpius" style={{ top: '45%', left: '60%' }}>
          {/* Antares - α Scorpii - red supergiant */}
          <div className="absolute w-2.5 h-2.5 bg-red-400 rounded-full constellation-star-bright" style={{ top: '35px', left: '50px' }} />
          {/* Shaula - λ Scorpii */}
          <div className="absolute w-1.5 h-1.5 bg-blue-100 rounded-full constellation-star-bright" style={{ top: '100px', left: '120px' }} />
          {/* Sargas - θ Scorpii */}
          <div className="absolute w-1 h-1 bg-yellow-100 rounded-full constellation-star" style={{ top: '25px', left: '25px' }} />
          {/* Dschubba - δ Scorpii */}
          <div className="absolute w-1 h-1 bg-white rounded-full constellation-star" style={{ top: '30px', left: '70px' }} />
          {/* β Scorpii */}
          <div className="absolute w-1 h-1 bg-white rounded-full constellation-star" style={{ top: '40px', left: '90px' }} />
          {/* π Scorpii */}
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '60px', left: '105px' }} />
          {/* Tail stars */}
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '80px', left: '115px' }} />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '95px', left: '125px' }} />
          <div className="absolute w-0.5 h-0.5 bg-white rounded-full constellation-star" style={{ top: '105px', left: '135px' }} />
          
          {/* Scorpius constellation lines - brighter */}
          <svg className="absolute inset-0 w-36 h-28 pointer-events-none" style={{ opacity: 0.6 }}>
            <line x1="25" y1="25" x2="50" y2="35" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="50" y1="35" x2="70" y2="30" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="70" y1="30" x2="90" y2="40" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="90" y1="40" x2="105" y2="60" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="105" y1="60" x2="115" y2="80" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="115" y1="80" x2="120" y2="100" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="120" y1="100" x2="125" y2="95" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
            <line x1="125" y1="95" x2="135" y2="105" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Enhanced shooting stars */}
        {Array.from({ length: 8 }, (_, i) => {
          const startDelay = Math.random() * 12;
          const duration = 0.8 + Math.random() * 1.5;
          const startX = Math.random() * 60;
          const startY = Math.random() * 40;
          
          return (
            <div
              key={`shooting-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full shooting-star-enhanced opacity-0"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
                animation: `enhanced-shooting-star ${duration}s linear infinite`,
                animationDelay: `${startDelay}s`,
                boxShadow: '0 0 12px rgba(255,255,255,1), 0 0 24px rgba(147,197,253,0.8), 0 0 36px rgba(59,130,246,0.6)'
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