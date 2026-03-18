import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    TrashIcon,
    MapPinIcon,
    CalendarIcon,
    SparklesIcon,
    PlusIcon,
    ArrowRightIcon,
    ClockIcon,
    MagnifyingGlassIcon,
    PrinterIcon,
    BanknotesIcon,
    GlobeAltIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Footer from '../components/Footer';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function TripHistory() {
    const [searchTerm, setSearchTerm] = useState('');
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchTrips();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchTrips = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'trips'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const tripsData = querySnapshot.docs.map(doc => ({
                _id: doc.id,
                ...doc.data()
            }));
            setTrips(tripsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your history');
        } finally {
            setLoading(false);
        }
    };

    const deleteTrip = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this expedition record?')) {
            try {
                await deleteDoc(doc(db, 'trips', id));
                setTrips(prev => prev.filter(t => t._id !== id));
                toast.success('Record deleted');
            } catch (error) {
                toast.error('Failed to delete record');
            }
        }
    };

    const toggleFavorite = async (id, currentStatus, e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await updateDoc(doc(db, 'trips', id), {
                isFavorite: !currentStatus
            });
            setTrips(prev => prev.map(t => t._id === id ? { ...t, isFavorite: !currentStatus } : t));
            toast.success(!currentStatus ? 'Added to Vault' : 'Removed from Vault');
        } catch (error) {
            console.error(error);
            toast.error('Sync failed');
        }
    };

    const filteredTrips = Array.isArray(trips) ? trips.filter(trip => {
        if (!trip) return false;
        
        const search = (searchTerm || '').toLowerCase();
        const city = typeof trip.destination === 'string' 
            ? trip.destination 
            : (trip.destination?.city || trip.destination?.name || '');
            
        const country = trip.destination?.country || '';
        const transport = trip.query?.transport || trip.transport || '';
        
        return (
            (city.toLowerCase().includes(search)) ||
            (country.toLowerCase().includes(search)) ||
            (transport.toLowerCase().includes(search))
        );
    }) : [];

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-[#FBFCFE] pt-8 md:pt-12 pb-20 px-4 sm:px-6 relative overflow-hidden">
                {/* Clean Background */}
                <div className="fixed inset-0 pointer-events-none bg-[#FBFCFE]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <header className="mb-12 md:mb-16">
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <h1 className="text-3xl md:text-6xl font-[1000] text-slate-900 tracking-tighter leading-none cursor-default">
                                        Expedition History
                                    </h1>
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="px-4 py-2 bg-slate-900 text-white rounded-2xl flex items-center gap-2.5 shadow-xl shadow-slate-200"
                                    >
                                        <SparklesIcon className="w-4 h-4 text-[#556B2F]" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                                            {trips.length} Records Found
                                        </span>
                                    </motion.div>
                                </div>
                                <p className="text-slate-400 font-bold text-[9px] md:text-lg uppercase tracking-widest max-w-xl leading-relaxed">
                                    Mission Logs: A comprehensive archive of your past search queries and routes.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Link 
                                    to="/planner" 
                                    className="px-5 md:px-6 py-3.5 md:py-4 bg-slate-900 text-white font-[1000] text-[9px] md:text-[10px] uppercase tracking-[0.3em] rounded-xl md:rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-105 transition-all flex items-center gap-2 md:gap-3"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    <span className="hidden xs:inline">New Search</span>
                                </Link>
                            </div>
                        </motion.div>
                    </header>

                    <div className="mb-16"></div>

                    {filteredTrips.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/60 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 text-center border border-slate-200/50 shadow-sm overflow-hidden relative"
                        >
                            <motion.div 
                                animate={{ 
                                    rotate: [0, -10, 10, 0], 
                                    scale: [1, 0.9, 1.1, 1] 
                                }}
                                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                                className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-slate-100/40 rounded-full blur-[140px]" 
                            />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                                <GlobeAltIcon className="w-64 h-64" />
                            </div>
                            <CalendarIcon className="w-20 h-20 text-slate-100 mx-auto mb-8" />
                            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter uppercase">
                                No History Found
                            </h2>
                            <p className="text-slate-400 font-bold mb-10 max-w-md mx-auto leading-relaxed">
                                Your mission archive is currently empty. Ready to initiate a new search sequence?
                            </p>
                            <Link to="/planner" className="px-12 py-5 bg-slate-900 text-white font-[1000] text-xs uppercase tracking-[0.3em] rounded-2xl shadow-2xl hover:bg-slate-800 transition-all inline-flex items-center gap-4">
                                Launch Expedition <ArrowRightIcon className="w-5 h-5" />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                        >
                            {filteredTrips.map((trip) => (
                                <motion.div key={trip._id} variants={cardVariants} className="group">
                                    <div
                                        className="block h-full bg-white rounded-[2.5rem] overflow-hidden border-2 border-slate-200 hover:border-[#556B2F] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 relative group-hover:-translate-y-2"
                                    >
                                        <div className="p-6 md:p-10 flex flex-col h-full">
                                            <div className="flex justify-between items-start mb-5 md:mb-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[#556B2F] text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
                                                        <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#556B2F] animate-pulse" />
                                                        {trip.query?.transport || 'Mission Active'}
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-[#556B2F] transition-colors line-clamp-1">
                                                        {typeof trip.destination === 'string' ? trip.destination.split(',')[0] : (trip.destination?.city || 'Unknown')}
                                                    </h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[150px]">
                                                        {trip.destination?.country || 'Global Expedition'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => toggleFavorite(trip._id, trip.isFavorite, e)}
                                                        className={`p-3 rounded-2xl transition-all duration-500 shadow-sm ${
                                                            trip.isFavorite 
                                                                ? 'bg-red-50 text-red-500 border border-red-100' 
                                                                : 'bg-slate-50 text-slate-300 hover:text-red-400 hover:bg-red-50 border border-transparent'
                                                        }`}
                                                    >
                                                        {trip.isFavorite ? (
                                                            <HeartIconSolid className="w-5 h-5 animate-heart-pop" />
                                                        ) : (
                                                            <HeartIcon className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={(e) => deleteTrip(trip._id, e)}
                                                        className="p-3 rounded-2xl bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all group/delete"
                                                    >
                                                        <TrashIcon className="w-5 h-5 group-hover/delete:scale-110 transition-transform" />
                                                    </button>
                                                </div>
                                                <style dangerouslySetInnerHTML={{ __html: `
                                                    @keyframes heart-pop {
                                                        0% { transform: scale(1); }
                                                        50% { transform: scale(1.3); }
                                                        100% { transform: scale(1); }
                                                    }
                                                    .animate-heart-pop { animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                                                `}} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-8">
                                                <div className="p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 flex flex-col gap-1.5 group-hover:bg-white transition-all duration-500">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Days</span>
                                                    <span className="text-xl font-black text-slate-900 leading-none">{trip.days?.length || trip.duration || 0}</span>
                                                </div>
                                                <div className="p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 flex flex-col gap-1.5 group-hover:bg-white transition-all duration-500">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none">Budget</span>
                                                    <span className="text-xl font-black text-slate-900 leading-none truncate">₹{String(trip.totalEstimatedCost || trip.budget?.total || 0).split('.')[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                                                </div>
                                            </div>

                                            <div className="mt-auto space-y-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {trip.interests?.slice(0, 2).map(interest => (
                                                        <span key={interest} className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[8px] font-black rounded-lg uppercase tracking-widest border border-slate-200">
                                                            {interest}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    <Link 
                                                        to={`/trip/${trip._id}`}
                                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-[1000] text-[10px] uppercase tracking-[0.2em] text-center hover:bg-slate-800 hover:shadow-xl shadow-slate-200 transition-all duration-500 flex items-center justify-center gap-3 group/view"
                                                    >
                                                        View Execution Details
                                                        <ArrowRightIcon className="w-4 h-4 group-hover/view:translate-x-1 transition-transform" />
                                                    </Link>
                                                    
                                                    <div className="flex items-center justify-between px-2">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <ClockIcon className="w-3.5 h-3.5 opacity-40" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">
                                                                {new Date(trip.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
