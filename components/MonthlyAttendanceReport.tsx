
import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Target,
  Users
} from 'lucide-react';
import { Student, Attendance, User, UserRole } from '../types';

interface MonthlyAttendanceReportProps {
  students: Student[];
  attendance: Attendance[];
  user: User;
}

const MonthlyAttendanceReport: React.FC<MonthlyAttendanceReportProps> = ({ students, attendance, user }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Alle');

  const months = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];

  const allClasses = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.className))).sort();
    return ['Alle', ...classes];
  }, [students]);

  const reportData = useMemo(() => {
    return students
      .filter(s => s.status === 'active')
      .filter(s => {
        const matchesClass = classFilter === 'Alle' || s.className === classFilter;
        const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTeacher = user.role === UserRole.PRINCIPAL || (user.assignedClasses && user.assignedClasses.includes(s.className));
        return matchesClass && matchesSearch && matchesTeacher;
      })
      .map(student => {
        const monthRecords = attendance.filter(a => {
          const d = new Date(a.date);
          return (
            a.studentId === student.id &&
            d.getMonth() === selectedMonth &&
            d.getFullYear() === selectedYear
          );
        });

        const presentCount = monthRecords.filter(r => r.isPresent).length;
        const absentCount = monthRecords.filter(r => !r.isPresent).length;
        const totalCount = monthRecords.length;
        const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

        return {
          ...student,
          presentCount,
          absentCount,
          totalCount,
          rate,
          goalReached: presentCount >= 8
        };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [students, attendance, selectedMonth, selectedYear, searchTerm, classFilter, user]);

  const statsSummary = useMemo(() => {
    if (reportData.length === 0) return { avgRate: 0, totalPresent: 0, reachedGoal: 0 };
    const avgRate = Math.round(reportData.reduce((acc, curr) => acc + curr.rate, 0) / reportData.length);
    const totalPresent = reportData.reduce((acc, curr) => acc + curr.presentCount, 0);
    const reachedGoal = reportData.filter(s => s.goalReached).length;
    return { avgRate, totalPresent, reachedGoal };
  }, [reportData]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20 px-2 md:px-0">
      {/* Header Panel */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full lg:w-auto">
          <div className="bg-madrassah-950 p-4 md:p-5 rounded-2xl md:rounded-[1.75rem] shadow-xl rotate-2">
            <BarChart3 className="text-white w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-xl md:text-3xl font-black text-madrassah-950 italic tracking-tight">Anwesenheits-Statistik</h2>
            <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[9px] tracking-[0.3em] mt-1">Auswertung & Ziele</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronLeft size={18}/></button>
            <div className="px-4 font-black uppercase text-[10px] tracking-widest text-madrassah-950 min-w-[140px] text-center">
              {months[selectedMonth]} {selectedYear}
            </div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl transition-all"><ChevronRight size={18}/></button>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <button onClick={() => window.print()} className="flex-1 sm:flex-none bg-white border border-gray-200 p-3 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
                <Printer size={18} className="mx-auto" />
             </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><TrendingUp size={24}/></div>
            <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Durchschnitt</p>
               <p className="text-xl font-black text-madrassah-950">{statsSummary.avgRate}% Präsenz</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Target size={24}/></div>
            <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Ziel Erreicht (8+)</p>
               <p className="text-xl font-black text-madrassah-950">{statsSummary.reachedGoal} Schüler</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><CheckCircle2 size={24}/></div>
            <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Gesamt-Checkins</p>
               <p className="text-xl font-black text-madrassah-950">{statsSummary.totalPresent}</p>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="bg-gray-50 p-3 rounded-xl text-gray-400"><Users size={24}/></div>
            <div>
               <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">In der Liste</p>
               <p className="text-xl font-black text-madrassah-950">{reportData.length} Schüler</p>
            </div>
         </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <div className="relative w-full sm:w-64">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                 <input 
                  type="text" 
                  placeholder="Schüler suchen..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl font-bold uppercase text-[9px] outline-none focus:ring-2 focus:ring-madrassah-950/10" 
                 />
              </div>
              <div className="relative w-full sm:w-48">
                 <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                 <select 
                   value={classFilter}
                   onChange={e => setClassFilter(e.target.value)}
                   className="w-full pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-xl font-black uppercase text-[9px] tracking-widest outline-none appearance-none cursor-pointer"
                 >
                    {allClasses.map(c => <option key={c} value={c}>{c === 'Alle' ? 'Alle Klassen' : `Klasse ${c}`}</option>)}
                 </select>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-gray-300">
              <Target size={12}/> Monatliches Ziel: 8 Anwesenheiten
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b">
               <tr>
                  <th className="px-8 py-6 font-black">Schüler / Klasse</th>
                  <th className="px-8 py-6 font-black text-center">Anwesenheiten</th>
                  <th className="px-8 py-6 font-black text-center">Abwesenheiten</th>
                  <th className="px-8 py-6 font-black text-center">Quote</th>
                  <th className="px-8 py-6 font-black text-right">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {reportData.map(s => (
                 <tr key={s.id} className="hover:bg-madrassah-50/30 transition-all group">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border ${s.goalReached ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                             {s.firstName.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-lg italic text-gray-900 leading-none">{s.firstName} {s.lastName}</p>
                             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{s.className}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className={`text-lg font-black ${s.goalReached ? 'text-emerald-600' : 'text-gray-900'}`}>{s.presentCount}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <span className="text-lg font-black text-red-400">{s.absentCount}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                       <div className="flex flex-col items-center gap-1.5">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-500 ${s.rate >= 80 ? 'bg-emerald-500' : s.rate >= 50 ? 'bg-amber-400' : 'bg-red-500'}`} style={{width: `${s.rate}%`}}></div>
                          </div>
                          <span className="text-[10px] font-black">{s.rate}%</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       {s.goalReached ? (
                         <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                            <CheckCircle2 size={12}/> Ziel Erreicht
                         </div>
                       ) : (
                         <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-amber-100">
                            <AlertTriangle size={12}/> Warnung
                         </div>
                       )}
                    </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>

        {reportData.length === 0 && (
           <div className="py-24 text-center">
              <BarChart3 size={48} className="mx-auto mb-4 opacity-10" />
              <p className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">Keine Daten für diesen Zeitraum gefunden</p>
           </div>
        )}
      </div>
      
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; overflow: visible !important; }
          .p-20 { padding: 0 !important; }
          .shadow-sm, .shadow-xl { box-shadow: none !important; }
          .rounded-[3.5rem], .rounded-[2.5rem] { border-radius: 0.5rem !important; }
          .bg-white { background: white !important; }
          .bg-gray-50 { background: white !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
};

export default MonthlyAttendanceReport;
