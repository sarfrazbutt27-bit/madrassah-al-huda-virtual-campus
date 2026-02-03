
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, BookOpen, FileText, LogOut, LayoutDashboard, PlusCircle, ShieldCheck, Settings, Library, Video, Bell, X, UserCheck, CheckCircle2, Hourglass, Menu, Users2, Settings2, Award, ClipboardList, Clock, AlertTriangle, UserX, BarChart3
} from 'lucide-react';
import { User, UserRole, Student, Grade, Attendance, ParticipationRecord, TeacherAttendance, Homework, HomeworkSubmission, Resource, Message, Notification, ScheduledMeeting, WaitlistEntry, CourseType } from './types';
import Login from './components/Login';
import PrincipalDashboard from './components/PrincipalDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import StudentRegistration from './components/StudentRegistration';
import ContractView from './components/ContractView';
import AttendanceTracker from './components/AttendanceTracker';
import AttendancePrintView from './components/AttendancePrintView';
import TeacherAttendanceReport from './components/TeacherAttendanceReport';
import MonthlyAttendanceReport from './components/MonthlyAttendanceReport';
import GradingSystem from './components/GradingSystem';
import ReportCard from './components/ReportCard';
import UserManagement from './components/UserManagement';
import LogoIcon from './components/LogoIcon';
import SubjectManagement from './components/SubjectManagement';
import ReportManager from './components/ReportManager';
import HomeworkManager from './components/HomeworkManager';
import ResourceManager from './components/ResourceManager';
import LiveClassroom from './components/LiveClassroom';
import MeetingPlanner from './components/MeetingPlanner';
import WaitlistForm from './components/WaitlistForm';
import WaitlistManagement from './components/WaitlistManagement';

const MAX_CLASS_SIZE = 25;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('huda_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('huda_accounts');
    if (saved) return JSON.parse(saved);
    // Standard-Accounts für den ersten Start
    return [
      { id: 'admin-1', name: 'Schulleiter', role: UserRole.PRINCIPAL, password: 'admin', assignedClasses: [] },
      { id: 'teacher-1', name: 'Lehrer', role: UserRole.TEACHER, password: 'lehrer', assignedClasses: ['J-1a', 'M-1a'] }
    ];
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('huda_students');
    return saved ? JSON.parse(saved).map((s: any) => ({...s, status: s.status || 'active'})) : [];
  });

  const [subjects, setSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('huda_subjects');
    if (saved) return JSON.parse(saved);
    return ['Qur\'an', 'Tajwid', 'Hifz', 'Fiqh', 'Sierah', 'Akhlaq'];
  });

  const [grades, setGrades] = useState<Grade[]>(() => {
    const saved = localStorage.getItem('huda_grades');
    return saved ? JSON.parse(saved) : [];
  });

  const [participation, setParticipation] = useState<ParticipationRecord[]>(() => {
    const saved = localStorage.getItem('huda_participation');
    return saved ? JSON.parse(saved) : [];
  });

  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('huda_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(() => {
    const saved = localStorage.getItem('huda_teacher_attendance');
    return saved ? JSON.parse(saved) : [];
  });

  const [homework, setHomework] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('huda_homework');
    return saved ? JSON.parse(saved) : [];
  });

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem('huda_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('huda_resources');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('huda_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  const [scheduledMeetings, setScheduledMeetings] = useState<ScheduledMeeting[]>(() => {
    const saved = localStorage.getItem('huda_meetings');
    return saved ? JSON.parse(saved) : [];
  });

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(() => {
    const saved = localStorage.getItem('huda_waitlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [incomingCall, setIncomingCall] = useState<Notification | null>(null);
  const [activePopup, setActivePopup] = useState<Notification | null>(null);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const pingSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('huda_user', JSON.stringify(currentUser));
    localStorage.setItem('huda_accounts', JSON.stringify(users));
    localStorage.setItem('huda_students', JSON.stringify(students));
    localStorage.setItem('huda_subjects', JSON.stringify(subjects));
    localStorage.setItem('huda_grades', JSON.stringify(grades));
    localStorage.setItem('huda_participation', JSON.stringify(participation));
    localStorage.setItem('huda_attendance', JSON.stringify(attendance));
    localStorage.setItem('huda_teacher_attendance', JSON.stringify(teacherAttendance));
    localStorage.setItem('huda_homework', JSON.stringify(homework));
    localStorage.setItem('huda_submissions', JSON.stringify(submissions));
    localStorage.setItem('huda_resources', JSON.stringify(resources));
    localStorage.setItem('huda_notifications', JSON.stringify(notifications));
    localStorage.setItem('huda_meetings', JSON.stringify(scheduledMeetings));
    localStorage.setItem('huda_waitlist', JSON.stringify(waitlist));
  }, [currentUser, users, students, subjects, grades, participation, attendance, teacherAttendance, homework, submissions, resources, notifications, scheduledMeetings, waitlist]);

  // Check Attendance Logic for Warning (Yellow) and Dismissal (Red)
  useEffect(() => {
    if (attendance.length === 0) return;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let studentUpdates: Student[] = [...students];
    let newNotifs: Omit<Notification, 'id' | 'timestamp' | 'isRead'>[] = [];

    students.forEach(student => {
      if (student.status === 'dismissed') return;

      const studentAttendance = attendance.filter(a => a.studentId === student.id).sort((a,b) => b.date.localeCompare(a.date));
      
      // 1. Check for 6 absences in current month (Yellow)
      const thisMonthAbsences = studentAttendance.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && !a.isPresent;
      }).length;

      if (thisMonthAbsences >= 6) {
        const alreadyNotified = notifications.some(n => n.userId === 'ALL' && n.message.includes(student.id) && n.title === 'Gelbe Liste Warnung');
        if (!alreadyNotified) {
          newNotifs.push({
            userId: 'ALL',
            role: UserRole.TEACHER,
            title: 'Gelbe Liste Warnung',
            message: `SCHÜLER ${student.firstName} ${student.lastName} (${student.id}) hat 6 Fehltage in diesem Monat erreicht. Bitte Kontakt aufnehmen.`,
            type: 'system'
          });
        }
      }

      // 2. Check for 16 consecutive absences (Red)
      let consecutiveAbsences = 0;
      for (const record of studentAttendance) {
        if (!record.isPresent) {
          consecutiveAbsences++;
        } else {
          break;
        }
      }

      if (consecutiveAbsences >= 16) {
        const idx = studentUpdates.findIndex(s => s.id === student.id);
        if (idx > -1) {
          studentUpdates[idx] = { ...studentUpdates[idx], status: 'dismissed' };
          newNotifs.push({
            userId: 'ALL',
            role: UserRole.PRINCIPAL,
            title: 'Rote Liste: Ausschluss',
            message: `${student.firstName} ${student.lastName} wurde nach 16 aufeinanderfolgenden Fehltagen in die Rote Liste verschoben.`,
            type: 'system'
          });
        }
      }
    });

    if (newNotifs.length > 0) {
      newNotifs.forEach(n => addNotification(n));
    }
    
    // Only update if changes occurred to avoid infinite loops
    const hasChanges = JSON.stringify(studentUpdates) !== JSON.stringify(students);
    if (hasChanges) {
      setStudents(studentUpdates);
    }
  }, [attendance]);

  useEffect(() => {
    if (activePopup) {
      const timer = setTimeout(() => setActivePopup(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [activePopup]);

  useEffect(() => {
    if (!currentUser) return;
    const latestCall = notifications.find(n => n.type === 'call' && !n.isRead && (n.userId === 'ALL' || n.userId === currentUser.id || n.role === currentUser.role));
    if (latestCall && !incomingCall) {
      setIncomingCall(latestCall);
      try { ringtoneRef.current?.play(); } catch (e) {}
    }
  }, [notifications, currentUser, incomingCall]);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: Notification = {
      ...n,
      id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
    const isMe = !currentUser || n.userId === currentUser.id || n.userId === 'ALL' || n.role === currentUser.role;
    if (isMe && n.type !== 'call') {
      setActivePopup(newNotif);
      try { 
        if (pingSoundRef.current) {
          pingSoundRef.current.currentTime = 0;
          pingSoundRef.current.play();
        }
      } catch (e) {}
    }
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    if (incomingCall?.id === id) {
      setIncomingCall(null);
      ringtoneRef.current?.pause();
    }
    if (activePopup?.id === id) setActivePopup(null);
  };

  const syncToCloud = async () => {
    setSyncStatus('syncing');
    await new Promise(r => setTimeout(r, 1000));
    setSyncStatus('success');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  const findAvailableClass = (start: string): string => {
    const count = students.filter(s => s.className === start).length;
    return count < MAX_CLASS_SIZE ? start : start; 
  };

  const handleConvertToStudent = (entry: WaitlistEntry, reqClass: string) => {
    const finalClass = findAvailableClass(reqClass);
    const newStudent: Student = {
      ...entry, id: `HUDA-${Date.now().toString().slice(-6)}`, className: finalClass, registrationDate: new Date().toISOString(), status: 'active'
    };
    setStudents([...students, newStudent]);
    setWaitlist(waitlist.filter(w => w.id !== entry.id));
    addNotification({ userId: currentUser?.id || 'admin-1', title: 'Schüler aufgenommen', message: `${entry.firstName} ist jetzt in Klasse ${finalClass}.`, type: 'system' });
  };

  const myNotifications = notifications.filter(n => currentUser && (n.userId === currentUser.id || n.userId === 'ALL' || n.role === currentUser.role));
  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  return (
    <HashRouter>
      {!currentUser ? (
        <Routes>
          <Route path="/waitlist" element={<WaitlistForm waitlist={waitlist} onAddToWaitlist={e => setWaitlist([...waitlist, e])} />} />
          <Route path="*" element={<Login onLogin={setCurrentUser} registeredUsers={users} students={students} />} />
        </Routes>
      ) : (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden relative">
          <audio ref={ringtoneRef} src="https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3" loop />
          <audio ref={pingSoundRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" />

          {/* Toast Notification Popup */}
          {activePopup && (
            <div onClick={() => markRead(activePopup.id)} className="fixed top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm cursor-pointer animate-in slide-in-from-top duration-300">
              <div className="bg-madrassah-950 text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4">
                 <div className="bg-white/10 p-2 rounded-lg"><Bell size={20} className="animate-pulse" /></div>
                 <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-madrassah-300 tracking-widest">{activePopup.title}</p>
                    <p className="text-xs truncate font-medium">{activePopup.message}</p>
                 </div>
                 <button onClick={e => { e.stopPropagation(); setActivePopup(null); }} className="opacity-40 hover:opacity-100"><X size={16} /></button>
              </div>
            </div>
          )}

          {/* Call Modal */}
          {incomingCall && (
            <div className="fixed inset-0 z-[1100] bg-madrassah-950/95 backdrop-blur-xl flex items-center justify-center p-6">
              <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-4 border-white animate-in zoom-in">
                <Video size={50} className="mx-auto text-blue-600 mb-6 animate-bounce" />
                <h3 className="text-2xl font-black text-madrassah-950 uppercase italic">{incomingCall.title}</h3>
                <p className="text-gray-500 mt-4 text-sm mb-10 leading-relaxed">{incomingCall.message}</p>
                <div className="flex flex-col gap-3">
                  <a href={incomingCall.meetingLink} target="_blank" onClick={() => markRead(incomingCall.id)} className="bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Beitreten</a>
                  <button onClick={() => markRead(incomingCall.id)} className="text-gray-400 font-bold uppercase text-[9px] py-2">Abbrechen</button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar / Mobile Nav */}
          <aside className={`no-print flex-shrink-0 bg-madrassah-950 text-white transition-all duration-300 z-50 ${mobileMenuOpen ? 'fixed inset-0' : 'hidden md:flex md:w-64'} flex-col shadow-2xl`}>
             <div className="p-6 flex flex-col items-center border-b border-white/5">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-madrassah-950 mb-3"><LogoIcon className="w-10 h-10" /></div>
                <h1 className="text-sm font-black uppercase tracking-tighter text-center">Madrassah Al-Huda</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 right-6 p-2 bg-white/5 rounded-lg"><X size={20}/></button>
             </div>
             
             <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><LayoutDashboard size={18}/> Dashboard</Link>
                <button onClick={() => { setShowNotifCenter(true); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold relative"><Bell size={18}/> Meldungen {unreadCount > 0 && <span className="bg-white text-madrassah-950 px-1.5 py-0.5 rounded-full text-[8px] font-black absolute right-4">{unreadCount}</span>}</button>
                
                {currentUser.role !== UserRole.STUDENT && (
                  <>
                    <Link to="/attendance" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><UserCheck size={18}/> Anwesenheit</Link>
                    <Link to="/attendance-report" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><BarChart3 size={18}/> Statistik</Link>
                    <Link to="/grades" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Award size={18}/> Noten</Link>
                    <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><ClipboardList size={18}/> Zeugnisse</Link>
                    <Link to="/planner" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Calendar size={18}/> Planer</Link>
                  </>
                )}

                {currentUser.role === UserRole.PRINCIPAL && (
                  <>
                    <Link to="/waitlist-management" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Hourglass size={18}/> Warteliste</Link>
                    <Link to="/users" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Users2 size={18}/> Accounts</Link>
                    <Link to="/subjects" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Settings2 size={18}/> Fächer</Link>
                  </>
                )}

                <Link to="/homework" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><PlusCircle size={18}/> Aufgaben</Link>
                <Link to="/library" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Library size={18}/> Bibliothek</Link>
                <Link to="/live" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold text-blue-400"><Video size={18}/> Zoom</Link>
             </nav>
             
             <div className="p-4 border-t border-white/5">
                <button onClick={() => setCurrentUser(null)} className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-300 rounded-xl text-xs font-black"><LogOut size={16}/> Abmelden</button>
             </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 flex flex-col min-w-0">
             <header className="no-print h-16 bg-white border-b flex md:hidden items-center justify-between px-4">
                <button onClick={() => setMobileMenuOpen(true)} className="p-2 bg-gray-50 rounded-lg text-madrassah-950"><Menu size={20}/></button>
                <div className="w-10 h-10 bg-madrassah-950 text-white rounded-lg flex items-center justify-center p-1.5"><LogoIcon /></div>
                <div className="w-8"></div>
             </header>

             <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <Routes>
                  <Route path="/" element={<Navigate to={currentUser.role === UserRole.PRINCIPAL ? '/principal' : currentUser.role === UserRole.TEACHER ? '/teacher' : '/student'} />} />
                  <Route path="/principal" element={<PrincipalDashboard students={students} users={users} grades={grades} attendance={attendance} onSync={syncToCloud} syncStatus={syncStatus} onDeleteStudent={id => setStudents(students.filter(s => s.id !== id))} onRestoreStudent={id => setStudents(students.map(s => s.id === id ? {...s, status: 'active'} : s))} />} />
                  <Route path="/teacher" element={<TeacherDashboard user={currentUser} students={students} attendance={attendance} teacherAttendance={teacherAttendance} onUpdateTeacherAttendance={setTeacherAttendance} />} />
                  <Route path="/student" element={<StudentDashboard user={currentUser} students={students} homework={homework} submissions={submissions} resources={resources} grades={grades} attendance={attendance} />} />
                  <Route path="/register" element={<StudentRegistration students={students} onRegister={s => setStudents([...students, s])} />} />
                  <Route path="/edit-student/:studentId" element={<StudentRegistration students={students} onUpdate={u => setStudents(students.map(s => s.id === u.id ? u : s))} />} />
                  <Route path="/contract/:studentId" element={<ContractView students={students} />} />
                  <Route path="/users" element={<UserManagement users={users} onUpdate={setUsers} />} />
                  <Route path="/subjects" element={<SubjectManagement subjects={subjects} onUpdate={setSubjects} />} />
                  <Route path="/attendance" element={<AttendanceTracker user={currentUser} students={students} attendance={attendance} teacherAttendance={teacherAttendance} onUpdateAttendance={setAttendance} onUpdateTeacherAttendance={setTeacherAttendance} />} />
                  <Route path="/attendance-report" element={<MonthlyAttendanceReport students={students} attendance={attendance} user={currentUser} />} />
                  <Route path="/attendance/print/:className/:month/:year" element={<AttendancePrintView user={currentUser} students={students} />} />
                  <Route path="/homework" element={<HomeworkManager user={currentUser} students={students} homework={homework} submissions={submissions} onUpdateHomework={setHomework} onUpdateSubmissions={setSubmissions} subjects={subjects} onNotify={addNotification} />} />
                  <Route path="/library" element={<ResourceManager user={currentUser} resources={resources} onUpdateResources={setResources} subjects={subjects} students={students} onNotify={addNotification} />} />
                  <Route path="/live" element={<LiveClassroom user={currentUser} students={students} users={users} onNotify={addNotification} meetings={scheduledMeetings} />} />
                  <Route path="/grades" element={<GradingSystem user={currentUser} students={students} subjects={subjects} grades={grades} participation={participation} onUpdateGrades={setGrades} onUpdateParticipation={setParticipation} />} />
                  <Route path="/reports" element={<ReportManager user={currentUser} students={students} subjects={subjects} grades={grades} onUpdateStudents={setStudents} />} />
                  <Route path="/report-card/:studentId" element={<ReportCard user={currentUser} students={students} subjects={subjects} grades={grades} participation={participation} onUpdateParticipation={setParticipation} />} />
                  <Route path="/waitlist-management" element={<WaitlistManagement waitlist={waitlist} onRemove={id => setWaitlist(waitlist.filter(w => w.id !== id))} onConvertToStudent={handleConvertToStudent} />} />
                  <Route path="/planner" element={<MeetingPlanner user={currentUser} meetings={scheduledMeetings} onUpdateMeetings={setScheduledMeetings} onNotify={addNotification} students={students} users={users} />} />
                </Routes>
             </div>
          </main>

          {/* Notification Sidebar */}
          {showNotifCenter && (
            <div className="fixed inset-0 z-[1000] bg-madrassah-950/20 backdrop-blur-sm flex justify-end">
               <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                  <div className="p-6 border-b flex items-center justify-between">
                     <h3 className="text-lg font-black uppercase italic text-madrassah-950">Meldungen</h3>
                     <button onClick={() => setShowNotifCenter(false)} className="p-2"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                     {myNotifications.map(n => (
                       <div key={n.id} onClick={() => markRead(n.id)} className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'opacity-40' : 'bg-gray-50 border-madrassah-100 shadow-sm'}`}>
                          <h4 className="text-[10px] font-black uppercase text-madrassah-950 tracking-widest">{n.title}</h4>
                          <p className="text-xs mt-1 leading-relaxed">{n.message}</p>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </HashRouter>
  );
};

export default App;
