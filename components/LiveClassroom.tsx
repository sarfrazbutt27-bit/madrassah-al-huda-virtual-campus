
import React, { useState, useMemo } from 'react';
import { 
  Video, Users, Sparkles, MessageSquare, 
  UsersRound, UserCog, HeartHandshake, AlertCircle, Hand, Monitor, Palette,
  BellRing, X, ExternalLink, Calendar, ChevronRight
} from 'lucide-react';
import { User, Student, UserRole, ScheduledMeeting } from '../types';

interface LiveClassroomProps {
  user: User;
  students: Student[];
  users: User[];
  onNotify: (n: any) => void;
  meetings: ScheduledMeeting[];
}

const LiveClassroom: React.FC<LiveClassroomProps> = ({ user, students, users, onNotify, meetings }) => {
  const isTeacher = user.role === UserRole.TEACHER || user.role === UserRole.PRINCIPAL;
  
  // Filter for currently relevant meetings (planned for today or live)
  const activeMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return meetings.filter(m => m.dateTime.startsWith(today)).sort((a,b) => a.dateTime.localeCompare(b.dateTime));
  }, [meetings]);

  const handleJoinZoom = (link?: string) => {
    if (link) {
      window.open(link, '_blank');
    } else {
      alert("Kein Zoom-Link für dieses Meeting hinterlegt.");
    }
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-10 animate-in fade-in duration-700">
      {/* Header Portal View */}
      <div className="bg-white p-12 md:p-20 rounded-[4rem] border border-gray-100 shadow-sm text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-600 pointer-events-none">
           <Video size={350} />
        </div>
        <div className="relative z-10">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Video size={48} />
          </div>
          <h2 className="text-5xl font-black text-madrassah-950 italic tracking-tighter">Zoom Portal</h2>
          <p className="text-gray-400 font-bold text-sm mt-6 uppercase tracking-[0.4em]">Offizielle Madrassah Al-Huda Online-Klassen</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 flex-1">
        {/* Active Meetings List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-madrassah-950 uppercase italic tracking-widest flex items-center gap-4">
              <Calendar className="text-blue-500" /> Heutige Sessions
            </h3>
            {isTeacher && (
              <a href="/#/planner" className="text-[10px] font-black text-madrassah-950 bg-gray-100 px-6 py-2 rounded-xl uppercase tracking-widest border border-gray-200">Termin planen</a>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {activeMeetings.length > 0 ? activeMeetings.map(m => (
              <div key={m.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${
                    m.type === 'CLASSROOM' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {m.type === 'CLASSROOM' ? <UsersRound size={32} /> : <UserCog size={32} />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-gray-900 uppercase italic group-hover:text-blue-600 transition-colors">{m.title}</h4>
                    <div className="flex items-center gap-4 mt-2">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                         <Clock size={12} /> {new Date(m.dateTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr
                       </span>
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">Zoom Session</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleJoinZoom(m.meetingLink)}
                  className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95"
                >
                  <ExternalLink size={18} /> Meeting Beitreten
                </button>
              </div>
            )) : (
              <div className="py-24 text-center bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-gray-100 flex flex-col items-center">
                 <Video size={80} className="text-gray-200 mb-6" />
                 <p className="text-gray-400 font-black uppercase tracking-[0.3em] italic">Aktuell keine geplanten Zoom-Klassen</p>
              </div>
            )}
          </div>
        </div>

        {/* Info & Support Sidebar */}
        <div className="space-y-8">
          <div className="bg-blue-600 p-10 rounded-[3.5rem] shadow-2xl text-white relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
               <Video size={140} />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black italic mb-4">Installations-Hilfe</h3>
              <p className="text-blue-100 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8">
                Stellen Sie sicher, dass die Zoom-App auf Ihrem Gerät installiert ist, um am Unterricht teilzunehmen.
              </p>
              <a 
                href="https://zoom.us/download" 
                target="_blank" 
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-50 transition-all shadow-lg"
              >
                App Herunterladen <ChevronRight size={16} />
              </a>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex items-center gap-4 text-madrassah-950 font-black uppercase text-[11px] tracking-widest border-b border-gray-50 pb-4">
                <AlertCircle size={20} className="text-blue-500" /> Verhaltensregeln
             </div>
             <ul className="space-y-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                <li className="flex gap-3"><span className="text-blue-500">●</span> Mikrofon stummschalten beim Beitreten</li>
                <li className="flex gap-3"><span className="text-blue-500">●</span> Hand-Heben Funktion in Zoom nutzen</li>
                <li className="flex gap-3"><span className="text-blue-500">●</span> Angemessene Kleidung & Hintergrund</li>
                <li className="flex gap-3"><span className="text-blue-500">●</span> Kamera anlassen für bessere Interaktion</li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components missing in the scope
const Clock = ({ size, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default LiveClassroom;
