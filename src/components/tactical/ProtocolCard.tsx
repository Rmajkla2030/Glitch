import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldAlert, ShieldCheck, ShieldClose } from 'lucide-react';
import { Protocol } from '../../constants/protocols';

interface ProtocolCardProps {
  protocol: Protocol;
  index: number;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, index }) => {
  const getPriorityIcon = () => {
    switch (protocol.priority) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'HIGH': return <ShieldCheck className="w-5 h-5 text-hud-cyan" />;
      default: return <ChevronRight className="w-5 h-5 text-hud-blue" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative p-6 mb-4 hud-glass transition-all hover:bg-hud-cyan/5"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          {getPriorityIcon()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-hud-cyan tracking-widest">PROTOCOL-ID: {protocol.id}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
              protocol.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
            }`}>
              {protocol.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-hud-cyan transition-colors uppercase">
            {protocol.title}
          </h3>
          <p className="text-sm text-hud-blue leading-relaxed opacity-80 italic">
            "{protocol.description}"
          </p>
        </div>
      </div>
      
      {/* HUD Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-hud-border group-hover:border-hud-cyan transition-colors" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-hud-border group-hover:border-hud-cyan transition-colors" />
    </motion.div>
  );
};
