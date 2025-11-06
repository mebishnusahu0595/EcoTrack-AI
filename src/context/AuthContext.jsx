import { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured, auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import localStorageService from '../services/localStorage';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usingFirebase, setUsingFirebase] = useState(isFirebaseConfigured);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      // Use Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Use LocalStorage fallback - check if user exists
      const user = localStorageService.getCurrentUser();
      setCurrentUser(user || null); // null if no user logged in
      setLoading(false);
      setUsingFirebase(false);
      console.log('🔧 Using LocalStorage authentication (Firebase not configured)');
    }
  }, []);

  async function signup(email, password, name) {
    if (usingFirebase && auth) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Update profile with name
      if (result.user && name) {
        await updateProfile(result.user, { displayName: name });
      }
      return result;
    } else {
      const user = await localStorageService.signUp(email, password, name);
      setCurrentUser(user);
      return { user };
    }
  }

  async function login(email, password) {
    if (usingFirebase && auth) {
      return signInWithEmailAndPassword(auth, email, password);
    } else {
      const user = await localStorageService.signIn(email, password);
      setCurrentUser(user);
      return { user };
    }
  }

  async function logout() {
    if (usingFirebase && auth) {
      await firebaseSignOut(auth);
      setCurrentUser(null);
    } else {
      await localStorageService.signOut();
      setCurrentUser(null); // No guest user - set to null
    }
  }

  const value = {
    currentUser,
    signup,
    login,
    logout,
    usingFirebase,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
