
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Search, User, Phone, CheckCircle, Clock, Trash2, Edit3, Check, X, 
  CheckSquare, Square, Image as ImageIcon, Video as VideoIcon, Mic, FileText, Paperclip, 
  Pause, Play, StopCircle, Loader2, Trash
} from 'lucide-react';
import { User as UserType, Student, Message, UserRole } from '../types';

interface ChatSystemProps {
  user: UserType;
  users: UserType[];
  students: Student[];
  messages: Message[];
  onSendMessage: (m: Message) => void;
  onDeleteMessages: (ids: string[]) => void;
  onUpdateMessage: (m: Message) => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ user, users, students, messages, onSendMessage, onDeleteMessages, onUpdateMessage }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Voice Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFileType, setActiveFileType] = useState<Message['fileType'] | null>(null);

  useEffect(() => { 
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; 
  }, [messages, selectedChatId]);

  const allContacts = useMemo(() => {
    return [...users, ...students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: UserRole.STUDENT, lastSeen: s.lastSeen }))]
      .filter(c => c.id !== user.id)
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [users, students, user.id, searchTerm]);

  const selectedContact = allContacts.find(c => c.id === selectedChatId);
  const chatMessages = useMemo(() => 
    messages.filter(m => (m.fromId === user.id && m.toId === selectedChatId) || (m.fromId === selectedChatId && m.toId === user.id))
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp)), 
    [messages, user.id, selectedChatId]
  );

  const handleSend = (fileUrl?: string, fileType?: Message['fileType']) => {
    if (!inputText.trim() && !fileUrl) return;
    const msg: Message = {
      id: `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fromId: user.id,
      toId: selectedChatId!,
      text: inputText,
      fileUrl,
      fileType,
      timestamp: new Date().toISOString()
    };
    onSendMessage(msg);
    setInputText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      handleSend(base64, activeFileType || 'file');
      setIsUploading(false);
      setActiveFileType(null);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = (type: Message['fileType']) => {
    setActiveFileType(type);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Voice Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
        const reader = new FileReader();
        reader.onloadend = () => {
          handleSend(reader.result as string, 'audio');
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      alert("Mikrofon-Zugriff verweigert.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-[calc(100vh-160px)] flex gap-8 animate-in fade-in duration-500 overflow-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={activeFileType === 'image' ? 'image/*' : activeFileType === 'video' ? 'video/*' : '*'} 
      />

      {/* Contacts List */}
      <div className="w-80 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50">
           <h3 className="text-xl font-black text-madrassah-950 uppercase italic mb-6 tracking-tighter">Nachrichten</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input 
                type="text" 
                placeholder="Name suchen..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-madrassah-950/20" 
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
           {allContacts.map(c => (
             <button key={c.id} onClick={() => setSelectedChatId(c.id)} className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all ${selectedChatId === c.id ? 'bg-madrassah-950 text-white shadow-xl scale-[1.02]' : 'hover:bg-gray-50'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border ${selectedChatId === c.id ? 'bg-white/10 border-white/20 text-white' : 'bg-madrassah-50 border-madrassah-100 text-madrassah-950'}`}>
                  {c.name.charAt(0)}
                </div>
                <div className="text-left overflow-hidden flex-1">
                   <p className="font-extrabold text-sm truncate">{c.name}</p>
                   <p className={`text-[9px] uppercase tracking-widest ${selectedChatId === c.id ? 'text-madrassah-200' : 'text-gray-400'}`}>{c.role}</p>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
        {selectedContact ? (
          <>
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
               <div className="flex items-center gap-6">
                 <div className="w-14 h-14 bg-madrassah-950 text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                   {selectedContact.name.charAt(0)}
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-madrassah-950 italic">{selectedContact.name}</h3>
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </p>
                 </div>
               </div>
               <div className="flex gap-2">
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"><Phone size={18}/></button>
                  <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all"><VideoIcon size={18}/></button>
               </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-gray-50/30 custom-scrollbar">
               {chatMessages.map(m => (
                 <div key={m.id} className={`flex flex-col ${m.fromId === user.id ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[70%] p-6 rounded-[2rem] shadow-sm text-sm ${m.fromId === user.id ? 'bg-madrassah-950 text-white rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none border border-gray-100'}`}>
                       {m.fileUrl && (
                         <div className="mb-4">
                           {m.fileType === 'image' && (
                             <img src={m.fileUrl} alt="Sent" className="rounded-2xl w-full max-h-80 object-cover border-2 border-white/10 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(m.fileUrl, '_blank')} />
                           )}
                           {m.fileType === 'video' && (
                             <video src={m.fileUrl} controls className="rounded-2xl w-full max-h-80 bg-black border-2 border-white/10" />
                           )}
                           {m.fileType === 'audio' && (
                             <div className={`flex items-center gap-4 p-4 rounded-2xl ${m.fromId === user.id ? 'bg-white/10' : 'bg-gray-50'}`}>
                                <audio src={m.fileUrl} controls className="h-10 w-full" />
                             </div>
                           )}
                           {m.fileType === 'file' && (
                             <a href={m.fileUrl} download className={`p-5 rounded-2xl flex items-center gap-4 transition-all ${m.fromId === user.id ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}>
                                <FileText size={24} className={m.fromId === user.id ? 'text-white' : 'text-madrassah-950'} />
                                <div className="text-left">
                                   <p className="text-[10px] font-black uppercase tracking-widest">Dokument empfangen</p>
                                   <p className="text-[8px] opacity-60">Klicken zum Herunterladen</p>
                                </div>
                             </a>
                           )}
                         </div>
                       )}
                       {m.text && <p className="leading-relaxed font-medium">{m.text}</p>}
                    </div>
                    <span className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest px-2">
                       {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                 </div>
               ))}
               {isUploading && (
                 <div className="flex justify-end">
                    <div className="bg-madrassah-950/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                       <Loader2 size={16} className="animate-spin text-madrassah-950" />
                       <span className="text-[10px] font-black text-madrassah-950 uppercase tracking-widest">Datei wird gesendet...</span>
                    </div>
                 </div>
               )}
            </div>

            <div className="p-8 bg-white border-t border-gray-50 space-y-4">
               {isRecording ? (
                 <div className="bg-red-50 p-6 rounded-3xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-4">
                       <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                       <span className="text-red-600 font-black text-lg">{formatTime(recordingTime)}</span>
                       <span className="text-red-400 text-[10px] font-black uppercase tracking-widest">Sprachnachricht aufnahme...</span>
                    </div>
                    <button onClick={stopRecording} className="p-4 bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                       <StopCircle size={24} />
                    </button>
                 </div>
               ) : (
                 <>
                   <div className="flex gap-3 px-2">
                      <button onClick={() => triggerFileSelect('image')} title="Bild senden" className="p-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-madrassah-950 hover:text-white transition-all"><ImageIcon size={20}/></button>
                      <button onClick={() => triggerFileSelect('video')} title="Video senden" className="p-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-madrassah-950 hover:text-white transition-all"><VideoIcon size={20}/></button>
                      <button onClick={() => triggerFileSelect('file')} title="Datei senden" className="p-3.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-madrassah-950 hover:text-white transition-all"><Paperclip size={20}/></button>
                      <button onClick={startRecording} title="Sprachnachricht" className="p-3.5 bg-madrassah-50 text-madrassah-950 rounded-2xl hover:bg-madrassah-950 hover:text-white transition-all"><Mic size={20}/></button>
                   </div>
                   <div className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)} 
                        onKeyPress={e => e.key === 'Enter' && handleSend()} 
                        placeholder="Deine Nachricht schreiben..." 
                        className="flex-1 px-8 py-5 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none focus:ring-4 focus:ring-madrassah-950/5 transition-all text-sm font-medium" 
                      />
                      <button 
                        onClick={() => handleSend()} 
                        disabled={!inputText.trim()}
                        className="p-5 bg-madrassah-950 text-white rounded-[1.5rem] shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-20 disabled:translate-y-0"
                      >
                         <Send size={28} />
                      </button>
                   </div>
                 </>
               )}
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-10 p-20 text-center">
             <MessageSquare size={150} strokeWidth={1} />
             <h4 className="text-3xl font-black mt-10 uppercase tracking-tighter italic">Willkommen im Chat</h4>
             <p className="text-sm font-bold mt-4 uppercase tracking-widest max-w-xs leading-relaxed">Wähle einen Kontakt aus der Liste, um eine Unterhaltung zu beginnen.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
