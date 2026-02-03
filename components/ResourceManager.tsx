
import React, { useState } from 'react';
import { Library, Plus, Search, FileText, Video, Image, Headset, Link as LinkIcon, Download, Trash2, Filter, AlertCircle, ChevronDown } from 'lucide-react';
import { User, UserRole, Resource, Student } from '../types';

interface ResourceManagerProps {
  user: User;
  resources: Resource[];
  onUpdateResources: (r: Resource[]) => void;
  subjects: string[];
  students: Student[];
  onNotify: (n: any) => void;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({ user, resources, onUpdateResources, subjects, students, onNotify }) => {
  const isTeacher = user.role === UserRole.TEACHER;
  const isPrincipal = user.role === UserRole.PRINCIPAL;
  const isStudent = user.role === UserRole.STUDENT;
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRes, setNewRes] = useState({ title: '', type: 'pdf' as Resource['type'], url: '', className: user.assignedClasses?.[0] || 'Alle', subject: subjects[0] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Resource['type']>('all');
  const [principalClassFilter, setPrincipalClassFilter] = useState<string>('Alle');

  const myClass = isStudent ? students.find(s => s.id === user.id)?.className : null;
  const allClasses = Array.from(new Set(students.map(s => s.className))).sort();

  const filteredResources = resources.filter(r => {
    // Role based filtering
    let matchesRole = false;
    if (isStudent) {
      matchesRole = r.className === myClass || r.className === 'Alle';
    } else if (isTeacher) {
      matchesRole = user.assignedClasses?.includes(r.className) || r.className === 'Alle';
    } else if (isPrincipal) {
      matchesRole = principalClassFilter === 'Alle' || r.className === principalClassFilter;
    }

    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || r.type === filterType;
    return matchesRole && matchesSearch && matchesType;
  });

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) return;

    const res: Resource = {
      ...newRes,
      id: `RES-${Date.now()}`,
      uploadedBy: user.name,
      createdAt: new Date().toISOString()
    };
    onUpdateResources([...resources, res]);
    
    // Notify students of that class
    onNotify({
      userId: 'ALL',
      role: UserRole.STUDENT,
      title: 'Neues Material',
      message: `${user.name} hat ein neues ${res.type}-Dokument (${res.title}) für Klasse ${res.className} hochgeladen.`,
      type: 'system'
    });

    setShowAddForm(false);
    setNewRes({ title: '', type: 'pdf', url: '', className: user.assignedClasses?.[0] || 'Alle', subject: subjects[0] });
  };

  const getIcon = (type: Resource['type']) => {
    switch (type) {
      case 'pdf': return <FileText />;
      case 'video': return <Video />;
      case 'image': return <Image />;
      case 'audio': return <Headset />;
      case 'link': return <LinkIcon />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-madrassah-950 p-5 rounded-3xl shadow-xl">
             <Library className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-madrassah-950 tracking-tight leading-none italic">Digitale Bibliothek</h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">
              {isPrincipal ? `Verwaltungs-Ansicht: ${principalClassFilter}` : 'Lernmaterialien & Medien'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          {isPrincipal && (
             <div className="relative">
                <select 
                  value={principalClassFilter}
                  onChange={(e) => setPrincipalClassFilter(e.target.value)}
                  className="bg-gray-50 border border-gray-100 px-6 py-3 rounded-2xl font-black uppercase text-[10px] outline-none appearance-none pr-12"
                >
                   <option value="Alle">Alle Klassen</option>
                   {allClasses.map(c => <option key={c} value={c}>Klasse {c}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
             </div>
          )}
          {isTeacher && (
             <button onClick={() => setShowAddForm(!showAddForm)} className="bg-madrassah-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1">
                {showAddForm ? 'Schließen' : <><Plus size={18} /> Datei Hochladen</>}
             </button>
          )}
        </div>
      </div>

      {showAddForm && isTeacher && (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl animate-in slide-in-from-top-4 duration-500">
           <form onSubmit={handleAddResource} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Titel</label>
                 <input required value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-bold outline-none" placeholder="z.B. Tajwid PDF" />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Klasse</label>
                 <select value={newRes.className} onChange={e => setNewRes({...newRes, className: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-2xl font-black uppercase text-[10px] outline-none">
                    <option value="Alle">Alle Klassen</option>
                    {user.assignedClasses?.map(c => <option key={c} value={c}>{c}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Typ</label>
                 <select value={newRes.type} onChange={e => setNewRes({...newRes, type: e.target.value as any})} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-2xl font-black uppercase text-[10px] outline-none">
                    <option value="pdf">PDF Buch</option>
                    <option value="video">Video</option>
                    <option value="image">Bild</option>
                    <option value="audio">Audio / MP3</option>
                    <option value="link">Web-Link</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">URL / Link</label>
                 <input required value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl font-medium outline-none" placeholder="https://..." />
              </div>
              <button type="submit" className="bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-lg uppercase text-[10px] tracking-widest">Hinzufügen</button>
           </form>
        </div>
      )}

      {/* Info for principal */}
      {isPrincipal && (
        <div className="bg-madrassah-50 p-6 rounded-[2rem] border border-madrassah-100 flex items-center gap-4 text-madrassah-950">
           <AlertCircle size={24} className="text-madrassah-600" />
           <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">
             Hinweis: Schulleiter-Ansicht. Sie sehen alle Materialien Ihrer Klassen. Hochladen ist Lehrkräften vorbehalten.
           </p>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
         <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
            <input type="text" placeholder="Material suchen..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-medium shadow-sm" />
         </div>
         <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            {['all', 'pdf', 'video', 'image', 'audio', 'link'].map(t => (
               <button key={t} onClick={() => setFilterType(t as any)} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === t ? 'bg-madrassah-950 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                  {t === 'all' ? 'Alle' : t}
               </button>
            ))}
         </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredResources.map(r => (
           <div key={r.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all flex flex-col">
              <div className="aspect-video bg-gray-50 flex items-center justify-center text-gray-300 relative overflow-hidden">
                 <div className="group-hover:scale-110 transition-transform duration-700">
                    {React.cloneElement(getIcon(r.type) as React.ReactElement<any>, { size: 64, strokeWidth: 1 })}
                 </div>
                 <div className="absolute top-4 right-4 flex gap-2">
                    <span className="bg-white/80 backdrop-blur-md text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/50 shadow-sm text-madrassah-950">{r.type}</span>
                 </div>
                 <div className="absolute bottom-4 left-4">
                    <span className="bg-madrassah-950/80 backdrop-blur-sm text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">Klasse {r.className}</span>
                 </div>
              </div>
              <div className="p-8 space-y-4 flex-1">
                 <h4 className="font-extrabold text-gray-900 group-hover:text-madrassah-950 transition-colors uppercase leading-tight">{r.title}</h4>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-madrassah-600 uppercase bg-madrassah-50 px-3 py-1 rounded-lg border border-madrassah-100">{r.subject}</span>
                    <span className="text-[9px] font-bold text-gray-400">Von: {r.uploadedBy}</span>
                 </div>
              </div>
              <div className="p-6 border-t border-gray-50 flex gap-2">
                 <a href={r.url} target="_blank" className="flex-1 bg-gray-950 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                    <Download size={16} /> Öffnen
                 </a>
                 {(isTeacher || isPrincipal) && (
                    <button onClick={() => { if(window.confirm('Datei löschen?')) onUpdateResources(resources.filter(x => x.id !== r.id)) }} className="p-4 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                       <Trash2 size={20} />
                    </button>
                 )}
              </div>
           </div>
         ))}
         {filteredResources.length === 0 && (
           <div className="col-span-full py-20 text-center opacity-20">
              <Library size={80} className="mx-auto" />
              <p className="font-black mt-4 uppercase tracking-[0.2em]">Keine Materialien gefunden</p>
           </div>
         )}
      </div>
    </div>
  );
};

export default ResourceManager;
