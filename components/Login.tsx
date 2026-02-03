
import React, { useState } from 'react';
import { ShieldCheck, User as UserIcon, Eye, EyeOff, Lock, AlertCircle, GraduationCap, ArrowRight, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole, Student } from '../types';
import LogoIcon from './LogoIcon';

interface LoginProps {
  onLogin: (user: User) => void;
  registeredUsers: User[];
  students: Student[];
}

const Login: React.FC<LoginProps> = ({ onLogin, registeredUsers, students }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.PRINCIPAL);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Bereinigung der Eingaben (besonders wichtig für mobile Apple-Tastaturen)
    const cleanName = name.trim();
    const cleanPassword = password.trim();

    if (role === UserRole.STUDENT) {
      const student = students.find(s => s.id === cleanName.toUpperCase());
      if (student) {
        onLogin({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          role: UserRole.STUDENT,
          assignedClasses: [student.className]
        });
      } else {
        setError('Schüler-ID nicht gefunden.');
      }
    } else {
      const foundUser = registeredUsers.find(u => 
        u.name.toLowerCase() === cleanName.toLowerCase() && 
        u.password === cleanPassword && 
        u.role === role
      );

      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('Benutzername oder Passwort falsch. Achten Sie auf Groß-/Kleinschreibung beim Passwort.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-madrassah-950 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10 mb-8">
        <div className="bg-madrassah-950 p-12 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-madrassah-900 rounded-full -mr-16 -mt-16 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center">
             <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-6 transform rotate-3 p-4 text-madrassah-950">
                <LogoIcon className="w-16 h-16" />
             </div>
             <h1 className="text-2xl font-extrabold mb-1 tracking-tighter uppercase leading-none">Madrassah Al-Huda</h1>
             <p className="text-madrassah-300 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Virtueller Campus</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[1.5rem]">
            {[UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); }}
                className={`flex-1 py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${role === r ? 'bg-madrassah-950 shadow-lg text-white' : 'text-gray-400 hover:text-gray-700'}`}
              >
                {r === UserRole.PRINCIPAL ? 'Leiter' : r === UserRole.TEACHER ? 'Lehrer' : 'Schüler'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {role !== UserRole.STUDENT && (
               <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                  <Info size={14} className="text-blue-600 shrink-0" />
                  <p className="text-[8px] font-bold text-blue-800 uppercase leading-relaxed">
                    {role === UserRole.TEACHER 
                      ? "Lehrer-Accounts werden vom Schulleiter verwaltet." 
                      : "Verwenden Sie Ihre Administrator-Zugangsdaten."}
                  </p>
               </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">
                {role === UserRole.STUDENT ? 'Schüler-ID (HUDA-XXXXXX)' : 'Benutzername'}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-4 text-gray-300" size={20} />
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-madrassah-950 outline-none transition-all font-semibold text-gray-800 bg-gray-50"
                  placeholder={role === UserRole.STUDENT ? "HUDA-123456" : "Name"}
                />
              </div>
            </div>

            {role !== UserRole.STUDENT && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-4 text-gray-300" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-14 pr-14 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-madrassah-950 outline-none transition-all font-semibold text-gray-800 bg-gray-50"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-4 text-gray-300">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold border border-red-100 animate-in fade-in zoom-in duration-300">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="w-full bg-madrassah-950 hover:bg-black text-white font-black py-4.5 rounded-2xl shadow-xl uppercase text-xs tracking-widest transition-all">
            Einloggen
          </button>
        </form>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:bg-white/20 transition-all cursor-pointer" onClick={() => navigate('/waitlist')}>
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-madrassah-950 shadow-xl group-hover:rotate-12 transition-transform">
               <Clock size={24} />
            </div>
            <div>
               <p className="text-white font-black uppercase text-xs tracking-tight">Neu anmelden?</p>
               <p className="text-madrassah-300 text-[10px] font-bold uppercase tracking-widest mt-1">Zur Warteliste & Terminen</p>
            </div>
         </div>
         <ArrowRight className="text-white opacity-40 group-hover:opacity-100 transition-all" />
      </div>
    </div>
  );
};

export default Login;
