
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Search, 
  Filter,
  ArrowRight,
  GraduationCap,
  AlertCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { Student, Grade, User, UserRole, ParticipationRecord } from '../types';

interface ReportManagerProps {
  user: User;
  students: Student[];
  subjects: string[];
  grades: Grade[];
  onUpdateStudents: (students: Student[]) => void;
}

const ReportManager: React.FC<ReportManagerProps> = ({ user, students, subjects, grades, onUpdateStudents }) => {
  const [selectedTerm, setSelectedTerm] = useState<'Halbjahr' | 'Abschluss'>('Halbjahr');
  const [searchTerm, setSearchTerm] = useState('');

  const assignedClasses = user.assignedClasses || [];
  const classStudents = students.filter(s => 
    user.role === UserRole.PRINCIPAL || assignedClasses.includes(s.className)
  ).filter(s => 
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletionStats = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && g.term === selectedTerm);
    const gradedSubjectsCount = new Set(studentGrades.map(g => g.subject)).size;
    const totalSubjectsCount = subjects.length;
    const isComplete = gradedSubjectsCount >= totalSubjectsCount && totalSubjectsCount > 0;
    
    return {
      count: gradedSubjectsCount,
      total: totalSubjectsCount,
      isComplete,
      percentage: totalSubjectsCount > 0 ? (gradedSubjectsCount / totalSubjectsCount) * 100 : 0
    };
  };

  const toggleRelease = (studentId: string) => {
    const stats = getCompletionStats(studentId);
    if (!stats.isComplete) {
      alert("Dieses Zeugnis ist noch nicht vollständig (Fächer fehlen). Freigabe nicht möglich.");
      return;
    }

    const updated = students.map(s => {
      if (s.id === studentId) {
        if (selectedTerm === 'Halbjahr') {
          return { ...s, reportReleasedHalbjahr: !s.reportReleasedHalbjahr };
        } else {
          return { ...s, reportReleasedAbschluss: !s.reportReleasedAbschluss };
        }
      }
      return s;
    });
    onUpdateStudents(updated);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="bg-madrassah-950 p-5 rounded-3xl shadow-xl">
            <FileText className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-madrassah-950 tracking-tight">Zeugnis-Zentrale</h2>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
              Freigabe & Veröffentlichung an Schüler
            </p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          {(['Halbjahr', 'Abschluss'] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedTerm(t)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTerm === t ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {t === 'Halbjahr' ? 'Halbjahr' : 'Hauptzeugnis'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center gap-4 text-emerald-950">
        <div className="p-3 bg-white rounded-xl text-emerald-600 shadow-sm"><Info size={20} /></div>
        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
          Sobald Sie ein Zeugnis "Freigeben", kann der Schüler sein Ergebnis im persönlichen Dashboard einsehen und drucken.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input 
            type="text"
            placeholder="Schüler suchen..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
           <h3 className="font-black text-madrassah-950 uppercase text-xs tracking-widest">Status: {selectedTerm}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
              <tr>
                <th className="px-10 py-6">Schüler</th>
                <th className="px-10 py-6">Vollständigkeit</th>
                <th className="px-10 py-6 text-center">Freigabe für Schüler</th>
                <th className="px-10 py-6 text-right">Zeugnis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {classStudents.map(student => {
                const stats = getCompletionStats(student.id);
                const isReleased = selectedTerm === 'Halbjahr' ? student.reportReleasedHalbjahr : student.reportReleasedAbschluss;

                return (
                  <tr key={student.id} className="hover:bg-madrassah-50/30 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${stats.isComplete ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                          {student.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-extrabold text-gray-900 group-hover:text-madrassah-950 text-lg transition-colors">{student.firstName} {student.lastName}</div>
                          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Klasse {student.className}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="space-y-2 max-w-[150px]">
                        <div className="flex justify-between items-end">
                           <span className={`text-[9px] font-black uppercase tracking-widest ${stats.isComplete ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {stats.isComplete ? 'Bereit' : 'Fehlt'}
                           </span>
                           <span className="text-[9px] font-bold text-gray-400">{stats.count}/{stats.total}</span>
                        </div>
                        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div className={`h-full transition-all ${stats.isComplete ? 'bg-emerald-500' : 'bg-amber-400'}`} style={{ width: `${stats.percentage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                       <button 
                        onClick={() => toggleRelease(student.id)}
                        className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isReleased ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-200' : 'bg-white text-gray-400 border-gray-200 hover:border-emerald-300'}`}
                       >
                         {isReleased ? <><Unlock size={16} /> Freigegeben</> : <><Lock size={16} /> Gesperrt</>}
                       </button>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <Link 
                        to={`/report-card/${student.id}`}
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-50 text-madrassah-950 hover:bg-white border border-gray-100 hover:shadow-md`}
                      >
                        <Printer size={16} /> Vorschau
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportManager;
