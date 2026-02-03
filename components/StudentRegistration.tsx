
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save, 
  UserPlus, 
  GraduationCap, 
  Pencil, 
  User as UserIcon, 
  Users,
  Calendar,
  MapPin,
  Phone,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { Student, Gender } from '../types';
import { GoogleGenAI } from "@google/genai";

interface StudentRegistrationProps {
  students: Student[];
  onRegister?: (student: Student) => void;
  onUpdate?: (student: Student) => void;
}

const StudentRegistration: React.FC<StudentRegistrationProps> = ({ students, onRegister, onUpdate }) => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const isEditMode = !!studentId;
  
  const lessonOptions = [
    'Sa & So 11:00 - 14:00',
    'MO, Di, Mi, Do 17:00 - 19:00'
  ];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Junge' as Gender,
    birthDate: '',
    className: 'J-1a',
    guardian: '',
    address: '',
    whatsapp: '',
    lessonTimes: lessonOptions[0]
  });

  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  // Altersberechnung
  const isMinor = useMemo(() => {
    if (!formData.birthDate) return true; 
    const birth = new Date(formData.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age < 18;
  }, [formData.birthDate]);

  useEffect(() => {
    if (isEditMode) {
      const student = students.find(s => s.id === studentId);
      if (student) {
        setFormData({
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          birthDate: student.birthDate,
          className: student.className,
          guardian: student.guardian,
          address: student.address,
          whatsapp: student.whatsapp,
          lessonTimes: student.lessonTimes
        });
      }
    }
  }, [isEditMode, studentId, students]);

  // Synchronisiert mit UserManagement.tsx
  const classes = formData.gender === 'Junge' 
    ? ['J-1a', 'J-1b', 'J-2', 'J-3', 'J-4', 'J-Hifz', 'J-Arabisch'] 
    : ['M-1a', 'M-1b', 'M-2', 'M-3', 'M-4', 'M-Hifz', 'M-Arabisch'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      if (onUpdate) {
        const student = students.find(s => s.id === studentId);
        if (student) {
          onUpdate({ ...student, ...formData });
          navigate('/principal');
        }
      }
    } else {
      if (onRegister) {
        const newStudent: Student = {
          ...formData,
          id: `HUDA-${Date.now().toString().slice(-6)}`,
          registrationDate: new Date().toISOString()
        };
        onRegister(newStudent);
        navigate(`/contract/${newStudent.id}`);
      }
    }
  };

  const autoFillGuardian = async () => {
    if (!formData.lastName) return;
    setIsAiSuggesting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Ein Schüler namens ${formData.firstName} ${formData.lastName} wird angemeldet. 
      Generiere einen passenden Namen für einen Erziehungsberechtigten (Vater oder Mutter), der zum Nachnamen passt. 
      Antworte nur mit dem Namen (Vor- und Nachname).`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      if (response.text) {
        setFormData(prev => ({ ...prev, guardian: response.text.trim() }));
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-8 px-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-madrassah-950 font-bold uppercase text-[10px] tracking-widest hover:bg-white p-3 rounded-2xl transition-all"
        >
          <ArrowLeft size={16} /> Zurück zum Management
        </button>
        <div className="flex items-center gap-2 bg-madrassah-100 text-madrassah-950 px-4 py-2 rounded-xl border border-madrassah-200">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Sichere Verbindung</span>
        </div>
      </div>

      <div className="bg-madrassah-950 p-12 text-white rounded-[3rem] shadow-2xl relative overflow-hidden mb-10 border-4 border-white/10 group">
        <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
          <GraduationCap size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-black italic tracking-tight flex items-center gap-4">
            {isEditMode ? <Pencil size={36} className="text-madrassah-300" /> : <UserPlus size={36} className="text-madrassah-300" />}
            {isEditMode ? 'Stammdaten korrigieren' : 'Schüler Neuaufnahme'}
          </h2>
          <p className="text-madrassah-300 font-bold uppercase text-[11px] tracking-[0.4em] mt-4 max-w-lg leading-relaxed">
            Bitte erfassen Sie die Schülerdaten für die Madrassah Al-Huda.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-madrassah-400 to-madrassah-950"></div>
        
        <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className="w-10 h-10 bg-madrassah-50 text-madrassah-950 rounded-xl flex items-center justify-center border border-madrassah-100">
                  <UserIcon size={20} />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase text-madrassah-950 tracking-widest">Persönliche Angaben</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identitätsdaten des Schülers</p>
                </div>
              </div>
              
              <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                 {['Junge', 'Mädchen'].map(g => (
                   <button 
                    key={g} 
                    type="button" 
                    onClick={() => {
                      const newGender = g as Gender;
                      const defaultClass = newGender === 'Junge' ? 'J-1a' : 'M-1a';
                      setFormData({...formData, gender: newGender, className: defaultClass});
                    }} 
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-madrassah-950 text-white shadow-xl' : 'text-gray-400 hover:text-gray-700'}`}
                   >
                     {g}
                   </button>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vorname</label>
                  <input 
                    required 
                    autoFocus
                    value={formData.firstName} 
                    onChange={e => setFormData({...formData, firstName: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 focus:bg-white focus:border-madrassah-950 transition-all shadow-sm"
                    placeholder="Vorname"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nachname</label>
                  <input 
                    required 
                    value={formData.lastName} 
                    onChange={e => setFormData({...formData, lastName: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 focus:bg-white focus:border-madrassah-950 transition-all shadow-sm"
                    placeholder="Nachname"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Geburtsdatum</label>
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      required 
                      type="date" 
                      value={formData.birthDate} 
                      onChange={e => setFormData({...formData, birthDate: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 focus:bg-white transition-all shadow-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Klasse</label>
                  <select 
                    value={formData.className} 
                    onChange={e => setFormData({...formData, className: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-5 rounded-2xl font-black uppercase text-[11px] outline-none cursor-pointer focus:ring-4 focus:ring-madrassah-950/5 transition-all shadow-sm"
                  >
                    {classes.map(c => <option key={c} value={c}>Klasse {c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${isMinor ? 'bg-madrassah-50 text-madrassah-950 border-madrassah-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase text-madrassah-950 tracking-widest">
                    {isMinor ? 'Erziehungsberechtigte' : 'Notfallkontakt'}
                  </h3>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${isMinor ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isMinor ? 'Pflichtfeld (Minderjährig)' : 'Optional (Volljährig)'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vollständiger Name</label>
                  {isMinor && (
                    <button 
                      type="button" 
                      onClick={autoFillGuardian}
                      disabled={isAiSuggesting || !formData.lastName}
                      className="text-[9px] font-black text-purple-600 hover:text-purple-800 uppercase flex items-center gap-1.5 transition-all disabled:opacity-30"
                    >
                      <Sparkles size={12} /> {isAiSuggesting ? 'Lädt...' : 'KI-Vorschlag'}
                    </button>
                  )}
                </div>
                <div className="relative">
                   <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input 
                    required={isMinor} 
                    value={formData.guardian} 
                    onChange={e => setFormData({...formData, guardian: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 transition-all shadow-sm" 
                    placeholder={isMinor ? "Name der Eltern" : "Name des Notfallkontakts (Optional)"} 
                   />
                </div>
              </div>

              {!isMinor && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                  <Info size={16} className="text-emerald-600" />
                  <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
                    Volljähriger Schüler erkannt. Die Angabe der Eltern ist freiwillig.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Anschrift</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    required 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 transition-all shadow-sm" 
                    placeholder="Straße, Hausnummer, PLZ & Stadt" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp Kontakt</label>
                  <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      required 
                      value={formData.whatsapp} 
                      onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-100 pl-14 pr-6 py-5 rounded-2xl font-bold text-gray-800 outline-none focus:ring-4 focus:ring-madrassah-950/5 transition-all shadow-sm" 
                      placeholder="+49 1..." 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unterrichtszeit</label>
                  <select 
                    value={formData.lessonTimes} 
                    onChange={e => setFormData({...formData, lessonTimes: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-5 rounded-2xl font-black uppercase text-[11px] outline-none cursor-pointer focus:ring-4 focus:ring-madrassah-950/5 shadow-sm"
                  >
                    {lessonOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-50 flex flex-col items-center">
            <button 
              type="submit" 
              className="w-full md:w-auto bg-madrassah-950 hover:bg-black text-white px-20 py-7 rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.3em] shadow-[0_20px_50px_rgba(63,0,66,0.3)] hover:shadow-[0_25px_60px_rgba(63,0,66,0.4)] transition-all hover:-translate-y-1.5 active:scale-95 flex items-center justify-center gap-4 group"
            >
               <Save size={24} className="group-hover:rotate-12 transition-transform" /> 
               {isEditMode ? 'Daten aktualisieren' : 'Schüler jetzt anmelden'}
            </button>
            <p className="mt-8 text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">Sichere Speicherung im Madrassah Al-Huda System</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistration;
