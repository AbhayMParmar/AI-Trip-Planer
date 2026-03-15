import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import TripPlanner from './pages/TripPlanner';
import TripDetails from './pages/TripDetails';
import TripHistory from './pages/TripHistory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Favorites from './pages/Favorites';
import AIAssistant from './pages/AIAssistant';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-[#FBFCFE] relative overflow-hidden flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-2 border-[#556B2F] border-t-transparent rounded-full"
      />
    </div>
  );

  return isAuthenticated ? children : <Login />;
};

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [prevAuth, setPrevAuth] = useState(isAuthenticated);

  const isChatPage = location.pathname === '/chat' && isAuthenticated;

  // Strict Home-First Redirection Logic
  useEffect(() => {
    // If user just logged in and isn't on the Home page, force them there
    if (!prevAuth && isAuthenticated && location.pathname !== '/') {
      navigate('/', { replace: true });
    }
    setPrevAuth(isAuthenticated);
  }, [isAuthenticated, location.pathname, navigate, prevAuth]);

  return (
    <div className="min-h-screen w-screen flex flex-col bg-white selection:bg-olive-100 selection:text-olive-900 relative">
      {!isChatPage && <Navbar />}
      <main className={`flex-grow relative flex flex-col ${isChatPage ? 'pt-0' : 'pt-[50px] md:pt-[70px]'}`}>
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <TripPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <TripHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trip/:id"
              element={
                <ProtectedRoute>
                  <TripDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {!isChatPage && <Footer />}
      </main>

      {!isChatPage && (
        <Link
          to="/chat"
          className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-[100] w-14 h-14 md:w-16 md:h-16 bg-[#556B2F] text-white rounded-[1.8rem] md:rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(245,185,153,0.5)] flex items-center justify-center hover:scale-110 hover:rotate-6 active:scale-95 transition-all group"
        >
          <ChatBubbleLeftRightIcon className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 px-4 py-2 bg-stone-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            AI Assistant
          </span>
        </Link>
      )}

      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={12}
        containerStyle={{
          top: typeof window !== 'undefined' && window.innerWidth < 768 ? 60 : 40,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            color: '#0f172a',
            borderRadius: '1.2rem',
            fontSize: '9px',
            fontWeight: '1000',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            maxWidth: '320px',
            width: 'auto',
            textAlign: 'center',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)',
          },
          success: {
            style: {
              background: 'rgba(34, 197, 94, 0.2)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#15803d',
              boxShadow: '0 0 20px rgba(34, 197, 94, 0.4), 0 10px 30px -5px rgba(34, 197, 94, 0.2)',
            },
            iconTheme: {
              primary: '#15803d',
              secondary: 'transparent',
            },
          },
          error: {
            style: {
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              boxShadow: '0 0 20px rgba(239, 68, 68, 0.4), 0 10px 30px -5px rgba(239, 68, 68, 0.2)',
            },
            iconTheme: {
              primary: '#dc2626',
              secondary: 'transparent',
            },
          },
        }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
