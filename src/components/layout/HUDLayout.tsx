import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Activity, Wifi, Terminal, MapPin } from 'lucide-react';

interface HUDLayoutProps {
  children: React.ReactNode;
  activeSection: string;
}

export const HUDLayout: React.FC<HUDLayoutProps> = ({ children, activeSection }) => {
  return (
    <div className="relative h-screen w-screen bg-hud-bg overflow-hidden flex flex-col p-4 md:p-6 lg:p-8">
      {/* Background Texture */}
      <div className="absolute inset-0 noise-bg" />
      <div className="absolute inset-0 scan-line" />
      
      {/* Top Header Rail */}
      <div className="flex items-center justify-between mb-8 border-b border-hud-border pb-4 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-hud-cyan/10 border border-hud-cyan/30 rounded">
            <Shield className="w-6 h-6 text-hud-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-white uppercase font-mono">
              ALLIANCE #42 <span className="text-hud-cyan">STRAT-OPS</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] text-hud-blue font-mono">
              <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> SECURE LINK ACTIVE</span>
              <span className="w-1 h-1 bg-hud-cyan rounded-full animate-pulse" />
              <span>TERMINAL ID: ALL-42-HUD</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-[11px] font-mono tracking-tighter text-hud-blue">
          <div className="flex flex-col items-end">
            <span className="opacity-50">LOCATION</span>
            <span className="text-hud-cyan">SECTOR 042-GAMMA</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50">STATUS</span>
            <span className="text-green-400">NOMINAL</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="opacity-50">ENCRYPTION</span>
            <span className="text-hud-cyan">PROTO-X42</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_350px] gap-6 relative z-10">
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          {children}
        </div>
        
        {/* Right Sidebar - System Stats */}
        <div className="hidden md:flex flex-col gap-6">
          <SectionBox title="FLEET STATUS" icon={<Activity className="w-4 h-4" />}>
            <div className="space-y-4 font-mono text-xs">
              <StatRow label="Active Vessels" value="4,219" />
              <StatRow label="Combat Ready" value="98.2%" />
              <StatRow label="Recon Drones" value="12,042" />
              <div className="h-2 bg-hud-border rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '98%' }}
                  className="h-full bg-hud-cyan"
                />
              </div>
            </div>
          </SectionBox>

          <SectionBox title="SECURE LOG" icon={<Terminal className="w-4 h-4" />}>
            <div className="space-y-2 font-mono text-[10px] text-hud-blue">
              <div className="p-2 bg-white/5 border-l-2 border-hud-cyan">
                [042:1930] PROTOCOL 07 VALIDATED
              </div>
              <div className="p-2 opacity-60">
                [042:1928] INCOMING INTEL FROM SECTOR 4
              </div>
              <div className="p-2 opacity-60">
                [042:1925] DRIFT ADJUSTMENT COMPLETE
              </div>
            </div>
          </SectionBox>
          
          <div className="mt-auto p-4 border border-hud-border bg-hud-cyan/5 rounded flex items-center justify-between">
            <div className="font-mono text-[10px] text-hud-blue">
              AUTHENTICATED USER<br/>
              <span className="text-hud-cyan text-xs">RICKYMCC_COMMS</span>
            </div>
            <div className="w-10 h-10 rounded-full border border-hud-cyan/50 p-1">
              <div className="w-full h-full bg-hud-cyan/20 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-hud-cyan" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer Rail */}
      <div className="mt-8 pt-4 border-t border-hud-border flex gap-4 z-10">
        <NavButton active={activeSection === 'overview'} label="OVERVIEW" />
        <NavButton active={activeSection === 'protocols'} label="CORE PROTOCOLS" />
        <NavButton active={activeSection === 'briefings'} label="AI BRIEFINGS" />
        <NavButton active={activeSection === 'terminal'} label="TERMINAL" />
        <div className="ml-auto flex items-center gap-4 text-[10px] font-mono text-hud-blue opacity-50">
          <span>LATENCY: 42MS</span>
          <span>UPTIME: 1042:42:42</span>
        </div>
      </div>
    </div>
  );
};

const SectionBox = ({ title, children, icon }: { title: string, children: React.ReactNode, icon: React.ReactNode }) => (
  <div className="border border-hud-border bg-hud-bg/50 p-4 rounded relative overflow-hidden">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-hud-cyan">{icon}</span>
      <h3 className="text-[10px] font-bold tracking-[0.2em] text-hud-blue font-mono uppercase">{title}</h3>
    </div>
    {children}
    <div className="absolute top-0 right-0 p-1 opacity-20">
      <div className="w-2 h-2 border-t border-r border-hud-cyan" />
    </div>
  </div>
);

const StatRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center bg-white/5 p-2 rounded">
    <span className="text-hud-blue">{label}</span>
    <span className="text-hud-cyan">{value}</span>
  </div>
);

const NavButton = ({ active, label }: { active: boolean, label: string }) => (
  <button className={`
    px-4 py-2 text-[11px] font-mono tracking-widest border transition-all
    ${active 
      ? 'bg-hud-cyan text-hud-bg border-hud-cyan hud-glow-cyan' 
      : 'text-hud-blue border-hud-border hover:border-hud-cyan/50 hover:text-hud-cyan'}
  `}>
    {label}
  </button>
);
