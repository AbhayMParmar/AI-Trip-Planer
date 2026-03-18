import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    HeartIcon,
    TrashIcon,
    MapPinIcon,
    SparklesIcon,
    MagnifyingGlassIcon,
    GlobeEuropeAfricaIcon,
    CalendarIcon,
    ClockIcon,
    BanknotesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.4 }
    }
};

export default function Favorites() {
    const { user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState('places');

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchFavorites(), fetchSavedTrips()]);
        setLoading(false);
    };

    const fetchSavedTrips = async () => {
        try {
            const q = query(collection(db, 'trips'), where('userId', '==', user.uid), where('isFavorite', '==', true));
            const querySnapshot = await getDocs(q);
            setTrips(querySnapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error(error);
        }
    };

    const fetchFavorites = async () => {
        try {
            const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            setFavorites(querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data()
            })));
        } catch (error) {
            console.error(error);
            toast.error('Failed to load bookmarks');
        }
    };

    const removeFavorite = async (docId) => {
        try {
            await deleteDoc(doc(db, 'favorites', docId));
            setFavorites(favorites.filter(f => f.docId !== docId));
            toast.success('Removed from bookmarks');
        } catch (error) {
            toast.error('Failed to remove');
        }
    };

    const filteredFavorites = favorites.filter(f =>
        f.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTrips = trips.filter(t => 
        (typeof t.destination === 'string' ? t.destination : t.destination?.city)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-8 md:pt-12 pb-20 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Your Vault</h1>
                        <p className="text-gray-500 text-xl font-medium">Curated collection of your finest travel moments.</p>
                    </motion.div>

                    <div className="flex flex-col gap-4 w-full md:w-auto">
                        <div className="flex bg-white p-1.5 rounded-[1.25rem] border border-gray-100 shadow-sm w-full md:w-auto">
                            <button 
                                onClick={() => setActiveType('places')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'places' ? 'bg-[#556B2F] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                Discoveries
                            </button>
                            <button 
                                onClick={() => setActiveType('trips')}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeType === 'trips' ? 'bg-[#556B2F] text-white shadow-lg' : 'text-gray-400 hover:text-gray-900'}`}
                            >
                                Adventure Logs
                            </button>
                        </div>
                        <div className="relative group">
                            <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#556B2F] transition-colors" />
                            <input
                                type="text"
                                placeholder={activeType === 'places' ? "Find a place..." : "Find a trip..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-[#556B2F] transition-all outline-none shadow-sm font-semibold"
                            />
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeType === 'places' ? (
                        <motion.div
                            key="places"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {filteredFavorites.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-sm">
                                    <HeartIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No bookmarks yet</h2>
                                    <p className="text-gray-500 mb-8">Items you save while planning will appear here.</p>
                                    <Link to="/planner" className="px-10 py-4 bg-[#556B2F] text-white font-bold rounded-xl hover:bg-[#6B732A] transition-all inline-block shadow-lg shadow-olive-100">
                                        Start Planning
                                    </Link>
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {filteredFavorites.map((item, idx) => (
                                        <motion.div
                                            key={item.docId || idx}
                                            variants={itemVariants}
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-olive-100/50 transition-all relative group overflow-hidden flex flex-col h-full"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.isMeal ? 'bg-olive-50 text-olive-600' : 'bg-blue-50 text-blue-600'}`}>
                                                    {item.isMeal ? 'Food & Drink' : 'Activity'}
                                                </div>
                                                <button
                                                    onClick={() => removeFavorite(item.docId)}
                                                    className="p-2.5 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="space-y-3 mb-8">
                                                <h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-[#556B2F] transition-colors">
                                                    {item.title || item.name}
                                                </h3>
                                                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">
                                                    {item.description || item.cuisine || 'No description available.'}
                                                </p>
                                            </div>

                                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <MapPinIcon className="w-4 h-4 text-[#556B2F]" />
                                                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[120px]">{item.location || 'Local Spot'}</span>
                                                </div>
                                                <div className="text-xl font-bold text-gray-900">₹{item.cost || 0}</div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="trips"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {filteredTrips.length === 0 ? (
                                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-gray-100 shadow-sm">
                                    <SparklesIcon className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No saved plans</h2>
                                    <p className="text-gray-500 mb-8">Trips you mark with a heart will be stored in your logs.</p>
                                    <Link to="/planner" className="px-10 py-4 bg-[#556B2F] text-white font-bold rounded-xl hover:bg-[#6B732A] transition-all inline-block shadow-lg shadow-olive-100">
                                        Create New Plan
                                    </Link>
                                </div>
                            ) : (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                                >
                                    {filteredTrips.map((trip) => (
                                        <motion.div
                                            key={trip._id}
                                            variants={itemVariants}
                                            whileHover={{ y: -5 }}
                                            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all group"
                                        >
                                            <div className="p-8">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-2 text-[#556B2F] text-[9px] font-black uppercase tracking-widest">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#556B2F]" />
                                                        {trip.query?.transport || 'Road Trip'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        {new Date(trip.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>

                                                <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter capitalize group-hover:text-[#556B2F] transition-colors">
                                                    {typeof trip.destination === 'string' ? trip.destination.split(',')[0] : trip.destination?.city}
                                                </h3>
                                                
                                                <div className="grid grid-cols-2 gap-3 mb-8 mt-6">
                                                    <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Duration</span>
                                                        <span className="text-lg font-black text-gray-900">{trip.days?.length || 0} Days</span>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-1">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Budget</span>
                                                        <span className="text-lg font-black text-gray-900 truncate">₹{String(trip.totalEstimatedCost || 0).split('.')[0]}</span>
                                                    </div>
                                                </div>

                                                <Link 
                                                    to={`/trip/${trip._id}`}
                                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-3 hover:bg-[#556B2F] transition-all"
                                                >
                                                    View Full Plan <ArrowRightIcon className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
