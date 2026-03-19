import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch additional user data from Firestore
                let userDocRef = doc(db, 'users', firebaseUser.uid);
                let userDoc = await getDoc(userDocRef);
                
                // If it's a social login (Google) and record doesn't exist, create it automatically
                if (!userDoc.exists() && firebaseUser.providerData.some(p => p.providerId === 'google.com')) {
                    const newUserObj = {
                        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                        email: firebaseUser.email,
                        preferences: {
                            budget: 'moderate',
                            travelStyle: 'cultural',
                            interests: [],
                            aiModel: 'gemini'
                        },
                        createdAt: new Date().toISOString(),
                        authProvider: 'google'
                    };
                    await setDoc(userDocRef, newUserObj);
                    userDoc = await getDoc(userDocRef); // refresh userDoc after creation
                }

                let backendToken = localStorage.getItem('token');

                // Proactively get token if missing
                if (!backendToken) {
                    try {
                        const res = await fetch('/api/auth/firebase-login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                email: firebaseUser.email,
                                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                                firebaseUid: firebaseUser.uid
                            })
                        });

                        if (res.ok) {
                            const data = await res.json();
                            backendToken = data.token;
                            localStorage.setItem('token', backendToken);
                        }
                    } catch (err) {
                        console.error("Token sync failed:", err.message);
                    }
                }

                if (userDoc.exists()) {
                    setUser({ uid: firebaseUser.uid, ...firebaseUser, ...userDoc.data(), backendToken });
                } else {
                    setUser({ ...firebaseUser, backendToken });
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const login = async (email, password) => {
        try {
            // Parallelize Backend and Firebase Login for speed
            const [backendResponse, firebaseResult] = await Promise.all([
                fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                }),
                signInWithEmailAndPassword(auth, email, password)
            ]);
 
            if (!backendResponse.ok) {
                const errorData = await backendResponse.json();
                throw new Error(errorData.message || 'Backend auth failed');
            }
 
            const data = await backendResponse.json();
            localStorage.setItem('token', data.token);
            
            toast.success('Welcome back!');
            return true;
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes('auth/user-not-found')) errorMsg = 'User not found';
            if (errorMsg.includes('auth/wrong-password')) errorMsg = 'Password not entered correctly, enter valid password';
            if (errorMsg.includes('auth/invalid-credential')) errorMsg = 'User or password incorrect. Try again.'; 
            if (errorMsg.includes('buffering timed out')) errorMsg = 'Invalid Email Id or Password';
            
            toast.error(errorMsg || 'Login failed');
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            // Start Backend and Firebase creation in parallel
            const [backendResponse, userCredential] = await Promise.all([
                fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                }),
                createUserWithEmailAndPassword(auth, email, password)
            ]);

            if (!backendResponse.ok) {
                const errorData = await backendResponse.json();
                throw new Error(errorData.message || 'Backend registration failed');
            }

            const data = await backendResponse.json();
            localStorage.setItem('token', data.token);

            const user = userCredential.user;
            await Promise.all([
                updateProfile(user, { displayName: name }),
                setDoc(doc(db, 'users', user.uid), {
                    name,
                    email,
                    preferences: {
                        budget: 'moderate',
                        travelStyle: 'cultural',
                        interests: [],
                        aiModel: 'gemini'
                    },
                    createdAt: new Date().toISOString()
                })
            ]);

            toast.success('Account created successfully!');
            return true;
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes('auth/user-not-found')) errorMsg = 'User not found';
            if (errorMsg.includes('auth/wrong-password')) errorMsg = 'Password not entered correctly, enter valid password';
            if (errorMsg.includes('auth/email-already-in-use')) errorMsg = 'Already registered user';
            if (errorMsg.includes('buffering timed out')) errorMsg = 'Invalid Email Id or Password';
            
            toast.error(errorMsg || 'Registration failed');
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged out successfully.');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore, if not create them
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    name: user.displayName,
                    email: user.email,
                    preferences: {
                        budget: 'moderate',
                        travelStyle: 'cultural',
                        interests: [],
                        aiModel: 'gemini'
                    },
                    createdAt: new Date().toISOString(),
                    authProvider: 'google'
                });
            }

            toast.success('Signed in with Google!');

            // Get backend token for Google user
            const backendRes = await fetch('/api/auth/firebase-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: user.displayName,
                    firebaseUid: user.uid
                })
            });

            if (backendRes.ok) {
                const backendData = await backendRes.json();
                localStorage.setItem('token', backendData.token);
            }

            return true;
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
                return false; // Silently fail if user closed or cancelled
            }
            toast.error(error.message || 'Google Auth Failed');
            return false;
        }
    };

    const value = {
        user,
        loading,
        token: localStorage.getItem('token'),
        login,
        loginWithGoogle,
        register,
        logout,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
