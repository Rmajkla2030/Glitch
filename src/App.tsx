import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HUDLayout } from './components/layout/HUDLayout';
import { ProtocolCard } from './components/tactical/ProtocolCard';
import { BriefingModule } from './components/tactical/BriefingModule';
import { ProjectsModule } from './components/tactical/ProjectsModule';
import { MissionsModule } from './components/tactical/MissionsModule';
import { TerminalModule } from './components/tactical/TerminalModule';
import { PROTOCOLS as INITIAL_PROTOCOLS, Protocol } from './constants/protocols';
import { Shield, Radio, Box, Target, Plus, X, CheckSquare, Settings } from 'lucide-react';
import { useAuth } from './lib/AuthContext';
import { collection, onSnapshot, doc, setDoc, writeBatch, getDoc, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, user: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

function useSystemStats() {
  const [battery, setBattery] = useState({ level: 100, charging: false, supported: false });
  const [network, setNetwork] = useState({ type: 'UNKNOWN', downlink: 0, rtt: 0 });

  useEffect(() => {
    // Battery
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        setBattery({ level: Math.round(batt.level * 100), charging: batt.charging, supported: true });
        batt.addEventListener('levelchange', () => {
          setBattery(prev => ({ ...prev, level: Math.round(batt.level * 100) }));
        });
        batt.addEventListener('chargingchange', () => {
          setBattery(prev => ({ ...prev, charging: batt.charging }));
        });
      });
    }

    // Network
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      const updateNet = () => {
        setNetwork({ 
          type: conn.effectiveType?.toUpperCase() || 'WIFI', 
          downlink: conn.downlink,
          rtt: conn.rtt
        });
      };
      updateNet();
      conn.addEventListener('change', updateNet);
      return () => conn.removeEventListener('change', updateNet);
    }
  }, []);

  return { battery, network };
}

export default function App() {
  const { user, appUser } = useAuth();
  const [section, setSection] = useState<'overview' | 'protocols' | 'briefings' | 'projects' | 'objectives' | 'terminal'>('overview');
  const [protocolFilter, setProtocolFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED' | 'PENDING'>('ALL');
  const [protocolSearch, setProtocolSearch] = useState('');
  const [protocolsList, setProtocolsList] = useState<Protocol[]>(INITIAL_PROTOCOLS);
  const [showNewProtocolForm, setShowNewProtocolForm] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ title: '', description: '', priority: 'MODERATE' as 'CRITICAL' | 'HIGH' | 'MODERATE', status: 'PENDING' as 'ACTIVE' | 'ARCHIVED' | 'PENDING' });
  const [isCreating, setIsCreating] = useState(false);
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedProtocols, setSelectedProtocols] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [isBooted, setIsBooted] = useState(false);
  const { battery, network } = useSystemStats();
  
  const [shieldState, setShieldState] = useState({ value: 'DOCTORING', status: 'ALIGNMENT' });

  useEffect(() => {
    // Artificial "boot" sequence for flavor
    const timer = setTimeout(() => setIsBooted(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const checkShieldStatus = async () => {
      try {
        const res = await fetch('/sheild_status');
        const data = await res.json();
        if (data.status === 'AVTIVE' || data.status === 'ACTIVE') {
          setShieldState({ value: 'ACTIVE', status: 'RESONANT #42' });
        } else {
          setShieldState({ value: data.status || 'DOCTORING', status: 'SELF HEALING' });
        }
      } catch (e) {
        setShieldState({ value: 'DOCTORING', status: 'SELF HEALING' });
      }
    };
    checkShieldStatus();
    const intervalId = setInterval(checkShieldStatus, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!user) {
        setProtocolsList(INITIAL_PROTOCOLS);
        return;
    }
    
    // Subscribe to protocols from Firestore
    const unsub = onSnapshot(collection(db, 'protocols'), (snap) => {
      const dbProtocols: Protocol[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as Protocol));
      
      const combined = [...INITIAL_PROTOCOLS, ...dbProtocols];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

      // Sort so newest are first based on createdAt if available, otherwise fallback to id
      const sorted = unique.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        if (timeA !== timeB) return timeB - timeA;
        return b.id.localeCompare(a.id);
      });
      
      setProtocolsList(sorted.filter(p => (p.status as string) !== 'DELETED'));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'protocols', user);
    });

    // Seed missing initial protocols once
    const seedInitialData = async () => {
      try {
        const metaRef = doc(db, 'system', 'protocols_meta');
        const metaSnap = await getDoc(metaRef);
        if (!metaSnap.exists()) {
          const snap = await getDocs(collection(db, 'protocols'));
          const existingIds = new Set(snap.docs.map(d => d.id));
          const batch = writeBatch(db);
          INITIAL_PROTOCOLS.forEach(p => {
            if (!existingIds.has(p.id)) {
              batch.set(doc(db, 'protocols', p.id), { ...p, createdAt: Date.now(), createdBy: 'system' });
            }
          });
          batch.set(metaRef, { seeded: true, timestamp: Date.now() });
          await batch.commit();
        }
      } catch (err) {
        console.error("Error seeding initial protocols:", err);
      }
    };
    seedInitialData();

    return () => unsub();
  }, [user]);

  const handleCreateProtocol = async () => {
    if (!newProtocol.title || !newProtocol.description || !user) return;
    
    setIsCreating(true);
    const newId = `PRT-${Date.now().toString().slice(-4)}`;
    const protocolData = {
      title: newProtocol.title,
      description: newProtocol.description,
      priority: newProtocol.priority,
      status: newProtocol.status,
      createdBy: user.uid,
      createdAt: Date.now()
    };
    
    try {
      await setDoc(doc(db, 'protocols', newId), protocolData);
      setNewProtocol({ title: '', description: '', priority: 'MODERATE', status: 'PENDING' });
      setShowNewProtocolForm(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `protocols/${newId}`, user);
      alert("Error: Could not create protocol (Check console). Ensure you are logged in.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedProtocols(prev => [...prev, id]);
    } else {
      setSelectedProtocols(prev => prev.filter(pId => pId !== id));
    }
  };

  const handleBulkStatusChange = async (newStatus: 'ACTIVE' | 'ARCHIVED' | 'PENDING') => {
    if (!user || selectedProtocols.length === 0) return;
    if (appUser?.role !== 'admin') {
      alert("UNAUTHORIZED: Only admins can execute field-wide status shifts.");
      return;
    }
    setIsBulkUpdating(true);
    try {
      const batch = writeBatch(db);
      for (const id of selectedProtocols) {
        const docRef = doc(db, 'protocols', id);
        batch.update(docRef, { status: newStatus });
      }
      await batch.commit();
      alert(`${selectedProtocols.length} protocols crystallized to ${newStatus} — field updated.`);
      setSelectedProtocols([]);
      setSelectionMode(false);
    } catch (e) {
      console.error(e);
      alert('Error during bulk update.');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  if (window.location.pathname === '/broadcast') {
    return (
      <div className="h-screen w-screen bg-black text-hud-cyan font-mono p-8 flex flex-col justify-center items-center">
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }} transition={{ duration: 4, repeat: Infinity }}>
          <Shield className="w-24 h-24 mb-6" />
        </motion.div>
        <h1 className="text-3xl font-bold tracking-[0.3em] mb-4 text-white">CARRICK HOME SHIELD</h1>
        <div className="text-sm tracking-widest animate-pulse text-green-400 mb-12 border border-green-500/30 bg-green-500/10 px-6 py-3 rounded uppercase font-bold text-center">
          SYSTEM STATUS: {shieldState.status || 'ACTIVE'} <br />
          INTEGRITY: 6900%
        </div>
        <div className="w-full max-w-2xl text-center space-y-4 text-hud-blue/80 text-lg">
          <p>“Life grows even when evil sows. We show the way and life always finds its way home.”</p>
          <div className="flex items-center justify-center gap-4 mt-8 opacity-60">
            <Radio className="w-5 h-5" />
            <span className="tracking-widest text-xs">BROADCASTING FROM ALLIANCE #42</span>
          </div>
        </div>
      </div>
    );
  }

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
      if (text === 'PROJECTS') setSection('projects');
      if (text === 'OBJECTIVES') setSection('objectives');
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
                  title="SIGNAL STRENGTH" 
                  value={network.type !== 'UNKNOWN' ? `${network.downlink}Mbps` : '-14dB'} 
                  status={network.type !== 'UNKNOWN' ? `${network.type}` : 'STABLE'} 
                  icon={<Radio className="w-5 h-5" />} 
                />
                <DashboardCard 
                  title="LOCAL POWER CORE" 
                  value={battery.supported ? `${battery.level}%` : '42.42'} 
                  status={battery.supported && battery.charging ? 'CHARGING' : 'OPTIMAL'} 
                  icon={<Box className="w-5 h-5" />} 
                />
                <DashboardCard 
                  title="GLITCH STATE" 
                  value={shieldState.value} 
                  status={shieldState.status} 
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
              className="grid grid-cols-1 gap-4"
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-hud-border pb-4 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white font-mono tracking-tighter">THE FOUNDATIONAL PROTOCOLS</h2>
                  <p className="text-hud-blue text-sm opacity-60">COUNCIL RATIFIED DIRECTIVES FOR ALLIANCE #42</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  {user && (
                    <button 
                      onClick={() => setShowNewProtocolForm(!showNewProtocolForm)}
                      className="flex items-center gap-1 text-xs text-black bg-hud-cyan px-2 py-1 tracking-widest font-mono rounded hover:bg-opacity-90"
                    >
                      {showNewProtocolForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {showNewProtocolForm ? 'CANCEL' : 'NEW'}
                    </button>
                  )}
                  {user && (
                    <button 
                      onClick={() => {
                        setSelectionMode(!selectionMode);
                        if (selectionMode) setSelectedProtocols([]);
                      }}
                      className={`flex items-center gap-1 text-xs border border-hud-cyan px-2 py-1 tracking-widest font-mono rounded transition-colors ${selectionMode ? 'bg-hud-cyan text-black' : 'text-hud-cyan hover:bg-hud-cyan/20'}`}
                    >
                      <CheckSquare className="w-3 h-3" />
                      {selectionMode ? 'CANCEL SELECT' : 'SELECT'}
                    </button>
                  )}
                  {selectionMode && selectedProtocols.length > 0 && (
                    <div className="flex items-center gap-3">
                       <span className="text-sm font-bold text-hud-cyan tracking-widest font-mono mr-2">{selectedProtocols.length} SELECTED</span>
                       <button onClick={() => handleBulkStatusChange('ACTIVE')} disabled={isBulkUpdating} className="flex items-center justify-center font-bold text-xs bg-green-500/20 text-green-400 border border-green-500 px-4 py-2 hover:bg-green-500/40 rounded transition-colors shadow-[0_0_10px_rgba(34,197,94,0.3)] disabled:opacity-50 tracking-widest">
                         BULK &rarr; ACTIVE
                       </button>
                       <button onClick={() => handleBulkStatusChange('ARCHIVED')} disabled={isBulkUpdating} className="flex items-center justify-center font-bold text-xs bg-orange-500/20 text-orange-400 border border-orange-500 px-4 py-2 hover:bg-orange-500/40 rounded transition-colors shadow-[0_0_10px_rgba(249,115,22,0.3)] disabled:opacity-50 tracking-widest">
                         BULK &rarr; ARCHIVED
                       </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-hud-cyan tracking-widest font-mono">SEARCH:</span>
                    <input
                      type="text"
                      className="bg-black/40 border border-hud-cyan/30 text-hud-cyan font-mono text-xs px-2 py-1 outline-none focus:border-hud-cyan rounded w-32 sm:w-48 placeholder-hud-cyan/30"
                      placeholder="TITLE / DESC..."
                      value={protocolSearch}
                      onChange={(e) => setProtocolSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-hud-cyan tracking-widest font-mono">STATUS:</span>
                    <select 
                      value={protocolFilter} 
                      onChange={(e) => setProtocolFilter(e.target.value as any)}
                      className="bg-black/40 border border-hud-cyan/30 text-hud-cyan font-mono text-xs px-2 py-1 outline-none focus:border-hud-cyan rounded"
                    >
                      <option value="ALL">ALL</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {showNewProtocolForm && user && (
                <div className="mb-6 p-4 border border-hud-cyan/40 rounded bg-black/30 font-mono">
                  <h3 className="text-hud-cyan text-sm mb-4 tracking-widest border-b border-hud-cyan/20 pb-2">CREATE PROTOCOL</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-[10px] text-hud-blue mb-1 tracking-wider">TITLE</label>
                      <input 
                        type="text" 
                        value={newProtocol.title}
                        onChange={(e) => setNewProtocol({...newProtocol, title: e.target.value})}
                        className="w-full bg-black/50 border border-hud-border p-2 text-xs text-white outline-none focus:border-hud-cyan rounded" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-hud-blue mb-1 tracking-wider">PRIORITY</label>
                      <select 
                        value={newProtocol.priority}
                        onChange={(e) => setNewProtocol({...newProtocol, priority: e.target.value as any})}
                        className="w-full bg-black/50 border border-hud-border p-2 text-xs text-hud-cyan outline-none focus:border-hud-cyan rounded"
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MODERATE">MODERATE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-hud-blue mb-1 tracking-wider">STATUS</label>
                      <select 
                        value={newProtocol.status}
                        onChange={(e) => setNewProtocol({...newProtocol, status: e.target.value as any})}
                        className="w-full bg-black/50 border border-hud-border p-2 text-xs text-hud-cyan outline-none focus:border-hud-cyan rounded"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] text-hud-blue mb-1 tracking-wider">DESCRIPTION</label>
                    <textarea 
                      value={newProtocol.description}
                      onChange={(e) => setNewProtocol({...newProtocol, description: e.target.value})}
                      className="w-full bg-black/50 border border-hud-border p-2 text-xs text-white outline-none focus:border-hud-cyan rounded min-h-[80px]"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleCreateProtocol}
                      disabled={isCreating || !newProtocol.title || !newProtocol.description}
                      className="bg-hud-cyan/20 text-hud-cyan border border-hud-cyan/50 px-4 py-2 text-xs hover:bg-hud-cyan/30 rounded font-bold tracking-widest transition-colors duration-300 disabled:opacity-50"
                    >
                      {isCreating ? 'ENGAGING...' : 'ENGAGE'}
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const visibleProtocols = protocolsList
                  .filter((p: Protocol) => protocolFilter === 'ALL' || p.status === protocolFilter)
                  .filter((p: Protocol) => {
                    if (!protocolSearch) return true;
                    const q = protocolSearch.toLowerCase();
                    return p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
                  });
                  
                return (
                  <div className="grid grid-cols-1 gap-2">
                    {selectionMode && (
                      <div className="flex items-center gap-4 bg-hud-cyan/10 border border-hud-cyan/30 p-3 rounded mb-2">
                        <input 
                          type="checkbox" 
                          className="accent-hud-cyan cursor-pointer w-4 h-4"
                          checked={visibleProtocols.length > 0 && visibleProtocols.every(p => selectedProtocols.includes(p.id))}
                          onChange={(e) => {
                            const visible = visibleProtocols.map(p => p.id);
                            if (e.target.checked) {
                              setSelectedProtocols(Array.from(new Set([...selectedProtocols, ...visible])));
                            } else {
                              setSelectedProtocols(selectedProtocols.filter(id => !visible.includes(id)));
                            }
                          }}
                        />
                        <span className="text-xs font-mono tracking-widest text-hud-cyan">SELECT ALL</span>
                      </div>
                    )}
                    {visibleProtocols.map((p: Protocol, i: number) => (
                      <ProtocolCard 
                        key={p.id} 
                        protocol={p} 
                        index={i} 
                        selectable={selectionMode}
                        isSelected={selectedProtocols.includes(p.id)}
                        onToggleSelect={handleToggleSelect}
                      />
                    ))}
                    {visibleProtocols.length === 0 && (
                      <div className="p-4 text-center text-hud-blue/50 font-mono text-sm border border-hud-border/30 rounded">
                        NO PROTOCOLS FOUND FOR CURRENT FILTER.
                      </div>
                    )}
                  </div>
                );
              })()}
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

          {section === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full overflow-y-auto pr-2 custom-scrollbar"
            >
              <ProjectsModule />
            </motion.div>
          )}

          {section === 'objectives' && (
            <motion.div
              key="objectives"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full overflow-y-auto pr-2 custom-scrollbar"
            >
              <MissionsModule />
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

