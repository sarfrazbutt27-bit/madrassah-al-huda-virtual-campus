
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ChevronLeft, Calendar, FileDown, Download } from 'lucide-react';
import { Student, User } from '../types';
import LogoIcon from './LogoIcon';

interface AttendancePrintViewProps {
  user: User;
  students: Student[];
}

const AttendancePrintView: React.FC<AttendancePrintViewProps> = ({ user, students }) => {
  const { className, month, year } = useParams();
  const navigate = useNavigate();
  
  const m = parseInt(month || '1');
  const y = parseInt(year || '2024');
  
  const daysInMonth = new Date(y, m, 0).getDate();
  const monthName = new Date(y, m - 1).toLocaleString('de-DE', { month: 'long' });
  
  const classStudents = students.filter(s => s.className === className);
  
  const isWeekend = (day: number) => {
    const date = new Date(y, m - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
  };

  const getDayInitial = (day: number) => {
    const date = new Date(y, m - 1, day);
    return date.toLocaleString('de-DE', { weekday: 'short' }).charAt(0);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Control Header - Hidden in Print */}
      <div className="no-print p-8 bg-madrassah-950 text-white border-b flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest bg-white/10 px-5 py-3 rounded-xl border border-white/20 hover:bg-white/20"
          >
            <ChevronLeft size={16} /> Zurück
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight italic">Export-Konsole</h1>
            <p className="text-[10px] text-madrassah-300 font-bold uppercase tracking-widest">Monatsliste vorbereiten</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-emerald-500/20 px-6 py-3 rounded-2xl border border-emerald-500/30 text-[10px] font-bold text-emerald-100 flex items-center gap-3">
             <Download size={16} /> <span>Wählen Sie "Als PDF speichern" im Druckmenü</span>
          </div>
          <button 
            onClick={() => window.print()} 
            className="bg-white text-madrassah-950 px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-madrassah-100 transition-all flex items-center gap-3"
          >
            <Printer size={18} /> Drucken / PDF Download
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="p-4 md:p-8 font-sans text-black max-w-[297mm] mx-auto overflow-hidden">
        {/* Header Section */}
        <div className="flex justify-between items-end border-b-[3px] border-black pb-6 mb-6">
          <div className="flex items-center gap-4">
            <LogoIcon className="w-14 h-14 text-madrassah-950" />
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Madrassah Al-Huda</h2>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Präsenzliste • Hamburg</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black uppercase italic text-madrassah-950">{monthName} {y}</div>
            <div className="flex gap-4 mt-1 text-[9px] font-bold uppercase tracking-widest">
              <span>Lehrer: <span className="border-b border-black inline-block min-w-[80px] text-center">{user.name}</span></span>
              <span>Klasse: <span className="border-b border-black inline-block min-w-[40px] text-center font-black">{className}</span></span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end gap-4 mb-3 text-[8px] font-black uppercase tracking-widest opacity-60">
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-black"></div> Anwesend (✓)</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-black bg-gray-100"></div> Abwesend (X)</div>
           <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 border border-black bg-madrassah-50/50"></div> Wochenende</div>
        </div>

        {/* Grid Table */}
        <div className="w-full">
          <table className="w-full border-collapse border-[2px] border-black text-[9px]">
            <thead>
              <tr className="bg-gray-100 font-black">
                <th className="border-[1.5px] border-black px-3 py-2 text-left w-56 bg-gray-200 uppercase tracking-widest">Schüler-Name</th>
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <th 
                    key={i+1} 
                    className={`border-[1.5px] border-black text-center w-7 py-1.5 ${isWeekend(i+1) ? 'bg-madrassah-50/70' : ''}`}
                  >
                    <div className="text-[7px] opacity-50 mb-0.5">{getDayInitial(i+1)}</div>
                    <div className="leading-none">{i+1}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student, sIdx) => (
                <tr key={student.id} className={sIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}>
                  <td className="border-[1.5px] border-black px-3 py-2.5 font-bold uppercase truncate">
                    {student.firstName} {student.lastName}
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <td 
                      key={i+1} 
                      className={`border-[1.5px] border-black h-9 text-center ${isWeekend(i+1) ? 'bg-madrassah-50/30' : ''}`}
                    >
                       {/* Space for manual tick */}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Extra empty rows for manual additions */}
              {Array.from({length: 4}).map((_, i) => (
                <tr key={`empty-${i}`} className="bg-white">
                   <td className="border-[1.5px] border-black h-9 italic text-gray-300 px-3">Zusätzlicher Schüler...</td>
                   {Array.from({ length: daysInMonth }, (_, j) => (
                    <td key={`empty-${i}-${j}`} className={`border-[1.5px] border-black ${isWeekend(j+1) ? 'bg-madrassah-50/30' : ''}`}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-between items-start text-[8px] font-black uppercase tracking-[0.3em] opacity-40">
           <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
              Madrassah Al-Huda Management • Hamburg • {new Date().toLocaleDateString('de-DE')}
           </div>
           <div className="text-right italic">
              Bitte bewahren Sie die Liste nach Abschluss des Monats für die Dokumentation auf.
           </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0.5cm;
          }
          body {
            background: white;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-root {
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            -webkit-print-color-adjust: exact;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendancePrintView;
