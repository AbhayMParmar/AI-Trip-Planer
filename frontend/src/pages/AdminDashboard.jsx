import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    UsersIcon, MapIcon, ChartBarIcon, 
    TrashIcon, ArrowRightOnRectangleIcon, LockClosedIcon
} from '@heroicons/react/24/outline';
import { collection, onSnapshot, getDocs, deleteDoc, doc, query, where, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Provide relative API pathing based on deployment environment
const API_URL = '';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalUsers: 0, totalTrips: 0 });
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [searchTrip, setSearchTrip] = useState('');

    useEffect(() => {
        // Set up real-time listener for users
        const usersQuery = query(collection(db, 'users'));
        const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
            setUsers(usersData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setStats(prev => ({ ...prev, totalUsers: usersData.length }));
        }, (error) => {
            toast.error('Real-time sync error (Users)');
            console.error(error);
        });

        // Set up real-time listener for trips
        const tripsQuery = query(collection(db, 'trips'));
        const unsubscribeTrips = onSnapshot(tripsQuery, (snapshot) => {
            const tripsData = snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
            setTrips(tripsData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setStats(prev => ({ ...prev, totalTrips: tripsData.length }));
        }, (error) => {
            toast.error('Real-time sync error (Trips)');
            console.error(error);
        });

        return () => {
            unsubscribeUsers();
            unsubscribeTrips();
        };
    }, []);



    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        toast.success('Admin Session Ended');
        navigate('/');
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
            
            const tripsSnapshot = await getDocs(collection(db, 'trips'));
            const tripsData = tripsSnapshot.docs.map(d => ({ _id: d.id, ...d.data() }));

            setStats({ totalUsers: usersData.length, totalTrips: tripsData.length });
            setUsers(usersData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
            setTrips(tripsData.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            toast.error('Failed to load portal data from Firebase');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Nuclear Warning: Deleting user removes all their trips, favorites, and AI chat history. Proceed?")) return;
        
        setLoading(true);
        const batch = writeBatch(db);
        
        try {
            // 1. Queue user deletion
            batch.delete(doc(db, 'users', userId));
            
            // 2. Fetch and queue related data in parallel for speed
            const queries = [
                getDocs(query(collection(db, 'trips'))),
                getDocs(query(collection(db, 'favorites'))),
                getDocs(query(collection(db, 'ai_chat_sessions')))
            ];
            
            const [tripsSnap, favoritesSnap, chatSnap] = await Promise.all(queries);

            // Filter and queue deletions (Firestore batch limit is 500 ops)
            let opsCount = 1; // starting with user delete

            tripsSnap.docs.forEach(d => {
                if ((d.data().userId === userId || d.data().user === userId) && opsCount < 499) {
                    batch.delete(doc(db, 'trips', d.id));
                    opsCount++;
                }
            });

            favoritesSnap.docs.forEach(d => {
                if (d.data().userId === userId && opsCount < 499) {
                    batch.delete(doc(db, 'favorites', d.id));
                    opsCount++;
                }
            });

            chatSnap.docs.forEach(d => {
                if (d.data().userId === userId && opsCount < 499) {
                    batch.delete(doc(db, 'ai_chat_sessions', d.id));
                    opsCount++;
                }
            });

            // 3. Commit the batch
            await batch.commit();
            toast.success('User and all associated data purged instantly.');
        } catch (err) {
            toast.error('Failed to execute absolute deletion');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const deleteTrip = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this trip?")) return;
        
        try {
            await deleteDoc(doc(db, 'trips', id));
            toast.success('Trip Destroyed');
        } catch (err) {
            toast.error('Failed to execute deletion');
            console.error(err);
        }
    };



    return (
        <div className="min-h-screen bg-gray-50 font-['Plus_Jakarta_Sans']">
            {/* Admin Header */}
            <div className="bg-black text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-50 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Admin" className="w-8 h-8 rounded-lg filter drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]" />
                    <div>
                        <div className="font-[1000] text-sm uppercase tracking-widest leading-none">TripNova <span className="text-olive-400">Core</span></div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">Global Command Portal</div>
                    </div>
                </div>
                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <button onClick={fetchData} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                        Refresh Node
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mt-5 -mr-5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center"><UsersIcon className="w-6 h-6" /></div>
                            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Total Travelers</div>
                        </div>
                        <div className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalUsers}</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-olive-500/5 rounded-full blur-2xl -mt-5 -mr-5 group-hover:bg-olive-500/10 transition-colors"></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-olive-50 text-olive-500 rounded-2xl flex items-center justify-center"><MapIcon className="w-6 h-6" /></div>
                            <div className="text-xs font-black uppercase tracking-widest text-gray-400">Trips Generated</div>
                        </div>
                        <div className="text-5xl font-black text-gray-900 tracking-tighter">{stats.totalTrips}</div>
                    </motion.div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto pb-4">
                    <button onClick={() => setActiveTab('overview')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>System DB</button>
                    <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Travelers ({users.length})</button>
                    <button onClick={() => setActiveTab('trips')} className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'trips' ? 'bg-black text-white' : 'text-gray-400 hover:text-black'}`}>Vault Trips ({trips.length})</button>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-olive-200 border-t-olive-500 rounded-full animate-spin"></div></div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {activeTab === 'users' && (
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Traveler</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Method</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Created</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u, i) => (
                                                    <tr key={u._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            <div className="flex items-center gap-2">
                                                                {u.name || (u.email ? u.email.split('@')[0] : 'Unknown User')}
                                                                <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-slate-200">
                                                                    {trips.filter(t => (t.userId === u._id || t.user === u._id)).length} TRIPS
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-semibold text-gray-500">{u.email || 'N/A'}</td>
                                                        <td className="px-6 py-4">
                                                            <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${u.authProvider === 'google' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                                                {u.authProvider || 'Email'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button 
                                                                    onClick={() => {
                                                                        setSearchTrip(u.email || u.name);
                                                                        setActiveTab('trips');
                                                                    }}
                                                                    className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-sm"
                                                                >
                                                                    Manage Trips
                                                                </button>
                                                                <button onClick={() => deleteUser(u._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-sm">
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {users.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No users detected</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'trips' && (
                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
                                        <div className="flex-1 relative">
                                            <input 
                                                type="text" 
                                                placeholder="Filter trip plans by traveler name, email or destination..." 
                                                value={searchTrip}
                                                onChange={(e) => setSearchTrip(e.target.value)}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-10 text-[11px] font-black uppercase tracking-widest text-slate-900 focus:ring-1 focus:ring-slate-200 placeholder:text-gray-400"
                                            />
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                                <UsersIcon className="w-4 h-4" />
                                            </div>
                                            {searchTrip && (
                                                <button onClick={() => setSearchTrip('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-red-400 hover:text-red-500 uppercase tracking-widest">Clear</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                         <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Owner</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {trips
                                                        .filter(t => {
                                                            const user = users.find(u => u._id === (t.userId || t.user));
                                                            const userSearch = (user?.name || '').toLowerCase().includes(searchTrip.toLowerCase()) || (user?.email || '').toLowerCase().includes(searchTrip.toLowerCase());
                                                            const destSearch = (typeof t.destination === 'string' ? t.destination : (t.destination?.city || t.tripName || '')).toLowerCase().includes(searchTrip.toLowerCase());
                                                            return userSearch || destSearch;
                                                        })
                                                        .map((t, i) => (
                                                    <tr key={t._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-6 py-4 font-bold text-gray-900">
                                                            {typeof t.destination === 'string' ? t.destination : (t.destination?.city ? `${t.destination.city}${t.destination.country ? `, ${t.destination.country}` : ''}` : t.tripName || 'Unknown Destination')}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                                                                    {users.find(u => u._id === (t.userId || t.user))?.name || 'Anonymous'}
                                                                </span>
                                                                <span className="text-[8px] font-bold text-gray-400 lowercase">
                                                                    {users.find(u => u._id === (t.userId || t.user))?.email || 'ghost@user.id'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{t.source || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-xs font-medium text-gray-400">{t.duration || (t.days ? t.days.length : 0)} Days</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => deleteTrip(t._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-auto">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {trips.length === 0 && <tr><td colSpan="5" className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No trips generated yet</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                            {activeTab === 'overview' && (
                                <div className="p-12 text-center bg-white rounded-[2rem] border border-gray-100">
                                    <ChartBarIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">System Systems Operational</h2>
                                    <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">Database clusters and AI nodes are responding cleanly. Select a tab above to manage system entities.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
