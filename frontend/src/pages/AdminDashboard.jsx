import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    UsersIcon, MapIcon, ChartBarIcon, 
    TrashIcon, ArrowRightOnRectangleIcon, LockClosedIcon
} from '@heroicons/react/24/outline';

// Provide relative API pathing based on deployment environment
const API_URL = '';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('adminToken'));
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [stats, setStats] = useState({ totalUsers: 0, totalTrips: 0 });
    const [users, setUsers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (token) {
            setIsAuthenticated(true);
            fetchData();
        }
    }, [token]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                setToken(data.token);
                localStorage.setItem('adminToken', data.token);
                toast.success('Admin Protocol Activated');
                setIsAuthenticated(true);
                fetchData();
            } else {
                toast.error('Invalid Credentials');
            }
        } catch (err) {
            toast.error('Server error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        setToken(null);
        setIsAuthenticated(false);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, tripsRes] = await Promise.all([
                fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
                fetch(`${API_URL}/api/admin/trips`, { headers: { Authorization: `Bearer ${token}` } })
            ]);

            if (statsRes.status === 403) {
                handleLogout();
                return toast.error('Session expired');
            }

            const statsData = await statsRes.json();
            const usersData = await usersRes.json();
            const tripsData = await tripsRes.json();

            setStats(statsData.stats);
            setUsers(usersData.users);
            setTrips(tripsData.trips);
        } catch (error) {
            toast.error('Failed to load portal data');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Nuclear Warning: Deleting user removes all their trips. Proceed?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('User Purged');
                fetchData(); // Refresh all
            }
        } catch (err) {
            toast.error('Failed to command server');
        }
    };

    const deleteTrip = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this trip?")) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/trips/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('Trip Destroyed');
                fetchData();
            }
        } catch (err) {
            toast.error('Failed to command server');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-black border border-gray-800 p-8 rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-olive-500/20 rounded-full blur-[40px] -mt-10 -mr-10"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(85,107,47,0.3)] border border-olive-900">
                            <LockClosedIcon className="w-8 h-8 text-olive-400" />
                        </div>
                        <h1 className="text-3xl font-[1000] text-white tracking-widest mb-2 uppercase">Root <span className="text-olive-500">Access</span></h1>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-8">TripNova Command Center</p>
                        
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Admin Identity</label>
                                <input 
                                    type="email" 
                                    value={email} onChange={e => setEmail(e.target.value)} required 
                                    className="w-full bg-gray-900 border-none text-white rounded-xl py-4 px-5 focus:ring-2 focus:ring-olive-500 transition-all text-sm font-bold"
                                    placeholder="admin@tripnova.com"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">Security Key</label>
                                <input 
                                    type="password" 
                                    value={password} onChange={e => setPassword(e.target.value)} required 
                                    className="w-full bg-gray-900 border-none text-white rounded-xl py-4 px-5 focus:ring-2 focus:ring-olive-500 transition-all text-sm font-bold"
                                />
                            </div>
                            <button disabled={loading} type="submit" className="w-full bg-olive-500 hover:bg-olive-600 text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(85,107,47,0.4)] active:scale-95">
                                {loading ? 'Bypassing...' : 'Initialize'}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

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
                        <ArrowRightOnRectangleIcon className="w-4 h-4" /> Terminate Session
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
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Traveler Log</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Email</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Created</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((u, i) => (
                                                    <tr key={u._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                                                        <td className="px-6 py-4 text-xs font-medium text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => deleteUser(u._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-auto">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
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
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                                     <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Source</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Duration</th>
                                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {trips.map((t, i) => (
                                                    <tr key={t._id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                                        <td className="px-6 py-4 font-bold text-gray-900">{t.destination}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{t.source}</td>
                                                        <td className="px-6 py-4 text-xs font-medium text-gray-400">{t.duration} Days</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button onClick={() => deleteTrip(t._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-auto">
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {trips.length === 0 && <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest text-xs">No trips generated yet</td></tr>}
                                            </tbody>
                                        </table>
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
