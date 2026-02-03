
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Award, 
  FileText, 
  GraduationCap, 
  Library, 
  Video, 
  UserPlus, 
  ClipboardList,
  CheckCircle,
  UserMinus,
  ArrowRight,
  Printer,
  FileDown,
  Sparkles,
  Clock,
  Loader2,
  CalendarDays,
  AlertCircle,
  TrendingDown,
  ChevronRight,
  LayoutGrid,
  Users,
  Search,
  Pencil,
  IdCard,
  AlertTriangle,
  Phone
} from 'lucide-react';
import { Student, User, TeacherAttendance, Attendance, Grade, UserRole } from '../types';

interface TeacherDashboardProps {
  user: User;
  students: Student[];
  attendance: Attendance[];
  teacherAttendance: TeacherAttendance[];
  onUpdateTeacherAttendance: (ta: TeacherAttendance[]) => void;
  grades?: Grade[];
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ 
  user, 
  students, 
  attendance,
  teacherAttendance, 
  onUpdateTeacherAttendance,
  grades = []
}) => {
  const [studentSearch, setStudentSearch] = useState('');
  
  const assignedClasses = user.assignedClasses || [];
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter students by teacher's classes and active status
  const myStudents = useMemo(() => {
    return students.filter(s => assignedClasses.includes(s.className) && s.status === 'active');
  }, [students, assignedClasses]);

  // Yellow Table Logic (6+ absences this month)
  const yellowList = useMemo(() => {
    return myStudents.filter(student => {
      const studentAbsences = attendance.filter(a => 
        a.studentId === student.id && 
        !a.isPresent && 
        new Date(a.date).getMonth() === currentMonth &&
        new Date(a.date).getFullYear() === currentYear
      ).length;
      return studentAbsences >= 6;
    }).map(student => {
       const count = attendance.filter(a => 
        a.studentId === student.id && 
        !a.isPresent && 
        new Date(a.date).getMonth() === currentMonth &&
        new Date(a.date).getFullYear() === currentYear
      ).length;
      return { ...student, absenceCount: count };
    });
  }, [myStudents, attendance, currentMonth, currentYear]);

  const myClassDetails = useMemo(() => {
    return assignedClasses.map(className => {
      const classStudents = students.filter(s => s.className === className && s.status === 'active');
      const boys = classStudents.filter(s => s.gender === 'Junge').length;
      const girls = classStudents.filter(s => s.gender === 'Mädchen').length;
      return { name: className, count: classStudents.length, boys, girls };
    });
  }, [assignedClasses, students]);

  const cards = [
    { title: 'Präsenz', icon: <UserCheck size={32} />, path: '/attendance', color: 'emerald', desc: 'Anwesenheit.' },
    { title: 'Noten', icon: <Award size={32} />, path: '/grades', color: 'madrassah', desc: 'Punkte.' },
    { title: 'Zeugnisse', icon: <ClipboardList size={32} />, path: '/reports', color: 'purple', desc: 'Freigabe.' },
    { title: 'Hausaufgaben', icon: <FileText size={32} />, path: '/homework', color: 'indigo', desc: 'Aufgaben.' },
    { title: 'Bibliothek', icon: <Library size={32} />, path: '/library', color: 'blue', desc: 'Medien.' },
    { title: 'Zoom', icon: <Video size={32} />, path: '/live', color: 'rose', desc: 'Online.' },
  ];

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-500 pb-20 px-2 md:px-0">
      {/* Header Info Bar */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-madrassah-950 pointer-events-none">
           <GraduationCap size={150} />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-2xl md:text-4xl font-black text-madrassah-950 tracking-tight leading-none italic uppercase">Salaam, {user.name}</h2>
          <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.4em] mt-3">Lehrkraft • {assignedClasses.join(', ')}</p>
        </div>
        <div className="bg-madrassah-50 px-6 md:px-10 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] border border-madrassah-100 text-center shadow-inner relative z-10">
           <div className="text-[8px] md:text-[10px] font-black text-madrassah-900 uppercase tracking-widest mb-1">Meine Schüler</div>
           <div className="text-2xl md:text-4xl font-black text-madrassah-950 leading-none">{myStudents.length}</div>
        </div>
      </div>

      {/* Yellow Table: Warnings (Gelbe Tabelle) */}
      {yellowList.length > 0 && (
        <div className="space-y-5 animate-in slide-in-from-top duration-700">
           <div className="flex items-center gap-3 px-4">
              <div className="p-2.5 bg-amber-400 text-white rounded-2xl shadow-lg animate-pulse">
                 <AlertTriangle size={24} />
              </div>
              <div>
                 <h3 className="text-xl md:text-2xl font-black text-madrassah-950 uppercase tracking-tighter italic">⚠️ Gelbe Liste (Warnung)</h3>
                 <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-1">Dringende Eltern-Kontakte erforderlich</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {yellowList.map(student => (
                <div key={student.id} className="bg-white p-6 rounded-[2rem] border-2 border-amber-100 shadow-xl flex flex-col space-y-5 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 -mr-8 -mt-8 rounded-full"></div>
                   <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-amber-400 text-white rounded-2xl flex items-center justify-center font-black text-lg">
                            {student.absenceCount}
                         </div>
                         <div>
                            <h4 className="font-black text-madrassah-950 uppercase text-base leading-tight italic">{student.firstName} {student.lastName}</h4>
                            <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest">Fehltage diesen Monat</p>
                         </div>
                      </div>
                      <span className="bg-madrassah-950 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest">{student.className}</span>
                   </div>
                   <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 relative z-10">
                      <p className="text-[10px] font-bold text-amber-800 leading-relaxed italic">"6 Fehltage erreicht. Bitte Erziehungsberechtigte ({student.guardian}) kontaktieren."</p>
                   </div>
                   <div className="flex gap-3 relative z-10">
                      <a href={`tel:${student.whatsapp}`} className="flex-1 bg-amber-400 hover:bg-amber-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg">
                         <Phone size={16} /> Anrufen
                      </a>
                      <a href={`https://wa.me/${student.whatsapp.replace(/\D/g,'')}`} target="_blank" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg">
                         <MessageCircle size={16} /> WhatsApp
                      </a>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Klassenübersicht */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-4">
           <div className="p-2.5 bg-madrassah-950 text-white rounded-2xl shadow-lg">
              <LayoutGrid size={24} />
           </div>
           <h3 className="text-xl md:text-2xl font-black text-madrassah-950 uppercase tracking-tighter italic">Klassen-Übersicht</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
           {myClassDetails.map((cls, idx) => (
             <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 opacity-[0.03] text-madrassah-950 rotate-12 group-hover:rotate-0 transition-transform">
                   <Users size={120} />
                </div>
                <div className="relative z-10">
                   <div className="flex justify-between items-start mb-6">
                      <span className="bg-madrassah-950 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic shadow-lg">Klasse {cls.name}</span>
                      <div className="text-right">
                         <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none">Aktiv</p>
                         <p className="text-2xl md:text-3xl font-black text-madrassah-950">{cls.count}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-center">
                         <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-1">Jungs</p>
                         <p className="text-sm font-black text-blue-700">{cls.boys}</p>
                      </div>
                      <div className="flex-1 bg-rose-50/50 p-3 rounded-2xl border border-rose-100 text-center">
                         <p className="text-[8px] font-black text-rose-400 uppercase tracking-widest mb-1">Mädels</p>
                         <p className="text-sm font-black text-rose-700">{cls.girls}</p>
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Grid Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, i) => (
          <Link key={i} to={card.path} className="bg-white p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative">
            <div className={`absolute top-0 right-0 p-8 opacity-5 text-${card.color}-600 rotate-12 group-hover:scale-150 transition-transform`}>
              {React.cloneElement(card.icon as React.ReactElement<any>, { size: 140 })}
            </div>
            <div className="relative z-10">
              <div className={`bg-${card.color}-50 w-20 h-20 rounded-[1.75rem] flex items-center justify-center text-${card.color}-600 mb-8 border border-${card.color}-100 shadow-sm`}>
                {card.icon}
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">{card.title}</h3>
              <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest">{card.desc}</p>
              <div className="mt-8 flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase group-hover:text-madrassah-950 transition-colors">
                 Öffnen <ArrowRight size={16} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const MessageCircle = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
  </svg>
);

export default TeacherDashboard;
