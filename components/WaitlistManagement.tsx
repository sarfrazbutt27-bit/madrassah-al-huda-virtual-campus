
import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Trash2, 
  UserCheck, 
  Search, 
  Filter, 
  ChevronRight, 
  Calendar, 
  IdCard,
  Clock,
  Trash,
  Phone,
  BookOpen,
  X
} from 'lucide-react';
import { WaitlistEntry, CourseType, Student } from '../types';

interface WaitlistManagementProps {
  waitlist: WaitlistEntry[];
  onRemove: (id: string) => void;
  onConvertToStudent: (entry: WaitlistEntry, className: string) => void;
}

const COURSE_LABELS = {
  [CourseType.ANFAENGER]: 'Anfänger',
  [CourseType.FORTGESCHRITTENE]: 'Fortgeschrittene',
  [CourseType.ARABISCH]: 'Arabisch',
  [CourseType.IMAM]: 'Imam-Kurs',
  [CourseType.ILMIYA]: 'Ilmiya-Kurs',
};

const WaitlistManagement: React.FC<WaitlistManagementProps> = ({ waitlist, onRemove, onConvertToStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('Alle');
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [targetClass, setTargetClass] = useState('J-1a');

  const filtered = useMemo(() => {
    return waitlist.filter(w => {
      const matchesSearch = `${w.firstName} ${w.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'Alle' || w.courseType === filter;
      return matchesSearch && matchesFilter;
    }).sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  }, [waitlist, searchTerm, filter]);

  const handleConvert = (entry: WaitlistEntry) => {
    onConvertToStudent(entry, targetClass);
    setConvertingId(null);
  };

  const targetClasses = [
    'J-1a', 'J-1b', 'J-2', 'J-3', 'J-4', 'J-Hifz', 'J-Arabisch',
    'M-1a', 'M-1b', 'M-2', 'M-3', 'M-4', 'M-Hifz', 'M-Arabisch'
  ];

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 px-2 md:px-0">
      {/* Optimized Compact Header Panel */}
      <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4 md:gap-6">
         <div className="flex items-center gap-3 md:gap-5 w-full lg:w-auto">
            <div className="bg-madrassah-950 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] shadow-lg rotate-2">
               <Users className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
               <h2 className="text-lg md:text-2xl font-black text-madrassah-950 italic tracking-tight">Warteliste</h2>
               <p className="text-gray-400 font-bold uppercase text-[7px] md:text-[8px] tracking-[0.3em] mt-0.5">Pool Management</p>
            </div>
         </div>
         <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-56">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
               <input 
                type="text" 
                placeholder="Suchen..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl font-bold outline-none focus:ring-2 focus:ring-madrassah-950/20 text-xs" 
               />
            </div>
            <select 
              value={filter} 
              onChange={e => setFilter(e.target.value)}
              className="bg-gray-50 border border-gray-100 px-3 py-2.5 rounded-xl font-black uppercase text-[8px] md:text-[9px] outline-none cursor-pointer"
            >
               <option value="Alle">Alle Kurse</option>
               {Object.entries(COURSE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
         </div>
      </div>

      {/* Desktop/Tablet Table View */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b">
               <tr>
                  <th className="px-8 py-5 font-black">Interessent</th>
                  <th className="px-8 py-5 font-black text-center">Kurs-Wunsch</th>
                  <th className="px-8 py-5 font-black">Kontakt (WA)</th>
                  <th className="px-8 py-5 text-right">Aktionen</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {filtered.map(w => (
                 <tr key={w.id} className="hover:bg-madrassah-50/30 transition-all group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-madrassah-950 text-white rounded-xl flex items-center justify-center font-black">
                             {w.firstName.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-lg italic text-gray-900 group-hover:text-madrassah-950 transition-colors uppercase tracking-tight leading-tight">{w.firstName} {w.lastName}</p>
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 flex items-center gap-2"><Clock size={10}/> {new Date(w.timestamp).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-indigo-100 italic">
                          {COURSE_LABELS[w.courseType]}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <p className="font-black text-madrassah-950 uppercase text-[10px] tracking-widest">{w.whatsapp}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2 items-center">
                          {convertingId === w.id ? (
                            <div className="flex items-center gap-2 animate-in slide-in-from-right">
                               <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="bg-gray-100 px-3 py-2 rounded-xl text-[9px] font-black uppercase outline-none">
                                  {targetClasses.map(c => <option key={c} value={c}>{c}</option>)}
                               </select>
                               <button onClick={() => handleConvert(w)} className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg hover:bg-emerald-600"><UserCheck size={16}/></button>
                               <button onClick={() => setConvertingId(null)} className="bg-gray-100 text-gray-400 p-2 rounded-xl"><X size={16}/></button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => {
                                setConvertingId(w.id);
                                setTargetClass(w.gender === 'Junge' ? 'J-1a' : 'M-1a');
                              }} className="bg-madrassah-950 text-white px-4 py-2 rounded-xl font-black uppercase text-[8px] tracking-widest hover:bg-black transition-all flex items-center gap-2">
                                 Aufnehmen <ChevronRight size={12}/>
                              </button>
                              <button onClick={() => onRemove(w.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                 <Trash2 size={16} />
                              </button>
                            </>
                          )}
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
         {filtered.map(w => (
           <div key={w.id} className="bg-white p-5 rounded-[1.25rem] border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-madrassah-950 text-white rounded-lg flex items-center justify-center font-black text-sm">
                       {w.firstName.charAt(0)}
                    </div>
                    <div>
                       <h4 className="font-black text-base uppercase tracking-tight text-gray-900 leading-tight">{w.firstName} {w.lastName}</h4>
                       <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{new Date(w.timestamp).toLocaleDateString()}</p>
                    </div>
                 </div>
                 <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border border-indigo-100">
                    {COURSE_LABELS[w.courseType]}
                 </span>
              </div>
              
              <div className="flex items-center gap-2 text-madrassah-950">
                 <Phone size={12} className="text-gray-300" />
                 <span className="text-[10px] font-black tracking-widest">{w.whatsapp}</span>
              </div>

              <div className="pt-3 border-t border-gray-50 flex gap-2">
                 {convertingId === w.id ? (
                   <div className="w-full flex items-center gap-1.5 animate-in slide-in-from-bottom">
                      <select value={targetClass} onChange={e => setTargetClass(e.target.value)} className="flex-1 bg-gray-100 px-3 py-2 rounded-lg text-[8px] font-black uppercase outline-none">
                         {targetClasses.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={() => handleConvert(w)} className="bg-emerald-500 text-white p-2.5 rounded-lg shadow-lg"><UserCheck size={16}/></button>
                      <button onClick={() => setConvertingId(null)} className="bg-gray-100 text-gray-400 p-2.5 rounded-lg"><X size={16}/></button>
                   </div>
                 ) : (
                   <>
                     <button 
                       onClick={() => {
                         setConvertingId(w.id);
                         setTargetClass(w.gender === 'Junge' ? 'J-1a' : 'M-1a');
                       }}
                       className="flex-1 bg-madrassah-950 text-white py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg flex items-center justify-center gap-2"
                     >
                        Aufnehmen <ChevronRight size={12} />
                     </button>
                     <button onClick={() => onRemove(w.id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl border border-red-100">
                        <Trash2 size={16} />
                     </button>
                   </>
                 )}
              </div>
           </div>
         ))}
      </div>

      {filtered.length === 0 && (
         <div className="bg-white py-16 md:py-24 text-center rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100">
            <Users size={40} className="mx-auto mb-3 opacity-10" />
            <p className="text-gray-300 font-bold italic uppercase text-[10px] tracking-widest px-4">
              Keine Einträge gefunden.
            </p>
         </div>
      )}
    </div>
  );
};

export default WaitlistManagement;
