import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc, addDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    MapPinIcon,
    CalendarIcon,
    BanknotesIcon,
    SparklesIcon,
    PrinterIcon,
    BookmarkIcon,
    ClockIcon,
    ChevronLeftIcon,
    StarIcon,
    InformationCircleIcon,
    CurrencyDollarIcon,
    HomeIcon,
    ArrowDownTrayIcon,
    FaceSmileIcon,
    PaperAirplaneIcon,
    TruckIcon,
    XMarkIcon,
    BuildingLibraryIcon,
    ShoppingBagIcon,
    CloudIcon,
    SunIcon,
    GlobeAltIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const TabButton = ({ active, onClick, label, icon: Icon }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 overflow-hidden group ${active
            ? 'text-white'
            : 'text-slate-400 hover:text-slate-900 border border-transparent'
            }`}
    >
        {active && (
            <motion.div 
                layoutId="active-tab-bg"
                className="absolute inset-0 bg-slate-900 shadow-xl shadow-slate-200"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
        <div className="relative z-10 flex items-center gap-2">
            {Icon && <Icon className={`w-4 h-4 transition-transform duration-500 ${active ? 'text-[#556B2F]' : 'group-hover:scale-110'}`} />}
            {label}
        </div>
    </button>
);

export default function TripDetails() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [trip, setTrip] = useState(location.state?.tripData || null);
    const [loading, setLoading] = useState(!location.state?.tripData);
    const [activeTab, setActiveTab] = useState('plan');
    const [favorites, setFavorites] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [saving, setSaving] = useState(false);

    const formatINR = (val) => {
        if (val === undefined || val === null) return '0';
        const clean = String(val).replace(/[₹,\s]/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? clean : num.toLocaleString('en-IN');
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!trip) {
            if (id && id.startsWith('guest-')) {
                setLoading(false);
            } else if (id !== 'new') {
                fetchTrip();
            }
        } else if (trip && !trip.weather?.liveUpdated) {
             // If we have trip data but want to ensure weather is current
             fetchLiveWeather(typeof trip.destination === 'string' ? trip.destination : trip.destination?.city);
        }
    }, [id, trip]);

    useEffect(() => {
        if (user) {
            fetchFavorites();
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'guide' && trip && !trip.destinationInfo?.reviews) {
            fetchCityGuide(typeof trip.destination === 'string' ? trip.destination : trip.destination?.city);
        }
    }, [activeTab, trip]);

    const fetchFavorites = async () => {
        try {
            const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            setFavorites(querySnapshot.docs.map(doc => doc.data().id));
        } catch (e) {
            console.error(e);
        }
    };

    const toggleFavorite = async (itemId) => {
        try {
            if (favorites.includes(itemId)) {
                // Remove from Firestore
                const q = query(collection(db, 'favorites'), where('userId', '==', user.uid), where('id', '==', itemId));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(async (d) => {
                    await deleteDoc(doc(db, 'favorites', d.id));
                });
                setFavorites(prev => prev.filter(id => id !== itemId));
                toast.success('Removed from collection');
            } else {
                // Find details
                let details = null;
                if (itemId.includes('-a')) {
                    const [d, a] = itemId.match(/\d+/g);
                    details = { ...trip.days[d - 1].activities[a], id: itemId, day: d };
                } else if (itemId.includes('-m-')) {
                    const [d] = itemId.match(/\d+/g);
                    const type = itemId.split('-m-')[1];
                    details = { ...trip.days[d - 1].meals[type], id: itemId, day: d, isMeal: true, title: trip.days[d - 1].meals[type].name };
                }

                if (details) {
                    await addDoc(collection(db, 'favorites'), {
                        ...details,
                        userId: user.uid,
                        createdAt: new Date().toISOString()
                    });
                    setFavorites(prev => [...prev, itemId]);
                    toast.success('Added to collection');
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('Sync failed');
        }
    };

    const fetchTrip = async () => {
        try {
            const docRef = doc(db, 'trips', id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = { _id: docSnap.id, ...docSnap.data() };
                setTrip(data);
                // Fetch live weather update
                fetchLiveWeather(typeof data.destination === 'string' ? data.destination : data.destination?.city);
            } else {
                toast.error('Mission parameters not found');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load mission parameters');
        } finally {
            setLoading(false);
        }
    };

    const fetchLiveWeather = async (city) => {
        try {
            const response = await fetch(`/api/recommendations/weather?city=${city}`);
            if (response.ok) {
                const weatherData = await response.json();
                setTrip(prev => ({ ...prev, weather: weatherData }));
            }
        } catch (error) {
            console.warn('Live weather update failed:', error.message);
        }
    };

    const fetchCityGuide = async (city) => {
        try {
            const response = await fetch(`/api/recommendations/city-guide?city=${city}`);
            if (response.ok) {
                const guideData = await response.json();
                setTrip(prev => ({ ...prev, destinationInfo: guideData }));
            }
        } catch (error) {
            console.warn('City guide update failed:', error.message);
        }
    };

    const toggleSaveTrip = async () => {
        if (!user) {
            toast.error('Please login to save your plan');
            navigate('/login', { state: { from: location.pathname, tripData: trip } });
            return;
        }

        setSaving(true);
        try {
            if (id === 'new' || id?.startsWith('guest-')) {
                // Initial Save
                const docRef = await addDoc(collection(db, 'trips'), {
                    ...trip,
                    userId: user.uid,
                    isFavorite: true,
                    createdAt: new Date().toISOString()
                });
                toast.success('Travel Plan Saved to Favorites');
                navigate(`/trip/${docRef.id}`, { replace: true });
            } else {
                // Toggle Favorite Status
                const newFavoriteStatus = !trip.isFavorite;
                await updateDoc(doc(db, 'trips', id), {
                    isFavorite: newFavoriteStatus
                });
                setTrip(prev => ({ ...prev, isFavorite: newFavoriteStatus }));
                toast.success(newFavoriteStatus ? 'Added to Favorites' : 'Removed from Favorites');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update plan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-12 h-12 border-4 border-[#556B2F] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <FaceSmileIcon className="w-20 h-20 text-[#556B2F] mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Plan not found</h2>
            <Link to="/planner" className="bg-[#556B2F] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#6B732A] transition-all">
                Go to Planner
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#FDFCFB] pb-4">
            {/* Header / Hero */}
            <div className="bg-white pt-2 md:pt-4 pb-6 px-4 md:px-6 relative overflow-hidden">
                {/* Advanced Background Design */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#556B2F]/15 rounded-full blur-[180px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50/60 rounded-full blur-[140px]"></div>
                    <div className="absolute inset-0 opacity-[0.05]" 
                         style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] md:rounded-[3.5rem] border border-white/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] p-5 md:p-8 relative group overflow-hidden transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_48px_140px_-20px_rgba(245,185,153,0.12)] hover:border-[#556B2F]/20"
                    >
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-3">
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-[0.4em] shadow-2xl"
                                        >
                                            <SparklesIcon className="w-3 h-3 text-[#556B2F] animate-pulse" />
                                            {trip.days?.length || 0} Day Travel Plan
                                        </motion.div>
 
                                         <div className="space-y-2">
                                             <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-[0.2em] text-[9px] md:text-xs">
                                                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                                                     <MapPinIcon className="w-3.5 h-3.5 text-slate-400" />
                                                     {trip.query?.source || 'Surat'}
                                                 </div>
                                                 <span className="text-[#556B2F] text-xl font-black px-1 opacity-60">/</span>
                                                 <div className="flex items-center gap-1.5 px-2.5 py-1 bg-olive-50/50 rounded-lg border border-olive-100/50 text-[#556B2F]">
                                                     <GlobeAltIcon className="w-3.5 h-3.5" />
                                                     {typeof trip.destination === 'string' ? trip.destination : trip.destination?.city}
                                                 </div>
                                             </div>
                                             <h1 className="text-5xl md:text-8xl font-[1000] text-slate-900 tracking-tighter leading-[0.85] capitalize">
                                                 {typeof trip.destination === 'string' ? (trip.destination.split(',')[0]) : trip.destination?.city}
                                             </h1>
                                         </div>
                                     </div>
                                 </div>

                                {/* Action Dock - Now Horizontal */}
                                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 lg:flex-none py-3 px-6 bg-[#0D2D2D] text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2.5 group/btn"
                                    >
                                        <PrinterIcon className="w-4 h-4 text-[#556B2F] group-hover/btn:rotate-12 transition-transform" />
                                        Export
                                    </button>

                                    <button
                                        onClick={() => setActiveTab('transport')}
                                        className="flex-1 lg:flex-none py-3 px-6 bg-white border border-gray-100 text-[#0D2D2D] rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2.5 group/btn"
                                    >
                                        <PaperAirplaneIcon className="w-4 h-4 text-[#556B2F] rotate-45" />
                                        Logistics
                                    </button>
                                     {/* Premium Heart Type Button for Saving Trip */}
                                    <motion.button
                                        onClick={toggleSaveTrip}
                                        disabled={saving}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`px-5 py-3 rounded-[1.2rem] flex items-center justify-center gap-2.5 transition-all duration-500 shadow-xl ${
                                            trip?.isFavorite 
                                                ? 'bg-red-50 text-red-500 border border-red-100 shadow-red-100 flex-1 lg:flex-none' 
                                                : 'bg-[#556B2F] text-white border border-[#556B2F] hover:bg-black hover:border-black shadow-slate-100 flex-1 lg:flex-none'
                                        }`}
                                        title={trip?.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                    >
                                        {trip?.isFavorite ? (
                                            <HeartIconSolid className="w-5 h-5 animate-heart-pop" />
                                        ) : (
                                            <HeartIcon className={`w-5 h-5 ${saving ? 'animate-pulse' : ''}`} />
                                        )}
                                        <span className="text-[10px] font-black uppercase tracking-widest">
                                            {trip?.isFavorite ? 'In Vault' : 'Save Plan'}
                                        </span>
                                        <style dangerouslySetInnerHTML={{ __html: `
                                            @keyframes heart-pop {
                                                0% { transform: scale(1); }
                                                50% { transform: scale(1.3); }
                                                100% { transform: scale(1); }
                                            }
                                            .animate-heart-pop { animation: heart-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                                        `}} />
                                    </motion.button>

                                </div>
                            </div>

                            {/* Advanced Stats Grid - Compact */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white/80 p-4 rounded-[1.5rem] border border-gray-100/50 flex items-center gap-4 hover:border-[#556B2F]/20 transition-all group/card">
                                    <div className="w-10 h-10 rounded-xl bg-[#556B2F]/10 text-[#556B2F] flex items-center justify-center shrink-0 group-hover/card:bg-[#556B2F] group-hover/card:text-white transition-all">
                                        <BanknotesIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0D2D2D]/30">
                                            {trip.budgetLevel || 'Budget Estimate'}
                                        </p>
                                        <p className="text-lg font-black text-[#0D2D2D]">₹{formatINR(trip.totalEstimatedCost)}</p>
                                    </div>
                                </div>

                                <div className="bg-white/80 p-4 rounded-[1.5rem] border border-gray-100/50 flex items-center gap-4 hover:border-blue-200 transition-all group/card">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover/card:bg-blue-500 group-hover/card:text-white transition-all">
                                        <TruckIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0D2D2D]/30">Travel</p>
                                        <p className="text-lg font-black text-[#0D2D2D] uppercase">{trip.query?.transport || 'train'}</p>
                                    </div>
                                </div>

                                <div className="bg-white/80 p-4 rounded-[1.5rem] border border-gray-100/50 flex items-center gap-4 hover:border-olive-200 transition-all group/card">
                                    <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-400 flex items-center justify-center shrink-0 group-hover/card:bg-olive-400 group-hover/card:text-white transition-all">
                                        <CloudIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#0D2D2D]/30">Weather: {typeof trip.destination === 'string' ? trip.destination : trip.destination?.city}</p>
                                        <p className="text-lg font-black text-[#0D2D2D]">{trip.weather?.temp || 28}°C {trip.weather?.condition || 'Clear'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs - Docked Segmented Control */}
                    <div className="mt-8 flex justify-center">
                        <div className="inline-flex items-center p-2 bg-slate-50/50 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] shadow-inner overflow-x-auto no-scrollbar max-w-full">
                            <TabButton
                                active={activeTab === 'guide'}
                                onClick={() => setActiveTab('guide')}
                                label="Guide"
                                icon={BuildingLibraryIcon}
                            />
                            <TabButton
                                active={activeTab === 'plan'}
                                onClick={() => setActiveTab('plan')}
                                label="Itinerary"
                                icon={CalendarIcon}
                            />
                            <TabButton
                                active={activeTab === 'transport'}
                                onClick={() => setActiveTab('transport')}
                                label="Logistics"
                                icon={PaperAirplaneIcon}
                            />
                            <TabButton
                                active={activeTab === 'hotels'}
                                onClick={() => setActiveTab('hotels')}
                                label="Stays"
                                icon={HomeIcon}
                            />
                            <TabButton
                                active={activeTab === 'food'}
                                onClick={() => setActiveTab('food')}
                                label="Dining"
                                icon={SparklesIcon}
                            />
                            <TabButton
                                active={activeTab === 'budget'}
                                onClick={() => setActiveTab('budget')}
                                label="Expenses"
                                icon={BanknotesIcon}
                            />
                            <TabButton
                                active={activeTab === 'favorites'}
                                onClick={() => setActiveTab('favorites')}
                                label="Vault"
                                icon={StarIcon}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:mt-16 relative z-10">
                {/* Content Area */}
                <div className="max-w-7xl mx-auto px-0 md:px-6 py-8 md:py-12">
                    <AnimatePresence mode="wait">
                        {activeTab === 'guide' && (
                            <motion.div
                                key="guide"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-16"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
                                    <div className="space-y-6 md:space-y-8">
                                        <div className="p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-olive-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-olive-100 transition-colors"></div>
                                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                                <StarIcon className="w-6 h-6 md:w-8 md:h-8 text-[#556B2F]" />
                                                Famous Places
                                            </h3>
                                            <div className="grid gap-3 md:gap-4">
                                                {(trip.destinationInfo?.famousPlaces || ['Landmark 1', 'Landmark 2', 'Landmark 3']).map((place, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-lg transition-all">
                                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white text-[#556B2F] flex items-center justify-center font-black shadow-sm text-sm md:text-base">{idx + 1}</div>
                                                        <span className="font-bold text-gray-700 text-sm md:text-base">{place}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
                                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                                                <ClockIcon className="w-6 h-6 md:w-8 md:h-8 text-[#556B2F]" />
                                                Best Time
                                            </h3>
                                            <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed">
                                                {trip.destinationInfo?.bestTime || 'Peak season usually falls between October and March when the weather is most pleasant for exploration.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-6 md:space-y-8">
                                        <div className="p-6 md:p-10 bg-gray-900 rounded-[2rem] md:rounded-[3rem] text-white space-y-4 md:space-y-6 relative overflow-hidden">
                                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#556B2F]/10 rounded-full blur-3xl -mb-32 -mr-32"></div>
                                            <h3 className="text-2xl md:text-3xl font-black flex items-center gap-3">
                                                <SparklesIcon className="w-6 h-6 md:w-8 md:h-8 text-[#556B2F]" />
                                                Vibe
                                            </h3>
                                            <p className="text-base md:text-lg text-gray-300 font-medium leading-relaxed italic">
                                                "{trip.destinationInfo?.vibe || 'A vibrant tapestry of history and modernity, blending traditional hospitality with a fast-paced urban energy.'}"
                                            </p>
                                        </div>

                                        <div className="p-6 md:p-10 bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-sm space-y-4 md:space-y-6">
                                            <h3 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                                                <InformationCircleIcon className="w-6 h-6 md:w-8 md:h-8 text-[#556B2F]" />
                                                Travel Tip
                                            </h3>
                                            <div className="space-y-3 md:space-y-4">
                                                {trip.travelTips?.slice(0, 2).map((tip, idx) => (
                                                    <div key={idx} className="flex gap-3 md:gap-4">
                                                        <div className="w-2 h-2 rounded-full bg-[#556B2F] mt-2 md:mt-2.5 shrink-0"></div>
                                                        <p className="text-gray-500 font-medium text-sm md:text-base">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {trip.destinationInfo?.reviews?.length > 0 && (
                                    <div className="pt-16 pb-8 border-t border-gray-100">
                                        <h3 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
                                            <FaceSmileIcon className="w-8 h-8 text-[#556B2F]" />
                                            Real Traveler Insights
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trip.destinationInfo.reviews.map((rev, rIdx) => (
                                                <div key={rIdx} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col gap-4 group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                            {rev.author_photo ? <img src={rev.author_photo} alt={rev.author_name} className="w-full h-full object-cover" /> : <FaceSmileIcon className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 text-sm">{rev.author_name}</div>
                                                            <div className="flex items-center gap-0.5 mt-0.5">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <StarIcon key={i} className={`w-3 h-3 ${i < Math.floor(rev.rating) ? 'text-olive-400 fill-current' : 'text-gray-200'}`} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-500 text-sm leading-relaxed italic line-clamp-4">"{rev.text || rev.review_text}"</p>
                                                    <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                        <span>{rev.relative_time_description || 'Recent'}</span>
                                                        <span className="text-[#556B2F]">Verified Hub</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {trip.weather && (
                                    <div className="p-10 bg-blue-50/50 rounded-[3rem] border border-blue-100/50 space-y-8 mt-12">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                                                <CloudIcon className="w-8 h-8 text-blue-500" />
                                                Live Weather
                                            </h3>
                                            <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-blue-600 shadow-sm">Real-time</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 bg-white rounded-2xl shadow-sm space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Humidity</p>
                                                <p className="text-2xl font-black text-gray-900">{trip.weather.humidity || 45}%</p>
                                            </div>
                                            <div className="p-6 bg-white rounded-2xl shadow-sm space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Wind</p>
                                                <p className="text-2xl font-black text-gray-900">{trip.weather.windSpeed || 12} km/h</p>
                                            </div>
                                        </div>

                                        {Array.isArray(trip.weather.forecast) && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">3-Hour Intervals</p>
                                                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                                    {trip.weather.forecast.map((f, idx) => (
                                                        <div key={idx} className="min-w-[120px] p-4 bg-white rounded-2xl shadow-sm text-center space-y-2 border border-blue-50">
                                                            <p className="text-[10px] font-bold text-gray-400">{new Date(f.time).getHours()}:00</p>
                                                            <p className="text-xl font-black text-gray-900">{f.temp}°C</p>
                                                            <p className="text-[9px] font-bold text-blue-500 uppercase">{f.condition}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        )}
                        {activeTab === 'plan' && (
                            <motion.div
                                key="plan"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12 max-w-4xl mx-auto"
                            >
                                {trip.days?.map((day, idx) => (
                                    <div key={idx} className="relative pl-12 md:pl-20 pb-16 last:pb-0">
                                        <div className="absolute left-[23px] md:left-[31px] top-0 bottom-0 w-1 bg-slate-100 rounded-full" />
                                        <div className="absolute left-0 top-0">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-900 border-4 border-white shadow-xl flex items-center justify-center relative z-10 transition-all hover:scale-110 duration-500">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[8px] font-black text-[#556B2F] uppercase leading-none mb-0.5">Day</span>
                                                    <span className="text-lg md:text-xl font-black text-white leading-none">{day.day}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="pt-2">
                                                <h2 className="text-3xl md:text-5xl font-[1000] text-slate-900 tracking-tighter mb-2">{day.theme || `Phase ${day.day}`}</h2>
                                                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <CalendarIcon className="w-4 h-4 text-[#556B2F]" />
                                                    Scheduled Activities
                                                </p>
                                            </div>
                                            <div className="grid gap-6">
                                                {day.activities?.map((act, aIdx) => (
                                                    <motion.div 
                                                        key={aIdx} 
                                                        initial={{ opacity: 0, x: 20 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        viewport={{ once: true }}
                                                        className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-soft group relative hover:border-[#556B2F]/30 transition-all duration-500"
                                                    >
                                                        <div className="flex flex-col md:flex-row gap-6">
                                                            <div className="md:w-32 flex flex-col justify-start">
                                                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                                                                    <ClockIcon className="w-3.5 h-3.5 text-[#556B2F]" /> {act.time}
                                                                </div>
                                                                <span className="mt-3 text-[9px] font-black text-slate-300 uppercase tracking-widest pl-1">{act.duration}</span>
                                                            </div>
                                                            <div className="flex-1 space-y-4">
                                                                <div className="flex justify-between items-start gap-4">
                                                                    <div>
                                                                        <h3 className="text-xl md:text-2xl font-black text-slate-900 group-hover:text-olive-500 transition-colors duration-500">{act.title}</h3>
                                                                        <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            <MapPinIcon className="w-3.5 h-3.5 text-[#556B2F]" />
                                                                            {act.location}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => toggleFavorite(`d${day.day}-a${aIdx}`)}
                                                                        className={`p-3 rounded-2xl transition-all duration-500 ${favorites.includes(`d${day.day}-a${aIdx}`) ? 'bg-[#556B2F] text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-[#556B2F] hover:bg-olive-50'}`}
                                                                    >
                                                                        <StarIcon className={`w-5 h-5 ${favorites.includes(`d${day.day}-a${aIdx}`) ? 'fill-current' : ''}`} />
                                                                    </button>
                                                                </div>
                                                                <p className="text-sm md:text-base text-slate-500 leading-relaxed font-medium">{act.description}</p>
                                                                {act.cost && (
                                                                    <div className="pt-4 mt-4 border-t border-slate-50 flex justify-end items-center">
                                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mr-3">Est. Cost</span>
                                                                        <span className="text-xl font-black text-slate-900">₹{formatINR(act.cost)}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                <div className="flex flex-wrap gap-4 mt-4">
                                                    {Object.entries(day.meals || {}).map(([type, meal], mIdx) => (
                                                        <div key={mIdx} className="flex-1 min-w-[200px] p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group/meal transition-all hover:bg-white hover:border-[#556B2F]/20 shadow-sm relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-[#556B2F]/5 rounded-full blur-2xl"></div>
                                                            <div className="relative z-10 space-y-1">
                                                                <span className="text-[8px] font-black text-[#556B2F] uppercase tracking-[0.2em]">{type}</span>
                                                                <h4 className="text-sm font-black text-slate-900">{meal.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{meal.cuisine}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {trip.localDiscovery?.length > 0 && (
                                    <div className="pt-20 border-t border-slate-100">
                                        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Local Intelligence</h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {trip.localDiscovery.map((item, idx) => (
                                                <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-soft flex gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                                                        <BuildingLibraryIcon className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-900 mb-1">{item.title}</h3>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {trip.whatToBuy?.length > 0 && (
                                    <div className="pt-20">
                                        <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tighter">Curated Collection</h2>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trip.whatToBuy.map((item, idx) => (
                                                <div key={idx} className="bg-white p-8 rounded-[2.2rem] border border-slate-100 shadow-soft space-y-4">
                                                    <div className="w-12 h-12 rounded-xl bg-olive-50 text-[#556B2F] flex items-center justify-center">
                                                        <ShoppingBagIcon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-black text-slate-900 mb-1">{item.item}</h3>
                                                        <p className="text-slate-400 text-xs leading-relaxed font-medium">{item.description}</p>
                                                    </div>
                                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Est. Cost</span>
                                                        <span className="text-xl font-black text-emerald-600">₹{formatINR(item.cost)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'transport' && (
                            <motion.div
                                key="transport"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >

                                {trip.transportData?.flights?.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <PaperAirplaneIcon className="w-8 h-8 text-[#556B2F]" />
                                            Flight Route Intelligence
                                        </h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                                            {trip.transportData.flights.map((flight, fIdx) => {
                                                if (flight.error) {
                                                    return (
                                                        <div key={fIdx} className="col-span-full p-12 bg-white rounded-[3rem] border border-gray-100 text-center shadow-xl space-y-6 relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <InformationCircleIcon className="w-16 h-16 text-blue-400 mx-auto" />
                                                            <div className="relative z-10">
                                                                <h4 className="text-2xl font-black text-gray-900">{flight.error}</h4>
                                                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-2 px-12 leading-relaxed">Consider switching to rail or road travel for optimal connectivity on this specific vector.</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div key={fIdx} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group/flight hover:-translate-y-1 relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover/flight:bg-blue-100/40 transition-colors"></div>
                                                        
                                                        <div className="flex justify-between items-start mb-8">
                                                            <div className="space-y-1">
                                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#556B2F]">{flight.airline}</div>
                                                                <div className="text-2xl font-black text-gray-900 tracking-tight">{flight.flight_number}</div>
                                                            </div>
                                                            <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${flight.flight_status === 'scheduled' ? 'bg-green-50 text-green-600' : 'bg-slate-900 text-white'}`}>
                                                                {flight.flight_status}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-3 items-center gap-4 p-6 bg-gray-50/80 rounded-[2rem] border border-gray-100/50 backdrop-blur-sm">
                                                            <div className="text-center space-y-1">
                                                                <div className="text-2xl font-black text-gray-900">{flight.departure_time || '00:00'}</div>
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{flight.departure.split('(')[1]?.replace(')', '') || 'SRC'}</div>
                                                            </div>
                                                            
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="h-px w-full bg-gray-200 relative">
                                                                    <PaperAirplaneIcon className="w-4 h-4 text-[#556B2F] absolute -top-2 left-1/2 -translate-x-1/2 rotate-90" />
                                                                </div>
                                                                <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">Non-stop</span>
                                                            </div>

                                                            <div className="text-center space-y-1">
                                                                <div className="text-2xl font-black text-gray-900">{flight.arrival_time || '00:00'}</div>
                                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{flight.arrival.split('(')[1]?.replace(')', '') || 'DEST'}</div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-8 pt-6 border-t border-gray-50 flex justify-between items-center group-hover/flight:border-blue-100 transition-colors">
                                                            <div className="space-y-0.5">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 italic">Flight Vector</span>
                                                                <div className="text-[10px] font-bold text-gray-500">{new Date(flight.flight_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="text-[8px] font-black uppercase tracking-widest text-[#556B2F] block mb-1">Starting From</span>
                                                                <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{formatINR(flight.price)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {trip.transportData?.trains?.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <TruckIcon className="w-8 h-8 text-[#556B2F]" />
                                            Live Station Data ({trip.query?.source || 'Origin'})
                                        </h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {trip.transportData.trains.map((train, tIdx) => {
                                                if (train.error) {
                                                    return (
                                                        <div key={tIdx} className="col-span-full bg-slate-900 p-12 rounded-[3rem] border border-white/10 text-center relative overflow-hidden group">
                                                            <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            <div className="relative z-10">
                                                                <InformationCircleIcon className="w-16 h-16 text-[#556B2F] mx-auto mb-6" />
                                                                <h4 className="text-2xl font-black text-white tracking-tight">{train.error}</h4>
                                                                <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-3">Refining exploration parameters... recommend alternative transport.</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                const isMajorRoute = (trip.query?.source?.toLowerCase() === 'surat' && (typeof trip.destination === 'string' ? trip.destination : trip.destination?.city)?.toLowerCase() === 'mumbai') ||
                                                    (trip.query?.source?.toLowerCase() === 'mumbai' && (typeof trip.destination === 'string' ? trip.destination : trip.destination?.city)?.toLowerCase() === 'surat') || 
                                                    train.sta; // Enable enhanced view if times are available

                                                return (
                                                    <div key={tIdx} className={`bg-gray-900 text-white rounded-[2.5rem] shadow-2xl hover:bg-black transition-all group border border-white/10 relative overflow-hidden ${isMajorRoute ? 'p-8 md:p-10' : 'p-6 md:p-8 flex items-center justify-center text-center'}`}>
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#556B2F]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#556B2F]/10 transition-colors"></div>

                                                        <div className="w-full space-y-6">
                                                            <div className="flex justify-between items-start">
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-black uppercase tracking-widest text-[#556B2F]">{train.train_no || 'Express'}</div>
                                                                    <h4 className="font-black text-white text-xl md:text-2xl group-hover:text-[#556B2F] transition-all leading-tight">
                                                                        {train.train_name}
                                                                    </h4>
                                                                </div>
                                                                <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0">PF {train.platform || 'NA'}</span>
                                                            </div>

                                                            {train.sta && train.std && (
                                                                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                                                                    <div className="space-y-1">
                                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Arrives</div>
                                                                        <div className="text-xl font-black text-[#556B2F]">{train.sta}</div>
                                                                    </div>
                                                                    <div className="h-px flex-1 mx-6 bg-white/10 relative">
                                                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#556B2F] shadow-[0_0_10px_#556B2F]"></div>
                                                                    </div>
                                                                    <div className="text-right space-y-1">
                                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Departs</div>
                                                                        <div className="text-xl font-black text-white">{train.std}</div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {trip.transportData?.roadTrip && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                            <MapPinIcon className="w-8 h-8 text-[#556B2F]" />
                                            Road Trip Breakdown ({trip.query?.transport})
                                        </h3>
                                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center justify-between">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-olive-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                            
                                            <div className="flex flex-col gap-2 z-10 w-full md:w-auto">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Total Distance</span>
                                                <span className="text-5xl font-black text-gray-900">{trip.transportData.roadTrip.distance}</span>
                                            </div>

                                            <div className="hidden md:flex flex-1 items-center justify-center px-8 z-10">
                                                <div className="w-full h-1 bg-gray-100 rounded-full relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-white rounded-full border border-gray-100 shadow-sm text-xs font-black text-[#556B2F] uppercase tracking-widest flex items-center gap-2">
                                                        <TruckIcon className="w-4 h-4" /> Route Active
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-2 z-10 w-full md:w-auto md:text-right">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Est. Travel Time</span>
                                                <span className="text-5xl font-black text-gray-900">{trip.transportData.roadTrip.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(!trip.transportData?.flights?.length && !trip.transportData?.trains?.length && !trip.transportData?.roadTrip) && (
                                    <div className="bg-white p-20 rounded-[4rem] text-center space-y-8 max-w-2xl mx-auto border border-gray-100 shadow-xl">
                                        <XMarkIcon className="w-20 h-20 text-red-100 mx-auto" />
                                        <p className="text-gray-400 font-bold uppercase tracking-[0.4em]">Transport Not Found</p>
                                        <p className="text-sm text-gray-500">Live logistics for your selected mode are currently unavailable. Please try searching for Flights.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'hotels' && (
                            <motion.div
                                key="hotels"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-12"
                            >
                                {trip.transportData?.hotels?.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                            <HomeIcon className="w-8 h-8 text-[#556B2F]" />
                                            Real-time Discovery Hotels ({trip.query?.destination})
                                        </h3>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {trip.transportData.hotels.map((hotel, idx) => (
                                                <div key={`live-${idx}`} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                                    <div className="h-40 overflow-hidden relative">
                                                        <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute top-4 right-4 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-gray-900 shadow-sm flex items-center gap-1">
                                                            <StarIcon className="w-3 h-3 text-olive-400 fill-current" /> {hotel.rating}
                                                        </div>
                                                    </div>
                                                    <div className="p-6">
                                                        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{hotel.name}</h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase truncate mb-4">{hotel.address || 'Central Area'}</p>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex flex-col">
                                                                <span className="text-[8px] font-bold text-gray-400 uppercase">From</span>
                                                                <span className="text-lg font-black text-gray-900">₹{formatINR(hotel.pricePerNight)}</span>
                                                            </div>
                                                            <button className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-[#556B2F] transition-colors">Book</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <SparklesIcon className="w-8 h-8 text-[#556B2F]" />
                                        AI Curated Stays
                                    </h3>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {trip.accommodations?.map((hotel, idx) => {
                                            const hotelId = `h-${idx}`;
                                            return (
                                                <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-olive-100/50 transition-all group">
                                                    <div className="flex justify-between items-start mb-8">
                                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <HomeIcon className="w-8 h-8" />
                                                        </div>
                                                        <div className="flex items-center gap-1 px-3 py-1 bg-olive-50 text-[#556B2F] rounded-lg text-xs font-bold">
                                                            <StarIcon className="w-4 h-4 fill-current" /> {hotel.rating}
                                                        </div>
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors">{hotel.name}</h3>
                                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{hotel.type}</p>
                                                    <p className="text-gray-500 text-sm leading-relaxed mb-10 flex-grow italic">{hotel.description}</p>
                                                    <div className="pt-8 border-t border-gray-50 flex justify-between items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Night</span>
                                                            <span className="text-3xl font-black text-gray-900">₹{formatINR(hotel.pricePerNight)}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleFavorite(hotelId)}
                                                            className={`p-4 rounded-2xl ${favorites.includes(hotelId) ? 'bg-[#556B2F] text-white' : 'bg-gray-50 text-gray-300 hover:text-[#556B2F] hover:bg-olive-50'}`}
                                                        >
                                                            <StarIcon className={`w-6 h-6 ${favorites.includes(hotelId) ? 'fill-current' : ''}`} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                         {activeTab === 'food' && (
                             <motion.div
                                 key="food"
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, y: -20 }}
                                 className="space-y-12"
                             >
                                 {trip.transportData?.restaurants?.length > 0 && (
                                     <div className="space-y-6">
                                         <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                             <SparklesIcon className="w-8 h-8 text-[#556B2F]" />
                                             Real-time Best Restaurants
                                         </h3>
                                         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                             {trip.transportData.restaurants.map((res, idx) => (
                                                 <div key={`res-${idx}`} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                                                     <div className="flex justify-between items-start mb-4">
                                                         <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-500 flex items-center justify-center font-bold">
                                                             {res.rating || 4.5}
                                                         </div>
                                                         <span className="text-[10px] font-black uppercase text-gray-400">₹{formatINR(res.price || '500 - 1200')}</span>
                                                     </div>
                                                     <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{res.name}</h4>
                                                     <p className="text-[10px] text-[#556B2F] font-bold uppercase mb-2">{res.cuisine || 'Local Delight'}</p>
                                                     <p className="text-[10px] text-gray-400 line-clamp-2">{res.address}</p>
                                                     <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 flex justify-between">
                                                         <span>{res.reviews || '100+'} reviews</span>
                                                         <span className="text-emerald-500">Highly Rated</span>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}

                                 <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                     <SparklesIcon className="w-8 h-8 text-[#556B2F]" />
                                     Daily Planned Meals
                                 </h3>
                                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {trip.days?.flatMap(day =>
                                    Object.entries(day.meals || {}).map(([type, meal]) => ({ ...meal, day: day.day, type }))
                                ).map((meal, idx) => {
                                    const mealId = `d${meal.day}-m-${meal.type}`;
                                    return (
                                        <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col hover:shadow-2xl hover:shadow-olive-100/50 transition-all group">
                                            <div className="flex justify-between items-start mb-8">
                                                <div className="w-16 h-16 rounded-2xl bg-olive-50 text-olive-600 flex items-center justify-center">
                                                    <SparklesIcon className="w-8 h-8" />
                                                </div>
                                                <div className="px-3 py-1 bg-gray-50 text-gray-500 rounded-lg text-[10px] font-black uppercase">Day {meal.day}</div>
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#556B2F] transition-colors">{meal.name}</h3>
                                            <p className="text-[#556B2F] text-xs font-bold uppercase tracking-widest mb-4">{meal.cuisine}</p>
                                            <div className="mt-auto pt-8 border-t border-gray-50 flex justify-between items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg. Cost</span>
                                                    <span className="text-3xl font-black text-gray-900">₹{formatINR(meal.cost)}</span>
                                                </div>
                                                <button
                                                    onClick={() => toggleFavorite(mealId)}
                                                    className={`p-4 rounded-2xl ${favorites.includes(mealId) ? 'bg-[#556B2F] text-white' : 'bg-gray-50 text-gray-300 hover:text-[#556B2F] hover:bg-olive-50'}`}
                                                >
                                                    <StarIcon className={`w-6 h-6 ${favorites.includes(mealId) ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'budget' && (
                            <motion.div
                                key="budget"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-[3rem] p-12 md:p-20 shadow-xl border border-gray-100 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                                    <BanknotesIcon className="w-80 h-80" />
                                </div>
                                <div className="relative z-10 max-w-4xl">
                                    <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Budget Breakdown</h2>
                                    <div className="grid md:grid-cols-2 gap-16">
                                        <div className="space-y-8">
                                            {Object.entries(trip.budgetBreakdown || {}).map(([category, amount]) => (
                                                <div key={category} className="space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">{category}</span>
                                                        <span className="text-2xl font-bold text-gray-900">₹{String(amount || 0).replace(/[₹,]/g, '')}</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(amount / (trip.totalEstimatedCost || 1)) * 100}%` }}
                                                            className="h-full bg-[#556B2F] rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#556B2F] rounded-[3rem] p-12 text-white flex flex-col justify-center gap-6">
                                            <span className="text-xs font-bold uppercase tracking-[0.3em] opacity-60">Total Estimated Cost</span>
                                             <h3 className="text-4xl md:text-6xl font-black">₹{formatINR(trip.totalEstimatedCost || trip.budget?.total)}</h3>
                                            <p className="text-olive-100 text-sm leading-relaxed font-medium">
                                                This estimate includes hotels, meals, and activities for {trip.days?.length} days.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'tips' && (
                            <motion.div
                                key="tips"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid md:grid-cols-2 gap-8"
                            >
                                {trip.travelTips?.map((tip, i) => (
                                    <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-8 items-start hover:shadow-xl transition-all">
                                        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                            <InformationCircleIcon className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-700 text-xl font-medium leading-relaxed mt-2">{tip}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {activeTab === 'favorites' && (
                            <motion.div
                                key="favorites"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-12"
                            >
                                <div className="text-center space-y-4 mb-20">
                                    <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Saved Items</h2>
                                    <p className="text-gray-500 font-medium">Items you've bookmarked for this trip.</p>
                                </div>

                                {favorites.length === 0 ? (
                                    <div className="bg-white p-20 rounded-[4rem] text-center space-y-8 max-w-2xl mx-auto border border-gray-100 shadow-xl">
                                        <StarIcon className="w-20 h-20 text-gray-100 mx-auto" />
                                        <p className="text-gray-400 font-bold uppercase tracking-[0.4em]">No bookmarks yet</p>
                                        <button onClick={() => setActiveTab('plan')} className="w-full py-6 rounded-2xl bg-[#556B2F] text-white font-bold">Browse Plan</button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {trip.days.flatMap(day =>
                                            (day.activities || []).map((act, aIdx) => ({ ...act, id: `d${day.day}-a${aIdx}`, day: day.day }))
                                                .concat(Object.entries(day.meals || {}).map(([type, meal]) => ({ ...meal, title: meal.name, id: `d${day.day}-m-${type}`, day: day.day, isMeal: true })))
                                        ).filter(item => favorites.includes(item.id)).map((item, i) => (
                                            <motion.div key={i} whileHover={{ y: -10 }} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl p-10 flex flex-col gap-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="px-4 py-1.5 bg-[#556B2F] text-white text-[9px] font-black uppercase tracking-widest rounded-lg">Day {item.day} {item.isMeal ? 'Meal' : 'Activity'}</span>
                                                    <button onClick={() => toggleFavorite(item.id)} className="text-[#556B2F]"><StarIcon className="w-6 h-6 fill-current" /></button>
                                                </div>
                                                <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{item.title}</h4>
                                                <p className="text-gray-500 text-sm line-clamp-3">{item.description || item.cuisine}</p>
                                                <div className="mt-auto flex justify-between items-center pt-6 border-t border-gray-50">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.location || 'Local Spot'}</span>
                                                    <span className="text-xl font-bold text-gray-900">₹{formatINR(item.cost)}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
