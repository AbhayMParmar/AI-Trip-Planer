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
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const favs = querySnapshot.docs.map(doc => ({
                docId: doc.id,
                ...doc.data()
            }));
            setFavorites(favs);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your bookmarks');
        } finally {
            setLoading(false);
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

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Your Bookmarks</h1>
                        <p className="text-gray-500 text-xl font-medium">All your favorite places and meals in one place.</p>
                    </motion.div>

                    <div className="relative w-full md:max-w-md group">
                        <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#556B2F] transition-colors" />
                        <input
                            type="text"
                            placeholder="Find a saved place..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-200 focus:border-[#556B2F] transition-all outline-none shadow-sm font-semibold"
                        />
                    </div>
                </header>

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
                                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-olive-100/50 transition-all relative group overflow-hidden"
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
                                        <span className="text-xs font-bold uppercase tracking-wider">{item.location || 'Local Spot'}</span>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">${item.cost || 0}</div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
