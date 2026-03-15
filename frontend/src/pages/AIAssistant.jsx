import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import {
    SparklesIcon,
    PaperAirplaneIcon,
    ArrowPathIcon,
    PlusIcon,
    ChatBubbleLeftRightIcon,
    ChevronUpIcon,
    MicrophoneIcon,
    DocumentIcon,
    XMarkIcon,
    ArrowLeftIcon,
    CommandLineIcon,
    CheckIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    Bars3CenterLeftIcon
} from '@heroicons/react/24/outline';

const SidebarToggleIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const WelcomeSuggestion = ({ text, onClick }) => (
    <motion.button
        whileHover={{ y: -4, backgroundColor: 'rgba(85, 107, 47, 0.1)' }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(text)}
        className="p-2.5 rounded-xl border border-olive-500/10 bg-white shadow-sm text-left group transition-all"
    >
        <p className="text-[11px] font-bold text-stone-900 group-hover:text-[#556B2F] transition-colors line-clamp-2">{text}</p>
    </motion.button>
);

export default function AIAssistant() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Llama 3.3 (Groq)');
    const [showModelMenu, setShowModelMenu] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const fileInputRef = useRef(null);
    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);

    const [isFold5, setIsFold5] = useState(false);

    useEffect(() => {
        const checkFold5 = () => {
            setIsFold5(window.innerWidth === 768 && window.innerHeight === 912);
        };
        checkFold5();
        window.addEventListener('resize', checkFold5);
        return () => window.removeEventListener('resize', checkFold5);
    }, []);

    // History & Session Management
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem(`ai_chat_sidebar_open_${user?.uid || 'guest'}`);
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        const loadSessionsFromFirestore = async () => {
            if (!user?.uid) return;
            try {
                const q = query(collection(db, 'ai_chat_sessions'), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);
                const loadedSessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                loadedSessions.sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));
                setSessions(loadedSessions);
            } catch (error) {
                console.error('Error loading sessions from firestore:', error);
            }
        };
        if (user) {
            loadSessionsFromFirestore();
        } else {
            setSessions([]);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem(`ai_chat_sidebar_open_${user?.uid || 'guest'}`, JSON.stringify(sidebarOpen));
    }, [sidebarOpen, user?.uid]);

    const startNewChat = () => {
        setActiveSessionId(null);
        setMessages([]);
        setMessage('');
        removeFile();
    };

    const loadSession = (session) => {
        setActiveSessionId(session.id);
        setMessages(session.messages);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const deleteSession = async (e, id) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) startNewChat();
        if (user?.uid) {
            try {
                await deleteDoc(doc(db, 'ai_chat_sessions', id));
            } catch (error) {
                console.error("Error deleting session:", error);
            }
        }
    };

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(prev => (prev ? prev + ' ' : '') + transcript);
                setIsRecording(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
            };

            recognitionRef.current.onend = () => {
                setIsRecording(false);
            };
        }
    }, []);

    const toggleRecording = () => {
        if (!recognitionRef.current) {
            alert('Speech Recognition is not supported in this browser.');
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setIsRecording(true);
            recognitionRef.current.start();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setFilePreview(reader.result);
                reader.readAsDataURL(file);
            } else {
                setFilePreview('document');
            }
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const models = [
        { name: 'Llama 3.3 (Groq)', status: 'Speed' },
        { name: 'Gemini 1.5 (Google)', status: 'Vision' },
    ];

    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        }
    }, [messages, isLoading]);

    const handleSend = async (e, text = null) => {
        if (e) e.preventDefault();
        const msgToSend = text || message;
        if ((!msgToSend.trim() && !selectedFile) || isLoading) return;

        const userMsg = {
            role: 'user',
            content: msgToSend,
            file: filePreview ? { type: selectedFile.type, name: selectedFile.name, data: filePreview } : null
        };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setMessage('');
        removeFile();
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', msgToSend);
            formData.append('model', selectedModel.includes('Gemini') ? 'gemini' : 'groq');
            formData.append('history', JSON.stringify(messages));
            if (selectedFile) formData.append('file', selectedFile);

            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            const assistantMsg = { role: 'assistant', content: data.reply || data.message || 'I am processing your request...' };
            const finalMessages = [...newMessages, assistantMsg];
            setMessages(finalMessages);

            // Update or Create Session
            const updatedSessions = [...sessions];
            let currentSessionId = activeSessionId;
            let sessionToSave = null;

            if (currentSessionId) {
                const sessionIdx = updatedSessions.findIndex(s => s.id === currentSessionId);
                if (sessionIdx !== -1) {
                    updatedSessions[sessionIdx].messages = finalMessages;
                    updatedSessions[sessionIdx].lastUpdate = new Date().toISOString();
                    sessionToSave = updatedSessions[sessionIdx];
                    setSessions(updatedSessions);
                }
            } else {
                const newSession = {
                    id: Date.now().toString(),
                    userId: user?.uid || 'guest',
                    userName: user?.name || 'Guest',
                    userEmail: user?.email || '',
                    title: msgToSend.slice(0, 30) + (msgToSend.length > 30 ? '...' : ''),
                    messages: finalMessages,
                    lastUpdate: new Date().toISOString()
                };
                sessionToSave = newSession;
                setSessions([newSession, ...sessions]);
                setActiveSessionId(newSession.id);
            }

            if (user?.uid && sessionToSave) {
                try {
                    await setDoc(doc(db, 'ai_chat_sessions', sessionToSave.id), sessionToSave, { merge: true });
                } catch (error) {
                    console.error("Error saving session to firestore:", error);
                }
            }
        } catch (error) {
            setMessages([...newMessages, { role: 'assistant', content: "Connection error. Please try again!" }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen flex bg-[#FBFCFE] overflow-hidden relative">
            {/* History Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? (window.innerWidth < 768 ? '100%' : (isFold5 ? '260px' : '320px')) : '0px' }}
                className={`fixed md:relative z-[200] h-full zf-sidebar-width bg-white/80 backdrop-blur-3xl border-r border-slate-200/60 flex flex-col overflow-hidden transition-all duration-300 ${!sidebarOpen && 'border-none'}`}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-[#556B2F] shadow-lg">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Mission Logs</h3>
                    </div>
                    <div className="relative group/sidebar-toggle">
                        <button 
                            onClick={() => setSidebarOpen(false)} 
                            className="p-2 text-slate-400 hover:text-slate-900 transition-colors flex items-center justify-center rounded-lg hover:bg-slate-50"
                        >
                            <SidebarToggleIcon className="w-6 h-6" />
                        </button>
                        <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/sidebar-toggle:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover/sidebar-toggle:translate-y-0 whitespace-nowrap pointer-events-none z-[1000] block shadow-2xl">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-900" />
                            Close Sidebar
                        </div>
                    </div>
                </div>

                <div className="p-4">
                    <button 
                        onClick={startNewChat}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-[#556B2F] transition-all flex items-center justify-center gap-3 group"
                    >
                        <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        New Chat
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-2 no-scrollbar">
                    {sessions.length === 0 ? (
                        <div className="py-20 text-center space-y-3 opacity-30">
                            <MagnifyingGlassIcon className="w-10 h-10 mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No previous logs</p>
                        </div>
                    ) : (
                        sessions.map(s => (
                            <div
                                key={s.id}
                                onClick={() => loadSession(s)}
                                className={`group relative p-4 rounded-2xl cursor-pointer transition-all border ${activeSessionId === s.id ? 'bg-[#556B2F]/10 border-[#556B2F]/20' : 'bg-transparent border-transparent hover:bg-slate-50'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <ChatBubbleLeftRightIcon className={`w-5 h-5 mt-0.5 shrink-0 ${activeSessionId === s.id ? 'text-[#556B2F]' : 'text-slate-300'}`} />
                                    <div className="flex-1 overflow-hidden">
                                        <p className={`text-[11px] font-bold truncate ${activeSessionId === s.id ? 'text-[#556B2F]' : 'text-slate-700'}`}>
                                            {s.title}
                                        </p>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-1">
                                            {new Date(s.lastUpdate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteSession(e, s.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <Link 
                    to="/profile"
                    className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center gap-4 hover:bg-slate-100 transition-all cursor-pointer group/profile"
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black shadow-sm group-hover/profile:border-[#556B2F]/30 transition-all">
                        {user?.name?.[0]}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest leading-none mb-1 group-hover/profile:text-[#556B2F] transition-colors">{user?.name}</p>
                        <p className="text-[8px] font-bold text-slate-400 truncate tracking-tight">{user?.email}</p>
                    </div>
                </Link>
            </motion.aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">


            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-5%] right-[-5%] w-[600px] h-[600px] bg-[#556B2F]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[100px]" />
            </div>

            <header className="px-3 md:px-6 py-1.5 md:py-2 relative z-[100]">
                <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-4 md:px-7 py-2 md:py-3 rounded-[1.8rem] md:rounded-[2.5rem] border bg-white/40 backdrop-blur-3xl border-white/30 shadow-sm transition-all duration-500 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:bg-white/60 hover:border-white/50 group/nav">
                    <div className="flex items-center gap-2 md:gap-6 w-full md:w-auto">

                        

                        
                        {/* Unified Logo & Brand Unit */}
                        <Link 
                            to="#" 
                            onClick={(e) => {
                                e.preventDefault();
                                if (!sidebarOpen) {
                                    setSidebarOpen(true);
                                }
                            }}
                            onMouseEnter={() => setIsLogoHovered(true)}
                            onMouseLeave={() => setIsLogoHovered(false)}
                            className="relative flex items-center gap-3 md:gap-5 group/logo outline-none"
                        >
                            <div className="relative w-10 h-10 md:w-14 md:h-14 overflow-visible shrink-0">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-1.5 md:-inset-2 border-t-2 border-[#556B2F]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl group-hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                                    <AnimatePresence mode="wait">
                                        {isLogoHovered && !sidebarOpen ? (
                                            <motion.div
                                                key="toggle-icon"
                                                initial={{ opacity: 0, scale: 0.8, rotate: -20 }}
                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                exit={{ opacity: 0, scale: 0.8, rotate: 20 }}
                                                className="text-[#556B2F]"
                                            >
                                                <SidebarToggleIcon className="w-5 h-5 md:w-8 md:h-8" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="brand-icon"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex items-center justify-center w-full h-full relative"
                                            >
                                                <SparklesIcon className="w-5 h-5 md:w-7 md:h-7 text-[#556B2F]" />
                                                <motion.div 
                                                    animate={{ x: [-100, 100] }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                {/* Custom Tooltip for Sidebar Open */}
                                {!sidebarOpen && (
                                    <div className="absolute top-[calc(100%+1rem)] left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/logo:opacity-100 transition-all duration-300 translate-y-[-10px] group-hover/logo:translate-y-0 whitespace-nowrap pointer-events-none z-[1000] block shadow-2xl">
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-slate-900" />
                                        Open Sidebar
                                    </div>
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <h2 className="text-xs md:text-xl font-[1000] text-slate-900 tracking-tighter flex items-center gap-1.5 md:gap-2 uppercase whitespace-nowrap group-hover:text-[#556B2F] transition-colors">
                                    Neural <span className="text-[#556B2F] italic group-hover:text-slate-900 transition-colors">Concierge</span>
                                    <span className="px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-lg bg-[#556B2F]/10 text-[#556B2F] text-[7px] md:text-[9px] tracking-[0.2em] md:tracking-[0.3em] font-black border border-[#556B2F]/20">V5.0</span>
                                </h2>
                                <div className="flex items-center gap-1.5 md:gap-2">
                                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#556B2F] animate-pulse" />
                                    <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] truncate">
                                        {selectedModel.includes('Gemini') ? 'Gemini 2.5 Active' : 'Llama 3 Active'}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-slate-900 text-white rounded-xl md:rounded-2xl font-black text-[9px] md:text-[11px] uppercase tracking-widest hover:bg-[#556B2F] transition-all group shadow-lg zf-nav-compact"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline zf-hide-text">Back</span>
                    </motion.button>
                </nav>
            </header>

            {/* Interaction Layer */}
            <div className={`flex-1 ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'} no-scrollbar relative z-10 scroll-smooth`}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    *::-webkit-scrollbar { display: none !important; }
                    * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
                `}} />

                <div className="max-w-4xl mx-auto px-4 md:px-10 py-1 h-full flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-start md:justify-center text-center space-y-3 md:space-y-6 pt-6 md:pt-0"
                            >
                                <div className="space-y-3 md:space-y-4">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] md:rounded-[2.5rem] bg-white border border-slate-100 flex items-center justify-center mx-auto shadow-xl group hover:rotate-12 transition-all">
                                        <ChatBubbleLeftRightIcon className="w-6 h-6 md:w-8 md:h-8 text-[#556B2F] group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="space-y-1 md:space-y-2">
                                        <h1 className="text-3xl md:text-6xl font-[1000] text-slate-900 tracking-tighter leading-none">
                                            Initiate <span className="text-[#556B2F] italic block sm:inline">Deep Intelligence</span>
                                        </h1>
                                        <p className="text-slate-400 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.5em] pt-1 md:pt-2">
                                            The Neural Core of Future Expeditions
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-2 pb-24 md:pb-20">
                                    {[
                                        "Architect a 7-day immersion in Japanese culture.",
                                        "Reveal the encrypted hidden gems of Lisbon.",
                                        "Optimize a family mission in the Swiss Alps.",
                                        "Synthesize a gastronomy tour across Florence."
                                    ].map((text, idx) => (
                                        <WelcomeSuggestion
                                            key={idx}
                                            text={text}
                                            onClick={(txt) => handleSend(null, txt)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-12 pb-10">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 md:gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                    >
                                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[2rem] flex-shrink-0 flex items-center justify-center shadow-2xl transition-all group ${msg.role === 'user' ? 'bg-slate-900 text-white shadow-slate-900/10' : 'bg-slate-900 text-[#556B2F] shadow-slate-900/10'}`}>
                                            {msg.role === 'user' ? (
                                                <span className="text-lg font-black uppercase text-white group-hover:scale-110 transition-transform">{user?.name?.charAt(0)}</span>
                                            ) : (
                                                <SparklesIcon className="w-6 h-6 md:w-9 md:h-9 group-hover:rotate-12 transition-transform" />
                                            )}
                                        </div>
                                        <div className={`flex-1 space-y-3 max-w-[85%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            <div className="flex items-center gap-3 mb-1 px-2">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${msg.role === 'user' ? 'text-[#556B2F]' : 'text-slate-400'}`}>
                                                    {msg.role === 'user' ? 'Protocol Explorer' : 'Neural Core'}
                                                </span>
                                            </div>
                                            <div className={`p-4 md:p-8 rounded-2xl md:rounded-[3rem] text-xs md:text-lg leading-relaxed font-[700] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] inline-block text-left transition-all zf-bubble-compact ${msg.role === 'user'
                                                ? 'bg-slate-900 text-white rounded-tr-none border border-slate-900 shadow-xl'
                                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-100 whitespace-pre-wrap'
                                                }`}>
                                                {msg.file && (
                                                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-1.5 ring-4 ring-slate-100/50">
                                                        {msg.file.type.startsWith('image/') ? (
                                                            <img src={msg.file.data} alt="uploaded" className="max-h-60 rounded-xl object-cover" />
                                                        ) : (
                                                            <div className="flex items-center gap-3 p-4 bg-white text-slate-800 rounded-xl">
                                                                <DocumentIcon className="w-7 h-7 text-olive-600" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]">{msg.file.name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {msg.content}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-8">
                                        <div className="w-16 h-16 rounded-[2rem] flex-shrink-0 flex items-center justify-center bg-slate-900 shadow-2xl">
                                            <ArrowPathIcon className="w-9 h-9 text-[#556B2F] animate-spin" />
                                        </div>
                                        <div className="flex-1 flex items-center">
                                            <div className="flex gap-2.5 p-8 bg-white/50 backdrop-blur-md rounded-[3rem] border border-slate-100 shadow-sm">
                                                <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce [animation-duration:800ms]" />
                                                <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:200ms]" />
                                                <div className="w-3 h-3 bg-slate-900 rounded-full animate-bounce [animation-duration:800ms] [animation-delay:400ms]" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} className="h-1 text-transparent">.</div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="px-4 md:px-8 py-6 bg-transparent relative z-[100]">
                <div className="max-w-4xl mx-auto relative group pb-1 md:pb-0">
                    <AnimatePresence>
                        {showModelMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full mb-6 left-0 w-80 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800 z-[1000] p-3"
                            >
                                <div className="px-5 py-3 border-b border-slate-800 mb-2">
                                    <p className="text-[9px] font-[1000] text-slate-500 uppercase tracking-[0.4em]">Processing Architecture</p>
                                </div>
                                {models.map((m) => (
                                    <button
                                        key={m.name}
                                        onClick={() => { setSelectedModel(m.name); setShowModelMenu(false); }}
                                        className={`w-full flex items-center justify-between px-5 py-4 rounded-[1.8rem] text-left transition-all ${selectedModel === m.name ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:bg-white/5 hover:text-white'} text-[10px] font-black uppercase tracking-widest`}
                                    >
                                        <span>{m.name}</span>
                                        {selectedModel === m.name && <CheckIcon className="w-4 h-4 text-[#556B2F]" />}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* File Preview Card */}
                    <AnimatePresence>
                        {filePreview && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute bottom-full mb-6 left-0 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-4 flex items-center gap-5 z-50 ring-8 ring-slate-100/50"
                            >
                                {filePreview === 'document' ? (
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-red-500">
                                        <DocumentIcon className="w-8 h-8" />
                                    </div>
                                ) : (
                                    <img src={filePreview} alt="preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-100" />
                                )}
                                <div className="pr-12">
                                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[180px] mb-1">{selectedFile?.name}</p>
                                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-olive-500 animate-pulse" />
                                        Data Buffered
                                    </div>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="absolute top-4 right-4 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form
                        onSubmit={handleSend}
                        className="relative bg-white border-[2px] md:border-[3px] border-slate-100 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.08)] md:shadow-[0_40px_100px_-30px_rgba(0,0,0,0.1)] rounded-2xl md:rounded-[3rem] p-1.5 md:p-2.5 flex items-center gap-2 md:gap-3 transition-all focus-within:border-[#556B2F]/30 group/input"
                    >
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,application/pdf,.doc,.docx,.txt"
                        />
                        <div className="flex items-center gap-1 md:gap-1.5 pl-1 md:pl-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-slate-400 hover:text-[#556B2F] hover:bg-slate-50 transition-all border border-slate-100 group-focus-within/input:border-[#556B2F]/20"
                                title="Attach"
                            >
                                <PlusIcon className="w-5 h-5 md:w-6 md:h-6 stroke-[3px]" />
                            </button>

                            <div className="hidden xs:block h-6 w-px bg-slate-100 mx-1 md:mx-2" />

                            <button
                                type="button"
                                onClick={() => setShowModelMenu(!showModelMenu)}
                                className="hidden sm:flex items-center gap-2 px-3 md:px-5 h-10 md:h-12 rounded-xl md:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-all border border-slate-100 whitespace-nowrap bg-slate-50/30"
                            >
                                <CommandLineIcon className="w-4 h-4" />
                                <span>{selectedModel.split(' ')[0]}</span>
                                <ChevronUpIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Message..."
                            className="flex-1 py-3 md:py-4 px-2 md:px-3 text-sm md:text-lg font-bold bg-transparent border-none focus:outline-none placeholder:text-slate-300 text-slate-900"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <div className="flex items-center gap-1 md:gap-2 pr-1 md:pr-2">
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-all rounded-xl md:rounded-[1.5rem] border ${isRecording ? 'bg-slate-100 text-[#556B2F] animate-pulse border-white shadow-lg' : 'text-slate-400 hover:text-slate-600 border-transparent hover:bg-slate-50'}`}
                            >
                                <MicrophoneIcon className={`w-4 h-4 md:w-5 md:h-5 ${isRecording ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                type="submit"
                                disabled={(!message.trim() && !selectedFile) || isLoading}
                                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.8rem] flex items-center justify-center shadow-2xl active:scale-95 flex-shrink-0 ${(message.trim() || selectedFile) && !isLoading
                                    ? 'bg-slate-900 text-white shadow-slate-900/30'
                                    : 'bg-slate-50 text-slate-200'
                                    }`}
                            >
                                <PaperAirplaneIcon className="w-4 h-4 md:w-6 md:h-6 -rotate-45 transition-transform" />
                            </button>
                        </div>
                    </form>
                    <p className="hidden md:block text-[9px] text-center mt-4 text-slate-300 font-black uppercase tracking-[0.8em] opacity-30">
                        Neural Concierge Interface • Synthesis Active
                    </p>
                </div>
            </div>
        </div>
    </div>
    );
}
