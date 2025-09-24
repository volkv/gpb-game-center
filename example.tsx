import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Trophy, 
  Star, 
  Shield, 
  Gem, 
  Grid3x3, 
  MapPin, 
  Building,
  ChevronRight,
  Play,
  Lock,
  Coins,
  Clock
} from 'lucide-react';

const GameCenter = () => {
  const [currentPoints, setCurrentPoints] = useState(0);
  const [animatePoints, setAnimatePoints] = useState(false);

  // Анимация очков при загрузке
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPoints(prev => {
        if (prev < 1250) {
          return prev + 50;
        }
        setAnimatePoints(true);
        clearInterval(interval);
        return 1250;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const activeGames = [
    {
      id: 'shield-ruble',
      title: 'Щит и Рубль',
      subtitle: 'Защита от мошенников',
      icon: Shield,
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      textColor: 'text-white',
      progress: 85,
      reward: 'Страхование карт',
      isNew: true
    },
    {
      id: 'golden-reserve',
      title: 'Золотой Запас',
      subtitle: 'Match-3 головоломка',
      icon: Gem,
      gradient: 'from-cyan-400 via-teal-400 to-green-400',
      textColor: 'text-gray-800',
      progress: 42,
      reward: 'Кредитная карта 180 дней',
      isNew: false
    },
    {
      id: 'financial-crossword',
      title: 'Финансовый Кроссворд',
      subtitle: 'Изучай термины играя',
      icon: Grid3x3,
      gradient: 'from-pink-500 via-rose-500 to-red-500',
      textColor: 'text-white',
      progress: 67,
      reward: 'ИИС с налоговым вычетом',
      isNew: false
    }
  ];

  const comingSoonGames = [
    {
      id: 'financial-navigator',
      title: 'Финансовый Навигатор',
      subtitle: 'Планирование бюджета',
      icon: MapPin,
      gradient: 'from-gray-400 to-gray-500'
    },
    {
      id: 'gazprombank-city',
      title: 'Газпромбанк-Сити',
      subtitle: 'Экономический симулятор',
      icon: Building,
      gradient: 'from-gray-400 to-gray-500'
    }
  ];

  const GameCard = ({ game, isComingSoon = false }) => (
    <div 
      className={`relative overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
        isComingSoon ? 'opacity-60' : 'hover:scale-105 hover:shadow-xl cursor-pointer'
      }`}
      style={{ minHeight: '160px' }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${game.gradient}`} />
      
      {/* Декоративные элементы */}
      <div className="absolute top-2 right-2 w-16 h-16 bg-white/10 rounded-full blur-xl" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-black/10 rounded-full blur-lg transform translate-x-4 translate-y-4" />
      
      <div className="relative p-4 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <game.icon 
            size={32} 
            className={`${game.textColor || 'text-white'} drop-shadow-lg`} 
          />
          
          {game.isNew && !isComingSoon && (
            <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
              НОВОЕ
            </div>
          )}
          
          {isComingSoon && (
            <div className="bg-gray-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Lock size={12} />
              СКОРО
            </div>
          )}
        </div>
        
        <div className={game.textColor || 'text-white'}>
          <h3 className="font-bold text-lg mb-1 drop-shadow-sm">{game.title}</h3>
          <p className="text-sm opacity-90 mb-3">{game.subtitle}</p>
          
          {!isComingSoon && (
            <>
              <div className="flex justify-between items-center text-xs mb-2 opacity-80">
                <span>Прогресс</span>
                <span>{game.progress}%</span>
              </div>
              
              <div className="w-full bg-black/20 rounded-full h-2 mb-3">
                <div 
                  className="bg-white/80 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${game.progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <Star size={12} className="fill-current" />
                  <span>{game.reward}</span>
                </div>
                <ChevronRight size={16} className="opacity-60" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 text-white">
        <div className="px-4 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Игровой Центр</h1>
              <p className="text-white/80 text-sm">Играй и изучай финансы</p>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-white/60 mb-1">Уровень 12</div>
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                <span className="text-lg font-bold">Pro</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins size={20} className="text-cyan-400" />
                <span className="text-sm opacity-80">Очки</span>
              </div>
              <div className={`text-2xl font-bold transition-all duration-500 ${
                animatePoints ? 'scale-110 text-cyan-300' : ''
              }`}>
                {currentPoints.toLocaleString()}
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={20} className="text-green-400" />
                <span className="text-sm opacity-80">Время в игре</span>
              </div>
              <div className="text-2xl font-bold">2ч 45м</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {/* Сейчас в игре */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Сейчас в игре</h2>
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              3 игры
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {activeGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>

        {/* Скоро в Центре */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Скоро в Центре</h2>
            <div className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              В разработке
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {comingSoonGames.map((game) => (
              <GameCard key={game.id} game={game} isComingSoon={true} />
            ))}
          </div>
        </div>

        {/* Достижения */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 rounded-full p-2">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Последнее достижение</h3>
              <p className="text-sm text-gray-600">Эксперт по безопасности</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-700">
              Вы успешно прошли все уровни квиза "Щит и Рубль"
            </p>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <div className="flex flex-col items-center py-2 text-indigo-600">
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Игры</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <Trophy size={24} />
            <span className="text-xs mt-1">Рейтинг</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <Star size={24} />
            <span className="text-xs mt-1">Награды</span>
          </div>
          <div className="flex flex-col items-center py-2 text-gray-400">
            <Grid3x3 size={24} />
            <span className="text-xs mt-1">Профиль</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4">
        <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
          <Play size={24} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default GameCenter;