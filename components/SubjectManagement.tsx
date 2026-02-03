
import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Save } from 'lucide-react';

interface SubjectManagementProps {
  subjects: string[];
  onUpdate: (subjects: string[]) => void;
}

const SubjectManagement: React.FC<SubjectManagementProps> = ({ subjects, onUpdate }) => {
  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) {
      alert("Dieses Fach existiert bereits.");
      return;
    }
    onUpdate([...subjects, newSubject.trim()]);
    setNewSubject('');
  };

  const handleDeleteSubject = (subjectToDelete: string) => {
    if (window.confirm(`Möchten Sie das Fach "${subjectToDelete}" wirklich löschen?`)) {
      onUpdate(subjects.filter(s => s !== subjectToDelete));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-2xl font-black text-madrassah-950 mb-8 flex items-center gap-3">
          <Plus className="text-madrassah-900" size={30} /> Neues Prüfungsfach hinzufügen
        </h3>
        <form onSubmit={handleAddSubject} className="flex gap-4">
          <input 
            required
            className="flex-1 bg-gray-50 border border-gray-100 px-5 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-madrassah-950 transition-all font-semibold"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            placeholder="Name des Fachs (z.B. Arabische Grammatik)"
          />
          <button 
            type="submit"
            className="bg-madrassah-950 hover:bg-black text-white font-black px-10 rounded-2xl shadow-xl transition-all hover:-translate-y-1 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
          >
            <Save size={18} /> Hinzufügen
          </button>
        </form>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 bg-madrassah-950 text-white font-bold flex items-center justify-between">
          <div className="flex items-center gap-4">
             <BookOpen size={24} className="text-madrassah-300"/> 
             <span className="text-xl font-extrabold uppercase tracking-tight">Aktive Prüfungsfächer</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full border border-white/20">
            {subjects.length} Fächer
          </span>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-madrassah-200 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-madrassah-950 text-white rounded-xl flex items-center justify-center font-black">
                  {index + 1}
                </div>
                <span className="font-bold text-gray-800 text-lg uppercase tracking-tight">{subject}</span>
              </div>
              <button 
                onClick={() => handleDeleteSubject(subject)}
                className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 italic font-bold">
              Keine Fächer definiert. Bitte fügen Sie Fächer hinzu, um Noten eintragen zu können.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;
