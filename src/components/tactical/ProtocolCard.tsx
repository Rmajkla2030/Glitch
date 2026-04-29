import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronRight, ShieldAlert, ShieldCheck, Edit2, Check, X, History, RotateCcw, Play } from 'lucide-react';
import { Protocol, ProtocolVersion } from '../../constants/protocols';
import { useAuth } from '../../lib/AuthContext';
import { doc, getDoc, updateDoc, setDoc, writeBatch, collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ProtocolCardProps {
  protocol: Protocol;
  index: number;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string, selected: boolean) => void;
}

export const ProtocolCard: React.FC<ProtocolCardProps> = ({ protocol, index, selectable, isSelected, onToggleSelect }) => {

  const { user, appUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState<ProtocolVersion[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [editForm, setEditForm] = useState<Protocol>(protocol);
  const [isSaving, setIsSaving] = useState(false);
  
  // Protocol 33 diagnostic state
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticInput, setDiagnosticInput] = useState('');
  const [diagnosticOutput, setDiagnosticOutput] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Allow edit if admin or if they created it. Allow admin to edit built-in protocols.
  const isAuthorized = user && (appUser?.role === 'admin' || protocol.createdBy === user.uid);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case 'HIGH': return <ShieldCheck className="w-5 h-5 text-hud-cyan" />;
      default: return <ChevronRight className="w-5 h-5 text-hud-blue" />;
    }
  };

  const startDiagnostics = async () => {
    if (!diagnosticInput) return;
    setIsDiagnosing(true);
    setDiagnosticOutput('');
    try {
      const res = await fetch('/api/protocol33/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: diagnosticInput })
      });
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (reader && !done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          
          if (value) {
              const chunk = decoder.decode(value, { stream: true });
              const lines = chunk.split('\n');
              for (const line of lines) {
                  if (line.startsWith('data: ')) {
                      const dataStr = line.substring(6);
                      if (dataStr === '[DONE]') break;
                      try {
                          const data = JSON.parse(dataStr);
                          if (data.text) setDiagnosticOutput(prev => prev + data.text);
                          if (data.error) setDiagnosticOutput(prev => prev + "\n[ERROR: " + data.error + "]");
                      } catch (e) {}
                  }
              }
          }
      }
    } catch (e: any) {
        setDiagnosticOutput(prev => prev + "\n[CRITICAL FAILURE: " + e.message + "]");
    }
    setIsDiagnosing(false);
  };

  const loadHistory = async () => {
    if (!showHistory) {
      setShowHistory(true);
      setIsLoadingHistory(true);
      try {
        const q = query(collection(db, 'protocols', protocol.id, 'versions'), orderBy('updatedAt', 'desc'));
        const snap = await getDocs(q);
        const v = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProtocolVersion));
        setVersions(v);
      } catch (e) {
        console.error("Error loading history", e);
      }
      setIsLoadingHistory(false);
    } else {
      setShowHistory(false);
    }
  };

  const handleSave = async (dataToSave: Partial<Protocol> = editForm, isRevert = false) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(db);
      const docRef = doc(db, 'protocols', protocol.id);
      const snap = await getDoc(docRef);
      
      const newTitle = dataToSave.title || protocol.title;
      const newDesc = dataToSave.description || protocol.description;
      const newPriority = dataToSave.priority || protocol.priority;
      const newStatus = dataToSave.status || protocol.status;

      if (snap.exists()) {
        const oldData = snap.data() as Protocol;
        batch.update(docRef, {
          title: newTitle,
          description: newDesc,
          priority: newPriority,
          status: newStatus
        });
        
        // Push old data to versions log
        const versionId = `VER-${Date.now()}`;
        const versionRef = doc(db, 'protocols', protocol.id, 'versions', versionId);
        batch.set(versionRef, {
          title: oldData.title || protocol.title,
          description: oldData.description || protocol.description,
          priority: oldData.priority || protocol.priority,
          status: oldData.status || protocol.status,
          updatedBy: user.uid,
          updatedAt: Date.now(),
          action: isRevert ? 'REVERTED' : 'EDITED'
        });
      } else {
        batch.set(docRef, {
          title: newTitle,
          description: newDesc,
          priority: newPriority,
          status: newStatus,
          createdBy: user.uid,
          createdAt: Date.now()
        });
        
        // Save initial memory state to versions log
        const versionId = `VER-${Date.now()}`;
        const versionRef = doc(db, 'protocols', protocol.id, 'versions', versionId);
        batch.set(versionRef, {
          title: protocol.title,
          description: protocol.description,
          priority: protocol.priority,
          status: protocol.status,
          updatedBy: user.uid,
          updatedAt: Date.now()
        });
      }
      
      await batch.commit();
      setIsEditing(false);
      if (isRevert) {
        setShowHistory(false);
        alert('Protocol reverted successfully.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating protocol from network layer');
    }
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative p-6 mb-4 hud-glass transition-all hover:bg-hud-cyan/5"
    >
      <div className="flex items-start gap-4">
        {selectable && (
          <div className="flex-shrink-0 mt-2">
            <input 
              type="checkbox" 
              checked={isSelected || false}
              onChange={(e) => onToggleSelect && onToggleSelect(protocol.id, e.target.checked)}
              className="accent-hud-cyan cursor-pointer w-4 h-4"
            />
          </div>
        )}
        <div className="flex-shrink-0 mt-1">
          {getPriorityIcon(isEditing ? editForm.priority : protocol.priority)}

        </div>
        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-hud-cyan tracking-widest">PROTOCOL-ID: {protocol.id}</span>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <select 
                  value={editForm.status} 
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                  className="bg-black/50 border border-hud-cyan text-[9px] px-1 py-0.5 rounded font-mono text-hud-cyan outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PENDING">PENDING</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              ) : (
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono ${
                  protocol.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {protocol.status}
                </span>
              )}
              {isAuthorized && !isEditing && (
                <>
                  <button onClick={loadHistory} className="text-hud-blue hover:text-hud-cyan transition-colors" title="View History">
                    <History className="w-3 h-3" />
                  </button>
                  <button onClick={() => setIsEditing(true)} className="text-hud-blue hover:text-hud-cyan transition-colors" title="Edit Protocol">
                    <Edit2 className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-3 relative z-10 w-full pr-4">
              <input 
                type="text" 
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                className="w-full bg-black/60 border border-hud-border px-2 py-1 text-sm font-bold text-white font-mono outline-none focus:border-hud-cyan rounded"
              />
              <select 
                value={editForm.priority}
                onChange={(e) => setEditForm({...editForm, priority: e.target.value as any})}
                className="w-full bg-black/60 border border-hud-border px-2 py-1 text-xs text-hud-cyan outline-none focus:border-hud-cyan rounded"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MODERATE">MODERATE</option>
              </select>
              <textarea 
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full bg-black/60 border border-hud-border px-2 py-1 text-sm text-hud-cyan outline-none focus:border-hud-cyan rounded min-h-[60px]"
              />
              <div className="flex justify-end gap-2 text-xs font-mono tracking-widest mt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-2 py-1 text-hud-blue border border-hud-border hover:bg-white/5 rounded"
                >
                  <X className="w-3 h-3 inline mr-1" /> CANCEL
                </button>
                <button 
                  onClick={() => handleSave(editForm, false)}
                  disabled={isSaving}
                  className="px-2 py-1 text-hud-cyan border border-hud-cyan/50 hover:bg-hud-cyan/10 rounded"
                >
                  <Check className="w-3 h-3 inline mr-1" /> {isSaving ? 'YIELDING...' : 'SAVE'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-hud-cyan transition-colors uppercase">
                {protocol.title}
              </h3>
              <p className="text-sm text-hud-blue leading-relaxed opacity-80 italic">
                "{protocol.description}"
              </p>

              {protocol.id === "33" && (
                <div className="mt-4 border border-hud-cyan/30 rounded bg-black/60 p-3">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs text-hud-cyan font-mono tracking-widest flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> AUTONOMOUS RESPONSE DELTA ONLINE
                    </h4>
                    <button 
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                      className="text-[9px] bg-hud-cyan/10 hover:bg-hud-cyan/30 text-hud-cyan border border-hud-cyan px-2 py-1 rounded font-mono"
                    >
                      {showDiagnostics ? 'CLOSE TERMINAL' : 'ENGAGE DIAGNOSTICS'}
                    </button>
                  </div>
                  
                  {showDiagnostics && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={diagnosticInput}
                          onChange={(e) => setDiagnosticInput(e.target.value)}
                          placeholder="INPUT ANOMALY / PROMPT INJECTION..."
                          className="flex-1 bg-black/50 border border-hud-cyan/50 text-hud-cyan text-xs font-mono px-2 py-1 outline-none"
                          onKeyDown={(e) => e.key === 'Enter' && startDiagnostics()}
                        />
                        <button 
                          onClick={startDiagnostics}
                          disabled={!diagnosticInput || isDiagnosing}
                          className="bg-hud-cyan text-black px-3 py-1 font-bold font-mono text-xs hover:bg-opacity-90 disabled:opacity-50 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> {isDiagnosing ? '...' : 'SCAN'}
                        </button>
                      </div>
                      <div className="h-40 overflow-y-auto bg-black p-2 border border-hud-cyan/20 rounded font-mono text-[10px] text-hud-cyan">
                        {diagnosticOutput ? (
                          <div className="whitespace-pre-wrap">{diagnosticOutput}</div>
                        ) : (
                          <div className="opacity-50">SYSTEM AWAITING INPUT...</div>
                        )}
                        {isDiagnosing && <span className="animate-pulse">_</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showHistory && (
                <div className="mt-4 border border-hud-border p-3 rounded bg-black/50">
                  <h4 className="text-xs text-hud-cyan font-mono tracking-widest mb-3 border-b border-hud-border pb-1">VERSION HISTORY LOG</h4>
                  {isLoadingHistory ? (
                    <div className="text-xs font-mono text-hud-blue animate-pulse">QUERYING LEDGER...</div>
                  ) : versions.length === 0 ? (
                    <div className="text-xs font-mono text-hud-blue/50">NO PREVIOUS VERSIONS FOUND.</div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                      {versions.map((ver) => (
                        <div key={ver.id} className="text-xs font-mono p-2 border border-hud-border/50 rounded flex gap-2">
                          <div className="flex-1">
                            <div className="text-[9px] text-hud-cyan opacity-80 mb-1 flex justify-between">
                              <span>
                                VER: {new Date(ver.updatedAt).toLocaleString()}
                                {ver.action === 'REVERTED' && <span className="ml-2 text-yellow-500 font-bold">[REVERTED]</span>}
                              </span>
                              <span className="truncate w-24 text-right">BY: {ver.updatedBy}</span>
                            </div>
                            <div className="text-white truncate" title={ver.title}>{ver.title}</div>
                            <div className="text-hud-blue/70 truncate flex gap-2">
                              <span>{ver.priority}</span> | <span>{ver.status}</span>
                            </div>
                          </div>
                          {isAuthorized && (
                            <button
                                onClick={() => handleSave(ver, true)}
                                disabled={isSaving}
                                className="flex-shrink-0 text-hud-cyan border border-hud-cyan/30 px-2 py-1 flex items-center gap-1 rounded hover:bg-hud-cyan/10 self-center"
                                title="Revert to this version"
                            >
                                <RotateCcw className="w-3 h-3" /> <span className="text-[10px] tracking-widest font-bold">REVERT</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* HUD Accents */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-hud-border group-hover:border-hud-cyan transition-colors pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-hud-border group-hover:border-hud-cyan transition-colors pointer-events-none" />
    </motion.div>
  );
};
