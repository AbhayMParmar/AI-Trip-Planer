import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    FaceSmileIcon,
    Bars3BottomLeftIcon
} from '@heroicons/react/24/outline';

export default function ChatAssistant() {
    const { user, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm your TravelAI Assistant. How can I help you plan your next adventure today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!user?.uid) return;
            try {
                const docRef = doc(db, 'chatbox_history', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().messages) {
                    setMessages(docSnap.data().messages);
                }
            } catch (error) {
                console.error("Error loading chat history:", error);
            }
        };
        if (isAuthenticated) {
            loadHistory();
        }
    }, [user, isAuthenticated]);

    const saveHistory = async (newMessages) => {
        if (!user?.uid) return;
        try {
            await setDoc(doc(db, 'chatbox_history', user.uid), { 
                userId: user.uid,
                name: user.name || '',
                email: user.email || '',
                messages: newMessages,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (error) {
            console.error("Error saving chat history:", error);
        }
    };
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            }, 100);
        }
    }, [messages, isLoading, isOpen]);

    // Listen for hash change in URL to open from navbar
    useEffect(() => {
        const handleHash = () => {
            if (window.location.hash === '#chat') {
                setIsOpen(true);
            }
        };
        handleHash(); // Check on mount
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = message;
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        saveHistory(newMessages);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chatbot/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    model: user?.preferences?.aiModel || 'gemini',
                    history: messages.slice(-5) // Send last 5 messages for context
                })
            });

            const data = await response.json();
            const finalMessages = [...newMessages, { role: 'assistant', content: data.reply || data.message }];
            setMessages(finalMessages);
            saveHistory(finalMessages);
        } catch (error) {
            const errorMessages = [...newMessages, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later!" }];
            setMessages(errorMessages);
            saveHistory(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[2000] font-['Plus_Jakarta_Sans']">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-24 right-0 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] shadow-2xl border border-olive-500/10 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 bg-stone-950 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#556B2F] flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm font-black tracking-tight">TravelAI Assistant</div>
                                    <div className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Powered by {user?.preferences?.aiModel === 'groq' ? 'Groq Llama 3' : 'Gemini 2.5'}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-gray-50/50">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-stone-950 text-white rounded-tr-none'
                                        : 'bg-white text-stone-900 rounded-tl-none border border-olive-500/5'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-olive-500/5 flex gap-2 items-center">
                                        <div className="w-1.5 h-1.5 bg-[#556B2F] rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-[#556B2F] rounded-full animate-bounce delay-75" />
                                        <div className="w-1.5 h-1.5 bg-[#556B2F] rounded-full animate-bounce delay-150" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} className="h-1 text-transparent">.</div>
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100 flex gap-3">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-4 focus:ring-[#556B2F]/10 transition-all outline-none"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || isLoading}
                                className="bg-[#556B2F] text-white p-4 rounded-2xl shadow-lg shadow-olive-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isOpen ? 'bg-stone-950' : 'bg-[#556B2F]'
                    }`}
            >
                {isOpen ? <XMarkIcon className="w-8 h-8" /> : <ChatBubbleLeftRightIcon className="w-8 h-8" />}
                {!isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-stone-950 rounded-full border-2 border-white flex items-center justify-center"
                    >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    );
}
