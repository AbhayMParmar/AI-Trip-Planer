import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  SparklesIcon,
  MapPinIcon,
  CalendarIcon,
  BanknotesIcon,
  ChevronRightIcon,
  HeartIcon,
  MapIcon,
  HomeIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  StarIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const DESTINATION_IMAGES = [
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=400", // Paris
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=400", // Dubai
  "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&q=80&w=400", // Japan
];

// Bento Card Component
const BentoCard = ({ title, description, icon: Icon, color, className, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ 
      y: -12, 
      scale: 1.02,
      shadow: "0 50px 100px -20px rgba(0,0,0,0.15)"
    }}
    className={`group relative overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-700 ${className}`}
  >
    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${color} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-[0.08] transition-opacity duration-700 -mr-16 -mt-16`} />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-slate-900 text-[#556B2F] shadow-2xl shadow-slate-200 transform group-hover:scale-110 transition-transform duration-500`}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-2xl md:text-3xl font-[1000] tracking-tighter text-slate-900 mb-4 uppercase">{title}</h3>
    <p className="text-slate-400 leading-relaxed font-bold text-sm md:text-lg uppercase tracking-widest opacity-80">{description}</p>
  </motion.div>
);

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePos({ x: clientX, y: clientY });
  };

  const handleQuickStart = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;
    const targetPath = isAuthenticated ? '/planner' : '/register';
    navigate(targetPath, { state: { initialData: { destination } } });
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#FBFCFE] font-['Plus_Jakarta_Sans'] selection:bg-olive-200 selection:text-olive-900 overflow-hidden text-gray-900"
    >
      {/* Interactive Global Mesh Highlight */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: `radial-gradient(1000px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245,185,153,0.06), transparent 80%)`
        }}
      />
      <section className="relative min-h-fit lg:min-h-[calc(100vh-100px)] flex items-start pt-8 md:pt-0 pb-12 md:pb-0 tb-gap-tight overflow-hidden">
        {/* Abstract Dynamic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div 
            animate={{ 
              rotate: [0, 10, -10, 0], 
              scale: [1, 1.1, 0.9, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[70%] bg-gradient-to-br from-[#556B2F]/20 to-olive-100/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              rotate: [0, -10, 10, 0], 
              scale: [1, 0.9, 1.1, 1] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[60%] bg-gradient-to-br from-olive-100/30 to-amber-100/30 rounded-full blur-[140px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-12 gap-12 items-start w-full">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start text-left lg:col-span-6 xl:col-span-5 zf-main-padding"
          >
            <div className="w-full mb-8 md:mb-0 mt-[5px]">
               {/* Mobile/Tablet Header Row */}
               <div className="flex flex-row items-start justify-between lg:block relative">
                 <h1 className="flex-1 text-4xl sm:text-6xl md:text-7xl lg:text-[75px] font-[900] tracking-[-0.04em] leading-[1.1] mb-6 relative zf-title-scale zf-title-mobile-scale tb-title-tight pr-4 md:pr-0">
                   <span className="relative z-10 whitespace-nowrap">Design your</span> <br className="md:hidden zf-forced-break" />
                   <span className="relative inline-block mt-2">
                     <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-olive-600 to-[#556B2F] whitespace-nowrap">
                       dream trip
                     </span>
                     <motion.span 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       transition={{ delay: 0.5, duration: 1 }}
                       className="absolute bottom-2 left-0 h-4 bg-olive-100/50 -z-10 rounded-lg hidden md:block"
                     />
                     <span className="absolute -inset-x-2 sm:-inset-x-4 -inset-y-2 bg-olive-50 rounded-2xl -z-10 md:hidden border border-olive-100/50 shadow-sm" />
                   </span> <br className="md:hidden zf-forced-break" />
                   <span className="relative z-10 whitespace-nowrap">in seconds.</span>
                 </h1>

                 {/* Mobile/Tablet Image Collage - Fixed to the right of H1 */}
                 <div className="lg:hidden w-32 sm:w-48 relative pt-4 select-none flex justify-center">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                     animate={{ opacity: 1, scale: 1, rotate: 6 }}
                     transition={{ duration: 1, delay: 0.3 }}
                     className="hero-img-mobile md:hero-img-tablet relative"
                   >
                     <img src={DESTINATION_IMAGES[0]} className="w-full h-full object-cover rounded-[1.25rem]" alt="Paris" />
                     
                     <motion.div 
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ duration: 1, delay: 0.6 }}
                       className="hero-img-circle hidden xs:block"
                     >
                       <img src={DESTINATION_IMAGES[1]} className="w-full h-full object-cover" alt="Dubai" />
                     </motion.div>
                   </motion.div>
                 </div>
               </div>

               <p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed max-w-lg mb-12 md:mb-4 md:block zf-desc-mobile-scale md:pr-0 relative z-10">
                 Stop scrolling through endless tabs. Our AI curates perfect, personalized itineraries, stays, and dining experiences instantly.
               </p>
            </div>

            {/* Left Aligned Search Bar for Mobile */}
            <div className="w-full max-w-md md:max-w-none text-left ml-0">
               <form
                 onSubmit={handleQuickStart}
                 className="w-full relative group"
               >
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-olive-400 to-[#556B2F] rounded-[2rem] blur-[2px] opacity-10 group-hover:opacity-20 transition duration-1000" />
                 <div className="relative flex items-center bg-white/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] overflow-hidden border border-white/60 p-1.5 zf-form-compact">
                   <div className="p-3 bg-olive-50 rounded-2xl ml-1 flex items-center justify-center">
                     <MapPinIcon className="w-5 h-5 text-[#556B2F]" />
                   </div>
                   <input
                     type="text"
                     placeholder="Where to?"
                     className="flex-1 py-3 px-3 md:py-3.5 md:px-5 text-gray-900 text-base md:text-xl font-bold bg-transparent border-none focus:outline-none placeholder:text-gray-300 zf-input-compact"
                     value={destination}
                     onChange={(e) => setDestination(e.target.value)}
                     required
                   />
                   <button
                     type="submit"
                     className="bg-slate-900 hover:bg-black text-white px-5 md:px-10 py-3 md:py-4 rounded-[1.3rem] font-black text-[10px] md:text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200 flex items-center gap-2 transform active:scale-95 group/btn"
                   >
                     <span className="hidden xs:inline">Start</span>
                     <SparklesIcon className="w-4 h-4 text-[#556B2F] group-hover:rotate-12 transition-transform" />
                   </button>
                 </div>
               </form>
            </div>
            <div className="mt-4 md:mt-4 flex items-center gap-5 self-start">
              <div className="flex -space-x-3 overflow-hidden p-1">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?u=${i + 80}`} className="w-9 h-9 rounded-full border-2 border-white shadow-sm" alt="user" />
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-0.5 text-olive-400">
                  {[...Array(5)].map((_, i) => <StarIcon key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none mt-1">
                  15k+ <span className="text-slate-400">Success Missions</span>
                </span>
              </div>
            </div>

            {/* Galaxy Z Fold 5 Specific Content - Fills the unique vertical space */}
            <div className="hidden zf-show mt-12">
                <div className="flex flex-col gap-6">
                    <div className="h-px w-32 bg-gradient-to-r from-[#556B2F]/40 via-[#556B2F]/10 to-transparent" />
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                <CommandLineIcon className="w-4 h-4 text-[#556B2F]" />
                            </div>
                            <p className="text-[10px] font-[1000] text-slate-900 uppercase tracking-[0.4em]">Neural Core Synthesis</p>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                            Verified Exploration Protocol <span className="text-[#556B2F]">v5.0 Active</span>. <br />
                            Synchronizing global transit nodes for precision routing.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#556B2F] animate-pulse shadow-[0_0_15px_rgba(85,107,47,0.4)]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    </div>
                </div>
            </div>
          </motion.div>

          {/* Right: Floating Images Collage */}
          <div className="hidden lg:block lg:col-span-6 xl:col-span-7 relative h-[550px]">
            <motion.div style={{ y: y1 }} className="absolute top-10 right-20 w-[280px] h-[380px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-white z-20 transform rotate-3">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <img src={DESTINATION_IMAGES[0]} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt="Paris" />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-black text-2xl tracking-tight mb-1">Paris</p>
                <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                  <MapPinIcon className="w-4 h-4" /> France
                </div>
              </div>
            </motion.div>

            <motion.div style={{ y: y2 }} className="absolute bottom-20 left-10 w-[240px] h-[320px] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-8 border-white z-10 transform -rotate-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
              <img src={DESTINATION_IMAGES[2]} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110" alt="Kyoto" />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <p className="font-black text-2xl tracking-tight mb-1">Kyoto</p>
                <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                  <MapPinIcon className="w-4 h-4" /> Japan
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 left-1/3 w-[180px] h-[180px] rounded-full overflow-hidden shadow-2xl border-8 border-white z-30"
            >
              <img src={DESTINATION_IMAGES[1]} className="w-full h-full object-cover" alt="Dubai" />
            </motion.div>
            
            {/* Glassmorphism Badge */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
              className="absolute top-1/3 right-10 z-40 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white flex items-center gap-4"
            >
              <div className="p-3 bg-gradient-to-br from-olive-400 to-red-500 rounded-2xl text-white shadow-lg">
                <GlobeAltIcon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Generated</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">100% Custom</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        BENTO GRID FEATURES
        ========================================
      */}
      <section className="pt-10 pb-24 md:py-32 tb-section-tight relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto mb-32 md:mb-28 tb-compact-header">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-900 text-[#556B2F] mb-8 font-black shadow-2xl shadow-slate-200"
            >
              🚀
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-7xl font-[1000] text-slate-900 mb-8 tracking-tighter leading-[0.9]"
            >
              Everything you need. <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-400">Beautifully organized.</span>
            </motion.h2>
            <p className="text-sm md:text-lg text-slate-400 font-black uppercase tracking-[0.4em] px-4 opacity-60">Architecting the future of personal exploration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[340px]">
            {/* Large Card - Spans 2 columns on lg */}
            <BentoCard
              title="Smart Itineraries"
              description="Our AI understands your vibe, creating minute-by-minute plans that balance famous landmarks with hidden local gems."
              icon={SparklesIcon}
              color="from-olive-400 to-rose-400"
              className="lg:col-span-2 bg-gradient-to-br from-[#fff5f0] to-white"
              delay={0.1}
            />
            
            <BentoCard
              title="Curated Stays"
              description="Boutique hotels to luxury resorts, perfectly matched to your budget."
              icon={HomeIcon}
              color="from-blue-400 to-indigo-500"
              delay={0.2}
            />

            <BentoCard
              title="Gastronomic Magic"
              description="Never eat a bad meal again. From street food to Michelin stars."
              icon={HeartIcon}
              color="from-pink-400 to-rose-500"
              delay={0.3}
            />

            <BentoCard
              title="Budget Tracking"
              description="Keep your finances in check with our intuitive budget visualizer."
              icon={BanknotesIcon}
              color="from-emerald-400 to-teal-500"
              delay={0.4}
            />

            <BentoCard
              title="Offline Access"
              description="Download your entire trip plan as a sleek PDF for when you're off the grid."
              icon={ArrowDownTrayIcon}
              color="from-purple-400 to-indigo-500"
              delay={0.5}
            />
          </div>
        </div>
      </section>

      {/* 
        ========================================
        SCROLLING MARQUEE
        ========================================
      */}
      <section className="py-20 bg-gray-900 overflow-hidden transform -skew-y-3 my-10 relative z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-transparent to-gray-900 z-10 w-full h-full pointer-events-none" />
        <div className="flex whitespace-nowrap overflow-hidden">
          <motion.div
            animate={{ x: [0, -1030] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 md:gap-20 items-center text-4xl md:text-7xl font-[900] text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 uppercase tracking-widest pl-10"
          >
            <span>Explore The World</span>
            <span className="text-olive-500/40">✦</span>
            <span>AI Travel Planning</span>
            <span className="text-olive-500/40">✦</span>
            <span>Discover Hidden Gems</span>
            <span className="text-olive-500/40">✦</span>
            <span>Smart Routing</span>
            <span className="text-olive-500/40">✦</span>
            <span>Explore The World</span>
            <span className="text-olive-500/40">✦</span>
            <span>AI Travel Planning</span>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================
        PREMIUM CTA
        ========================================
      */}
      <section className="py-32 md:py-48 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 40 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-24 text-center relative overflow-hidden bg-white shadow-[0_20px_80px_-15px_rgba(0,0,0,0.1)] border border-gray-100"
          >
            {/* Dynamic CTA Background */}
            <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-olive-200 to-pink-200 opacity-40 rounded-full blur-3xl -mr-20 -mt-20 md:-mr-40 md:-mt-40" />
            <div className="absolute bottom-0 left-0 w-64 md:w-80 h-64 md:h-80 bg-gradient-to-tr from-blue-200 to-purple-200 opacity-40 rounded-full blur-3xl -ml-20 -mb-20 md:-ml-40 md:-mb-40" />
            
            <div className="relative z-10 block">
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-[900] text-gray-900 mb-6 md:mb-8 tracking-tight leading-[1.1]">
                    Your next adventure is <br className="hidden sm:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-600 to-[#556B2F]">one click away.</span>
                  </h2>
              <p className="text-lg md:text-2xl text-gray-500 font-medium mb-8 md:mb-12 max-w-2xl mx-auto px-2">
                Join thousands of travelers who are planning their trips faster, smarter, and beautifully.
              </p>
              
              <Link 
                to={isAuthenticated ? "/planner" : "/register"} 
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 md:px-12 md:py-6 bg-gray-900 text-white rounded-full font-bold text-base md:text-xl hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transform hover:-translate-y-1 active:scale-95"
              >
                <span>Generate Your Trip</span>
                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 
        ========================================
        MODERN FOOTER
        ========================================
      */}
      <footer className="py-12 bg-white border-t border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-6">
          <div className="flex items-center gap-3 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-[#556B2F] shadow-[0_0_10px_#556B2F]" />
              </div>
            </div>
            <span className="font-[1000] text-xl tracking-tighter text-gray-900">
              Trip<span className="text-[#556B2F] italic ml-0.5">Nova</span>
            </span>
          </div>
          
          <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 text-center">
            © 2026 TripNova. Designed with precision.
          </div>
          
          <div className="flex gap-6 md:gap-8 text-[10px] md:text-sm font-black uppercase tracking-widest text-gray-500">
            <Link to="#" className="hover:text-olive-500 transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-olive-500 transition-colors">Terms</Link>
            <Link to="#" className="hover:text-olive-500 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


