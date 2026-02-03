
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ChevronLeft, Sparkles, Loader2, Save, Lock } from 'lucide-react';
import { Student, Grade, ParticipationRecord, User, UserRole } from '../types';
import { GoogleGenAI } from "@google/genai";
import LogoIcon from './LogoIcon';

interface ReportCardProps {
  user: User;
  students: Student[];
  subjects: string[];
  grades: Grade[];
  participation: ParticipationRecord[];
  onUpdateParticipation: (p: ParticipationRecord[]) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ user, students, subjects, grades, participation, onUpdateParticipation }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'Halbjahr' | 'Abschluss'>('Halbjahr');
  const [isGenerating, setIsGenerating] = useState(false);
  const [remarks, setRemarks] = useState('Engagement im Unterricht ist lobenswert. Wir wünschen weiterhin viel Erfolg auf dem Weg des Wissens.');

  const isTeacher = user.role === UserRole.TEACHER || user.role === UserRole.PRINCIPAL;
  const isStudent = user.role === UserRole.STUDENT;
  const student = students.find(s => s.id === studentId);

  const isReleased = reportType === 'Halbjahr' ? student?.reportReleasedHalbjahr : student?.reportReleasedAbschluss;
  if (isStudent && !isReleased) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center p-4 space-y-6">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center animate-pulse">
           <Lock size={40} />
        </div>
        <h2 className="text-2xl font-black text-madrassah-950 italic">Zeugnis gesperrt</h2>
        <button onClick={() => navigate('/')} className="px-6 py-3 bg-madrassah-950 text-white rounded-xl font-black uppercase text-[10px]">Dashboard</button>
      </div>
    );
  }

  const currentParticipation = participation.find(p => p.studentId === studentId && p.term === reportType) || {
    studentId: studentId!,
    term: reportType,
    verhalten: 'Sehr gut',
    vortrag: 'Sehr gut',
    pünktlichkeit: 'Sehr gut',
    zusatzpunkte: 0
  };

  const handleParticipationUpdate = (field: string, value: any) => {
    if (!isTeacher) return;
    const newRecord = { ...currentParticipation, [field]: value };
    const others = participation.filter(p => !(p.studentId === studentId && p.term === reportType));
    onUpdateParticipation([...others, newRecord]);
  };

  if (!student) return <div className="p-8 text-center text-red-500 font-bold">Schüler nicht gefunden.</div>;

  const getTermPoints = (subj: string, term: 'Halbjahr' | 'Abschluss') => {
    return grades.find(g => g.studentId === studentId && g.term === term && g.subject === subj)?.points || 0;
  };

  const calculateTotal = (term: 'Halbjahr' | 'Abschluss') => {
    const sum = subjects.reduce((acc, s) => acc + getTermPoints(s, term), 0);
    const bonus = participation.find(p => p.studentId === studentId && p.term === term)?.zusatzpunkte || 0;
    return sum + bonus;
  };

  const getGermanGrade = (points: number, max: number) => {
    if (max === 0) return "-";
    const perc = (points / max) * 100;
    if (perc >= 92) return "1";
    if (perc >= 81) return "2";
    if (perc >= 67) return "3";
    if (perc >= 50) return "4";
    if (perc >= 30) return "5";
    return "6";
  };

  const generateAI = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const pointsInfo = subjects.map(s => `${s}: ${getTermPoints(s, reportType)}/20`).join(', ');
      const prompt = `Gutachten für ${student.firstName} ${student.lastName}. Noten: ${pointsInfo}. Verhalten: ${currentParticipation.verhalten}. Ein Satz.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (response.text) setRemarks(response.text.trim());
    } catch (e) {
      console.error("AI Error:", e);
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 px-2 md:px-0">
      <div className="no-print flex flex-wrap items-center justify-between mb-4 md:mb-6 gap-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-madrassah-950 font-black uppercase text-[10px] bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <ChevronLeft size={16} /> Zurück
        </button>
        <div className="flex bg-gray-100 p-1 rounded-xl">
           <button onClick={() => setReportType('Halbjahr')} className={`px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${reportType === 'Halbjahr' ? 'bg-madrassah-950 text-white' : 'text-gray-400'}`}>Halbjahr</button>
           <button onClick={() => setReportType('Abschluss')} className={`px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest ${reportType === 'Abschluss' ? 'bg-madrassah-950 text-white' : 'text-gray-400'}`}>Hauptzeugnis</button>
        </div>
        <div className="flex gap-2">
           {isTeacher && (
             <button onClick={generateAI} disabled={isGenerating} className="bg-purple-50 text-purple-900 px-3 md:px-4 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2 hover:bg-purple-100">
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
             </button>
           )}
           <button onClick={() => window.print()} className="bg-madrassah-950 text-white px-4 md:px-6 py-3 rounded-xl font-black uppercase text-[10px] flex items-center gap-2">
             <Printer size={16} /> Drucken
           </button>
        </div>
      </div>

      <div className="report-print-container bg-white p-4 md:p-10 border-[1px] border-black text-black leading-tight shadow-xl print:shadow-none print:m-0 print:border-none print:p-0 flex flex-col font-sans">
        <div className="flex justify-between items-start mb-4 print:mb-2 scale-90 md:scale-100 origin-left">
          <div className="w-12 h-12 md:w-16 md:h-16 text-madrassah-950"><LogoIcon className="w-full h-full" /></div>
          <div className="text-right flex-1">
            <div className="text-lg md:text-xl font-bold">مدرسة الهدى</div>
            <div className="text-md md:text-lg font-bold uppercase tracking-widest">MADRASSAH AL HUDA</div>
            <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-widest text-gray-500">Bildungsinstitut Hamburg</p>
          </div>
        </div>

        <h1 className="text-center text-xl md:text-2xl font-bold mb-4 print:mb-2 italic uppercase">{reportType === 'Halbjahr' ? 'Halbjahres-Zeugnis' : 'Abschluss-Zeugnis'}</h1>

        <div className="grid grid-cols-2 border border-black mb-4 print:mb-2 text-[10px] md:text-xs">
          <div className="border-r border-b border-black p-2 flex items-center gap-2">
             <span className="font-bold uppercase text-[7px] md:text-[8px] opacity-50">Name</span>
             <span className="font-black uppercase truncate">{student.firstName} {student.lastName}</span>
          </div>
          <div className="border-b border-black p-2 flex items-center gap-2">
             <span className="font-bold uppercase text-[7px] md:text-[8px] opacity-50">Klasse</span>
             <span className="font-black uppercase">{student.className}</span>
          </div>
          <div className="p-2 flex items-center gap-2 col-span-2 border-b border-black">
             <span className="font-bold uppercase text-[7px] md:text-[8px] opacity-50">Lehrkraft</span>
             <span className="italic uppercase font-medium truncate">{isTeacher ? user.name : 'Madrassah Leitung'}</span>
          </div>
        </div>

        <div className="mb-4 border border-black print:mb-2">
          <div className="bg-gray-100 text-center py-1 font-bold uppercase text-[8px]">Beteiligung & Mitarbeit</div>
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-black text-[7px] md:text-[8px] uppercase">
                <th className="border-r border-black py-1 text-left pl-2">Einheit</th>
                <th className="border-r border-black py-1">Sehr gut</th>
                <th className="border-r border-black py-1">Befried.</th>
                <th className="py-1">Unzureich.</th>
              </tr>
            </thead>
            <tbody>
              {['verhalten', 'vortrag', 'pünktlichkeit'].map((metric) => (
                <tr key={metric} className="border-b border-black">
                  <td className="border-r border-black py-1 text-left pl-2 font-bold capitalize">{metric}</td>
                  {(['Sehr gut', 'Befriedigend', 'Unzureichend'] as const).map(level => (
                    <td key={level} className="border-r border-black py-1 cursor-pointer" onClick={() => handleParticipationUpdate(metric, level)}>
                      {currentParticipation[metric as keyof ParticipationRecord] === level ? <span className="text-xs font-bold">X</span> : <span className="opacity-0">.</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-4 border border-black print:mb-2">
           <table className="w-full text-[10px] md:text-xs border-collapse">
              <thead><tr className="bg-gray-100 border-b border-black text-[8px] uppercase"><th className="text-left p-1.5 md:p-2 border-r border-black">Prüfungsfach</th><th className="text-center p-1.5 md:p-2 border-r border-black">Ergebnis</th><th className="text-right p-1.5 md:p-2">Note</th></tr></thead>
              <tbody>
                {subjects.map(subj => {
                  const pts = reportType === 'Halbjahr' ? getTermPoints(subj, 'Halbjahr') : getTermPoints(subj, 'Halbjahr') + getTermPoints(subj, 'Abschluss');
                  const max = reportType === 'Halbjahr' ? 20 : 40;
                  return (
                    <tr key={subj} className="border-b border-black">
                      <td className="p-1.5 md:p-2 border-r border-black font-bold uppercase">{subj}</td>
                      <td className="p-1.5 md:p-2 border-r border-black text-center font-black">{pts} / {max}</td>
                      <td className="p-1.5 md:p-2 text-right font-black italic">{getGermanGrade(pts, max)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-black text-white font-bold">
                   <td className="p-1.5 md:p-2 border-r border-white uppercase text-[8px] md:text-[10px]">Punktesumme (inkl. Bonus)</td>
                   <td className="p-1.5 md:p-2 text-center text-sm font-black">{calculateTotal(reportType)}</td>
                   <td className="p-1.5 md:p-2 text-right font-black italic">Endnote: {getGermanGrade(calculateTotal(reportType), subjects.length * (reportType==='Halbjahr'?20:40) + 5)}</td>
                </tr>
              </tbody>
           </table>
        </div>

        <div className="border border-black flex-1 flex flex-col mb-4 print:mb-2 min-h-[60px] md:min-h-[100px]">
           <div className="bg-gray-100 px-3 py-1 font-bold uppercase text-[8px]">Individuelles Gutachten</div>
           <div className="p-3 md:p-4 flex-1">
              {isTeacher ? <textarea className="w-full h-full bg-transparent border-none outline-none resize-none no-print italic text-xs md:text-sm" value={remarks} onChange={(e) => setRemarks(e.target.value)} /> : null}
              <p className={`${isTeacher ? 'hidden print:block' : 'block'} italic text-xs md:text-sm leading-relaxed`}>"{remarks}"</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-10 pt-4 md:pt-6 mt-auto">
           <div className="text-center border-t border-black pt-2 uppercase text-[7px] md:text-[8px] font-black">Siegel & Schulleitung</div>
           <div className="text-center border-t border-black pt-2 uppercase text-[7px] md:text-[8px] font-black">Datum: {new Date().toLocaleDateString('de-DE')}</div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0.5cm; }
          body { background: white; margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
          #root { height: 100%; width: 100%; }
          .no-print { display: none !important; }
          .report-print-container { 
            border: none !important; 
            padding: 0 !important; 
            margin: 0 !important;
            height: 100%;
            width: 100%;
            display: flex !important;
            flex-direction: column !important;
            transform: scale(0.98);
            transform-origin: top center;
          }
          table { width: 100% !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default ReportCard;
