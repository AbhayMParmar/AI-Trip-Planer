import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
    GlobeAltIcon,
    ArrowPathIcon,
    PlusIcon,
    TruckIcon,
    UserIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    ChevronRightIcon,
    BookmarkIcon
} from '@heroicons/react/24/outline';

const NavLink = ({ to, icon: Icon, label, isActive }) => (
    <Link to={to} className="relative px-2 py-1.5 group">
        <motion.div
            whileHover={{ y: -1 }}
            className={`relative z-10 flex items-center gap-2.5 px-4 py-1.5 rounded-xl transition-all duration-500 ${isActive
                ? 'text-[#556B2F]'
                : 'text-slate-400 group-hover:text-slate-900'
                }`}
        >
            <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
                <Icon className={`w-4.5 h-4.5 transition-colors duration-500 ${isActive ? 'stroke-[2.5px] text-[#556B2F]' : 'stroke-2'}`} />
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block transition-all duration-500 group-hover:tracking-[0.3em]">
                {label}
            </span>
        </motion.div>
        
        {isActive && (
            <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-white shadow-[0_12px_24px_-8px_rgba(85,107,47,0.25)] rounded-2xl z-0 border border-[#556B2F]/15 ring-2 ring-white/50"
                transition={{ type: "spring", bounce: 0.35, duration: 0.8 }}
            >
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#556B2F]"
                />
            </motion.div>
        )}

        {!isActive && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileHover={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-[#556B2F]/5 rounded-2xl z-0 border border-transparent group-hover:border-[#556B2F]/20 transition-all duration-300"
            />
        )}
    </Link>
);

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Explore', path: '/', icon: GlobeAltIcon },
        { name: 'Planner', path: '/planner', icon: PlusIcon },
        { name: 'History', path: '/history', icon: ClockIcon },
        { name: 'Saved', path: '/favorites', icon: BookmarkIcon },
        { name: 'Chat', path: '/chat', icon: ChatBubbleLeftRightIcon }
    ];

    return (
        <>
            {/* --- TOP BRAND BAR (MOBILE & DESKTOP) --- */}
            <header className={`fixed top-0 inset-x-0 z-[2000] transition-all duration-500 px-3 md:px-6 py-1 md:py-1.5`}>
                <nav className={`max-w-7xl mx-auto flex items-center justify-between px-4 md:px-5 py-1 md:py-1.5 rounded-[1.8rem] md:rounded-[2.5rem] border transition-all duration-700 ${scrolled
                    ? 'bg-white/80 backdrop-blur-3xl border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1)] ring-1 ring-white/20'
                    : 'bg-white/40 backdrop-blur-3xl border-white/30 shadow-sm'
                }`}>
                    {/* Brand Logo */}
                    <Link to="/" className="flex items-center gap-2 md:gap-3 group outline-none relative">
                        <div className="relative w-9 h-9 md:w-11 md:h-11 overflow-visible">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-1.5 md:-inset-2 border-t-2 border-[#556B2F]/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.15, 1],
                                    rotate: [0, 90, 180, 270, 360]
                                }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-tr from-[#556B2F] to-olive-200 rounded-[1rem] md:rounded-[1.2rem] opacity-30 blur-md group-hover:opacity-60 transition-all duration-700"
                            />
                            <div className="absolute inset-0 bg-slate-900 rounded-[1rem] md:rounded-[1.2rem] flex items-center justify-center shadow-2xl group-hover:-translate-y-1 group-hover:shadow-[#556B2F]/20 transition-all duration-500 overflow-hidden">
                                <motion.div 
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-[#556B2F] shadow-[0_0_20px_#556B2F]"
                                />
                                <motion.div 
                                    animate={{ x: [-100, 100] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col relative overflow-hidden">
                            <span className="text-lg md:text-2xl font-[1000] text-slate-900 tracking-tighter leading-none mb-0.5 relative">
                                Trip<span className="text-[#556B2F] italic ml-0.5 group-hover:text-olive-600 transition-colors">Nova</span>
                            </span>
                            <span className="text-[6px] md:text-[7px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-400 hidden sm:block">
                                Neural Arch
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-0.5 bg-slate-900/5 p-1 rounded-2xl border border-slate-200/40 backdrop-blur-md">
                        {navItems.map((item) => {
                            const isActive = item.path.includes('?') 
                                ? (location.pathname + location.search) === item.path
                                : location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    icon={item.icon}
                                    label={item.name}
                                    isActive={isActive}
                                />
                            );
                        })}
                    </div>

                    {/* Profile & Mobile Menu Trigger */}
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="hidden sm:flex items-center gap-2 md:gap-3">
                            {isAuthenticated ? (
                                <Link to="/profile">
                                    <motion.div
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-[1.2rem] bg-[#556B2F] border-2 border-[#556B2F]/20 text-white font-black text-[12px] md:text-sm shadow-xl shadow-[#556B2F]/20 transition-all duration-500"
                                    >
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </motion.div>
                                </Link>
                            ) : (
                                <div className="flex items-center gap-1 md:gap-2 p-1 bg-slate-100/30 rounded-xl md:rounded-2xl border border-slate-200/40 shadow-inner">
                                    <Link to="/login" className="px-3 md:px-5 py-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">Sign In</Link>
                                    <Link to="/register" className="px-4 md:px-6 py-2 bg-slate-900 text-white rounded-lg md:rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-[#556B2F] hover:scale-105 transition-all">Join</Link>
                                </div>
                            )}
                        </div>
                        
                        {/* Mobile Menu Toggle / Auth Button */}
                        <div className="md:hidden">
                            {isAuthenticated ? (
                                <button
                                    className="p-2.5 text-slate-900 bg-white/80 border border-slate-100 rounded-2xl shadow-sm active:scale-95 transition-all"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                                </button>
                            ) : (
                                <Link 
                                    to="/login"
                                    className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Redesigned Mobile Sidebar/Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[1500] md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[400px] bg-white z-[1600] md:hidden shadow-[-20px_0_60px_-15px_rgba(85,107,47,0.1)] flex flex-col p-6 overflow-hidden"
                        >
                            <div className="flex justify-end mb-6">
                                <button 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-3 bg-slate-50 rounded-2xl active:scale-95 transition-all border border-slate-100 shadow-sm"
                                >
                                    <XMarkIcon className="w-6 h-6 text-slate-900" />
                                </button>
                            </div>

                            {/* User Profile in Menu */}
                            {isAuthenticated && (
                                <Link 
                                    to="/profile" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 mb-8"
                                >
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white">
                                        {user?.name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Traveler</div>
                                        <div className="text-base font-black text-slate-900 truncate">{user?.name || 'Explorer'}</div>
                                    </div>
                                    <ChevronRightIcon className="w-5 h-5 text-slate-300 ml-auto" />
                                </Link>
                            )}

                            {/* Nav Links */}
                            <div className="flex flex-col gap-3">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${isActive 
                                                ? 'bg-[#556B2F]/10 border border-[#556B2F]/20 text-slate-900' 
                                                : 'hover:bg-slate-50 text-slate-500'}`}
                                        >
                                            <item.icon className={`w-6 h-6 ${isActive ? 'text-[#556B2F]' : ''}`} />
                                            <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>
                                            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#556B2F]" />}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-auto pt-10">
                                {!isAuthenticated ? (
                                    <div className="flex flex-col gap-4">
                                        <Link 
                                            to="/login" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full p-4 text-center rounded-2xl font-bold uppercase tracking-widest text-slate-500 bg-slate-50"
                                        >
                                            Sign In
                                        </Link>
                                        <Link 
                                            to="/register" 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="w-full p-4 text-center rounded-2xl font-bold uppercase tracking-widest text-white bg-slate-900 shadow-xl"
                                        >
                                            Create Account
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.8rem] bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        Logout Session
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
