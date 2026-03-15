import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    UserIcon,
    EnvelopeIcon,
    LockClosedIcon,
    GlobeAltIcon,
    RocketLaunchIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    SparklesIcon,
    ChevronRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';

const themes = [
    { name: 'Peach Main', hex: '#556B2F' },
    { name: 'Sunset Warm', hex: '#6B732A' },
    { name: 'Coral Soft', hex: '#d88d6a' },
    { name: 'White Light', hex: '#ffffff' }
];

const AdvancedLoader = ({ statusText, colorHex }) => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FBFCFE]/90 backdrop-blur-sm">
        <div className="relative w-24 h-24 mb-8">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-slate-100 rounded-full"
                style={{ borderTopColor: colorHex }}
            />
            <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-4 border-slate-100 rounded-full"
                style={{ borderBottomColor: "#0f172a" }}
            />
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-6 bg-slate-900 rounded-full flex items-center justify-center shadow-lg"
            >
                <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
        </div>
        <h3 className="text-xl font-black text-slate-900 tracking-widest uppercase mb-3">{statusText}</h3>
        <div className="flex gap-2 mb-4">
            {[0, 1, 2].map(i => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: colorHex }}
                />
            ))}
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Preparing neural structure...</p>
    </div>
);

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTheme, setActiveTheme] = useState(themes[0]); // Default to Emerald Deep
    const { register, logout } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(true);

        try {
            const success = await register(formData.name, formData.email, formData.password);
            if (success) {
                setIsSuccess(true);
                await logout(); // Sign out so they have to log in manually as requested
                setTimeout(() => navigate('/login'), 1500);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Registration failed:", error);
            toast.error(error.message || "Registration encountered an error");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#FBFCFE] flex justify-center items-start pt-1 md:pt-2 pb-4 p-4 md:p-8 relative font-sans antialiased overflow-hidden">
            <AnimatePresence>
                {(isSubmitting || isSuccess) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100]"
                    >
                        <AdvancedLoader 
                            statusText={isSuccess ? "Identity Configured" : "Configuring Profile"} 
                            colorHex={activeTheme.hex} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Soft Ambient Background - Shared across identity pages */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-[-10%] right-[-10%] w-[500px] md:w-[800px] h-[500px] md:h-[800px] rounded-full blur-[120px] opacity-40 transition-colors duration-1000"
                    style={{ backgroundColor: activeTheme.hex }}
                />
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, boxShadow: "0 40px 80px -20px rgba(0,0,0,0.1)" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-[1050px] w-full bg-white rounded-[2.5rem] flex flex-col lg:flex-row overflow-hidden relative z-10 border border-slate-200/60 shadow-2xl shadow-slate-200/50 transition-all duration-500"
            >
                {/* Visual Side (Left) */}
                <div className="hidden md:flex w-[40%] bg-stone-950 relative flex-col justify-between p-12 overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-[#556B2F] rounded-xl flex items-center justify-center shadow-lg">
                                <GlobeAltIcon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-white font-black tracking-widest text-sm uppercase">AI Travel Planner</span>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
                            Your <br />
                            <span className="text-[#556B2F] font-black italic">Journey Begins.</span>
                        </h2>
                        <p className="mt-4 text-neutral-500 text-xs font-bold uppercase tracking-[0.2em] max-w-[200px] leading-relaxed">
                            Generate complete trip plans based on your unique preferences and budget.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3 text-olive-200/60 text-[10px] font-black uppercase tracking-widest">
                            <SparklesIcon className="w-4 h-4" /> Smart Recommendations
                        </div>
                        <div className="flex items-center gap-3 text-olive-200/60 text-[10px] font-black uppercase tracking-widest">
                            <GlobeAltIcon className="w-4 h-4" /> Global Coverage
                        </div>
                    </div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full aspect-square border-2 border-white/5 rounded-full scale-150 pointer-events-none" />
                </div>

                {/* Form Side (Right) */}
                <div className="w-full lg:w-[60%] flex flex-col justify-center p-6 sm:p-8 lg:p-10 bg-white relative">
                    <div className="mb-4 lg:mb-6">
                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Create Account</h3>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                            <div className="relative group/in">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    autoComplete="name"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group/in">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group/in">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                            <div className="relative group/in">
                                <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    autoComplete="new-password"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                    placeholder="••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full md:col-span-2 py-3.5 mt-2 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:pointer-events-none"
                        >
                            Complete Setup
                            <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </form>

                    <div className="mt-8 pt-4 border-t border-slate-50 flex flex-col items-center gap-4">
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest text-center">
                            Return to access?{' '}
                            <Link to="/login" className="text-slate-900 border-b border-slate-200 hover:border-[#556B2F] transition-all">
                                Travel Sign In
                            </Link>
                        </p>

                        <Link to="/" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-[#556B2F] transition-all flex items-center gap-2 group">
                            <ArrowLeftIcon className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>

                        <div className="flex gap-2">
                            {themes.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveTheme(t)}
                                    className={`w-4 h-4 rounded-full border transition-all ${activeTheme.name === t.name ? 'border-slate-900 scale-110 shadow-sm' : 'border-slate-200 opacity-50'}`}
                                    style={{ backgroundColor: t.hex }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Subtle info */}
            <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pointer-events-none">
                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-olive-500 rounded-full animate-pulse" /> Always secure</span>
                <span className="opacity-40">|</span>
                <span>Fast & Reliable</span>
                <span className="opacity-40">|</span>
                <span>Easy to use</span>
            </div>
        </div>
    );
}
