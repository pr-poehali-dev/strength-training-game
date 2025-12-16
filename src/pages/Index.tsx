import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface PlayerStats {
  level: number;
  strength: number;
  experience: number;
  maxExperience: number;
  coins: number;
  wins: number;
  losses: number;
  nickname: string;
}

interface Pet {
  name: string;
  level: number;
  experience: number;
  maxExperience: number;
  power: number;
}

interface LeaderboardPlayer {
  nickname: string;
  level: number;
  strength: number;
  wins: number;
  losses: number;
  rank: number;
}

interface BattleLog {
  type: 'hit' | 'crit' | 'miss' | 'defend';
  attacker: string;
  defender: string;
  damage: number;
}

const STORAGE_KEY = 'power-arena-save';

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save:', e);
  }
};

const Index = () => {
  const [player, setPlayer] = useState<PlayerStats>(() => 
    loadFromStorage(`${STORAGE_KEY}-player`, {
      level: 1,
      strength: 10,
      experience: 0,
      maxExperience: 100,
      coins: 50,
      wins: 0,
      losses: 0,
      nickname: 'Игрок'
    })
  );

  const [pet, setPet] = useState<Pet>(() => 
    loadFromStorage(`${STORAGE_KEY}-pet`, {
      name: 'Драко',
      level: 1,
      experience: 0,
      maxExperience: 50,
      power: 5
    })
  );

  const [achievements, setAchievements] = useState(() => 
    loadFromStorage(`${STORAGE_KEY}-achievements`, [
      { id: 1, name: 'Первые шаги', unlocked: true, icon: 'Award' },
      { id: 2, name: 'Силач 10 lvl', unlocked: false, icon: 'Trophy' },
      { id: 3, name: 'Мастер питомцев', unlocked: false, icon: 'Star' },
      { id: 4, name: 'Первая победа', unlocked: false, icon: 'Swords' },
      { id: 5, name: 'Непобедимый', unlocked: false, icon: 'Shield' }
    ])
  );

  const [isTraining, setIsTraining] = useState(false);
  const [isBattling, setIsBattling] = useState(false);
  const [showBattleDialog, setShowBattleDialog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showNicknameDialog, setShowNicknameDialog] = useState(() => !loadFromStorage(`${STORAGE_KEY}-player`, { nickname: '' }).nickname || loadFromStorage(`${STORAGE_KEY}-player`, { nickname: '' }).nickname === 'Игрок');
  const [nicknameInput, setNicknameInput] = useState('');
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [currentEnemy, setCurrentEnemy] = useState({ nickname: '', strength: 0 });
  const [battleResult, setBattleResult] = useState<'win' | 'loss' | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(() => 
    loadFromStorage(`${STORAGE_KEY}-leaderboard`, [
      { nickname: 'DragonSlayer', level: 15, strength: 145, wins: 23, losses: 3, rank: 1 },
      { nickname: 'ThunderFist', level: 13, strength: 128, wins: 19, losses: 5, rank: 2 },
      { nickname: 'IronWill', level: 12, strength: 115, wins: 17, losses: 4, rank: 3 },
      { nickname: 'ShadowKnight', level: 11, strength: 102, wins: 15, losses: 6, rank: 4 },
      { nickname: 'StormBreaker', level: 10, strength: 95, wins: 14, losses: 7, rank: 5 },
      { nickname: 'CrimsonBlade', level: 9, strength: 88, wins: 12, losses: 8, rank: 6 },
      { nickname: 'SilverFang', level: 8, strength: 79, wins: 10, losses: 9, rank: 7 },
      { nickname: 'GoldenLion', level: 7, strength: 68, wins: 9, losses: 10, rank: 8 }
    ])
  );



  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}-player`, player);
  }, [player]);

  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}-pet`, pet);
  }, [pet]);

  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}-leaderboard`, leaderboard);
  }, [leaderboard]);

  useEffect(() => {
    saveToStorage(`${STORAGE_KEY}-achievements`, achievements);
  }, [achievements]);

  useEffect(() => {
    if (player.wins > 0 || player.losses > 0) {
      updateLeaderboard();
    }
  }, [player.wins, player.losses, player.strength]);

  useEffect(() => {
    checkAchievements();
  }, [player, pet]);

  const checkAchievements = () => {
    const updates = [...achievements];
    let hasUpdate = false;

    if (player.level >= 10 && !updates[1].unlocked) {
      updates[1].unlocked = true;
      hasUpdate = true;
    }
    if (pet.level >= 5 && !updates[2].unlocked) {
      updates[2].unlocked = true;
      hasUpdate = true;
    }
    if (player.wins >= 1 && !updates[3].unlocked) {
      updates[3].unlocked = true;
      hasUpdate = true;
    }
    if (player.wins >= 10 && player.losses === 0 && !updates[4].unlocked) {
      updates[4].unlocked = true;
      hasUpdate = true;
    }

    if (hasUpdate) {
      setAchievements(updates);
    }
  };

  const updateLeaderboard = () => {
    const playerInLeaderboard: LeaderboardPlayer = {
      nickname: player.nickname,
      level: player.level,
      strength: player.strength,
      wins: player.wins,
      losses: player.losses,
      rank: 0
    };

    const updatedLeaderboard = [...leaderboard.filter(p => p.nickname !== player.nickname), playerInLeaderboard]
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.strength !== a.strength) return b.strength - a.strength;
        return a.losses - b.losses;
      })
      .map((p, index) => ({ ...p, rank: index + 1 }));

    setLeaderboard(updatedLeaderboard);
  };

  const setNickname = () => {
    if (nicknameInput.trim()) {
      setPlayer(prev => ({ ...prev, nickname: nicknameInput.trim() }));
      setShowNicknameDialog(false);
    }
  };

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

  const startBattle = () => {
    const enemies = leaderboard.filter(p => p.nickname !== player.nickname);
    const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
    
    setCurrentEnemy({ nickname: randomEnemy.nickname, strength: randomEnemy.strength });
    setPlayerHP(100);
    setEnemyHP(100);
    setBattleLogs([]);
    setBattleResult(null);
    setShowBattleDialog(true);
    setIsBattling(true);

    simulateBattle(randomEnemy.strength);
  };

  const simulateBattle = (enemyStrength: number) => {
    const logs: BattleLog[] = [];
    let pHP = 100;
    let eHP = 100;
    let turn = 0;

    const battleInterval = setInterval(() => {
      turn++;
      
      if (turn % 2 === 1) {
        const hitChance = Math.random();
        const isCrit = Math.random() > 0.85;
        
        if (hitChance > 0.2) {
          const damage = isCrit 
            ? Math.floor((player.strength + pet.power) * 1.5) 
            : Math.floor(player.strength + pet.power * 0.5);
          
          eHP = Math.max(0, eHP - damage);
          logs.push({
            type: isCrit ? 'crit' : 'hit',
            attacker: player.nickname,
            defender: currentEnemy.nickname,
            damage
          });
          setEnemyHP(eHP);
        } else {
          logs.push({
            type: 'miss',
            attacker: player.nickname,
            defender: currentEnemy.nickname,
            damage: 0
          });
        }
      } else {
        const hitChance = Math.random();
        
        if (hitChance > 0.2) {
          const damage = Math.floor(enemyStrength * (0.8 + Math.random() * 0.4));
          pHP = Math.max(0, pHP - damage);
          logs.push({
            type: 'hit',
            attacker: currentEnemy.nickname,
            defender: player.nickname,
            damage
          });
          setPlayerHP(pHP);
        } else {
          logs.push({
            type: 'miss',
            attacker: currentEnemy.nickname,
            defender: player.nickname,
            damage: 0
          });
        }
      }

      setBattleLogs([...logs]);

      if (pHP <= 0 || eHP <= 0) {
        clearInterval(battleInterval);
        setIsBattling(false);
        
        if (eHP <= 0) {
          setBattleResult('win');
          setPlayer(prev => ({
            ...prev,
            wins: prev.wins + 1,
            coins: prev.coins + 25,
            experience: prev.experience + 30
          }));
        } else {
          setBattleResult('loss');
          setPlayer(prev => ({
            ...prev,
            losses: prev.losses + 1
          }));
        }
      }
    }, 1200);
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

  const getBattleLogIcon = (type: string) => {
    switch (type) {
      case 'crit': return '💥';
      case 'hit': return '⚔️';
      case 'miss': return '🌪️';
      case 'defend': return '🛡️';
      default: return '⚡';
    }
  };

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
          <DialogContent className="bg-slate-800 border-amber-500/30">
            <DialogHeader>
              <DialogTitle className="text-2xl text-amber-400">Добро пожаловать в POWER ARENA!</DialogTitle>
              <DialogDescription className="text-slate-300">
                Введи свой никнейм, чтобы начать путь к славе
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Твой никнейм..."
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && setNickname()}
                className="bg-slate-900 border-amber-500/30 text-white text-lg"
              />
              <Button 
                onClick={setNickname}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-900 font-bold"
              >
                Начать игру
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showBattleDialog} onOpenChange={setShowBattleDialog}>
          <DialogContent className="bg-slate-800 border-red-500/30 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center text-red-400 flex items-center justify-center gap-2">
                <Icon name="Swords" size={32} />
                АРЕНА БОЯ
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center space-y-2">
                  <div className="text-6xl">👤</div>
                  <p className="font-bold text-amber-400">{player.nickname}</p>
                  <div className="space-y-1">
                    <Progress value={playerHP} className="h-4 bg-slate-700" />
                    <p className="text-sm text-green-400">{playerHP} HP</p>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <div className="text-6xl">🦹</div>
                  <p className="font-bold text-red-400">{currentEnemy.nickname}</p>
                  <div className="space-y-1">
                    <Progress value={enemyHP} className="h-4 bg-slate-700" />
                    <p className="text-sm text-red-400">{enemyHP} HP</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 h-48 overflow-y-auto space-y-2 border border-slate-700">
                {battleLogs.length === 0 && (
                  <p className="text-center text-slate-400">Бой начинается...</p>
                )}
                {battleLogs.map((log, i) => (
                  <div 
                    key={i}
                    className={`p-2 rounded text-sm animate-slide-in-right ${
                      log.attacker === player.nickname 
                        ? 'bg-amber-500/10 text-amber-300' 
                        : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {getBattleLogIcon(log.type)} <strong>{log.attacker}</strong>{' '}
                    {log.type === 'miss' 
                      ? 'промахнулся!' 
                      : log.type === 'crit'
                      ? `нанёс критический удар ${log.defender} на ${log.damage} урона!`
                      : `атаковал ${log.defender} на ${log.damage} урона!`
                    }
                  </div>
                ))}
              </div>

              {battleResult && (
                <div className={`text-center p-6 rounded-lg ${
                  battleResult === 'win' 
                    ? 'bg-green-500/20 border-2 border-green-500/50' 
                    : 'bg-red-500/20 border-2 border-red-500/50'
                }`}>
                  <div className="text-6xl mb-4">{battleResult === 'win' ? '🏆' : '💀'}</div>
                  <h3 className={`text-3xl font-bold ${
                    battleResult === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {battleResult === 'win' ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
                  </h3>
                  {battleResult === 'win' && (
                    <p className="text-amber-300 mt-2">+25 монет • +30 опыта</p>
                  )}
                  <Button
                    onClick={() => setShowBattleDialog(false)}
                    className="mt-4 bg-slate-700 hover:bg-slate-600"
                  >
                    Закрыть
                  </Button>
                </div>
              )}

              {isBattling && !battleResult && (
                <div className="text-center">
                  <Icon name="Loader2" className="animate-spin text-amber-400 mx-auto" size={32} />
                  <p className="text-slate-400 mt-2">Бой продолжается...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showLeaderboard} onOpenChange={setShowLeaderboard}>
          <DialogContent className="bg-slate-800 border-amber-500/30 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl text-center text-amber-400 flex items-center justify-center gap-2">
                <Icon name="Trophy" size={32} />
                ТАБЛИЦА ЛИДЕРОВ
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leaderboard.map((p) => (
                <div
                  key={p.nickname}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    p.nickname === player.nickname
                      ? 'bg-amber-500/20 border-amber-500/50 scale-105'
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold w-12">{getRankEmoji(p.rank)}</span>
                    <div>
                      <p className={`font-bold ${
                        p.nickname === player.nickname ? 'text-amber-400' : 'text-white'
                      }`}>
                        {p.nickname}
                      </p>
                      <p className="text-sm text-slate-400">
                        Уровень {p.level} • Сила {p.strength}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{p.wins}W</p>
                    <p className="text-red-400 text-sm">{p.losses}L</p>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <header className="text-center space-y-2 animate-slide-up">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500">
            POWER ARENA
          </h1>
          <p className="text-slate-400 text-lg">Прокачай силу. Тренируй питомца. Стань легендой.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <Card className="lg:col-span-2 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-2 border-amber-500/30 backdrop-blur-sm p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold text-amber-400">{player.nickname}</h2>
                <p className="text-slate-400">Уровень {player.level} • Сила {player.strength}</p>
                <p className="text-sm text-slate-500">{player.wins}W / {player.losses}L</p>
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
              
              <Button 
                onClick={startBattle}
                disabled={isBattling}
                className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold py-6 text-lg shadow-lg shadow-red-500/50"
              >
                <Icon name="Swords" className="mr-2" size={20} />
                В БОЙ!
              </Button>
              
              <Button 
                onClick={() => setShowLeaderboard(true)}
                variant="outline" 
                className="border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-semibold py-6 text-lg"
              >
                <Icon name="Trophy" className="mr-2" size={20} />
                Лидеры
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
                {achievements.slice(0, 5).map((ach) => (
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
                <div className="bg-slate-900/50 p-4 rounded-lg border border-green-600 text-center space-y-2">
                  <Icon name="Trophy" className="mx-auto text-green-400" size={32} />
                  <p className="text-3xl font-bold text-green-400">{player.wins}</p>
                  <p className="text-sm text-slate-400">Победы</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-red-600 text-center space-y-2">
                  <Icon name="X" className="mx-auto text-red-400" size={32} />
                  <p className="text-3xl font-bold text-red-400">{player.losses}</p>
                  <p className="text-sm text-slate-400">Поражения</p>
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