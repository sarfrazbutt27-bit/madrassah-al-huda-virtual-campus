
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  Users, Calendar, BookOpen, FileText, LogOut, LayoutDashboard, PlusCircle, ShieldCheck, Settings, Library, Video, Bell, X, UserCheck, CheckCircle2, Hourglass, Menu, Users2, Settings2, Award, ClipboardList, Clock, AlertTriangle, UserX, BarChart3, Database, Download, Upload
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
import BackupSync from './components/BackupSync';

const MAX_CLASS_SIZE = 25;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('huda_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('huda_accounts');
    if (saved) return JSON.parse(saved);
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

  const [showBackupModal, setShowBackupModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePopup, setActivePopup] = useState<Notification | null>(null);
  const [showNotifCenter, setShowNotifCenter] = useState(false);
  const [incomingCall, setIncomingCall] = useState<Notification | null>(null);

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

  // Funktion zum Importieren eines kompletten Datensatzes von einem anderen Gerät
  const handleImportAllData = (allData: any) => {
    if (allData.users) setUsers(allData.users);
    if (allData.students) setStudents(allData.students);
    if (allData.subjects) setSubjects(allData.subjects);
    if (allData.grades) setGrades(allData.grades);
    if (allData.participation) setParticipation(allData.participation);
    if (allData.attendance) setAttendance(allData.attendance);
    if (allData.teacherAttendance) setTeacherAttendance(allData.teacherAttendance);
    if (allData.homework) setHomework(allData.homework);
    if (allData.submissions) setSubmissions(allData.submissions);
    if (allData.resources) setResources(allData.resources);
    if (allData.notifications) setNotifications(allData.notifications);
    if (allData.meetings) setScheduledMeetings(allData.meetings);
    if (allData.waitlist) setWaitlist(allData.waitlist);
    
    addNotification({
      userId: 'ALL',
      title: 'Daten synchronisiert',
      message: 'Der Datenbestand wurde erfolgreich von einem anderen Gerät aktualisiert.',
      type: 'system'
    });
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: Notification = {
      ...n,
      id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 50));
  };

  const syncToCloud = async () => {
    setShowBackupModal(true);
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

  const unreadCount = notifications.filter(n => !n.isRead && (currentUser && (n.userId === currentUser.id || n.userId === 'ALL' || n.role === currentUser.role))).length;

  return (
    <HashRouter>
      {!currentUser ? (
        <Routes>
          <Route path="/waitlist" element={<WaitlistForm waitlist={waitlist} onAddToWaitlist={e => setWaitlist([...waitlist, e])} />} />
          <Route path="*" element={<Login onLogin={setCurrentUser} registeredUsers={users} students={students} />} />
        </Routes>
      ) : (
        <div className="h-screen bg-gray-50 flex flex-col md:flex-row overflow-hidden relative font-sans">
          
          {showBackupModal && (
            <BackupSync 
              isOpen={showBackupModal} 
              onClose={() => setShowBackupModal(false)} 
              onImport={handleImportAllData}
              currentData={{
                users, students, subjects, grades, participation, attendance, teacherAttendance, homework, submissions, resources, notifications, meetings: scheduledMeetings, waitlist
              }}
            />
          )}

          <aside className={`no-print flex-shrink-0 bg-madrassah-950 text-white transition-all duration-300 z-50 ${mobileMenuOpen ? 'fixed inset-0' : 'hidden md:flex md:w-64'} flex-col shadow-2xl`}>
             <div className="p-6 flex flex-col items-center border-b border-white/5">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-madrassah-950 mb-3"><LogoIcon className="w-10 h-10" /></div>
                <h1 className="text-sm font-black uppercase tracking-tighter text-center">Madrassah Al-Huda</h1>
                <button onClick={() => setMobileMenuOpen(false)} className="md:hidden absolute top-6 right-6 p-2 bg-white/5 rounded-lg"><X size={20}/></button>
             </div>
             
             <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><LayoutDashboard size={18}/> Dashboard</Link>
                
                {currentUser.role !== UserRole.STUDENT && (
                  <>
                    <Link to="/attendance" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><UserCheck size={18}/> Anwesenheit</Link>
                    <Link to="/attendance-report" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><BarChart3 size={18}/> Statistik</Link>
                    <Link to="/grades" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Award size={18}/> Noten</Link>
                    <Link to="/reports" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><ClipboardList size={18}/> Zeugnisse</Link>
                  </>
                )}

                {currentUser.role === UserRole.PRINCIPAL && (
                  <>
                    <button onClick={() => { setShowBackupModal(true); setMobileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-sm font-bold"><Database size={18}/> Cloud & Backup</button>
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
        </div>
      )}
    </HashRouter>
  );
};

export default App;
