
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Printer, 
  UserCheck, 
  UserMinus, 
  UserPlus, 
  Zap,
  Clock,
  Search,
  RotateCcw,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Target
} from 'lucide-react';
import { Student, Attendance, User, UserRole, TeacherAttendance } from '../types';

interface AttendanceTrackerProps {
  user: User;
  students: Student[];
  attendance: Attendance[];
  teacherAttendance: TeacherAttendance[];
  onUpdateAttendance: (attendance: Attendance[]) => void;
  onUpdateTeacherAttendance: (teacherAttendance: TeacherAttendance[]) => void;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ 
  user, students, attendance, teacherAttendance, onUpdateAttendance, onUpdateTeacherAttendance 
}) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const [selectedClass, setSelectedClass] = useState<string>(
    user.role === UserRole.TEACHER && user.assignedClasses && user.assignedClasses.length > 0 
      ? user.assignedClasses[0] 
      : 'Alle'
  );

  const assignedClasses = user.assignedClasses || [];
  
  const classStudents = useMemo(() => {
    return students.filter(s => {
      const isActive = s.status === 'active';
      const isVisible = (user.role === UserRole.PRINCIPAL && (selectedClass === 'Alle' || s.className === selectedClass)) || 
                       (user.role === UserRole.TEACHER && assignedClasses.includes(s.className) && s.className === selectedClass);
      
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      
      return isActive && isVisible && matchesSearch;
    });
  }, [students, user.role, selectedClass, assignedClasses, searchTerm]);

  const getMonthStats = (studentId: string) => {
    const monthRecords = attendance.filter(a => {
      const d = new Date(a.date);
      return a.studentId === studentId && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const present = monthRecords.filter(r => r.isPresent).length;
    const absent = monthRecords.filter(r => !r.isPresent).length;
    return { present, absent };
  };

  const getStatus = (studentId: string) => {
    const record = attendance.find(a => a.studentId === studentId && a.date === selectedDate);
    return record?.isPresent;
  };

  const handleUpdateAttendance = (studentId: string, isPresent: boolean) => {
    const existingIndex = attendance.findIndex(a => a.studentId === studentId && a.date === selectedDate);
    const newAttendance = [...attendance];
    
    if (existingIndex > -1) {
      if (newAttendance[existingIndex].isPresent === isPresent) {
        newAttendance.splice(existingIndex, 1);
      } else {
        newAttendance[existingIndex].isPresent = isPresent;
      }
    } else {
      newAttendance.push({ studentId, date: selectedDate, isPresent });
    }
    onUpdateAttendance(newAttendance);
  };

  const handleClearAttendance = (studentId: string) => {
    const newAttendance = attendance.filter(a => !(a.studentId === studentId && a.date === selectedDate));
    onUpdateAttendance(newAttendance);
  };

  const handleMarkAllPresent = () => {
    let newAttendance = [...attendance];
    classStudents.forEach(student => {
      const existingIndex = newAttendance.findIndex(a => a.studentId === student.id && a.date === selectedDate);
      if (existingIndex > -1) {
        newAttendance[existingIndex].isPresent = true;
      } else {
        newAttendance.push({ studentId: student.id, date: selectedDate, isPresent: true });
      }
    });
    onUpdateAttendance(newAttendance);
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700">
      {/* Dynamic Header & Filter Panel */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 md:gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-madrassah-950 pointer-events-none">
           <ClipboardCheck size={200} />
        </div>
        
        <div className="relative z-10 flex items-center gap-4 md:gap-6">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-madrassah-950 text-white rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl transform -rotate-3">
              <UserCheck size={32} />
           </div>
           <div>
              <h2 className="text-xl md:text-3xl font-black text-madrassah-950 italic tracking-tight leading-none">Präsenz</h2>
              <p className="text-gray-400 font-bold uppercase text-[7px] md:text-[9px] tracking-[0.3em] mt-2 md:mt-3">Madrassah Al-Huda</p>
           </div>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 bg-gray-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-100">
             <button onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() - 1);
                setSelectedDate(current.toISOString().split('T')[0]);
             }} className="p-2 hover:bg-white rounded-lg transition-colors text-madrassah-900"><ChevronLeft size={16}/></button>
             <div className="flex items-center gap-2 px-2 md:px-4">
                <Calendar className="text-madrassah-950 hidden sm:block" size={14} />
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-black text-madrassah-950 outline-none uppercase text-[10px] tracking-widest cursor-pointer"
                />
             </div>
             <button onClick={() => {
                const current = new Date(selectedDate);
                current.setDate(current.getDate() + 1);
                setSelectedDate(current.toISOString().split('T')[0]);
             }} className="p-2 hover:bg-white rounded-lg transition-colors text-madrassah-900"><ChevronRight size={16}/></button>
          </div>

          <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-gray-100 flex items-center gap-3 relative">
             <select 
               value={selectedClass} 
               onChange={(e) => setSelectedClass(e.target.value)}
               className="bg-transparent font-black text-madrassah-950 outline-none uppercase text-[10px] tracking-widest cursor-pointer appearance-none pr-8 relative z-10"
             >
               {user.role === UserRole.PRINCIPAL && <option value="Alle">Alle Klassen</option>}
               {(assignedClasses.length > 0 ? assignedClasses : Array.from(new Set(students.map(s => s.className)))).map(c => (
                 <option key={c} value={c}>Klasse {c}</option>
               ))}
             </select>
             <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-madrassah-300 rotate-90" />
          </div>
        </div>
      </div>

      {/* Main Student List */}
      <div className="bg-white rounded-[2rem] md:rounded-[4rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center bg-gray-50/20 gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-madrassah-950 text-white rounded-xl flex items-center justify-center font-black shadow-lg">
                 <Users size={20} />
              </div>
              <div>
                 <h3 className="font-black text-madrassah-950 uppercase text-[10px] tracking-[0.2em] italic">Liste {selectedClass}</h3>
                 <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{classStudents.length} Aktive Schüler</p>
              </div>
           </div>

           <div className="relative w-full md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="Suche..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-3.5 bg-white border border-gray-100 rounded-3xl text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-madrassah-950/5 transition-all shadow-inner"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-6 md:px-12 py-5 md:py-8 font-black">Name</th>
                <th className="px-6 md:px-12 py-5 md:py-8 font-black text-center">Monats-Ziel (Min. 8)</th>
                <th className="px-6 md:px-12 py-5 md:py-8 font-black text-right">Eintrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classStudents.map(student => {
                const isPresent = getStatus(student.id);
                const monthStats = getMonthStats(student.id);
                const progress = Math.min((monthStats.present / 8) * 100, 100);
                
                return (
                  <tr key={student.id} className={`transition-all group border-l-4 md:border-l-8 ${
                    isPresent === true ? 'border-emerald-500 bg-emerald-50/20' : 
                    isPresent === false ? 'border-red-500 bg-red-50/20' : 
                    'border-transparent hover:bg-gray-50'
                  }`}>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-900 group-hover:text-madrassah-950 text-base md:text-xl uppercase tracking-tighter italic leading-tight">
                          {student.firstName} {student.lastName}
                        </span>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">ID: {student.id}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex flex-col items-center gap-2 max-w-[120px] mx-auto">
                         <div className="flex justify-between w-full text-[8px] font-black uppercase tracking-widest">
                            <span className={monthStats.present >= 8 ? 'text-emerald-600' : 'text-gray-400'}>{monthStats.present} / 8</span>
                            <span className="text-red-400">{monthStats.absent} Abw.</span>
                         </div>
                         <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${monthStats.present >= 8 ? 'bg-emerald-500' : monthStats.present >= 4 ? 'bg-indigo-400' : 'bg-amber-400'}`} 
                              style={{ width: `${progress}%` }}
                            />
                         </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-12 py-6 md:py-8">
                      <div className="flex gap-2 md:gap-3 justify-end items-center">
                        <button 
                          onClick={() => handleUpdateAttendance(student.id, true)}
                          className={`p-3 md:p-5 rounded-xl md:rounded-2xl transition-all border shadow-md active:scale-95 ${
                            isPresent === true 
                            ? 'bg-emerald-600 text-white border-emerald-700 scale-105' 
                            : 'bg-white text-gray-200 border-gray-100 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleUpdateAttendance(student.id, false)}
                          className={`p-3 md:p-5 rounded-xl md:rounded-2xl transition-all border shadow-md active:scale-95 ${
                            isPresent === false 
                            ? 'bg-red-600 text-white border-red-700 scale-105' 
                            : 'bg-white text-gray-200 border-gray-100 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <XCircle size={20} />
                        </button>
                        {isPresent !== undefined && (
                          <button 
                            onClick={() => handleClearAttendance(student.id)}
                            className="p-2 md:p-3 bg-white text-gray-300 hover:text-madrassah-950 rounded-lg"
                          >
                             <RotateCcw size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Users = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

export default AttendanceTracker;
