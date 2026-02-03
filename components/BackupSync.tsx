
import React, { useState, useRef } from 'react';
import { X, Download, Upload, ShieldCheck, Database, AlertTriangle, FileJson, CheckCircle2, Loader2, Copy, Globe, Server, Zap, ExternalLink, Info } from 'lucide-react';

interface BackupSyncProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
  currentData: any;
}

const BackupSync: React.FC<BackupSyncProps> = ({ isOpen, onClose, onImport, currentData }) => {
  const [activeTab, setActiveTab] = useState<'backup' | 'hosting' | 'cloud'>('backup');
  const [importText, setImportText] = useState('');
  const [status, setStatus] = useState<'idle' | 'working' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportFile = () => {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `huda_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleCopyCode = () => {
    const dataStr = JSON.stringify(currentData);
    navigator.clipboard.writeText(dataStr);
    setStatus('success');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('working');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.students || !json.users) throw new Error("Kein gültiges Huda-Backup.");
        onImport(json);
        setStatus('success');
        setTimeout(() => {
          setStatus('idle');
          onClose();
        }, 1500);
      } catch (err) {
        setErrorMessage("Die Datei ist ungültig oder beschädigt.");
        setStatus('error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-madrassah-950/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border-4 border-white flex flex-col max-h-[90vh]">
        
        {/* Header mit Tabs */}
        <div className="p-8 bg-madrassah-950 text-white shrink-0">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-2xl"><Globe size={24}/></div>
              <div>
                 <h3 className="text-xl font-black uppercase italic tracking-tighter">Cloud & Server Center</h3>
                 <p className="text-[10px] font-bold text-madrassah-300 uppercase tracking-widest mt-1">Status: <span className="text-amber-400">Lokal (Offline-Modus)</span></p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X size={24}/></button>
          </div>

          <div className="flex gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
             {[
               { id: 'backup', label: 'Backup & Sync', icon: Database },
               { id: 'hosting', label: 'Webserver-Setup', icon: Server },
               { id: 'cloud', label: 'Echtzeit-Cloud', icon: Zap },
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-madrassah-950 shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
               >
                 <tab.icon size={14} /> {tab.label}
               </button>
             ))}
          </div>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto space-y-10 custom-scrollbar">
          
          {activeTab === 'backup' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex items-start gap-5">
                  <Info size={32} className="text-blue-600 shrink-0" />
                  <div>
                     <h4 className="text-sm font-black text-blue-900 uppercase mb-1">Was ist Synchronisation?</h4>
                     <p className="text-xs text-blue-800/70 leading-relaxed font-medium">
                       Da diese App momentan ohne zentralen Server läuft, musst du Daten manuell übertragen. Exportiere deine Daten hier und importiere sie auf dem Zweitgerät.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group hover:border-madrassah-200 transition-all">
                     <div className="w-16 h-16 bg-madrassah-950 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl group-hover:rotate-6 transition-transform">
                        <Download size={32} />
                     </div>
                     <h5 className="font-black text-madrassah-950 uppercase text-xs tracking-widest mb-2">Daten Exportieren</h5>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mb-8">Backup für andere Geräte</p>
                     <div className="flex flex-col gap-2 w-full">
                        <button onClick={handleExportFile} className="w-full bg-madrassah-950 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">Datei laden</button>
                        <button onClick={handleCopyCode} className="text-[9px] font-black text-madrassah-900 hover:underline uppercase flex items-center justify-center gap-2">
                          {status === 'success' ? <CheckCircle2 size={12}/> : <Copy size={12}/>} Code Kopieren
                        </button>
                     </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 flex flex-col items-center text-center group hover:border-madrassah-200 transition-all">
                     <div className="w-16 h-16 bg-white border-2 border-madrassah-950 text-madrassah-950 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl group-hover:-rotate-6 transition-transform">
                        <Upload size={32} />
                     </div>
                     <h5 className="font-black text-madrassah-950 uppercase text-xs tracking-widest mb-2">Daten Importieren</h5>
                     <p className="text-[10px] text-gray-400 font-bold uppercase mb-8">Backup von Gerät A einspielen</p>
                     <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-2 border-madrassah-950 text-madrassah-950 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">Datei wählen</button>
                     <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'hosting' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-madrassah-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><Globe size={100} /></div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter mb-4">Deine App weltweit online</h4>
                  <p className="text-xs text-madrassah-300 leading-relaxed font-bold uppercase tracking-widest mb-8">
                    Um die App über einen Browser-Link (URL) aufzurufen, musst du sie "hosten".
                  </p>
                  
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 bg-white text-madrassah-950 rounded-lg flex items-center justify-center font-black">1</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest flex-1">Erstelle einen kostenlosen Account bei <span className="text-blue-400">Vercel.com</span></p>
                        <ExternalLink size={14} className="text-white/40" />
                     </div>
                     <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 bg-white text-madrassah-950 rounded-lg flex items-center justify-center font-black">2</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest flex-1">Verknüpfe deinen Code (z.B. von GitHub)</p>
                     </div>
                     <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 bg-white text-madrassah-950 rounded-lg flex items-center justify-center font-black">3</div>
                        <p className="text-[10px] font-bold uppercase tracking-widest flex-1">Erhalte deinen Link: <span className="italic text-emerald-400">huda-schule.vercel.app</span></p>
                     </div>
                  </div>
               </div>

               <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4">
                  <AlertTriangle size={24} className="text-amber-500" />
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                    Wichtig: Hosting allein synchronisiert die Daten noch nicht. Dafür wird ein Echtzeit-Speicher (Datenbank) benötigt.
                  </p>
               </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                     <Zap size={40} className="animate-pulse" />
                  </div>
                  <h4 className="text-2xl font-black text-madrassah-950 uppercase italic tracking-tighter">Echtzeit-Synchronisation</h4>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] max-w-sm mx-auto">
                    Verbinde deine App mit einer Online-Datenbank für automatische Updates auf allen Geräten.
                  </p>
               </div>

               <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <h5 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Datenbank-Optionen</h5>
                  <div className="grid grid-cols-1 gap-4">
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-madrassah-950 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Database size={20}/></div>
                           <div>
                              <p className="font-black text-xs uppercase text-madrassah-950">Google Firebase</p>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Empfohlen • Kostenlos bis 50.000 Schüler</p>
                           </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-madrassah-950 transition-colors" />
                     </div>
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between group cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Server size={20}/></div>
                           <div>
                              <p className="font-black text-xs uppercase text-madrassah-950">Eigener Node.js Server</p>
                              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Für IT-Experten</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col items-center">
                  <button className="bg-madrassah-950 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl opacity-30 cursor-not-allowed">
                     Cloud jetzt aktivieren
                  </button>
                  <p className="text-[8px] font-bold text-gray-300 uppercase mt-4 tracking-widest">Wird bald unterstützt...</p>
               </div>
            </div>
          )}

          {status === 'working' && (
            <div className="flex items-center gap-3 bg-blue-50 text-blue-600 p-4 rounded-2xl font-black text-[10px] uppercase">
               <Loader2 size={16} className="animate-spin"/> Synchronisation läuft...
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl font-black text-[10px] uppercase">
               <AlertTriangle size={16}/> {errorMessage}
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 bg-emerald-50 text-emerald-600 p-4 rounded-2xl font-black text-[10px] uppercase">
               <CheckCircle2 size={16}/> Erfolgreich synchronisiert!
            </div>
          )}

        </div>
        
        <div className="p-8 bg-gray-50 border-t border-gray-100 text-center shrink-0">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Madrassah Al-Huda Multi-Device Sync Engine • Version 1.2</p>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default BackupSync;
