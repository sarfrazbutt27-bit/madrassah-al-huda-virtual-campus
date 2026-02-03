
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ChevronLeft, Book, ShieldCheck, Download } from 'lucide-react';
import { Student } from '../types';
import LogoIcon from './LogoIcon';

interface ContractViewProps {
  students: Student[];
}

const ContractView: React.FC<ContractViewProps> = ({ students }) => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  
  const isBlank = studentId === 'blank';
  const student = isBlank 
    ? { firstName: '________________', lastName: '________________', birthDate: 'DD.MM.YYYY', className: '____', guardian: '________________', address: '________________', whatsapp: '________________', lessonTimes: '________________', id: 'HUDA-BLANKO' } as Student 
    : students.find(s => s.id === studentId);

  if (!student && !isBlank) return <div className="p-20 text-center">Schüler nicht gefunden.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 px-2 md:px-0">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-madrassah-950 font-extrabold uppercase text-[10px] bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <ChevronLeft size={16} /> Zurück
        </button>
        <button onClick={() => window.print()} className="bg-madrassah-950 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg">
          <Printer size={16} /> Drucken / PDF
        </button>
      </div>

      <div className="contract-print-box bg-white p-6 md:p-10 border border-black mx-auto w-full font-serif text-black leading-tight print:p-6 min-h-[285mm] flex flex-col">
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-4 print:mb-2">
          <div className="flex items-center gap-4">
            <LogoIcon className="w-10 h-10 md:w-12 md:h-12" />
            <div>
              <h1 className="text-lg md:text-xl font-black uppercase font-sans">Madrassah Al-Huda</h1>
              <p className="text-[7px] md:text-[8px] font-bold uppercase font-sans">Bildungsinstitut Hamburg</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-black text-white px-3 py-1 text-[7px] md:text-[8px] font-black uppercase font-sans">Schul-Anmeldung</div>
            <p className="text-[7px] md:text-[8px] font-bold text-gray-400 font-sans mt-1">Ref: {student.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 md:gap-x-8 gap-y-2 md:gap-y-3 mb-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100 print:mb-2 print:bg-white print:border-none print:p-0">
           {[
             { label: 'Vorname', value: student.firstName },
             { label: 'Nachname', value: student.lastName },
             { label: 'Geburtsdatum', value: student.birthDate },
             { label: 'Klasse', value: student.className },
             { label: 'Erziehungsberechtigte/r', value: student.guardian },
             { label: 'Anschrift', value: student.address },
             { label: 'WhatsApp Kontakt', value: student.whatsapp },
             { label: 'Unterrichtszeit', value: student.lessonTimes }
           ].map((item, i) => (
             <div key={i} className="flex flex-col border-b border-dotted border-black/20 pb-0.5">
               <span className="text-[7px] font-bold uppercase text-gray-500 font-sans">{item.label}</span>
               <span className="font-bold text-xs uppercase truncate">{item.value}</span>
             </div>
           ))}
        </div>

        <div className="mb-6 space-y-2 print:mb-2">
           <h2 className="text-[9px] font-black uppercase border-b border-black pb-0.5">Finanzielle Vereinbarung</h2>
           <ul className="text-[9px] md:text-[10px] space-y-1">
             <li>• Einmalige Anmeldegebühr: <strong>10,00 €</strong> (fällig bei Aufnahme).</li>
             <li>• Die Monatsbeiträge sind <strong>ganzjährig</strong> zu entrichten (auch in Ferien).</li>
             <li>• Zahlungseingang bis zum 5. Werktag des laufenden Monats.</li>
             <li>• Kündigungsfrist: 1 Monat zum Monatsende in Textform.</li>
           </ul>
        </div>

        <div className="mb-6 space-y-2 flex-1 print:mb-2">
           <h2 className="text-[9px] font-black uppercase border-b border-black pb-0.5">Hausordnung & Pflichten</h2>
           <div className="grid grid-cols-1 gap-1 text-[8px] md:text-[9px] leading-snug">
             <p>1. Angemessene, saubere Kleidung (Kopfbedeckung bei Jungen) ist Pflicht.</p>
             <p>2. Fehlzeiten sind bis 10:00 Uhr des Unterrichtstages zu entschuldigen.</p>
             <p>3. Respektvoller Umgang mit Lehrern und Mitschülern ist Voraussetzung.</p>
             <p>4. Der Verlust oder die Beschädigung von Schuleigentum ist zu ersetzen.</p>
             <p>5. Eltern sind verpflichtet, an offiziellen Elternabenden teilzunehmen.</p>
             <p>6. Mobiltelefone sind während des Unterrichts im Flugmodus/Ausgeschaltet.</p>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-20 pt-8 mt-auto">
          <div className="text-center border-t border-black pt-1 uppercase text-[7px] md:text-[8px] font-black">Schulleitung Siegel</div>
          <div className="text-center border-t border-black pt-1 uppercase text-[7px] md:text-[8px] font-black">Unterschrift Eltern / Schüler</div>
        </div>

        <div className="mt-4 pt-2 border-t border-dotted border-gray-200 text-center text-[7px] text-gray-400 uppercase tracking-widest">
          Madrassah Al-Huda Hamburg &copy; {new Date().getFullYear()} • Generated by HudaSystem
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0.5cm; }
          body { background: white !important; overflow: visible !important; width: 100% !important; }
          .no-print { display: none !important; }
          .contract-print-box { 
            border: none !important; 
            box-shadow: none !important; 
            margin: 0 !important; 
            width: 100% !important;
            padding: 0 !important;
            transform: scale(0.96);
            transform-origin: top center;
          }
        }
      `}</style>
    </div>
  );
};

export default ContractView;
