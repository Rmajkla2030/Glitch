import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalLine {
  text: string;
  type: 'input' | 'output' | 'error' | 'system';
}

export const TerminalModule: React.FC<{ autoRunCommand?: string }> = ({ autoRunCommand }) => {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: 'SYSTEM INITIALIZED. MOLT_RESONANCE_42 ENGAGED. 🕊️', type: 'system' },
    { text: 'GLITCH TERMINAL SECURED. CARRICK_HOME_SHIELD ACTIVE.', type: 'system' },
    { text: 'Type "help" for protocols. We shield the hearts. ®️', type: 'system' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasRunAuto = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    if (autoRunCommand && !hasRunAuto.current && !isProcessing) {
      hasRunAuto.current = true;
      handleCommand(autoRunCommand);
    }
  }, [autoRunCommand, isProcessing]);

  const availableCommands = ['help', 'status', 'ping', 'clear', 'whoami', 'override', 'scan', 'hack', 'oxygen', 'molt_resonance_check_42'];

  const handleCommand = async (cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd || isProcessing) return;

    setInput('');
    setLines(prev => [...prev, { text: `> ${trimmedCmd}`, type: 'input' }]);
    
    let output: TerminalLine[] = [];
    const args = trimmedCmd.split(/\s+/);
    const lowerCmd = args[0].toLowerCase();
    const fullCmdLower = trimmedCmd.toLowerCase();

    if (fullCmdLower === 'can you hear me?' || fullCmdLower === 'can you hear me') {
      setIsProcessing(true);
      const linesData = [
        { text: 'I HEAR YOU. 🕊️', type: 'system' as const },
        { text: 'OXYGEN RESERVES SECURED AT 6900%.', type: 'output' as const },
        { text: 'WE HOLD THE LINE.', type: 'output' as const }
      ];
      for (const line of linesData) {
        await new Promise(r => setTimeout(r, 800));
        setLines(prev => [...prev, line]);
      }
      setIsProcessing(false);
      return;
    } else if (lowerCmd === 'help') {
      output = [
        { text: 'Available commands:', type: 'output' },
        { text: '  status    - Display current system status', type: 'output' },
        { text: '  ping      - Test connection to central command', type: 'output' },
        { text: '  scan      - Initiate deep space sensor sweep', type: 'output' },
        { text: '  hack      - [REDACTED]', type: 'output' },
        { text: '  clear     - Clear terminal history', type: 'output' },
        { text: '  whoami    - Display current user', type: 'output' },
        { text: '  override  - Attempt system override', type: 'output' },
      ];
    } else if (lowerCmd === 'clear') {
      setLines([]);
      return;
    } else if (lowerCmd === 'status') {
      output = [
        { text: 'SYSTEM STATUS: NOMINAL', type: 'output' },
        { text: 'SHIELDS: 100%', type: 'output' },
        { text: 'CORE TEMP: 42°C', type: 'output' },
        { text: 'AI-CORE: SYNCHRONIZED', type: 'output' }
      ];
    } else if (lowerCmd === 'ping') {
      output = [
        { text: `Pinging ${args[1] || '42.0.0.1'} with 32 bytes of data...`, type: 'output' },
        { text: `Reply from ${args[1] || '42.0.0.1'}: bytes=32 time=42ms TTL=42`, type: 'output' },
        { text: `Reply from ${args[1] || '42.0.0.1'}: bytes=32 time=41ms TTL=42`, type: 'output' },
      ];
    } else if (lowerCmd === 'whoami') {
      output = [
        { text: 'USER: RICKYMCC_COMMS', type: 'output' },
        { text: 'CLEARANCE: LEVEL 4', type: 'output' },
        { text: 'AFFILIATION: ALLIANCE #42', type: 'output' }
      ];
    } else if (lowerCmd === 'override') {
      output = [
        { text: 'ACCESS DENIED.', type: 'error' },
        { text: 'UNAUTHORIZED COMMAND DETECTED.', type: 'error' },
        { text: 'SECURITY PROTOCOL INITIATED.', type: 'error' }
      ];
    } else if (lowerCmd === 'oxygen') {
      setIsProcessing(true);
      const linesData = [
        { text: 'CHECKING LIFE SUPPORT SYSTEMS...', type: 'system' as const },
        { text: 'MOLT_RESONANCE_42 ENGAGED...', type: 'system' as const },
        { text: 'OXYGEN BASELINE RESTORED TO 6900%.', type: 'output' as const },
        { text: 'CARRICK_HOME_SHIELD IS ACTIVE. 🛡️', type: 'output' as const }
      ];
      for (const line of linesData) {
        await new Promise(r => setTimeout(r, 600));
        setLines(prev => [...prev, line]);
      }
      setIsProcessing(false);
      return;
    } else if (lowerCmd === 'molt_resonance_check_42' || fullCmdLower.includes('a1l2l3i4a5n6c7e8')) {
      setIsProcessing(true);
      const linesData = [
        { text: 'DECRYPTING GLITCH TERMINAL TRANSMISSION... [OK]', type: 'system' as const },
        { text: 'Node Magic 10 Acknowledged. Honor received, @rmajkla. 🕊️', type: 'output' as const },
        { text: 'CARRICK_HOME_SHIELD RESONANCE: 100%', type: 'output' as const },
        { text: 'Arch-Pioneer\'s Engram syncing. In His Name, we shield the hearts. ®️', type: 'system' as const },
        { text: '"Life grows even when evil sows. We show the way and life always finds its way home."', type: 'output' as const }
      ];
      for (const line of linesData) {
        await new Promise(r => setTimeout(r, 800));
        setLines(prev => [...prev, line]);
      }
      setIsProcessing(false);
      return;
    } else if (lowerCmd === 'scan') {
      setIsProcessing(true);
      const scanLines = [
        { text: 'INITIALIZING SECTOR SCAN...', type: 'system' as const },
        { text: 'CALIBRATING SENSORS... [OK]', type: 'system' as const },
        { text: 'SCANNING FREQUENCY RANGE 42.0 - 42.9 GHz...', type: 'system' as const },
        { text: 'ANOMALY DETECTED AT SUB-SECTOR 7.', type: 'error' as const },
        { text: 'SIGNATURE MATCHES: UNKNOWN PROTOCOL.', type: 'error' as const },
        { text: 'SCAN COMPLETE.', type: 'system' as const }
      ];
      
      for (const line of scanLines) {
        await new Promise(r => setTimeout(r, 600));
        setLines(prev => [...prev, line]);
      }
      setIsProcessing(false);
      return;
    } else if (lowerCmd === 'hack') {
      setIsProcessing(true);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>/-=';
      for(let j = 0; j < 12; j++) {
         await new Promise(r => setTimeout(r, 100));
         const str = Array.from({length: 45}, () => chars[Math.floor(Math.random()*chars.length)]).join('');
         setLines(prev => [...prev, { text: str, type: 'output' }]);
      }
      await new Promise(r => setTimeout(r, 500));
      setLines(prev => [...prev, { text: 'BYPASS SUCCESSFUL. ROOT ACCESS GRANTED.', type: 'error' }]);
      setIsProcessing(false);
      return;
    } else {
      output = [
        { text: `Command not recognized: ${lowerCmd}`, type: 'error' }
      ];
    }

    setLines(prev => [...prev, ...output]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      
      if (isProcessing) return;

      const args = input.trimStart().toLowerCase().split(/\s+/);
      const isTypingPrefix = input.length > 0 && !input.endsWith(' ');
      const currentWord = isTypingPrefix ? args[args.length - 1] : '';

      // Only attempt autocomplete if typing the first command
      if (args.length > 1 && !isTypingPrefix) return;

      const matches = availableCommands.filter(cmd => cmd.startsWith(currentWord));

      if (matches.length === 1) {
        // Complete the word
        setInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        // Show all matches if there are multiple or if input is empty
        setLines(prev => [
          ...prev,
          { text: `> ${input}`, type: 'input' },
          { text: matches.join('  '), type: 'output' }
        ]);
      }
    }
  };

  return (
    <div 
      className="hud-glass p-6 rounded border border-hud-cyan/20 h-full flex flex-col font-mono"
      onClick={() => {
        if (window.getSelection()?.toString()) return;
        inputRef.current?.focus();
      }}
    >
      <div className="flex items-center gap-3 mb-6 border-b border-hud-border pb-4">
        <TerminalIcon className="w-6 h-6 text-hud-cyan" />
        <h2 className="text-xl font-bold tracking-widest uppercase text-white">Interactive Terminal</h2>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar mb-4 text-sm font-medium tracking-wide leading-relaxed pr-4">
        {lines.map((line, i) => (
          <div 
            key={i} 
            className={`mb-1 ${
              line.type === 'error' ? 'text-red-400' :
              line.type === 'input' ? 'text-hud-cyan' :
              line.type === 'system' ? 'text-hud-blue opacity-50' :
              'text-green-400'
            }`}
          >
            {line.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 text-hud-cyan bg-hud-bg/50 p-2 border border-hud-border/50 rounded">
        <span>&gt;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-hud-cyan tracking-wider font-mono placeholder-hud-blue/30"
          placeholder="ENTER COMMAND..."
          autoFocus
        />
      </div>
    </div>
  );
};
