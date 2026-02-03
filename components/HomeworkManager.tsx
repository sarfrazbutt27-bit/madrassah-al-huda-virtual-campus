
import React, { useState } from 'react';
import { Book, Plus, Send, Clock, FileText, CheckCircle, Search, Trash2, Award, ChevronRight, MessageCircle, FileUp, Image as ImageIcon, FileCheck, Sparkles, Loader2 } from 'lucide-react';
import { User, UserRole, Student, Homework, HomeworkSubmission } from '../types';
import { GoogleGenAI } from "@google/genai";

interface HomeworkManagerProps {
  user: User;
  students: Student[];
  homework: Homework[];
  submissions: HomeworkSubmission[];
  onUpdateHomework: (h: Homework[]) => void;
  onUpdateSubmissions: (s: HomeworkSubmission[]) => void;
  subjects: string[];
  onNotify: (n: any) => void;
}

const HomeworkManager: React.FC<HomeworkManagerProps> = ({ 
  user, students, homework, submissions, onUpdateHomework, onUpdateSubmissions, subjects, onNotify 
}) => {
  const isTeacher = user.role === UserRole.TEACHER;
  const isStudent = user.role === UserRole.STUDENT;
  const isPrincipal = user.role === UserRole.PRINCIPAL;
  
  const [showForm, setShowForm] = useState(false);
  const [newHw, setNewHw] = useState({ title: '', description: '', subject: subjects[0], dueDate: '', className: user.assignedClasses?.[0] || '' });
  
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFileType, setSubmissionFileType] = useState<'pdf' | 'image' | 'doc'>('doc');
  const [simulatedFileUrl, setSimulatedFileUrl] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState<string | null>(null);

  const myClass = isStudent ? students.find(s => s.id === user.id)?.className : null;
  const filteredHomework = homework.filter(h => isStudent ? h.className === myClass : user.assignedClasses?.includes(h.className) || isPrincipal);

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault();
    const assignment: Homework = {
      ...newHw,
      id: `HW-${Date.now()}`,
      teacherId: user.id,
      createdAt: new Date().toISOString()
    };
    onUpdateHomework([...homework, assignment]);
    
    onNotify({
      userId: 'ALL',
      role: UserRole.STUDENT,
      title: 'Neue Hausaufgabe',
      message: `In ${assignment.subject} gibt es eine neue Aufgabe: "${assignment.title}".`,
      type: 'homework'
    });

    setShowForm(false);
    setNewHw({ title: '', description: '', subject: subjects[0], dueDate: '', className: user.assignedClasses?.[0] || '' });
  };

  const generateAiFeedback = async (sub: HomeworkSubmission, hw: Homework) => {
    setIsAiGenerating(sub.id);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Du bist ein Lehrer an der Madrassah Al-Huda. Bewerte die Hausaufgabe des Schülers. 
      Aufgabe: ${hw.title} - ${hw.description}
      Abgabe: ${sub.content}
      Schreibe ein kurzes, motivierendes Feedback (max 2 Sätze) und gib eine Punktzahl von 1 bis 10.
      Antworte NUR im JSON Format: {"feedback": "text", "points": number}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      const updatedSubmissions = submissions.map(s => 
        s.id === sub.id ? { ...s, grade: result.points, feedback: result.feedback } : s
      );
      onUpdateSubmissions(updatedSubmissions);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiGenerating(null);
    }
  };

  const handleSubmitWork = (hwId: string) => {
    const submission: HomeworkSubmission = {
      id: `SUB-${Date.now()}`,
      homeworkId: hwId,
      studentId: user.id,
      content: submissionContent,
      fileUrl: simulatedFileUrl,
      fileType: submissionFileType,
      submittedAt: new Date().toISOString()
    };
    onUpdateSubmissions([...submissions, submission]);
    setSubmissionId(null);
    setSubmissionContent('');
    setSimulatedFileUrl('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-madrassah-950 tracking-tight leading-none italic">Hausaufgaben & Projekte</h2>
          <p className="text-gray-400 font-bold uppercase text-[9px] tracking-[0.3em] mt-3">Interaktiver Lernbereich</p>
        </div>
        <div className="flex gap-4">
          {isTeacher && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-madrassah-950 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 shadow-xl hover:-translate-y-1 transition-all"
            >
              {showForm ? 'Abbrechen' : <><Plus size={18} /> Neue Aufgabe</>}
            </button>
          )}
        </div>
      </div>

      {showForm && isTeacher && (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleAddHomework} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Thema / Titel</label>
                  <input required value={newHw.title} onChange={e => setNewHw({...newHw, title: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-madrassah-950" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Beschreibung</label>
                  <textarea rows={4} value={newHw.description} onChange={e => setNewHw({...newHw, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-medium outline-none focus:ring-2 focus:ring-madrassah-950" />
               </div>
            </div>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fach</label>
                    <select value={newHw.subject} onChange={e => setNewHw({...newHw, subject: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-2xl font-black uppercase text-[10px] outline-none">
                       {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Klasse</label>
                    <select value={newHw.className} onChange={e => setNewHw({...newHw, className: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-4 rounded-2xl font-black uppercase text-[10px] outline-none">
                       {user.assignedClasses?.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Abgabetermin</label>
                  <input type="date" required value={newHw.dueDate} onChange={e => setNewHw({...newHw, dueDate: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl font-bold outline-none" />
               </div>
               <button type="submit" className="w-full bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-600 transition-all uppercase text-[10px] tracking-widest">Aufgabe Erstellen</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.map(h => {
          const isSubmitted = submissions.some(s => s.homeworkId === h.id && s.studentId === user.id);
          const currentSubmissions = submissions.filter(s => s.homeworkId === h.id);
          const mySubmission = submissions.find(s => s.homeworkId === h.id && s.studentId === user.id);

          return (
            <div key={h.id} className={`bg-white rounded-[2.5rem] border ${isSubmitted ? 'border-emerald-100' : 'border-gray-100'} shadow-sm flex flex-col overflow-hidden group hover:shadow-xl transition-all`}>
               <div className={`p-6 ${isSubmitted ? 'bg-emerald-50' : 'bg-madrassah-50/30'} flex justify-between items-start`}>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-madrassah-950 font-black text-xs border border-gray-100">
                     {h.subject.charAt(0)}
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">
                       {isTeacher || isPrincipal ? `${currentSubmissions.length} Abgaben` : 'Status'}
                     </span>
                     {isStudent ? (
                        isSubmitted ? (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">
                             <CheckCircle size={10} /> Abgegeben
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-100 px-3 py-1 rounded-lg">
                             <Clock size={10} /> Ausstehend
                          </span>
                        )
                     ) : (
                        <span className="text-[9px] font-black text-madrassah-950 bg-madrassah-100 px-3 py-1 rounded-lg">Klasse {h.className}</span>
                     )}
                  </div>
               </div>
               
               <div className="p-8 space-y-4 flex-1">
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{h.title}</h3>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-3">{h.description}</p>
               </div>

               <div className="p-6 pt-0 space-y-4">
                  {isStudent && !isSubmitted && submissionId !== h.id && (
                     <button onClick={() => setSubmissionId(h.id)} className="w-full bg-madrassah-950 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-black transition-all uppercase text-[10px] tracking-widest">Antwort verfassen</button>
                  )}
                  
                  {isStudent && submissionId === h.id && (
                     <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <textarea value={submissionContent} onChange={e => setSubmissionContent(e.target.value)} placeholder="Schreibe hier deine Antwort..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs outline-none focus:ring-2 focus:ring-madrassah-950 h-24" />
                        <div className="flex gap-2">
                           <button onClick={() => handleSubmitWork(h.id)} className="flex-1 bg-emerald-500 text-white font-black py-3 rounded-xl shadow-lg uppercase text-[9px] tracking-widest flex items-center justify-center gap-2">
                              <Send size={14} /> Senden
                           </button>
                           <button onClick={() => setSubmissionId(null)} className="flex-1 bg-gray-100 text-gray-400 font-black py-3 rounded-xl uppercase text-[9px] tracking-widest">Abbrechen</button>
                        </div>
                     </div>
                  )}

                  {isTeacher && currentSubmissions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Eingereichte Arbeiten</p>
                      {currentSubmissions.map(sub => (
                        <div key={sub.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-madrassah-950">{students.find(s => s.id === sub.studentId)?.firstName}</span>
                            <div className="flex items-center gap-2">
                              {sub.grade ? (
                                <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">{sub.grade}/10</span>
                              ) : (
                                <button 
                                  onClick={() => generateAiFeedback(sub, h)}
                                  disabled={isAiGenerating === sub.id}
                                  className="text-purple-600 hover:text-purple-800 transition-colors"
                                  title="KI-Korrektur anfordern"
                                >
                                  {isAiGenerating === sub.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-600 italic line-clamp-2">"{sub.content}"</p>
                        </div>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeworkManager;
