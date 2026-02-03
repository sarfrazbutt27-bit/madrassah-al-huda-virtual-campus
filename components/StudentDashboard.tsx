
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Book, 
  CheckCircle, 
  Clock, 
  FileText, 
  Library, 
  MessageSquare, 
  Video, 
  GraduationCap, 
  TrendingUp, 
  Star, 
  Award,
  Calendar,
  ChevronRight,
  TrendingDown,
  Lock,
  Unlock,
  Printer,
  ClipboardCheck
} from 'lucide-react';
import { Student, User, Homework, HomeworkSubmission, Resource, Grade, Attendance } from '../types';

interface StudentDashboardProps {
  user: User;
  students: Student[];
  homework: Homework[];
  submissions: HomeworkSubmission[];
  resources: Resource[];
  grades?: Grade[];
  attendance?: Attendance[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  user, students, homework, submissions, resources, grades = [], attendance = [] 
}) => {
  const student = students.find(s => s.id === user.id);
  const myClass = student?.className || '';
  
  const myHomework = homework.filter(h => h.className === myClass);
  const myResources = resources.filter(r => r.className === myClass);
  const myGrades = grades.filter(g => g.studentId === user.id);
  const myAttendance = attendance.filter(a => a.studentId === user.id);
  
  const pendingHomework = myHomework.filter(h => !submissions.some(s => s.homeworkId === h.id && s.studentId === user.id));
  const latestResources = myResources.slice(-3).reverse();

  const attendanceRate = useMemo(() => {
    if (myAttendance.length === 0) return 0;
    const present = myAttendance.filter(a => a.isPresent).length;
    return Math.round((present / myAttendance.length) * 100);
  }, [myAttendance]);

  const averagePoints = useMemo(() => {
    if (myGrades.length === 0) return 0;
    const sum = myGrades.reduce((acc, g) => acc + g.points, 0);
    return Math.round(sum / myGrades.length);
  }, [myGrades]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Welcome Header */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-madrassah-900 pointer-events-none">
          <GraduationCap size={180} />
        </div>
        <div className="relative z-10 text-center md:text-left">
          <h2 className="text-4xl font-black text-madrassah-950 tracking-tight leading-none italic">As-salamu alaykum, {student?.firstName}!</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">Klasse: {myClass} • Dein Lernbereich</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-emerald-50 px-8 py-5 rounded-[2rem] border border-emerald-100 text-center shadow-inner">
             <div className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Offene Aufgaben</div>
             <div className="text-3xl font-black text-emerald-950 leading-none">{pendingHomework.length}</div>
          </div>
          <div className="bg-indigo-50 px-8 py-5 rounded-[2rem] border border-indigo-100 text-center shadow-inner">
             <div className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">Präsenz</div>
             <div className="text-3xl font-black text-indigo-950 leading-none">{attendanceRate}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Zeugnisse Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-black text-madrassah-950 uppercase tracking-wider flex items-center gap-3 px-2">
               <ClipboardCheck size={20} className="text-purple-500" /> Meine Zeugnisse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[
                 { term: 'Halbjahr', released: student?.reportReleasedHalbjahr, title: 'Halbjahres-Bericht' },
                 { term: 'Abschluss', released: student?.reportReleasedAbschluss, title: 'Hauptzeugnis' }
               ].map((rpt, i) => (
                 <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${rpt.released ? 'bg-white border-madrassah-100 shadow-lg' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-6">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rpt.released ? 'bg-madrassah-950 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {rpt.released ? <Unlock size={22} /> : <Lock size={22} />}
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${rpt.released ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                          {rpt.released ? 'Veröffentlicht' : 'In Bearbeitung'}
                       </span>
                    </div>
                    <h4 className="text-lg font-black text-madrassah-950 mb-1">{rpt.title}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">{rpt.term} 2024</p>
                    
                    {rpt.released ? (
                      <Link to={`/report-card/${user.id}`} className="w-full bg-madrassah-950 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all">
                        <Printer size={16} /> Ansehen & Drucken
                      </Link>
                    ) : (
                      <div className="w-full bg-gray-200 text-gray-400 font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                         Noch gesperrt
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>

          {/* Homework Quick View */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xl font-black text-madrassah-950 uppercase tracking-wider flex items-center gap-3">
                 <Clock size={20} className="text-emerald-500" /> Aktuelle Aufgaben
               </h3>
               <Link to="/homework" className="text-[10px] font-black text-madrassah-900 uppercase tracking-widest hover:underline">Alle ansehen</Link>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {pendingHomework.length > 0 ? pendingHomework.slice(0, 3).map(h => (
                <Link key={h.id} to="/homework" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-madrassah-200 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-madrassah-950 font-black text-xs border border-gray-100 group-hover:bg-madrassah-950 group-hover:text-white transition-all">
                        {h.subject.charAt(0)}
                     </div>
                     <div>
                        <h4 className="font-extrabold text-gray-900 group-hover:text-madrassah-950">{h.title}</h4>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{h.subject} • Fällig: {new Date(h.dueDate).toLocaleDateString('de-DE')}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Book size={18} />
                     </div>
                  </div>
                </Link>
              )) : (
                <div className="bg-emerald-50/30 p-12 rounded-[2.5rem] border border-dashed border-emerald-100 text-center">
                   <CheckCircle size={48} className="mx-auto text-emerald-200 mb-4" />
                   <p className="text-emerald-800 font-bold italic">Alles erledigt! Keine offenen Aufgaben.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           {/* Live Meeting Hook */}
           <Link to="/live" className="block bg-emerald-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-20 text-white animate-pulse">
                <Video size={80} />
              </div>
              <div className="relative z-10 text-white">
                 <span className="bg-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full inline-block mb-4">Live Jetzt</span>
                 <h3 className="text-2xl font-black italic">Zum Live Unterricht</h3>
              </div>
           </Link>

           {/* Personal Stats Widget */}
           <div className="bg-madrassah-950 p-8 rounded-[2.5rem] shadow-xl text-white">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-madrassah-400 mb-6">Deine Erfolge</h3>
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><TrendingUp size={16} /></div>
                       <span className="text-xs font-bold">Durchschnitt</span>
                    </div>
                    <span className="font-black text-lg">{averagePoints} Pkt.</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Calendar size={16} /></div>
                       <span className="text-xs font-bold">Anwesenheit</span>
                    </div>
                    <span className="font-black text-lg">{attendanceRate}%</span>
                 </div>
              </div>
           </div>

           {/* Latest Resources */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">Materialien</h3>
              <div className="space-y-4">
                 {latestResources.map(r => (
                   <a key={r.id} href={r.url} target="_blank" className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-madrassah-50 flex items-center justify-center text-madrassah-900 border border-madrassah-100 group-hover:bg-madrassah-950 group-hover:text-white transition-all">
                        {r.type === 'pdf' ? <FileText size={18} /> : <Library size={18} />}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-xs truncate group-hover:text-madrassah-950">{r.title}</p>
                      </div>
                   </a>
                 ))}
              </div>
              <Link to="/library" className="block text-center pt-2 text-[9px] font-black text-madrassah-900 uppercase tracking-widest hover:underline">Bibliothek öffnen</Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
