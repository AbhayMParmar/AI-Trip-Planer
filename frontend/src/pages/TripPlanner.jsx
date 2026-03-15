import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import {
    MapPinIcon,
    UserGroupIcon,
    BoltIcon,
    GlobeAltIcon,
    MinusIcon,
    PlusIcon,
    ArrowPathIcon,
    SparklesIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const transportOptions = [
    { id: 'flight', label: 'Flight', icon: '✈️', subtitle: 'Fastest' },
    { id: 'train', label: 'Train', icon: '🚆', subtitle: 'Scenic' },
    { id: 'car', label: 'Car', icon: '🚗', subtitle: 'Flexible' },
    { id: 'bike', label: 'Bike', icon: '🚲', subtitle: 'Active' }
];

const styleOptions = [
    { id: 'backpacker', label: 'Backpacker', icon: '🎒', subtitle: 'Budget' },
    { id: 'comfort', label: 'Comfort', icon: '🏨', subtitle: 'Boutique' },
    { id: 'luxury', label: 'Luxury', icon: '💎', subtitle: 'High-end' }
];

const experienceOptions = [
    { id: 'adventure', label: 'Adventure', icon: '🧗' },
    { id: 'foodie', label: 'Foodie', icon: '🍱' },
    { id: 'cultural', label: 'Culture', icon: '🏛️' },
    { id: 'nature', label: 'Nature', icon: '🌲' },
    { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
    { id: 'relaxing', label: 'Relax', icon: '🧘' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'shopping', label: 'Shopping', icon: '🛍️' }
];

const MagicCard = ({ children, isSelected, onClick, className = "" }) => (
    <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative cursor-pointer p-6 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${isSelected
            ? 'bg-white border-olive-200 shadow-[0_20px_40px_rgba(245,185,153,0.15)] ring-4 ring-olive-100/30'
            : 'bg-white/50 border-gray-100 hover:border-olive-100 hover:bg-white shadow-sm'
            } ${className}`}
    >
        {isSelected && (
            <motion.div 
                layoutId="selection-bubble"
                className="absolute top-4 right-4 w-6 h-6 bg-olive-500 rounded-full flex items-center justify-center text-white z-20"
            >
                <CheckCircleIcon className="w-4 h-4 stroke-[3px]" />
            </motion.div>
        )}
        {children}
    </motion.div>
);

export default function TripPlanner() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.initialData;
    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(3);
    const [selectedTransport, setSelectedTransport] = useState('flight');
    const [selectedStyle, setSelectedStyle] = useState('comfort');
    const [selectedExperiences, setSelectedExperiences] = useState(['cultural']);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const { register, handleSubmit, watch, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            source: '',
            destination: initialData?.destination || '',
            adults: 1,
            children: 0
        }
    });

    useEffect(() => {
        if (initialData?.destination) {
            setValue('destination', initialData.destination);
        }
    }, [initialData, setValue]);

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        setMousePos({ x: clientX, y: clientY });
    };

    const toggleExperience = (id) => {
        setSelectedExperiences(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const API_URL = '';
            const response = await fetch(`${API_URL}/api/recommendations/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                },
                body: JSON.stringify({
                    source: data.source,
                    destination: data.destination,
                    duration,
                    transport: selectedTransport,
                    style: selectedStyle,
                    interests: selectedExperiences,
                    travelers: { adults: parseInt(data.adults), children: parseInt(data.children) || 0 },
                    module: selectedStyle === 'luxury' ? 'sanctuary' : 'expedition'
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Generation failed');
            }

            const tripData = await response.json();

            if (user) {
                const docRef = await addDoc(collection(db, 'trips'), {
                    ...tripData,
                    userId: user.uid,
                    createdAt: new Date().toISOString()
                });
                navigate(`/trip/${docRef.id}`, { state: { tripData: { ...tripData, _id: docRef.id } } });
            } else {
                navigate(`/trip/guest-${Date.now()}`, { state: { tripData: { ...tripData, _id: `guest-${Date.now()}` } } });
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to create trip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            onMouseMove={handleMouseMove}
            className="min-h-screen bg-[#FDFCFB] pb-32 relative overflow-hidden font-['Plus_Jakarta_Sans']"
        >
            {/* Interactive Ambient Background */}
            <div 
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(1200px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245,185,153,0.05), transparent 85%)`
                }}
            />
            
            <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-olive-100/20 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-100/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />

            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] flex flex-col items-center justify-center backdrop-blur-3xl bg-white/60"
                    >
                        <div className="relative w-48 h-48 mb-12">
                            <motion.div
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-[4px] border-olive-100 border-t-olive-500 rounded-[3rem]"
                            />
                            <div className="absolute inset-8 bg-white rounded-[2rem] flex flex-col items-center justify-center shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)]">
                                <SparklesIcon className="w-12 h-12 text-olive-400 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4">Crafting Perfection</h2>
                        <div className="flex gap-2">
                            {[0, 1, 2].map(i => (
                                <motion.div 
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-2 h-2 bg-olive-400 rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto px-6 pt-4 md:pt-6 relative z-10">
                {/* Simplified Header */}
                <div className="mb-10 md:mb-14 text-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        className="mb-6 px-4 py-2 bg-white/80 border border-gray-100 rounded-2xl inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-olive-500 transition-all shadow-sm"
                    >
                        <ArrowPathIcon className="w-3.5 h-3.5 rotate-180" />
                        Back to Home
                    </motion.button>
                    
                    <h1 className="text-4xl md:text-7xl font-[1000] text-gray-900 tracking-tighter mb-4">
                        Plan your <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-500 to-red-500">escape.</span>
                    </h1>
                    <p className="text-gray-500 text-base md:text-lg font-medium max-w-2xl mx-auto px-4">Configure your mission parameters below to generate a high-fidelity AI travel itinerary.</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                    {/* SECTION 1: DESTINATION & TIMELINE */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 grid md:grid-cols-2 gap-8">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-olive-500 to-pink-500 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
                                <div className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-soft">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-500 flex items-center justify-center">
                                            <MapPinIcon className="w-5 h-5" />
                                        </div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Starting Point</label>
                                    </div>
                                    <input
                                        type="text"
                                        {...register('source')}
                                        placeholder="e.g. Surat"
                                        className="w-full text-2xl font-black bg-transparent border-none outline-none placeholder:text-gray-200 text-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-olive-500 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-10 transition duration-500" />
                                <div className="relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-soft">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                                            <GlobeAltIcon className="w-5 h-5" />
                                        </div>
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Destination</label>
                                    </div>
                                    <input
                                        type="text"
                                        {...register('destination', { required: true })}
                                        placeholder="e.g. Mumbai"
                                        className="w-full text-2xl font-black bg-transparent border-none outline-none placeholder:text-gray-200 text-gray-900"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-soft flex flex-col justify-center text-center">
                            <div className="text-5xl font-black text-gray-900 tracking-tighter mb-4 tabular-nums">
                                {duration} <span className="text-xl text-olive-500 italic">Days</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setDuration(Math.max(1, duration - 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 transition-all font-black"><MinusIcon className="w-5 h-5" /></button>
                                <div className="flex-1 relative h-1.5 bg-gray-100 rounded-full">
                                    <input type="range" min="1" max="14" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                    <div className="absolute inset-y-0 left-0 bg-olive-500 rounded-full" style={{ width: `${(duration / 14) * 100}%` }} />
                                </div>
                                <button type="button" onClick={() => setDuration(Math.min(14, duration + 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-900 text-white transition-all font-black"><PlusIcon className="w-5 h-5" /></button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: VIBE & EXPERIENCE */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
                                <SparklesIcon className="w-6 h-6 text-olive-500" />
                                Travel DNA
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {styleOptions.map(opt => (
                                    <MagicCard 
                                        key={opt.id} 
                                        isSelected={selectedStyle === opt.id}
                                        onClick={() => setSelectedStyle(opt.id)}
                                        className="p-6"
                                    >
                                        <div className="text-4xl mb-4">{opt.icon}</div>
                                        <div className="text-lg font-black text-gray-900 mb-1">{opt.label}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{opt.subtitle}</div>
                                    </MagicCard>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Interests & Experiences</h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
                                {experienceOptions.map(opt => (
                                    <MagicCard
                                        key={opt.id}
                                        isSelected={selectedExperiences.includes(opt.id)}
                                        onClick={() => toggleExperience(opt.id)}
                                        className="p-3 sm:p-4 flex flex-col items-center text-center"
                                    >
                                        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{opt.icon}</div>
                                        <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-900">{opt.label}</div>
                                    </MagicCard>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: CREW & LOGISTICS */}
                    <div className="grid lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-soft">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-8">Travel Crew & Transport</h3>
                            <div className="grid md:grid-cols-2 gap-12 mb-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                            <UserGroupIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Adults</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setValue('adults', Math.max(1, watch('adults') - 1))} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50"><MinusIcon className="w-4 h-4 text-gray-400" /></button>
                                        <span className="text-xl font-black text-gray-900 w-6 text-center">{watch('adults')}</span>
                                        <button type="button" onClick={() => setValue('adults', watch('adults') + 1)} className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg"><PlusIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                            <BoltIcon className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Children</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button type="button" onClick={() => setValue('children', Math.max(0, watch('children') - 1))} className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50"><MinusIcon className="w-4 h-4 text-gray-400" /></button>
                                        <span className="text-xl font-black text-gray-900 w-6 text-center">{watch('children')}</span>
                                        <button type="button" onClick={() => setValue('children', watch('children') + 1)} className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg"><PlusIcon className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {transportOptions.map(opt => (
                                    <MagicCard
                                        key={opt.id}
                                        isSelected={selectedTransport === opt.id}
                                        onClick={() => setSelectedTransport(opt.id)}
                                        className="p-4 flex flex-col items-center text-center"
                                    >
                                        <div className="text-2xl mb-2">{opt.icon}</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-gray-900">{opt.label}</div>
                                    </MagicCard>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 bg-gray-900 p-8 rounded-[3rem] text-white flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-olive-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                            <div className="relative">
                                <h3 className="text-xs font-black text-olive-500 uppercase tracking-[0.3em] mb-8">Summary Metrics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 font-medium">Flight Priority</span>
                                        <span className="font-black text-olive-400 uppercase tracking-widest">{selectedTransport}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400 font-medium">Style Tier</span>
                                        <span className="font-black uppercase tracking-widest">{selectedStyle}</span>
                                    </div>
                                </div>
                            </div>
                                <button
                                    type="submit"
                                    className="mt-8 py-5 bg-gradient-to-r from-olive-500 to-red-500 text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    Generate Mission
                                    <SparklesIcon className="w-5 h-5" />
                                </button>
                        </div>
                    </div>
                </form>

                <p className="text-center text-[7px] font-black text-gray-200 uppercase tracking-[0.8em] mt-24 opacity-50">
                    Propelled by Global AI Transit Mesh 4.0
                </p>
            </div>
        </div>
    );
}
