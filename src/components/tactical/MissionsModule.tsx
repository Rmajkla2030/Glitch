import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Square, Plus, Trash2, Target } from 'lucide-react';

interface Mission {
  id: string;
  text: string;
  completed: boolean;
  timestamp: number;
}

export const MissionsModule: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('alliance_missions');
    if (saved) {
      try {
        setMissions(JSON.parse(saved));
      } catch (e) {}
    } else {
      setMissions([
        { id: '1', text: 'Verify structural integrity (Postural Check)', completed: false, timestamp: Date.now() },
        { id: '2', text: 'Replenish biological reserves (Hydrate)', completed: false, timestamp: Date.now() },
        { id: '3', text: 'Establish physical reality anchor (Perform Exercise)', completed: false, timestamp: Date.now() }
      ]);
    }
  }, []);

  useEffect(() => {
    if (missions.length > 0) {
      localStorage.setItem('alliance_missions', JSON.stringify(missions));
    }
  }, [missions]);

  const addMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMissions(prev => [
      { id: Date.now().toString(), text: input.trim(), completed: false, timestamp: Date.now() },
      ...prev
    ]);
    setInput('');
  };

  const toggleMission = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const deleteMission = (id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));
  };

  const completedCount = missions.filter(m => m.completed).length;
  const progress = missions.length === 0 ? 0 : Math.round((completedCount / missions.length) * 100);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="mb-2 border-b border-hud-border pb-4">
        <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">TACTICAL OBJECTIVES</h2>
        <p className="text-hud-blue text-sm opacity-60">BRIDGING ALLIANCE DIRECTIVES TO LOCAL REALITY</p>
      </div>

      <div className="hud-glass p-6 rounded border border-hud-cyan/20">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] text-hud-blue tracking-widest uppercase">CAMPAIGN PROGRESS</span>
          <span className="font-mono text-xs text-hud-cyan">{progress}%</span>
        </div>
        <div className="w-full h-2 bg-hud-bg/50 rounded-full overflow-hidden border border-hud-border">
          <motion.div 
            className="h-full bg-hud-cyan"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <form onSubmit={addMission} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ASSIGN NEW LOCAL OPERATION..."
          className="w-full bg-hud-bg/80 border border-hud-border p-4 pr-12 text-hud-cyan font-mono text-sm focus:border-hud-cyan outline-none transition-all rounded"
        />
        <button 
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-hud-blue hover:text-hud-cyan transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-8">
        <AnimatePresence>
          {missions.map((mission) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-4 p-4 rounded border transition-all cursor-pointer group ${
                mission.completed 
                  ? 'bg-hud-cyan/5 border-hud-cyan/20 opacity-60' 
                  : 'hud-glass hover:border-hud-cyan/40'
              }`}
              onClick={() => toggleMission(mission.id)}
            >
              <button className={`flex-shrink-0 transition-colors ${mission.completed ? 'text-hud-cyan' : 'text-hud-blue group-hover:text-hud-cyan'}`}>
                {mission.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
              </button>
              
              <span className={`flex-1 font-mono text-sm transition-all ${
                mission.completed ? 'text-hud-blue line-through' : 'text-white/90'
              }`}>
                {mission.text}
              </span>

              <button 
                onClick={(e) => { e.stopPropagation(); deleteMission(mission.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-hud-blue hover:text-red-400 transition-all flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {missions.length === 0 && (
            <div className="text-center p-8 border border-dashed border-hud-border rounded text-hud-blue/50 font-mono text-sm">
              NO ACTIVE DIRECTIVES. SECTOR CLEAR.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
