
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus, Trash2, Eye, EyeOff, ShieldCheck, User as UserIcon, Save, Settings, CheckSquare, Square, Phone } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onUpdate: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdate }) => {
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newWhatsapp, setNewWhatsapp] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.TEACHER);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Einheitliche Klassennamen-Liste
  const allClasses = [
    'J-1a', 'J-1b', 'J-2', 'J-3', 'J-4', 'J-Hifz', 'J-Arabisch',
    'M-1a', 'M-1b', 'M-2', 'M-3', 'M-4', 'M-Hifz', 'M-Arabisch'
  ];

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPassword) return;

    const newUser: User = {
      id: `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: newName,
      password: newPassword,
      whatsapp: newWhatsapp,
      role: newRole,
      assignedClasses: newRole === UserRole.TEACHER ? selectedClasses : []
    };

    onUpdate([...users, newUser]);
    setNewName('');
    setNewPassword('');
    setNewWhatsapp('');
    setSelectedClasses([]);
  };

  const toggleClass = (className: string) => {
    setSelectedClasses(prev => 
      prev.includes(className) ? prev.filter(c => c !== className) : [...prev, className]
    );
  };

  const handleDeleteUser = (id: string) => {
    if (users.length <= 1) {
      alert("Es muss mindestens ein Administrator im System verbleiben.");
      return;
    }
    if (window.confirm("Möchten Sie diesen Benutzer wirklich löschen?")) {
      onUpdate(users.filter(u => u.id !== id));
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-3xl font-extrabold text-madrassah-950 tracking-tight">Benutzerverwaltung</h2>
          <p className="text-gray-400 font-semibold">Lehrer-Accounts und Systemberechtigungen</p>
        </div>
        <div className="bg-madrassah-50 p-4 rounded-2xl border border-madrassah-100">
          <Settings className="text-madrassah-950" size={24} />
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-madrassah-950">
          <UserPlus size={24} className="text-madrassah-900" /> Neuen Account erstellen
        </h3>
        <form onSubmit={handleAddUser} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Vollständiger Name</label>
              <input 
                required
                className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-semibold"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="z.B. Br. Omar"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Passwort</label>
              <input 
                required
                className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-semibold"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Passwort wählen"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">WhatsApp / Tel.</label>
              <input 
                className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-semibold"
                value={newWhatsapp}
                onChange={e => setNewWhatsapp(e.target.value)}
                placeholder="+49 123 4567890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Rolle</label>
              <select 
                className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-bold"
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
              >
                <option value={UserRole.TEACHER}>Lehrer</option>
                <option value={UserRole.PRINCIPAL}>Schulleiter</option>
              </select>
            </div>
          </div>

          {newRole === UserRole.TEACHER && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Klassenzuordnung (Mehrfachauswahl möglich)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {allClasses.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleClass(c)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all ${selectedClasses.includes(c) ? 'bg-madrassah-950 text-white border-madrassah-950 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:border-madrassah-200'}`}
                  >
                    {selectedClasses.includes(c) ? <CheckSquare size={14} /> : <Square size={14} />}
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit"
            className="w-full md:w-auto bg-madrassah-950 hover:bg-black text-white font-black px-12 py-4.5 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase text-xs tracking-widest flex items-center justify-center gap-3"
          >
            <Save size={20} /> Account aktivieren
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-10 bg-gray-50/50 border-b flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-madrassah-950 uppercase tracking-tight">System-Konten</h3>
          <span className="text-[10px] bg-madrassah-950 text-white px-5 py-2 rounded-full font-black uppercase tracking-widest">{users.length} Benutzer</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-10 py-6 font-black">Typ</th>
                <th className="px-10 py-6 font-black">Name / Tel.</th>
                <th className="px-10 py-6 font-black">Passwort</th>
                <th className="px-10 py-6 font-black">Klassen</th>
                <th className="px-10 py-6 font-black text-right">Löschen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-madrassah-50/30 transition-all group">
                  <td className="px-10 py-6">
                    {user.role === UserRole.PRINCIPAL ? (
                      <div className="bg-purple-100 text-madrassah-950 p-3 rounded-2xl inline-block border border-purple-200"><ShieldCheck size={20} /></div>
                    ) : (
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-2xl inline-block border border-blue-100"><UserIcon size={20} /></div>
                    )}
                  </td>
                  <td className="px-10 py-6 font-extrabold text-gray-900 group-hover:text-madrassah-950 transition-colors">
                    <div className="text-lg">{user.name}</div>
                    {user.whatsapp && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                        <Phone size={10} /> {user.whatsapp}
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono bg-gray-100 px-4 py-2 rounded-xl text-gray-600 font-bold min-w-[120px] text-center border border-gray-200 shadow-inner">
                        {showPasswords[user.id] ? user.password : '••••••••'}
                      </span>
                      <button 
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-2 text-gray-400 hover:text-madrassah-950 hover:bg-madrassah-50 rounded-xl transition-all"
                      >
                        {showPasswords[user.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-wrap gap-1">
                      {user.role === UserRole.PRINCIPAL ? (
                        <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">Vollzugriff</span>
                      ) : (
                        (user.assignedClasses || []).map(c => (
                          <span key={c} className="text-[9px] font-black text-madrassah-600 uppercase tracking-widest bg-madrassah-50 px-3 py-1 rounded-lg border border-madrassah-100">{c}</span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
