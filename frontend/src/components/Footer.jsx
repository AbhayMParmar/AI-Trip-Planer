import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    SparklesIcon,
    GlobeAltIcon,
    ShieldCheckIcon,
    CommandLineIcon,
    CpuChipIcon,
    SignalIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
    return (
        <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-2xl font-bold text-[#556B2F]">
                            <SparklesIcon className="w-8 h-8" />
                            TravelAI
                        </div>
                        <p className="text-gray-500 leading-relaxed font-medium">
                            Making world travel simple, affordable, and accessible for everyone through the power of AI.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Navigation</h4>
                        <ul className="space-y-4 font-medium">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'New Plan', path: '/planner' },
                                { name: 'History', path: '/history' },
                                { name: 'Bookmarks', path: '/favorites' }
                            ].map(link => (
                                <li key={link.name}>
                                    <Link to={link.path} className="text-gray-400 hover:text-[#556B2F] transition-colors">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Company</h4>
                        <ul className="space-y-4 font-medium">
                            {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service'].map(link => (
                                <li key={link}>
                                    <Link to="#" className="text-gray-400 hover:text-[#556B2F] transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Stay Updated</h4>
                        <p className="text-gray-500 text-sm font-medium">Get travel tips and new features in your inbox.</p>
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#556B2F] transition-all font-semibold"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#556B2F] rounded-lg flex items-center justify-center text-white hover:bg-[#6B732A] transition-all">
                                <ChevronRightIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-gray-400 text-sm font-medium">
                        © {new Date().getFullYear()} TravelAI. All rights reserved.
                    </p>
                    <div className="flex items-center gap-8">
                        <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <ShieldCheckIcon className="w-4 h-4 text-[#556B2F]" />
                            Secure Payments
                        </span>
                        <span className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <GlobeAltIcon className="w-4 h-4 text-[#556B2F]" />
                            24/7 Support
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
