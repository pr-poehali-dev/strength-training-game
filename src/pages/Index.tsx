import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface PlayerStats {
  level: number;
  strength: number;
  experience: number;
  maxExperience: number;
  coins: number;
}

interface Pet {
  name: string;
  level: number;
  experience: number;
  maxExperience: number;
  power: number;
}

const Index = () => {
  const [player, setPlayer] = useState<PlayerStats>({
    level: 1,
    strength: 10,
    experience: 0,
    maxExperience: 100,
    coins: 50
  });

  const [pet, setPet] = useState<Pet>({
    name: 'Драко',
    level: 1,
    experience: 0,
    maxExperience: 50,
    power: 5
  });

  const [isTraining, setIsTraining] = useState(false);
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'Первые шаги', unlocked: true, icon: 'Award' },
    { id: 2, name: 'Силач 10 lvl', unlocked: false, icon: 'Trophy' },
    { id: 3, name: 'Мастер питомцев', unlocked: false, icon: 'Star' },
  ]);

  const trainStrength = () => {
    setIsTraining(true);
    setTimeout(() => {
      const expGain = Math.floor(Math.random() * 20) + 10;
      const newExp = player.experience + expGain;
      
      if (newExp >= player.maxExperience) {
        setPlayer(prev => ({
          ...prev,
          level: prev.level + 1,
          strength: prev.strength + 5,
          experience: newExp - prev.maxExperience,
          maxExperience: Math.floor(prev.maxExperience * 1.5)
        }));
      } else {
        setPlayer(prev => ({
          ...prev,
          experience: newExp,
          strength: prev.strength + 1
        }));
      }

      const petExpGain = Math.floor(Math.random() * 10) + 5;
      const newPetExp = pet.experience + petExpGain;
      
      if (newPetExp >= pet.maxExperience) {
        setPet(prev => ({
          ...prev,
          level: prev.level + 1,
          power: prev.power + 3,
          experience: newPetExp - prev.maxExperience,
          maxExperience: Math.floor(prev.maxExperience * 1.3)
        }));
      } else {
        setPet(prev => ({
          ...prev,
          experience: newPetExp
        }));
      }

      setIsTraining(false);
    }, 1500);
  };

  const buyUpgrade = (cost: number, type: 'strength' | 'pet') => {
    if (player.coins >= cost) {
      setPlayer(prev => ({ ...prev, coins: prev.coins - cost }));
      
      if (type === 'strength') {
        setPlayer(prev => ({ ...prev, strength: prev.strength + 10 }));
      } else {
        setPet(prev => ({ ...prev, power: prev.power + 5 }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <header className="text-center space-y-2 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
            POWER ARENA
          </h1>
          <p className="text-slate-400 text-lg">Прокачай силу. Тренируй питомца. Стань легендой.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/30 backdrop-blur-sm p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-amber-400">Уровень {player.level}</h2>
                <p className="text-slate-400">Сила: {player.strength}</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-lg border border-amber-500/30">
                <Icon name="Coins" className="text-amber-400" size={24} />
                <span className="text-2xl font-bold text-amber-400">{player.coins}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Опыт</span>
                <span className="text-amber-400 font-semibold">{player.experience} / {player.maxExperience}</span>
              </div>
              <Progress value={(player.experience / player.maxExperience) * 100} className="h-4 bg-slate-700" />
            </div>

            <div className="relative aspect-video bg-gradient-to-b from-slate-700 to-slate-900 rounded-xl overflow-hidden border-2 border-amber-500/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,158,11,0.1),transparent)]"></div>
              <div className="relative z-10 text-center space-y-4">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center animate-pulse-glow">
                  <Icon name="User" size={64} className="text-slate-900" />
                </div>
                <div className="bg-slate-900/80 px-6 py-3 rounded-lg backdrop-blur-sm border border-amber-500/30">
                  <p className="text-2xl font-bold text-amber-400">💪 {player.strength}</p>
                  <p className="text-xs text-slate-400">СИЛА</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={trainStrength}
                disabled={isTraining}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-900 font-bold py-6 text-lg shadow-lg shadow-amber-500/50 disabled:opacity-50"
              >
                {isTraining ? (
                  <>
                    <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                    Тренировка...
                  </>
                ) : (
                  <>
                    <Icon name="Dumbbell" className="mr-2" size={20} />
                    Тренировать
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="border-red-500/50 hover:bg-red-500/10 text-red-400 font-semibold py-6 text-lg">
                <Icon name="Swords" className="mr-2" size={20} />
                Мультиплеер
              </Button>
              
              <Button variant="outline" className="border-blue-500/50 hover:bg-blue-500/10 text-blue-400 font-semibold py-6 text-lg">
                <Icon name="Target" className="mr-2" size={20} />
                Арена
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            
            <Card className="bg-gradient-to-br from-red-900/40 to-orange-900/40 border-2 border-red-500/30 backdrop-blur-sm p-6 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-red-400">Питомец</h3>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Уровень {pet.level}</Badge>
              </div>

              <div className="aspect-square bg-gradient-to-br from-red-800/30 to-orange-800/30 rounded-xl flex items-center justify-center border-2 border-red-500/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent)]"></div>
                <div className="relative text-8xl animate-pulse-glow">🐉</div>
              </div>

              <div className="space-y-2">
                <p className="text-xl font-bold text-center text-red-300">{pet.name}</p>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Мощь: {pet.power}</span>
                  <span>{pet.experience} / {pet.maxExperience} XP</span>
                </div>
                <Progress value={(pet.experience / pet.maxExperience) * 100} className="h-3 bg-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-slate-900/50 p-2 rounded border border-red-500/20">
                  <p className="text-red-400 font-semibold">🔥 Урон</p>
                  <p className="text-white font-bold">{pet.power * 2}</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded border border-red-500/20">
                  <p className="text-red-400 font-semibold">⚡ Скорость</p>
                  <p className="text-white font-bold">{Math.floor(pet.level * 1.5)}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm p-6 space-y-4 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl font-bold text-amber-400 flex items-center gap-2">
                <Icon name="Award" size={24} />
                Достижения
              </h3>
              <div className="space-y-2">
                {achievements.map((ach) => (
                  <div
                    key={ach.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      ach.unlocked
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-700/30 border-slate-600/30 opacity-50'
                    }`}
                  >
                    <Icon name={ach.icon as any} className={ach.unlocked ? 'text-amber-400' : 'text-slate-500'} size={20} />
                    <span className={`text-sm font-medium ${ach.unlocked ? 'text-amber-300' : 'text-slate-400'}`}>
                      {ach.name}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <Card className="bg-slate-800/90 border-amber-500/30 backdrop-blur-sm p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Tabs defaultValue="shop" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50">
              <TabsTrigger value="shop" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 font-semibold">
                <Icon name="ShoppingCart" className="mr-2" size={18} />
                Магазин
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 font-semibold">
                <Icon name="BarChart3" className="mr-2" size={18} />
                Статистика
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="shop" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border-amber-500/30 p-4 space-y-3 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-300">Протеиновый коктейль</h4>
                    <span className="text-2xl">💪</span>
                  </div>
                  <p className="text-sm text-slate-400">+10 к силе</p>
                  <Button
                    onClick={() => buyUpgrade(30, 'strength')}
                    disabled={player.coins < 30}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold"
                  >
                    <Icon name="Coins" className="mr-2" size={16} />
                    30 монет
                  </Button>
                </Card>

                <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/30 p-4 space-y-3 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-red-300">Корм для питомца</h4>
                    <span className="text-2xl">🍖</span>
                  </div>
                  <p className="text-sm text-slate-400">+5 к мощи питомца</p>
                  <Button
                    onClick={() => buyUpgrade(25, 'pet')}
                    disabled={player.coins < 25}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold"
                  >
                    <Icon name="Coins" className="mr-2" size={16} />
                    25 монет
                  </Button>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 p-4 space-y-3 hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-purple-300">Легендарный эликсир</h4>
                    <span className="text-2xl">⚗️</span>
                  </div>
                  <p className="text-sm text-slate-400">Мгновенно +1 уровень</p>
                  <Button
                    disabled={player.coins < 100}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
                  >
                    <Icon name="Coins" className="mr-2" size={16} />
                    100 монет
                  </Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="stats" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center space-y-2">
                  <Icon name="TrendingUp" className="mx-auto text-amber-400" size={32} />
                  <p className="text-3xl font-bold text-white">{player.level}</p>
                  <p className="text-sm text-slate-400">Уровень</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center space-y-2">
                  <Icon name="Zap" className="mx-auto text-orange-400" size={32} />
                  <p className="text-3xl font-bold text-white">{player.strength}</p>
                  <p className="text-sm text-slate-400">Сила</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center space-y-2">
                  <Icon name="Heart" className="mx-auto text-red-400" size={32} />
                  <p className="text-3xl font-bold text-white">{pet.power}</p>
                  <p className="text-sm text-slate-400">Мощь питомца</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center space-y-2">
                  <Icon name="Award" className="mx-auto text-amber-400" size={32} />
                  <p className="text-3xl font-bold text-white">{achievements.filter(a => a.unlocked).length}</p>
                  <p className="text-sm text-slate-400">Достижения</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

      </div>
    </div>
  );
};

export default Index;
