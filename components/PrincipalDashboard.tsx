
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Search,
  Pencil,
  Printer,
  UserPlus,
  Calendar,
  Sparkles,
  UserCheck,
  UserMinus,
  CheckCircle,
  Clock,
  ChevronRight,
  Trash2,
  MoreVertical,
  IdCard,
  UserX,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Student, User, UserRole, TeacherAttendance, Grade, Attendance } from '../types';

interface PrincipalDashboardProps {
  students: Student[];
  users: User[];
  grades: Grade[];
  attendance: Attendance[];
  teacherAttendance?: TeacherAttendance[];
  onSync: () => void;
  syncStatus: string;
  onDeleteStudent: (id: string) => void;
  onRestoreStudent: (id: string) => void;
}

const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({ 
  students, users, grades, attendance, teacherAttendance = [], onSync, syncStatus, onDeleteStudent, onRestoreStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('Alle');
  const [viewMode, setViewMode] = useState<'active' | 'dismissed'>('active');
  
  const today = new Date().toISOString().split('T')[0];
  const activeStudents = students.filter(s => s.status === 'active');
  const dismissedStudents = students.filter(s => s.status === 'dismissed');
  
  const currentViewStudents = viewMode === 'active' ? activeStudents : dismissedStudents;
  const classes = ['Alle', ...Array.from(new Set(activeStudents.map(s => s.className))).sort()];
  
  const teachers = users.filter(u => u.role === UserRole.TEACHER);

  const filteredStudents = currentViewStudents.filter(s => {
    const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         s.guardian.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = activeFilter === 'Alle' || s.className === activeFilter;
    return matchesSearch && matchesClass;
  });

  const getTeacherStatus = (userId: string) => {
    return teacherAttendance.find(ta => ta.userId === userId && ta.date === today)?.status;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 px-2 md:px-0">
      {/* Top Welcome Bar */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-madrassah-950 pointer-events-none">
           <ShieldCheck size={200} />
        </div>
        <div className="flex items-center gap-6 md:gap-8 relative z-10">
          <div className="bg-madrassah-950 p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-2xl transform rotate-3">
             <ShieldCheck className="text-white w-8 h-8 md:w-10 md:h-10" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-madrassah-950 italic tracking-tight">Management Konsole</h2>
            <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.4em] mt-2">Madrassah Al-Huda Hamburg</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 relative z-10">
          <Link 
            to="/register"
            className="flex-1 lg:flex-none bg-madrassah-950 hover:bg-black text-white px-6 md:px-10 py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all"
          >
            <UserPlus size={18} /> Aufnahme
          </Link>
          <button 
            onClick={onSync}
            className="flex-1 lg:flex-none bg-gray-50 border border-gray-100 text-madrassah-950 px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-white"
          >
            <Sparkles size={18} className={syncStatus === 'syncing' ? 'animate-spin' : ''} /> Sync
          </button>
        </div>
      </div>

      {/* Tabs for Active/Red List */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex bg-white p-1.5 rounded-[1.75rem] border border-gray-100 shadow-sm w-full md:w-auto">
            <button 
              onClick={() => { setViewMode('active'); setActiveFilter('Alle'); }}
              className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${viewMode === 'active' ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
               <Users size={16} /> Aktive Schüler ({activeStudents.length})
            </button>
            <button 
              onClick={() => { setViewMode('dismissed'); setActiveFilter('Alle'); }}
              className={`flex-1 md:flex-none px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${viewMode === 'dismissed' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-red-500'}`}
            >
               <UserX size={16} /> Rote Liste ({dismissedStudents.length})
            </button>
         </div>

         {viewMode === 'active' && (
           <div className="flex gap-2 bg-white p-1.5 rounded-[1.75rem] border border-gray-100 shadow-sm overflow-x-auto max-w-full custom-scrollbar">
              {classes.map(c => (
                <button 
                  key={c}
                  onClick={() => setActiveFilter(c)}
                  className={`whitespace-nowrap px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === c ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                >
                  {c}
                </button>
              ))}
           </div>
         )}
      </div>

      {/* Schüler-Tabelle */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-6 md:p-10 border-b border-gray-50 flex flex-col xl:flex-row xl:items-center justify-between gap-6 ${viewMode === 'dismissed' ? 'bg-red-50/30' : 'bg-gray-50/20'}`}>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 md:w-16 md:h-16 text-white rounded-[1.25rem] md:rounded-[1.75rem] flex items-center justify-center shadow-lg transform -rotate-3 ${viewMode === 'active' ? 'bg-madrassah-950' : 'bg-red-600 animate-pulse'}`}>
                {viewMode === 'active' ? <Users size={32} /> : <UserX size={32} />}
             </div>
             <div>
                <h3 className="text-xl md:text-3xl font-black text-madrassah-950 italic tracking-tight leading-none">
                   {viewMode === 'active' ? 'Schülerverzeichnis' : '🚫 Rote Liste (Ausschluss)'}
                </h3>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2">{filteredStudents.length} Einträge</p>
             </div>
          </div>
          
          <div className="relative w-full md:w-80 group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-madrassah-950 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Name suchen..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-madrassah-950/5 text-[10px] font-bold uppercase transition-all shadow-inner"
              />
          </div>
        </div>

        {viewMode === 'dismissed' && dismissedStudents.length > 0 && (
          <div className="m-6 p-6 bg-red-100/50 border border-red-200 rounded-3xl flex items-center gap-4 text-red-900">
             <AlertCircle size={24} className="shrink-0" />
             <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
               Diese Schüler wurden nach 16 aufeinanderfolgenden Fehltagen automatisch ausgeschlossen. Eine Wiederaufnahme setzt eine Rücksprache mit der Leitung voraus.
             </p>
          </div>
        )}

        <div className="overflow-x-auto">
          {/* Desktop Table View */}
          <table className="hidden md:table w-full text-left">
            <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-12 py-8 font-black">Vor- & Nachname</th>
                <th className="px-8 py-8 font-black text-center">Klasse</th>
                <th className="px-8 py-8 font-black">Erziehungsberechtigte</th>
                <th className="px-12 py-8 text-right font-black">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-madrassah-50/40 transition-all group">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black border group-hover:scale-110 transition-transform ${viewMode === 'active' ? 'bg-gray-50 text-madrassah-950 border-gray-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {student.firstName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <span className="font-black text-gray-900 text-xl uppercase tracking-tighter italic leading-tight">{student.firstName} {student.lastName}</span>
                         <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                            <IdCard size={10} className="text-madrassah-950" /> {student.id}
                         </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest italic ${viewMode === 'active' ? 'bg-madrassah-950 text-white' : 'bg-red-100 text-red-700'}`}>{student.className}</span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1">
                       <span className="text-xs font-black text-gray-800 uppercase italic">{student.guardian}</span>
                       <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{student.whatsapp}</span>
                    </div>
                  </td>
                  <td className="px-12 py-8 text-right">
                     <div className="flex gap-2 justify-end items-center">
                        {viewMode === 'active' ? (
                          <>
                            <Link to={`/edit-student/${student.id}`} className="p-3 bg-white text-madrassah-950 border-2 border-madrassah-950 rounded-xl hover:bg-madrassah-950 hover:text-white transition-all shadow-sm"><Pencil size={18} /></Link>
                            <button onClick={() => onDeleteStudent(student.id)} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                          </>
                        ) : (
                          <button 
                            onClick={() => onRestoreStudent(student.id)}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg transition-all active:scale-95"
                          >
                             <RotateCcw size={16} /> Wiederaufnehmen
                          </button>
                        )}
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden p-4 space-y-4">
             {filteredStudents.map(student => (
               <div key={student.id} className="bg-white p-5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${viewMode === 'active' ? 'bg-madrassah-50 text-madrassah-950' : 'bg-red-50 text-red-600'}`}>
                           {student.firstName.charAt(0)}
                        </div>
                        <div>
                           <h4 className="font-black text-lg uppercase tracking-tight italic">{student.firstName} {student.lastName}</h4>
                           <p className="text-[8px] font-bold text-gray-400 uppercase">{student.id}</p>
                        </div>
                     </div>
                     <span className={`text-[8px] font-black px-2 py-1 rounded-md ${viewMode === 'active' ? 'bg-madrassah-950 text-white' : 'bg-red-100 text-red-700'}`}>{student.className}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                     <div className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[150px]">{student.guardian}</div>
                     <div className="flex gap-2">
                        {viewMode === 'active' ? (
                          <button onClick={() => onDeleteStudent(student.id)} className="p-2 bg-red-50 text-red-400 rounded-lg"><Trash2 size={16}/></button>
                        ) : (
                          <button onClick={() => onRestoreStudent(student.id)} className="p-2 bg-emerald-50 text-emerald-500 rounded-lg"><RotateCcw size={16}/></button>
                        )}
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {filteredStudents.length === 0 && (
             <div className="py-24 text-center text-gray-300 italic font-bold">
                <Search size={48} className="mx-auto mb-4 opacity-10" />
                Keine Einträge gefunden.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;
