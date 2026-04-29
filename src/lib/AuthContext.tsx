import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, AppUser } from './firebase';

interface AuthContextType {
    user: User | null;
    appUser: AppUser | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, appUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                // Ensure AppUser document exists
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setAppUser(userDoc.data() as AppUser);
                    } else {
                        // Create standard user profile
                        const newAppUser: AppUser = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            role: 'user', // Default role. Admin would be manually set via firestore initially
                            displayName: firebaseUser.displayName || '',
                            createdAt: Date.now(),
                        };
                        try {
                            await setDoc(userDocRef, newAppUser);
                            setAppUser(newAppUser);
                        } catch (error) {
                            console.error('Error creating app user document:', error);
                            // If they can't create it due to rules (e.g. unverified email), handle it
                            setAppUser(null);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user doc:', error);
                }
            } else {
                setAppUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, appUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
