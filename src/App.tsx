import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HUDLayout } from './components/layout/HUDLayout';
import { ProtocolCard } from './components/tactical/ProtocolCard';
import { BriefingModule } from './components/tactical/BriefingModule';
import { TerminalModule } from './components/tactical/TerminalModule';
import { PROTOCOLS } from './constants/protocols';
import { Shield, Radio, Box, Target } from 'lucide-react';

export default function App() {
  const [section, setSection] = useState<'overview' | 'protocols' | 'briefings' | 'terminal'>('terminal');
  const [isBooted, setIsBooted] = useState(false);

  useEffect(() => {
    // Artificial "boot" sequence for flavor
    const timer = setTimeout(() => setIsBooted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!isBooted) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center flex-col gap-6 text-hud-cyan font-mono">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <Shield className="w-16 h-16" />
        </motion.div>
        <div className="text-xs tracking-[0.5em] animate-pulse">INITIATING PROTOCOL-42...</div>
        <div className="w-48 h-[1px] bg-hud-cyan/20 relative overflow-hidden">
          <motion.div 
            initial={{ left: '-100%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-0 bottom-0 w-1/2 bg-hud-cyan"
          />
        </div>
      </div>
    );
  }

  return (
    <div onClick={(e: any) => {
      // Simple custom navigation click handler for the NavButtons inside Layout
      const text = e.target.textContent;
      if (text === 'OVERVIEW') setSection('overview');
      if (text === 'CORE PROTOCOLS') setSection('protocols');
      if (text === 'AI BRIEFINGS') setSection('briefings');
      if (text === 'TERMINAL') setSection('terminal');
    }}>
      <HUDLayout activeSection={section}>
        <AnimatePresence mode="wait">
          {section === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard 
                  title="CARRICK SHIELD" 
                  value="ACTIVE" 
                  status="RESONANT" 
                  icon={<Shield className="w-5 h-5" />} 
                />
                <DashboardCard 
                  title="NODE MAGIC" 
                  value="10" 
                  status="HONORED" 
                  icon={<Radio className="w-5 h-5" />} 
                />
                <DashboardCard 
                  title="OXYGEN LEVEL" 
                  value="6900%" 
                  status="SUSTAINED" 
                  icon={<Box className="w-5 h-5" />} 
                />
                <DashboardCard 
                  title="GLITCH STATE" 
                  value="DOCTORING" 
                  status="ALIGNMENT" 
                  icon={<Target className="w-5 h-5" />} 
                />
              </div>

              <div className="hud-glass p-8 rounded border border-hud-cyan/10">
                <h3 className="text-xl font-bold font-mono text-white mb-6 tracking-widest">SYSTEM BROADCAST</h3>
                <div className="space-y-6">
                  <BroadcastItem 
                    time="14:22" 
                    title="Protocol 42 Update" 
                    content="The High Council has ratified the latest encryption standards. All commanders are advised to update local kernels immediately." 
                  />
                  <BroadcastItem 
                    time="11:45" 
                    title="Sector 09 Encounter" 
                    content="Unidentified drone activity detected in the outer rim. Protocol 33 is now in PENDING status." 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {section === 'protocols' && (
            <motion.div
              key="protocols"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 gap-2"
            >
              <div className="mb-6 border-b border-hud-border pb-4">
                <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">THE FOUNDATIONAL PROTOCOLS</h2>
                <p className="text-hud-blue text-sm opacity-60">COUNCIL RATIFIED DIRECTIVES FOR ALLIANCE #42</p>
              </div>
              {PROTOCOLS.map((p, i) => (
                <ProtocolCard key={p.id} protocol={p} index={i} />
              ))}
            </motion.div>
          )}

          {section === 'briefings' && (
            <motion.div
              key="briefings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <BriefingModule />
            </motion.div>
          )}

          {section === 'terminal' && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              <TerminalModule autoRunCommand="molt_resonance_check_42" />
            </motion.div>
          )}
        </AnimatePresence>
      </HUDLayout>
    </div>
  );
}

function DashboardCard({ title, value, status, icon }: any) {
  return (
    <div className="hud-glass p-6 rounded group cursor-pointer hover:border-hud-cyan/40 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="text-hud-cyan group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[9px] font-mono text-green-400 bg-green-400/10 px-2 py-0.5 rounded">{status}</span>
      </div>
      <div>
        <div className="text-[10px] font-mono text-hud-blue tracking-widest uppercase mb-1">{title}</div>
        <div className="text-3xl font-bold text-white font-mono tracking-tighter">{value}</div>
      </div>
    </div>
  );
}

function BroadcastItem({ time, title, content }: any) {
  return (
    <div className="flex gap-4">
      <div className="font-mono text-xs text-hud-cyan pt-1 opacity-50">{time}</div>
      <div>
        <h4 className="font-bold text-hud-cyan text-sm uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-sm text-hud-blue/80 leading-relaxed font-mono">{content}</p>
      </div>
    </div>
  );
}

