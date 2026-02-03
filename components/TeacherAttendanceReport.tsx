
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ChevronLeft, 
  UserCheck, 
  CheckCircle, 
  XCircle,
  Phone,
  TrendingUp,
  Award,
  Users,
  CheckSquare,
  Square,
  UserPlus
} from 'lucide-react';
import { User, UserRole, TeacherAttendance } from '../types';
import LogoIcon from './LogoIcon';

interface TeacherAttendanceReportProps {
  users: User[];
  teacherAttendance: TeacherAttendance[];
}

const TeacherAttendanceReport: React.FC<TeacherAttendanceReportProps> = ({ users, teacherAttendance }) => {
  const navigate = useNavigate();
  const teachers = users.filter(u => u.role === UserRole.TEACHER);
  
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>(
    teachers.length > 0 ? [teachers[0].id] : []
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth() + 1);
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 1);
  const [isMultiMode, setIsMultiMode] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => ({
    val: i + 1,
    name: new Date(0, i).toLocaleString('de-DE', { month: 'long' })
  }));

  const getAttendanceForTeacherAndMonth = (teacherId: string, month: number) => {
    return teacherAttendance.filter(ta => {
      const date = new Date(ta.date);
      return (
        ta.userId === teacherId &&
        date.getFullYear() === selectedYear &&
        date.getMonth() + 1 === month
      );
    });
  };

  const calculateStats = (teacherId: string, month: number) => {
    const records = getAttendanceForTeacherAndMonth(teacherId, month);
    const present = records.filter(r => r.status === 'present').length;
    const substituted = records.filter(r => r.status === 'substituted').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const total = records.length;
    // Substitution counts as "covered", but we track it separately
    const percentage = total > 0 ? Math.round(((present + substituted) / total) * 100) : 0;
    return { present, substituted, absent, total, percentage };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="no-print bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-madrassah-950 font-black uppercase text-[10px] tracking-widest bg-white px-5 py-3 rounded-2xl border border-gray-100 hover:bg-gray-50">
            <ChevronLeft size={18} /> Zurück
          </button>
          
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button onClick={() => setIsMultiMode(false)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isMultiMode ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400'}`}>Einzeln</button>
            <button onClick={() => setIsMultiMode(true)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isMultiMode ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400'}`}>Sammeldruck</button>
          </div>

          <button onClick={() => window.print()} disabled={selectedTeacherIds.length === 0} className="bg-madrassah-950 text-white px-10 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest flex items-center gap-3 shadow-2xl disabled:opacity-30 transition-all hover:-translate-y-1">
            <Printer size={20} /> Drucken / PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Lehrkräfte</label>
            {isMultiMode ? (
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {teachers.map(t => (
                  <button key={t.id} onClick={() => setSelectedTeacherIds(prev => prev.includes(t.id) ? (prev.length > 1 ? prev.filter(id => id !== t.id) : prev) : [...prev, t.id])} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${selectedTeacherIds.includes(t.id) ? 'bg-madrassah-950 text-white border-madrassah-900 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}>
                    {selectedTeacherIds.includes(t.id) ? <CheckSquare size={14} /> : <Square size={14} />} <span className="truncate">{t.name}</span>
                  </button>
                ))}
              </div>
            ) : (
              <select value={selectedTeacherIds[0]} onChange={(e) => setSelectedTeacherIds([e.target.value])} className="w-full px-6 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-madrassah-950 outline-none">
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </div>
          <div className="lg:col-span-7 grid grid-cols-3 gap-4">
             <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-full px-5 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-madrassah-950 outline-none">
                {[selectedYear - 1, selectedYear, selectedYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
             </select>
             <select value={startMonth} onChange={(e) => setStartMonth(parseInt(e.target.value))} className="w-full px-5 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-madrassah-950 outline-none">
                {months.map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
             </select>
             <select value={endMonth} onChange={(e) => setEndMonth(parseInt(e.target.value))} className="w-full px-5 py-4.5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-madrassah-950 outline-none">
                {months.filter(m => m.val >= startMonth).map(m => <option key={m.val} value={m.val}>{m.name}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="print-root space-y-20 print:space-y-0">
        {selectedTeacherIds.map((teacherId) => {
          const teacher = teachers.find(t => t.id === teacherId);
          if (!teacher) return null;

          return (
            <div key={teacherId} className="report-page bg-white p-12 print:p-0 shadow-2xl print:shadow-none border border-gray-100 print:border-none rounded-[2.5rem] font-sans overflow-hidden page-break-after-always">
              <div className="flex justify-between items-end border-b-4 border-black pb-8 mb-10">
                <div className="flex items-center gap-6">
                  <LogoIcon className="w-20 h-20 text-madrassah-950" />
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight">Personal-Präsenzbericht</h1>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Madrassah Al-Huda Hamburg</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-black text-white px-4 py-1.5 text-[11px] font-black uppercase tracking-widest mb-2 inline-block">Management Kopie</div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    {months.find(m => m.val === startMonth)?.name} - {months.find(m => m.val === endMonth)?.name} {selectedYear}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10 bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Lehrkraft</span><span className="text-lg font-extrabold text-madrassah-950 uppercase">{teacher.name}</span></div>
                <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Kontakt</span><span className="text-lg font-extrabold text-madrassah-950 uppercase flex items-center gap-2"><Phone size={16} className="text-gray-400" />{teacher.whatsapp || 'n.A.'}</span></div>
                <div className="flex flex-col"><span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Klassen</span><span className="text-lg font-extrabold text-madrassah-950 uppercase">{(teacher.assignedClasses || []).join(', ') || 'Keine'}</span></div>
              </div>

              <div className="space-y-12 min-h-[600px]">
                {months.filter(m => m.val >= startMonth && m.val <= endMonth).map(m => {
                    const records = getAttendanceForTeacherAndMonth(teacherId, m.val).sort((a,b) => a.date.localeCompare(b.date));
                    const stats = calculateStats(teacherId, m.val);
                    if (records.length === 0) return null;

                    return (
                      <div key={m.val} className="month-block border-l-4 border-madrassah-950 pl-6 mb-12 page-break-inside-avoid">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-[0.2em] text-madrassah-950">{m.name} {selectedYear}</h3>
                            <div className="flex gap-4 mt-2">
                              <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1.5"><CheckCircle size={12} /> {stats.present} Anwesend</span>
                              <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-lg flex items-center gap-1.5"><UserPlus size={12} /> {stats.substituted} Vertreten</span>
                              <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1.5"><XCircle size={12} /> {stats.absent} Abwesend</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm">
                             <div className="text-right"><p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Abdeckungs-Quote</p><p className="text-2xl font-black text-madrassah-950">{stats.percentage}%</p></div>
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${stats.percentage >= 90 ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-amber-100 border-amber-200 text-amber-700'}`}><Award size={24} /></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                          {records.map((r, i) => (
                            <div key={i} className={`flex flex-col justify-center p-3 rounded-xl border-2 ${
                                r.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-900' : 
                                r.status === 'substituted' ? 'bg-amber-50 border-amber-100 text-amber-900' :
                                'bg-red-50 border-red-100 text-red-900'
                              }`}>
                              <span className="text-[9px] font-black uppercase opacity-60">{new Date(r.date).toLocaleDateString('de-DE', { weekday: 'short' })}</span>
                              <span className="font-black text-sm">{new Date(r.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</span>
                              <div className="flex items-center gap-1 mt-1 font-bold text-[8px] uppercase tracking-tighter">
                                {r.status === 'present' ? <CheckCircle size={10}/> : r.status === 'substituted' ? <UserPlus size={10}/> : <XCircle size={10}/>}
                                {r.status === 'present' ? 'Anw.' : r.status === 'substituted' ? 'Vertr.' : 'Abw.'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-auto border-t-2 border-black/10 pt-10 pb-8">
                 <div className="grid grid-cols-2 gap-20">
                    <div className="text-center"><div className="h-[1px] bg-black/40 w-full mb-4"></div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Personalabteilung</p></div>
                    <div className="text-center"><div className="h-[1px] bg-black/40 w-full mb-4"></div><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stand: {new Date().toLocaleDateString('de-DE')}</p></div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 1.5cm; }
          .no-print { display: none !important; }
          .page-break-after-always { page-break-after: always; }
          .report-page { box-shadow: none !important; border: none !important; border-radius: 0 !important; display: flex; flex-direction: column; min-height: 297mm; }
        }
      `}</style>
    </div>
  );
};

export default TeacherAttendanceReport;
