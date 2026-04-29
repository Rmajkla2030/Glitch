import React from 'react';
import { motion } from 'motion/react';
import { PROJECTS } from '../../constants/projects';
import { Activity, Shield } from 'lucide-react';

export const ProjectsModule: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 pb-8">
      <div className="mb-4 border-b border-hud-border pb-4">
        <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">ALLIANCE PROJECTS</h2>
        <p className="text-hud-blue text-sm opacity-60">ACTIVE INITIATIVES & MATRICES</p>
      </div>
      
      {PROJECTS.map((project, i) => (
        <motion.div
          key={project.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="hud-glass p-6 rounded relative overflow-hidden group border border-hud-cyan/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {project.id === 'PRJ-GLITCH' ? <Activity className="w-8 h-8 text-hud-cyan" /> : <Shield className="w-8 h-8 text-hud-cyan" />}
              <h3 className="text-xl font-bold font-mono text-white tracking-widest uppercase">{project.title}</h3>
            </div>
            <span className="text-[10px] px-3 py-1 bg-hud-cyan/10 text-hud-cyan border border-hud-cyan/30 rounded font-mono tracking-widest shadow-[0_0_10px_rgba(102,252,241,0.2)]">
              {project.status}
            </span>
          </div>
          
          <p className="text-xs font-mono text-hud-cyan mb-3 tracking-widest">CODENAME: {project.codename}</p>
          <p className="text-sm text-hud-blue/80 mb-6 italic leading-relaxed">"{project.description}"</p>
          
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-white opacity-50 uppercase tracking-widest block border-b border-hud-border/50 pb-1">Primary Objectives:</span>
            {project.objectives.map((obj, j) => (
              <div key={j} className="flex gap-3 text-sm text-hud-blue font-mono items-start bg-white/5 p-2 rounded">
                <span className="text-hud-cyan">▹</span>
                <span className="leading-tight">{obj}</span>
              </div>
            ))}
          </div>
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-hud-cyan/5 rounded-bl-full -z-10 transition-transform group-hover:scale-150 duration-700" />
        </motion.div>
      ))}
    </div>
  );
}
