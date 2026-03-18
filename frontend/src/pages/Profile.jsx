import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    SparklesIcon,
    ArrowRightOnRectangleIcon,
    CheckBadgeIcon,
    ChevronRightIcon,
    CpuChipIcon,
    CommandLineIcon,
    TrophyIcon,
    BookmarkIcon,
    MapIcon,
    PencilSquareIcon,
    XMarkIcon,
    CheckIcon,
    ArrowPathIcon,
    BoltIcon
} from '@heroicons/react/24/outline';

export default function Profile() {
    const { user, setUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [stats, setStats] = useState({ trips: 0, saved: 0 });
    
    useEffect(() => {
        if (user?.uid) {
            fetchStats();
        }
    }, [user?.uid]);

    const fetchStats = async () => {
        try {
            // Count total expeditions (trips)
            const tripsQuery = query(collection(db, 'trips'), where('userId', '==', user.uid));
            const tripsSnapshot = await getDocs(tripsQuery);
            
            // Count favorited trips
            const favTripsQuery = query(
                collection(db, 'trips'), 
                where('userId', '==', user.uid),
                where('isFavorite', '==', true)
            );
            const favTripsSnapshot = await getDocs(favTripsQuery);

            // Count saved places/meals
            const savedQuery = query(collection(db, 'favorites'), where('userId', '==', user.uid));
            const savedSnapshot = await getDocs(savedQuery);
            
            setStats({ 
                trips: tripsSnapshot.size, 
                saved: favTripsSnapshot.size + savedSnapshot.size 
            });
        } catch (error) {
            console.error("Stats fetch error:", error);
        }
    };
    const [formData, setFormData] = useState({
        name: user?.name || user?.displayName || (user?.email ? user.email.substring(0, 4) : 'User'),
        preferences: {
            budget: user?.preferences?.budget || 'moderate',
            aiModel: user?.preferences?.aiModel || 'groq'
        }
    });

    const displayNameFallback = user?.name || user?.displayName || (user?.email ? user.email.substring(0, 4) : 'User');
    const currentDisplayName = isEditing ? (formData.name || 'User') : displayNameFallback;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.uid) return toast.error('Check your connection');
        
        const syncToast = toast.loading('Synchronizing identity...');
        try {
            // Priority 1: Persistent Storage (Firestore)
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, formData, { merge: true });
            
            // Priority 2: Local State
            setUser({ ...user, ...formData });
            setIsEditing(false);
            toast.success('Identity Synchronized', { id: syncToast });
        } catch (error) {
            console.error('Profile Update Error:', error);
            // Fallback: If Firestore fails (permissions), still update the local session for the current session
            setUser({ ...user, ...formData });
            setIsEditing(false);
            toast.success('Updated (Cloud Sync Pending)', { id: syncToast });
            toast.error('Note: Database permissions restricted', { duration: 5000 });
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFCFE] pt-4 md:pt-6 pb-6 md:pb-8 px-4 sm:px-6 relative overflow-hidden">
            {/* Soft Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#556B2F]/10 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">


                <div className="grid lg:grid-cols-12 gap-6 items-start">
                    {/* Compact Identity Panel (Left on Desktop, Top on Mobile) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-4 space-y-5"
                    >
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-slate-200/60 p-5 md:p-8 shadow-sm flex flex-col items-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity">
                                <UserIcon className="w-40 h-40" />
                            </div>
                            
                            <div className="relative mb-6">
                                <motion.div 
                                    whileHover={{ rotate: 5, scale: 1.05 }}
                                    className="w-32 h-32 rounded-[2.5rem] bg-slate-900 flex items-center justify-center text-4xl font-black text-white shadow-2xl ring-4 ring-white"
                                >
                                    {currentDisplayName.charAt(0).toUpperCase()}
                                </motion.div>
                                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#556B2F] rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                                    <CheckBadgeIcon className="w-6 h-6" />
                                </div>
                            </div>
                            
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-1 text-center capitalize">
                                {currentDisplayName}
                            </h1>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-8 text-center truncate w-full px-4 border-b border-slate-50 pb-4">
                                {user?.email}
                            </p>
                            
                            <div className="w-full grid grid-cols-2 gap-4">
                                <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100 group/stat hover:bg-white transition-all">
                                    <span className="text-2xl font-[1000] text-slate-900 leading-none group-hover/stat:text-[#556B2F] transition-colors">{stats.trips}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Expeditions</span>
                                </div>
                                <div className="bg-slate-50/50 rounded-2xl p-5 flex flex-col items-center justify-center border border-slate-100 group/stat hover:bg-white transition-all">
                                    <span className="text-2xl font-[1000] text-slate-900 leading-none group-hover/stat:text-blue-500 transition-colors">{stats.saved}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Markers</span>
                                </div>
                            </div>

                            <div className="flex flex-col w-full gap-3 mt-8">
                                <button 
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white shadow-2xl shadow-slate-200 hover:bg-[#556B2F]'}`}
                                >
                                    {isEditing ? <><XMarkIcon className="w-4 h-4" /> Exit Editor</> : <><PencilSquareIcon className="w-4 h-4" /> Modify Profile</>}
                                </button>
                                <button 
                                    onClick={logout} 
                                    className="flex items-center justify-center gap-3 py-5 px-8 bg-white hover:bg-red-50 border-2 border-red-100 hover:border-red-200 rounded-[2rem] text-red-600 font-[1000] text-[11px] uppercase tracking-[0.3em] transition-all active:scale-95 shadow-[0_15px_30px_-10px_rgba(239,68,68,0.15)] hover:shadow-[0_20px_40px_-10px_rgba(239,68,68,0.2)] group/logout relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/logout:opacity-100 transition-opacity" />
                                    <ArrowRightOnRectangleIcon className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" /> 
                                    <span className="relative z-10">Logout Session</span>
                                </button>
                            </div>
                        </div>

                    </motion.div>

                    {/* Dynamic Configuration Panel (Right Column) */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-8 space-y-6"
                    >
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] border border-slate-200/60 p-5 md:p-10 shadow-sm relative overflow-hidden h-full">
                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Modify Parameters</h2>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configure your personal exploration engine</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-[#556B2F]/10 flex items-center justify-center">
                                                <SparklesIcon className="w-6 h-6 text-[#556B2F]" />
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em] ml-2">Public Handle</label>
                                                <div className="relative group">
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full bg-slate-50/50 rounded-2xl py-5 px-6 font-bold border border-slate-100 focus:border-[#556B2F] focus:bg-white transition-all outline-none text-slate-900"
                                                    />
                                                    <UserIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-[#556B2F] transition-colors" />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.2em] ml-2">Eco-Parameter</label>
                                                <div className="relative group">
                                                    <select
                                                        value={formData.preferences.budget}
                                                        onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, budget: e.target.value } })}
                                                        className="w-full bg-slate-50/50 rounded-2xl py-5 px-6 font-bold border border-slate-100 focus:border-[#556B2F] focus:bg-white transition-all outline-none appearance-none text-slate-900"
                                                    >
                                                        <option value="budget">Value Optimized</option>
                                                        <option value="moderate">Smart Balance</option>
                                                        <option value="luxury">Luxury Elite</option>
                                                    </select>
                                                    <ChevronRightIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 rotate-90" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <label className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.3em] ml-2 flex items-center gap-3">
                                                <CpuChipIcon className="w-4 h-4 text-[#556B2F]" /> Intelligence Core Configuration
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    { id: 'groq', name: 'Llama 3.3', label: 'Pro-Active Processing', icon: BoltIcon },
                                                    { id: 'gemini', name: 'Gemini 1.5', label: 'Deep Logic Synthesis', icon: CommandLineIcon }
                                                ].map(m => (
                                                    <button
                                                        key={m.id}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, preferences: { ...formData.preferences, aiModel: m.id } })}
                                                        className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-5 text-left group/model ${formData.preferences.aiModel === m.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${formData.preferences.aiModel === m.id ? 'bg-[#556B2F] text-white' : 'bg-white text-slate-300 group-hover/model:text-[#556B2F]'}`}>
                                                            <m.icon className="w-6 h-6" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mb-0.5">{m.label}</div>
                                                            <div className="text-lg font-black tracking-tight">{m.name}</div>
                                                        </div>
                                                        {formData.preferences.aiModel === m.id && <CheckIcon className="w-5 h-5 text-[#556B2F] shrink-0" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-[1000] uppercase tracking-[0.4em] text-xs shadow-2xl hover:bg-[#556B2F] hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-4">
                                            Synchronize Profile
                                            <ArrowPathIcon className="w-5 h-5" />
                                        </button>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="view"
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-12"
                                    >
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 md:gap-6">
                                            <div className="space-y-1">
                                                <h2 className="text-2xl md:text-3xl font-[1000] text-slate-900 tracking-tight leading-none uppercase">Neural Interface</h2>
                                                <div className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                                                    Current Operating Parameters
                                                </div>
                                            </div>
                                            <div className="px-6 md:px-8 py-3 md:py-4 bg-slate-900 rounded-2xl md:rounded-[1.5rem] flex items-center gap-4 shadow-xl">
                                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                                <div className="flex flex-col">
                                                    <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mb-1">Active Core</span>
                                                    <span className="text-[10px] md:text-xs font-black text-white uppercase tracking-widest leading-none">
                                                        {user?.preferences?.aiModel === 'groq' ? 'Llama 3.3 Ultra' : 'Gemini 1.5 Flash'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 group overflow-hidden relative transition-all hover:bg-white hover:border-[#556B2F]/20">
                                                <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] transition-transform group-hover:scale-110 duration-700">
                                                    <CpuChipIcon className="w-32 h-32" />
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                    <CpuChipIcon className="w-7 h-7" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Logic Algorithm</h4>
                                                <p className="text-2xl font-black text-slate-900 tracking-tight">Advanced Itinerary <span className="text-[#556B2F]">Synthesis</span></p>
                                            </div>
                                            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100 group overflow-hidden relative transition-all hover:bg-white hover:border-blue-200/20">
                                                <div className="absolute -right-4 -top-4 p-8 opacity-[0.03] transition-transform group-hover:scale-110 duration-700">
                                                    <CommandLineIcon className="w-32 h-32" />
                                                </div>
                                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                                    <CommandLineIcon className="w-7 h-7" />
                                                </div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Economic Mode</h4>
                                                <p className="text-2xl font-black text-slate-900 tracking-tight capitalize">{user?.preferences?.budget || 'Smart Moderate'}</p>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50">
                                             <div className="bg-slate-900 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 shadow-xl relative overflow-hidden group/cta">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover/cta:scale-125 transition-transform duration-1000">
                                                    <SparklesIcon className="w-40 h-40 text-[#556B2F]" />
                                                </div>
                                                <div className="flex-1 text-center md:text-left relative z-10">
                                                    <h3 className="text-2xl font-black text-white tracking-tight uppercase mb-1">Ready for the Next Quest?</h3>
                                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Your preferences are optimized for maximum exploration efficiency.</p>
                                                </div>
                                                <Link to="/planner" className="px-10 py-5 bg-[#556B2F] text-white font-[1000] text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-olive-500/20 shrink-0 relative z-10">
                                                    Launch Planner
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
