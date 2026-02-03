
import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  BookOpen, 
  Save, 
  ShieldAlert, 
  CheckCircle2, 
  Table as TableIcon, 
  UserCheck, 
  Settings,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Student, Grade, User, UserRole, ParticipationRecord } from '../types';

interface GradingSystemProps {
  user: User;
  students: Student[];
  subjects: string[];
  grades: Grade[];
  participation: ParticipationRecord[];
  onUpdateGrades: (grades: Grade[]) => void;
  onUpdateParticipation: (p: ParticipationRecord[]) => void;
}

const GradingSystem: React.FC<GradingSystemProps> = ({ 
  user, 
  students, 
  subjects, 
  grades, 
  participation, 
  onUpdateGrades, 
  onUpdateParticipation 
}) => {
  const isTeacher = user.role === UserRole.TEACHER;
  const [activeTab, setActiveTab] = useState<'entry' | 'participation' | 'overview'>('overview');
  const [selectedTerm, setSelectedTerm] = useState<'Halbjahr' | 'Abschluss'>('Halbjahr');
  const [classFilter, setClassFilter] = useState<string>('Alle');
  const [searchTerm, setSearchTerm] = useState('');

  // Input states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [points, setPoints] = useState<number>(0);

  const assignedClasses = user.assignedClasses || [];
  
  const classStudents = useMemo(() => {
    return students.filter(s => {
      const isMyStudent = user.role === UserRole.PRINCIPAL || assignedClasses.includes(s.className);
      const matchesFilter = classFilter === 'Alle' || s.className === classFilter;
      const matchesSearch = searchTerm === '' || 
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
      return isMyStudent && matchesFilter && matchesSearch;
    });
  }, [students, user.role, assignedClasses, classFilter, searchTerm]);

  const allClasses = useMemo(() => {
    const available = user.role === UserRole.PRINCIPAL 
      ? Array.from(new Set(students.map(s => s.className)))
      : assignedClasses;
    return ['Alle', ...available.sort()];
  }, [students, user.role, assignedClasses]);

  const addGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher || !selectedStudent || !selectedSubject) return;

    const newGrade: Grade = {
      studentId: selectedStudent,
      subject: selectedSubject,
      term: selectedTerm,
      points: points,
      date: new Date().toISOString().split('T')[0]
    };

    const filteredGrades = grades.filter(g => 
      !(g.studentId === selectedStudent && g.term === selectedTerm && g.subject === selectedSubject)
    );
    
    onUpdateGrades([...filteredGrades, newGrade]);
    setPoints(0);
    setSelectedStudent(''); 
  };

  const updateParticipationMetric = (studentId: string, field: keyof ParticipationRecord, value: any) => {
    if (!isTeacher) return;
    const existing = participation.find(p => p.studentId === studentId && p.term === selectedTerm) || {
      studentId,
      term: selectedTerm,
      verhalten: 'Sehr gut',
      vortrag: 'Sehr gut',
      pünktlichkeit: 'Sehr gut',
      zusatzpunkte: 0
    };

    const updated = { ...existing, [field]: value };
    const filtered = participation.filter(p => !(p.studentId === studentId && p.term === selectedTerm));
    onUpdateParticipation([...filtered, updated]);
  };

  const getPoints = (studentId: string, subj: string) => {
    return grades.find(g => g.studentId === studentId && g.term === selectedTerm && g.subject === subj)?.points || 0;
  };

  const getBonus = (studentId: string) => {
    return participation.find(p => p.studentId === studentId && p.term === selectedTerm)?.zusatzpunkte || 0;
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

  const getPointsColor = (pts: number) => {
    if (pts >= 18) return 'bg-emerald-500 text-white shadow-lg shadow-emerald-200';
    if (pts >= 14) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (pts >= 10) return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-red-50 text-red-700 border border-red-100';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Term Selector */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-madrassah-950 p-5 rounded-3xl shadow-2xl rotate-3">
            <Award className="text-white" size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-madrassah-950 tracking-tight leading-none">
              Noten-Management
            </h2>
            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">
              {user.role === UserRole.PRINCIPAL ? 'Schulweite Notenübersicht' : `Meine Klassen: ${assignedClasses.join(', ')}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-100 p-1.5 rounded-2xl flex">
            {(['Halbjahr', 'Abschluss'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSelectedTerm(t)}
                className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedTerm === t ? 'bg-madrassah-950 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between no-print">
        <div className="flex gap-1 bg-white p-1 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto w-full lg:w-auto">
          {[
            { id: 'overview', label: 'Übersicht', icon: TableIcon },
            { id: 'entry', label: 'Eingabe', icon: Plus },
            { id: 'participation', label: 'Beteiligung', icon: UserCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab.id ? 'bg-madrassah-50 text-madrassah-950 border border-madrassah-100' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
          <div className="relative w-full sm:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
             <input 
              type="text" 
              placeholder="Schüler suchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-[10px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-madrassah-950 transition-all"
             />
          </div>
          
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
            >
              {allClasses.map(c => <option key={c} value={c}>{c === 'Alle' ? 'Alle Klassen' : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tab Content: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-madrassah-950 text-white">
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-madrassah-950 z-20 border-r border-madrassah-900 shadow-xl min-w-[280px]">
                    Schüler / Klasse
                  </th>
                  {subjects.map(s => (
                    <th key={s} className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center border-r border-madrassah-900/50">{s}</th>
                  ))}
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center bg-madrassah-900 border-r border-madrassah-800">Bonus</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center bg-madrassah-800 border-r border-madrassah-700">Punkte</th>
                  <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest text-center bg-madrassah-700">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map(student => {
                  const totalSubjectsPoints = subjects.reduce((acc, s) => acc + getPoints(student.id, s), 0);
                  const bonusPoints = getBonus(student.id);
                  const grandTotal = totalSubjectsPoints + bonusPoints;
                  const maxPossible = subjects.length * 20 + 5;

                  return (
                    <tr key={student.id} className="hover:bg-madrassah-50/30 transition-colors group">
                      <td className="px-10 py-6 font-extrabold text-gray-900 sticky left-0 bg-white group-hover:bg-madrassah-50 transition-colors z-10 border-r border-gray-50 shadow-xl">
                        <div className="flex flex-col">
                          <span className="text-lg leading-tight group-hover:text-madrassah-950">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-madrassah-600 font-black uppercase tracking-widest mt-1">Klasse: {student.className}</span>
                        </div>
                      </td>
                      {subjects.map(s => {
                        const pts = getPoints(student.id, s);
                        return (
                          <td key={s} className="px-6 py-6 text-center border-r border-gray-50/50">
                            <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl font-black text-sm transition-all group-hover:scale-110 ${getPointsColor(pts)}`}>
                              {pts}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-6 text-center bg-madrassah-50/20 font-black text-madrassah-900 border-r border-gray-50">
                        <span className="text-lg">+{bonusPoints}</span>
                      </td>
                      <td className="px-6 py-6 text-center bg-madrassah-50 font-black border-r border-gray-50">
                        <div className="flex flex-col items-center">
                          <span className="text-xl text-madrassah-950 leading-none">{grandTotal}</span>
                          <span className="text-[8px] text-gray-400 uppercase mt-1">/ {maxPossible}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-block px-4 py-1.5 rounded-xl font-black text-xs text-white ${parseInt(getGermanGrade(grandTotal, maxPossible)) <= 2 ? 'bg-emerald-500' : parseInt(getGermanGrade(grandTotal, maxPossible)) <= 4 ? 'bg-madrassah-900' : 'bg-red-500'}`}>
                          {getGermanGrade(grandTotal, maxPossible)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {classStudents.length === 0 && (
                  <tr>
                    <td colSpan={subjects.length + 4} className="px-10 py-24 text-center text-gray-400 font-bold italic border-none bg-gray-50/30">
                       <Search size={48} className="mx-auto mb-4 opacity-10" />
                       Keine Schüler mit diesen Kriterien gefunden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: ENTRY FORM */}
      {activeTab === 'entry' && (
        <div className="space-y-10">
          {!isTeacher ? (
            <div className="bg-amber-50 p-10 rounded-[2.5rem] border border-amber-100 flex items-center gap-6 shadow-inner">
              <ShieldAlert className="text-amber-600" size={40} />
              <div>
                <h4 className="text-xl font-black text-amber-900">Bearbeitung eingeschränkt</h4>
                <p className="font-bold text-amber-800/60 mt-0.5 text-sm">Nur Lehrkräfte können Noten für ihre zugewiesenen Klassen eintragen.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                <TrendingUp size={120} className="text-madrassah-950" />
              </div>
              
              <div className="mb-10">
                <h3 className="text-2xl font-black text-madrassah-950 flex items-center gap-4">Punkte erfassen</h3>
                <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">Zeitraum: {selectedTerm}</p>
              </div>
              
              <form onSubmit={addGrade} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Fach</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 focus:bg-white font-black text-gray-800 transition-all cursor-pointer"
                    value={selectedSubject}
                    onChange={e => setSelectedSubject(e.target.value)}
                  >
                    <option value="">Wählen...</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Schüler</label>
                  <select 
                    required
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 focus:bg-white font-black text-gray-800 transition-all cursor-pointer"
                    value={selectedStudent}
                    onChange={e => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Wählen...</option>
                    {classStudents.map(s => (
                      <option key={s.id} value={s.id}>
                        [{s.className}] {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest ml-2">Punkte (0-20)</label>
                  <input 
                    required
                    type="number"
                    min="0"
                    max="20"
                    className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 focus:bg-white font-black text-center text-xl text-madrassah-950 transition-all"
                    value={points}
                    onChange={e => setPoints(parseInt(e.target.value) || 0)}
                  />
                </div>

                <button type="submit" className="bg-madrassah-950 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-1 active:scale-95 uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3">
                  <Save size={18} /> Speichern
                </button>
              </form>
            </div>
          )}
          
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/30 flex justify-between items-center">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verlauf ({selectedTerm})</h4>
             </div>
             <div className="max-h-[500px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-gray-400 text-[10px] uppercase tracking-[0.2em] border-b">
                    <tr>
                      <th className="px-10 py-5">Schüler & Klasse</th>
                      <th className="px-10 py-5">Fach</th>
                      <th className="px-10 py-5 text-center">Punkte</th>
                      <th className="px-10 py-5 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(() => {
                        const history = grades.filter(g => g.term === selectedTerm && classStudents.some(s => s.id === g.studentId))
                            .sort((a,b) => b.date.localeCompare(a.date));
                        
                        if (history.length === 0) return (
                            <tr>
                                <td colSpan={4} className="px-10 py-20 text-center text-gray-300 font-bold italic">Keine Einträge vorhanden.</td>
                            </tr>
                        );

                        return history.map((grade, i) => {
                            const student = students.find(s => s.id === grade.studentId);
                            return (
                                <tr key={i} className="hover:bg-madrassah-50/30 group transition-all">
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-gray-900 group-hover:text-madrassah-950 text-lg">{student?.firstName} {student?.lastName}</span>
                                            <span className="text-[9px] text-madrassah-600 font-black uppercase tracking-widest">Klasse {student?.className}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="bg-white border border-gray-100 text-gray-900 px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                                            {grade.subject}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`text-2xl font-black ${grade.points >= 10 ? 'text-madrassah-950' : 'text-red-500'}`}>{grade.points}</span>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        {isTeacher && (
                                            <button onClick={() => {
                                                const newGrades = grades.filter((_, idx) => idx !== grades.indexOf(grade));
                                                onUpdateGrades(newGrades);
                                            }} className="text-gray-300 hover:text-red-600 transition-colors p-2 rounded-xl hover:bg-red-50">
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        });
                    })()}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      )}

      {/* Tab Content: PARTICIPATION */}
      {activeTab === 'participation' && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-10 bg-madrassah-950 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 p-10 opacity-10">
               <Star size={100} fill="white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-tight italic">Mitarbeit & Bonus</h3>
              <p className="text-madrassah-300 font-bold uppercase text-[9px] tracking-[0.3em] mt-2">Bewertung für {selectedTerm}</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="px-10 py-6">Schüler / Klasse</th>
                  <th className="px-6 py-6 text-center">Verhalten</th>
                  <th className="px-6 py-6 text-center">Vortrag</th>
                  <th className="px-6 py-6 text-center">Präsenz</th>
                  <th className="px-10 py-6 text-center">Bonus (0-5)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.map(student => {
                  const record = participation.find(p => p.studentId === student.id && p.term === selectedTerm) || {
                    verhalten: 'Sehr gut',
                    vortrag: 'Sehr gut',
                    pünktlichkeit: 'Sehr gut',
                    zusatzpunkte: 0
                  };

                  return (
                    <tr key={student.id} className="hover:bg-madrassah-50/20 transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="text-lg font-extrabold text-gray-900 group-hover:text-madrassah-950">{student.firstName} {student.lastName}</span>
                          <span className="text-[10px] text-madrassah-700 font-black uppercase tracking-widest">Klasse {student.className}</span>
                        </div>
                      </td>
                      {['verhalten', 'vortrag', 'pünktlichkeit'].map(field => (
                        <td key={field} className="px-6 py-6 text-center">
                          <select
                            disabled={!isTeacher}
                            className={`appearance-none bg-white border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-madrassah-950 transition-all cursor-pointer disabled:opacity-50 ${
                              record[field as keyof ParticipationRecord] === 'Sehr gut' ? 'text-emerald-600' : 
                              record[field as keyof ParticipationRecord] === 'Befriedigend' ? 'text-amber-600' : 'text-red-600'
                            }`}
                            value={record[field as keyof ParticipationRecord]}
                            onChange={e => updateParticipationMetric(student.id, field as any, e.target.value)}
                          >
                            <option>Sehr gut</option>
                            <option>Befriedigend</option>
                            <option>Unzureichend</option>
                          </select>
                        </td>
                      ))}
                      <td className="px-10 py-6">
                        <div className="flex items-center justify-center gap-4">
                           <input 
                            disabled={!isTeacher}
                            type="range"
                            min="0"
                            max="5"
                            className="w-24 h-1.5 bg-gray-100 rounded-full accent-madrassah-950 disabled:opacity-30 cursor-pointer"
                            value={record.zusatzpunkte}
                            onChange={e => updateParticipationMetric(student.id, 'zusatzpunkte', parseInt(e.target.value))}
                           />
                           <span className="font-black text-xl text-madrassah-950 min-w-[35px]">+{record.zusatzpunkte}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingSystem;
