
import React, { useState, useMemo } from 'react';
import { Calendar, Plus, Clock, Users, X, Trash2, CalendarRange, Bell, User as UserIcon, GraduationCap, ShieldCheck, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { User, Student, ScheduledMeeting, UserRole } from '../types';

interface MeetingPlannerProps {
  user: User;
  meetings: ScheduledMeeting[];
  onUpdateMeetings: (m: ScheduledMeeting[]) => void;
  onNotify: (n: any) => void;
  students: Student[];
  users: User[];
}

const MeetingPlanner: React.FC<MeetingPlannerProps> = ({ user, meetings, onUpdateMeetings, onNotify, students, users }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    type: 'CLASSROOM' as ScheduledMeeting['type'],
    dateTime: '',
    targetType: 'GROUP' as 'GROUP' | 'INDIVIDUAL',
    targetId: 'ALL',
    meetingLink: ''
  });

  const isPrincipal = user.role === UserRole.PRINCIPAL;
  const isTeacher = user.role === UserRole.TEACHER;

  const teachers = useMemo(() => users.filter(u => u.role === UserRole.TEACHER), [users]);
  
  const availableTargets = useMemo(() => {
    if (isPrincipal) {
      return {
        groups: [{ id: 'TEACHERS_ALL', label: 'Alle Lehrer', role: UserRole.TEACHER }],
        individuals: [
          ...teachers.map(t => ({ id: t.id, label: `Lehrer: ${t.name}`, role: UserRole.TEACHER })),
          ...students.map(s => ({ id: s.id, label: `Eltern von: ${s.firstName} ${s.lastName} (${s.className})`, role: UserRole.STUDENT }))
        ]
      };
    }
    if (isTeacher) {
      const myClasses = user.assignedClasses || [];
      return {
        groups: [...myClasses.map(c => ({ id: `CLASS_${c}`, label: `Alle Eltern: Klasse ${c}`, role: UserRole.STUDENT }))],
        individuals: [
          { id: 'PRINCIPAL_ALL', label: 'Schulleitung', role: UserRole.PRINCIPAL },
          ...students.filter(s => myClasses.includes(s.className)).map(s => ({ id: s.id, label: `Eltern von: ${s.firstName} ${s.lastName}`, role: UserRole.STUDENT }))
        ]
      };
    }
    return { groups: [], individuals: [] };
  }, [isPrincipal, isTeacher, teachers, students, user]);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const meeting: ScheduledMeeting = {
      ...newMeeting,
      id: `MEET-${Date.now()}`,
      createdBy: user.name,
      hostId: user.id,
    };
    onUpdateMeetings([...meetings, meeting]);
    
    const target = [...availableTargets.groups, ...availableTargets.individuals].find(t => t.id === newMeeting.targetId);
    
    onNotify({
      userId: newMeeting.targetType === 'INDIVIDUAL' ? newMeeting.targetId : 'ALL',
      role: newMeeting.targetType === 'GROUP' ? target?.role : undefined,
      title: 'Neuer Termin geplant',
      message: `Termin "${meeting.title}" am ${new Date(meeting.dateTime).toLocaleString('de-DE')}.`,
      meetingLink: meeting.meetingLink,
      type: 'system'
    });

    setShowAdd(false);
    setNewMeeting({ title: '', type: 'CLASSROOM', dateTime: '', targetType: 'GROUP', targetId: 'ALL', meetingLink: '' });
  };

  const startMeetingNow = (meeting: ScheduledMeeting) => {
    if (meeting.meetingLink) {
      window.open(meeting.meetingLink, '_blank');
    }
    onNotify({
      userId: 'ALL',
      title: 'Zoom Meeting beginnt',
      message: `${user.name} bittet Sie zum Gespräch: "${meeting.title}". Klicken Sie zum Beitreten.`,
      meetingLink: meeting.meetingLink,
      type: 'call'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-madrassah-950 p-6 rounded-[2rem] shadow-2xl rotate-2">
            <CalendarRange className="text-white" size={36} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-madrassah-950 italic">Sprechstunden & Zoom</h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-2">Terminplanung Madrassah Al-Huda</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-madrassah-950 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all">
          <Plus size={20} /> Termin planen
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] bg-madrassah-950/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in duration-300 border-4 border-white">
            <button onClick={() => setShowAdd(false)} className="absolute top-10 right-10 text-gray-300 hover:text-red-500 transition-colors"><X size={28} /></button>
            
            <div className="mb-10">
               <h3 className="text-3xl font-black text-madrassah-950 uppercase italic tracking-tighter">Termin planen</h3>
               <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2">Zoom-Integration aktiv</p>
            </div>

            <form onSubmit={handleSchedule} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Titel des Treffens</label>
                    <input required value={newMeeting.title} onChange={e => setNewMeeting({...newMeeting, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-madrassah-950" placeholder="z.B. Eltern-Gespräch" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Kategorie</label>
                    <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl">
                       {(['CLASSROOM', 'STAFF', 'PARENT_TEACHER'] as const).map(t => (
                         <button key={t} type="button" onClick={() => setNewMeeting({...newMeeting, type: t})} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${newMeeting.type === t ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-200'}`}>
                           {t === 'CLASSROOM' ? 'Unterricht' : t === 'STAFF' ? 'Team' : 'Sprechstunde'}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Teilnehmer-Auswahl</label>
                    <select value={newMeeting.targetId} onChange={e => setNewMeeting({...newMeeting, targetId: e.target.value, targetType: e.target.value.includes('_') ? 'GROUP' : 'INDIVIDUAL'})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-black uppercase text-[10px] outline-none cursor-pointer">
                       <option value="">-- Empfänger wählen --</option>
                       <optgroup label="Gruppen">
                          {availableTargets.groups.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                       </optgroup>
                       <optgroup label="Einzelpersonen">
                          {availableTargets.individuals.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                       </optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Zoom / Meeting Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                      <input type="url" required value={newMeeting.meetingLink} onChange={e => setNewMeeting({...newMeeting, meetingLink: e.target.value})} className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-4 rounded-2xl font-bold outline-none" placeholder="https://zoom.us/j/..." />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Datum & Uhrzeit</label>
                    <input type="datetime-local" required value={newMeeting.dateTime} onChange={e => setNewMeeting({...newMeeting, dateTime: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="w-full bg-madrassah-950 text-white font-black py-6 rounded-[2rem] shadow-2xl uppercase text-[11px] tracking-[0.3em] hover:bg-black transition-all">
                Termin festlegen & Zoom-Link senden
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {meetings.sort((a,b) => a.dateTime.localeCompare(b.dateTime)).map(m => (
          <div key={m.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col justify-between group relative overflow-hidden">
            <div className={`absolute top-0 right-0 p-8 opacity-5 rotate-12 transition-transform group-hover:scale-150 ${m.type === 'CLASSROOM' ? 'text-emerald-600' : m.type === 'STAFF' ? 'text-indigo-600' : 'text-amber-600'}`}>
              {m.type === 'CLASSROOM' ? <GraduationCap size={120} /> : m.type === 'STAFF' ? <ShieldCheck size={120} /> : <Users size={120} />}
            </div>
            
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className={`p-5 rounded-2xl shadow-sm border ${m.type === 'CLASSROOM' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : m.type === 'STAFF' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {m.type === 'CLASSROOM' ? <GraduationCap size={28} /> : m.type === 'STAFF' ? <ShieldCheck size={28} /> : <Users size={28} />}
                </div>
                <button onClick={() => onUpdateMeetings(meetings.filter(x => x.id !== m.id))} className="text-gray-200 hover:text-red-500 transition-colors p-2"><Trash2 size={20} /></button>
              </div>
              
              <h4 className="text-2xl font-black text-gray-900 group-hover:text-madrassah-950 transition-colors italic leading-tight">{m.title}</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                 <Clock size={12} /> {new Date(m.dateTime).toLocaleString('de-DE')}
              </p>
              {m.meetingLink && (
                <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase">
                  <ExternalLink size={12} /> Externes Zoom-Meeting
                </div>
              )}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-50">
              <button onClick={() => startMeetingNow(m)} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-blue-700 transition-all">
                <Bell size={16} className="animate-bounce" /> Zoom jetzt starten
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MeetingPlanner;
