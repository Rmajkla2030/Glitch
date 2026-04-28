import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Send, Loader2 } from 'lucide-react';
import { getTacticalBriefing } from '../../services/aiService';

export const BriefingModule: React.FC = () => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('ALLIANCE NODES NOMINAL');

  const fetchBriefing = async () => {
    setLoading(true);
    const result = await getTacticalBriefing(status);
    setBriefing(result);
    setLoading(false);
  };

  const formatIntel = (text: string) => {
    // Basic formatting for the AI output to look more techy
    return text.split('\n').map((line, i) => (
      <div key={i} className="mb-2 font-mono text-sm">
        {line.startsWith('[HEADING]') ? (
          <span className="text-hud-cyan font-bold block mb-4 mt-2 border-b border-hud-cyan/20 pb-1">
            {line.replace('[HEADING]', '').trim()}
          </span>
        ) : line.startsWith('[INTEL]') ? (
          <div className="pl-4 border-l border-hud-blue/30 py-2">
            <span className="text-hud-blue font-semibold uppercase text-xs block mb-1">STRATEGIC INTEL:</span>
            <span className="opacity-90">{line.replace('[INTEL]', '').trim()}</span>
          </div>
        ) : (
          <span className="opacity-70">{line}</span>
        )}
      </div>
    ));
  };

  return (
    <div className="hud-glass p-8 rounded border border-hud-cyan/20 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-8 border-b border-hud-border pb-4">
        <Cpu className="w-8 h-8 text-hud-cyan" />
        <div>
          <h2 className="text-xl font-bold font-mono tracking-widest uppercase">Strat-AI Briefing</h2>
          <p className="text-xs text-hud-blue font-mono opacity-60">HEURISTIC ANALYSIS V4.2.0</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar mb-6 min-h-[300px]">
        {loading ? (
          <div className="h-full flex flex-center flex-col items-center justify-center text-hud-cyan gap-4">
            <Loader2 className="w-12 h-12 animate-spin opacity-50" />
            <span className="font-mono text-xs animate-pulse tracking-widest uppercase">Intercepting Fleet Transmissions...</span>
          </div>
        ) : briefing ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-hud-blue leading-relaxed"
          >
            {formatIntel(briefing)}
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-hud-blue/40 text-center">
            <ShieldIcon />
            <p className="mt-4 font-mono text-sm">SECURE LINK READY. REQUEST INTEL UPLINK.</p>
          </div>
        )}
      </div>

      <div className="mt-auto space-y-4">
        <div className="relative">
          <input 
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="INPUT SECTOR STATUS..."
            className="w-full bg-hud-bg/80 border border-hud-border p-4 pr-12 text-hud-cyan font-mono text-sm focus:border-hud-cyan outline-none transition-all rounded"
          />
          <TerminalIcon />
        </div>
        
        <button 
          onClick={fetchBriefing}
          disabled={loading}
          className="w-full bg-hud-cyan/10 hover:bg-hud-cyan/20 border border-hud-cyan text-hud-cyan p-4 font-mono tracking-[0.3em] font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          {loading ? 'PROCESSING...' : 'REQUEST TACTICAL BRIEF'}
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const ShieldIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const TerminalIcon = () => (
  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-hud-cyan">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  </div>
);
