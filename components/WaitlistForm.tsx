
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  QrCode,
  Loader2,
  ExternalLink,
  MapPin,
  Users,
  Info,
  Phone
} from 'lucide-react';
import { CourseType, Gender, WaitlistEntry } from '../types';
import LogoIcon from './LogoIcon';

interface WaitlistFormProps {
  waitlist: WaitlistEntry[];
  onAddToWaitlist: (entry: WaitlistEntry) => void;
}

const COURSE_META = {
  [CourseType.ANFAENGER]: { label: 'Anfänger', cycle: 'Alle 3 Monate', info: 'Islam & Qur\'an' },
  [CourseType.FORTGESCHRITTENE]: { label: 'Fortgeschrittene', cycle: 'Alle 3 Monate', info: 'Hifz & Fiqh' },
  [CourseType.ARABISCH]: { label: 'Arabisch Kurs', cycle: 'Einmal jährlich', info: 'Grammatik' },
  [CourseType.IMAM]: { label: 'Imam Kurs', cycle: 'Alle 3 Jahre', info: 'Vorbeter' },
  [CourseType.ILMIYA]: { label: 'Ilmiya Kurs', cycle: 'Alle 4 Jahre', info: 'Grundstudium' },
};

const LESSON_OPTIONS = [
  'Sa & So 11:00 - 14:00',
  'MO, Di, Mi, Do 17:00 - 19:00'
];

const MAX_CAPACITY = 25;
const WAITLIST_FEE = "10.00";

const WaitlistForm: React.FC<WaitlistFormProps> = ({ waitlist, onAddToWaitlist }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'payment' | 'verifying' | 'success'>('form');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Junge' as Gender,
    birthDate: '',
    courseType: CourseType.ANFAENGER,
    whatsapp: '',
    guardian: '',
    address: '',
    lessonTimes: LESSON_OPTIONS[0]
  });

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

  const countForSelected = useMemo(() => 
    waitlist.filter(w => w.courseType === formData.courseType).length,
  [waitlist, formData.courseType]);

  const isFull = countForSelected >= MAX_CAPACITY;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFull) return;
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    setStep('verifying');
    setTimeout(() => {
      const entry: WaitlistEntry = {
        ...formData,
        id: `WAIT-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      onAddToWaitlist(entry);
      setStep('success');
    }, 3000);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-madrassah-950 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-2xl animate-in zoom-in duration-500">
           <div className="w-16 h-16 md:w-24 md:h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner">
              <CheckCircle2 size={32} className="md:w-12 md:h-12" />
           </div>
           <h2 className="text-2xl md:text-3xl font-black text-madrassah-950 italic mb-4">Zahlung erhalten!</h2>
           <p className="text-gray-500 font-bold text-xs md:text-sm leading-relaxed mb-8 md:mb-10">
             Vielen Dank. Die Anmeldegebühr wurde bestätigt. Du bist nun offiziell in der Warteliste.
           </p>
           <button onClick={() => navigate('/')} className="w-full bg-madrassah-950 text-white py-4 md:py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">Zum Login</button>
        </div>
      </div>
    );
  }

  if (step === 'verifying') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
         <div className="relative mb-8 md:mb-12">
            <Loader2 size={80} className="text-madrassah-950 animate-spin opacity-10 md:w-[120px] md:h-[120px]" />
            <div className="absolute inset-0 flex items-center justify-center">
               <ShieldCheck size={32} className="text-madrassah-950 animate-pulse md:w-12 md:h-12" />
            </div>
         </div>
         <h2 className="text-2xl md:text-4xl font-black text-madrassah-950 italic tracking-tighter uppercase mb-4">Zahlung wird geprüft</h2>
         <p className="text-gray-400 font-bold uppercase text-[8px] md:text-[10px] tracking-[0.4em] max-w-xs leading-relaxed mx-auto">
            Bitte schließen Sie das Fenster nicht...
         </p>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-10 font-sans">
        <div className="max-w-2xl w-full bg-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          <div className="flex-1 p-8 md:p-12 bg-madrassah-950 text-white flex flex-col justify-between">
            <div>
               <button onClick={() => setStep('form')} className="text-white/40 hover:text-white mb-8 flex items-center gap-2 font-black uppercase text-[9px] tracking-widest transition-all">
                  <ChevronLeft size={16} /> Zurück
               </button>
               <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase mb-2">Anmeldegebühr</h3>
               <p className="text-madrassah-300 font-bold uppercase text-[9px] tracking-[0.3em] mb-8 md:mb-12">Madrassah Al-Huda</p>
               <div className="space-y-4 md:space-y-6">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Kurs</span>
                     <span className="font-bold text-xs md:text-sm">{COURSE_META[formData.courseType].label}</span>
                  </div>
                  <div className="pt-4 flex justify-between items-center">
                     <span className="text-lg md:text-xl font-black italic uppercase">Gesamt</span>
                     <span className="text-3xl md:text-4xl font-black text-emerald-400">{WAITLIST_FEE} €</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8">
             <div className="w-full text-center">
                <p className="text-gray-900 font-black text-xl md:text-2xl mb-6 md:mb-8 uppercase tracking-tighter italic">Sarfraz Butt</p>
                <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl border-2 border-gray-50 relative">
                   <div className="aspect-square w-full bg-gray-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                      <QrCode size={120} className="text-madrassah-950 md:w-40 md:h-40" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-madrassah-950 p-1 border border-gray-100">
                            <LogoIcon className="w-6 h-6" />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             <button onClick={handleConfirmPayment} className="w-full bg-madrassah-950 hover:bg-black text-white py-4 md:py-5 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3">
                <ShieldCheck size={18} /> Zahlung bestätigt
             </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-10 md:pb-20">
      <div className="bg-madrassah-950 text-white p-10 md:p-20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none"><Calendar size={200} className="md:w-[300px] md:h-[300px]" /></div>
        <div className="max-w-4xl mx-auto relative z-10">
           <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 text-madrassah-950 shadow-2xl rotate-3 p-3 md:p-4"><LogoIcon className="w-full h-full" /></div>
           <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter">Warteliste & Anmeldung</h1>
           <p className="text-madrassah-300 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.4em] mt-4 md:mt-6">Madrassah Al-Huda Hamburg</p>
        </div>
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 md:top-10 md:left-10 text-white/50 hover:text-white flex items-center gap-2 font-black uppercase text-[8px] md:text-[9px] tracking-widest transition-all"><ChevronLeft size={16} /> Login</button>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-4 md:px-6">
        <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-16">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
               <div className="bg-blue-50 p-6 rounded-[1.5rem] border border-blue-100">
                  <Clock className="text-blue-600 mb-2" size={20} />
                  <p className="text-[9px] font-black uppercase text-blue-900 tracking-widest">Aufnahmezyklen</p>
                  <p className="text-[10px] font-bold text-blue-700/70 mt-1">Alle 3-4 Monate</p>
               </div>
               <div className="bg-emerald-50 p-6 rounded-[1.5rem] border border-emerald-100">
                  <ShieldCheck className="text-emerald-600 mb-2" size={20} />
                  <p className="text-[9px] font-black uppercase text-emerald-900 tracking-widest">Klassengröße</p>
                  <p className="text-[10px] font-bold text-emerald-700/70 mt-1">Max. 25 Schüler</p>
               </div>
               <div className="bg-purple-50 p-6 rounded-[1.5rem] border border-purple-100">
                  <CreditCard className="text-purple-600 mb-2" size={20} />
                  <p className="text-[9px] font-black uppercase text-purple-900 tracking-widest">Gebühr</p>
                  <p className="text-[10px] font-bold text-purple-700/70 mt-1">Einmalig 10 €</p>
               </div>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-10 md:space-y-12">
               <div className="space-y-6">
                  <h3 className="text-[10px] md:text-[11px] font-black uppercase text-madrassah-950 tracking-[0.2em] border-b border-gray-100 pb-3 italic">1. Kurswahl</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                     {Object.entries(COURSE_META).map(([key, meta]) => (
                       <button 
                        key={key} 
                        type="button" 
                        onClick={() => setFormData({...formData, courseType: key as CourseType})}
                        className={`p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 text-left transition-all relative group ${formData.courseType === key ? 'border-madrassah-950 bg-madrassah-50/30' : 'border-gray-100 hover:border-madrassah-200'}`}
                       >
                          <p className={`text-xs font-black uppercase italic ${formData.courseType === key ? 'text-madrassah-950' : 'text-gray-400'}`}>{meta.label}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{meta.cycle}</p>
                          {formData.courseType === key && <div className="absolute top-4 right-4 text-madrassah-950"><CheckCircle2 size={18} /></div>}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-8">
                  <h3 className="text-[10px] md:text-[11px] font-black uppercase text-madrassah-950 tracking-[0.2em] border-b border-gray-100 pb-3 italic">2. Personendaten</h3>
                  {isFull ? (
                    <div className="bg-red-50 p-6 rounded-[1.5rem] border border-red-100 flex items-center gap-4">
                       <AlertTriangle className="text-red-600 shrink-0" size={24} />
                       <p className="text-red-700 text-xs font-bold">Warteliste voll. Bitte später erneut versuchen.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Vorname</label>
                           <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl font-bold text-sm" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nachname</label>
                           <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl font-bold text-sm" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Geburt</label>
                           <input required type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-5 py-4 rounded-xl font-bold text-sm" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Geschlecht</label>
                           <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                              {['Junge', 'Mädchen'].map(g => (
                                <button key={g} type="button" onClick={() => setFormData({...formData, gender: g as any})} className={`flex-1 py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.gender === g ? 'bg-madrassah-950 text-white shadow-md' : 'text-gray-400'}`}>{g}</button>
                              ))}
                           </div>
                        </div>
                    </div>
                  )}
               </div>

               <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-2">
                     <h3 className="text-[10px] md:text-[11px] font-black uppercase text-madrassah-950 tracking-[0.2em] italic">3. Kontakt & Adresse</h3>
                     {!isMinor && (
                        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                           <Info size={12} />
                           <span className="text-[8px] font-black uppercase tracking-widest">Eltern optional (Volljährig)</span>
                        </div>
                     )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isMinor ? "text-gray-400" : "text-emerald-500/50"}`}>Erziehungsberechtigter {isMinor ? "*" : ""}</label>
                        <div className="relative">
                           <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                           <input required={isMinor} value={formData.guardian} onChange={e => setFormData({...formData, guardian: e.target.value})} className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-xl font-bold text-sm" placeholder="Name der Eltern" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Anschrift</label>
                        <div className="relative">
                           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                           <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-xl font-bold text-sm" placeholder="Straße, PLZ, Ort" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                        <div className="relative">
                           <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                           <input required value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-xl font-bold text-sm" placeholder="+49..." />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Zeitwunsch</label>
                        <select value={formData.lessonTimes} onChange={e => setFormData({...formData, lessonTimes: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-xl font-bold text-[10px] md:text-sm uppercase tracking-widest outline-none cursor-pointer">
                           {LESSON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                     </div>
                  </div>
               </div>

               <div className="pt-6 md:pt-10 flex flex-col items-center gap-6">
                  <button type="submit" disabled={isFull} className="w-full md:w-auto bg-madrassah-950 text-white px-12 md:px-20 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black uppercase text-[10px] md:text-[11px] tracking-[0.3em] shadow-2xl hover:bg-black transition-all disabled:opacity-20 flex items-center justify-center gap-4 group">
                     Zahlung ({WAITLIST_FEE} €) <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                  <p className="text-[8px] md:text-[9px] font-bold text-gray-300 uppercase tracking-widest italic">
                     {countForSelected} von {MAX_CAPACITY} Plätzen belegt
                  </p>
               </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistForm;
