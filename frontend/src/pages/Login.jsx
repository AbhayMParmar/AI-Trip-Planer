import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    EnvelopeIcon,
    LockClosedIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    CommandLineIcon,
    FingerPrintIcon,
    ArrowRightIcon,
    MapIcon,
    SparklesIcon,
    ArrowDownTrayIcon,
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
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">Establishing secure link...</p>
    </div>
);

export default function Login() {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [activeTheme, setActiveTheme] = useState(themes[0]); // Default to Emerald Deep
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const success = await login(email, password);
            if (success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/'), 1200);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Login failed:", error);
            toast.error(error.message || "Failed to establish secure link");
            setIsSubmitting(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        try {
            const success = await loginWithGoogle();
            if (success) {
                setIsSuccess(true);
                setTimeout(() => navigate('/'), 1200);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error("Google login failed:", error);
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
                            statusText={isSuccess ? "Access Granted" : "Verifying Identity"} 
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
                className="max-w-[1000px] w-full bg-white rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden relative z-10 border border-slate-200/60 shadow-2xl shadow-slate-200/50 transition-all duration-500"
            >
                {/* Visual Side (Left) */}
                <div className="hidden md:flex w-1/2 bg-stone-950 relative flex-col justify-between p-12 overflow-hidden">
                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                <GlobeAltIcon className="w-6 h-6 text-stone-900" />
                            </div>
                            <span className="text-white font-black tracking-widest text-sm uppercase">AI Travel Planner</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-5xl font-black text-white leading-tight tracking-tighter"
                        >
                            Architect Your <br />
                            <span className="text-[#556B2F]">Next Journey.</span>
                        </motion.h2>
                    </div>

                    <div className="relative z-10">
                        <div className="space-y-4">
                            {[
                                { icon: MapIcon, text: "Day-wise AI Itineraries" },
                                { icon: SparklesIcon, text: "Smart Hotel Suggestions" },
                                { icon: ArrowDownTrayIcon, text: "PDF Itinerary Exports" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="flex items-center gap-4 text-olive-100/60"
                                >
                                    <item.icon className="w-5 h-5 text-[#556B2F]" />
                                    <span className="text-xs font-bold uppercase tracking-widest">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.2, 0.1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                        className="absolute -bottom-20 -right-20 w-80 h-80 border-[40px] border-white/5 rounded-full"
                    />
                </div>

                {/* Mobile Header */}
                <div className="md:hidden bg-stone-950 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GlobeAltIcon className="w-5 h-5 text-white" />
                        <span className="text-white font-black tracking-widest text-[10px] uppercase">AI Travel Planner</span>
                    </div>
                </div>

                {/* Form Side (Right) */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-8 md:p-10 bg-white relative">
                    <div className="mb-6 md:mb-8">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Sign In Access</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Direct Google Login - Priority Position */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={isSubmitting}
                            className="w-full py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 disabled:opacity-70 shadow-sm"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            One-Click Google Access
                        </button>

                        <div className="relative flex items-center gap-4">
                            <div className="flex-grow h-px bg-slate-100"></div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">or email auth</span>
                            <div className="flex-grow h-px bg-slate-100"></div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group/input">
                                <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-950/40 group-focus-within/input:text-stone-950 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                </div>
                                <div className="relative group/input">
                                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        autoComplete="current-password"
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-[#556B2F] transition-all font-bold text-sm"
                                        placeholder="••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:pointer-events-none"
                            >
                                Sign In Now
                                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </form>
                    </div>

                    <div className="mt-8 md:mt-auto pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest text-center">
                            New here?{' '}
                            <Link to="/register" className="text-slate-900 border-b border-slate-200 hover:border-[#556B2F] transition-all">
                                Create Account
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
            <div className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 items-center gap-8 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pointer-events-none">
                <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-olive-500 rounded-full animate-pulse" /> Always secure</div>
                <span className="opacity-40">|</span>
                <span>Fast & Reliable</span>
                <span className="opacity-40">|</span>
                <span>v3.0.0</span>
            </div>
        </div>
    );
}
