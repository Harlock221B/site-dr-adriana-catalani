import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // E-mails autorizados (pode ser um ou múltiplos separados por vírgula)
  const rawAdminEmails = import.meta.env.VITE_ADMIN_EMAIL || '';
  const adminEmails = rawAdminEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = currentUser?.email?.toLowerCase() || '';
  // Se VITE_ADMIN_EMAIL estiver definido, valida estritamente contra a lista.
  // Se estiver vazio (desenvolvimento inicial), permite qualquer usuário criado no Firebase Console.
  const isAdmin = adminEmails.length > 0
    ? adminEmails.includes(userEmail)
    : Boolean(currentUser);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Erro na verificação de autenticação:", error);
      setAuthError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const [googleAccessToken, setGoogleAccessToken] = useState(() => {
    return sessionStorage.getItem('drica_gcal_token') || null;
  });

  /**
   * Valida se o e-mail tem permissão de acesso
   */
  const validateAdminAccess = async (user) => {
    const loggedEmail = user?.email?.toLowerCase() || '';
    if (adminEmails.length > 0 && !adminEmails.includes(loggedEmail)) {
      await signOut(auth);
      sessionStorage.removeItem('drica_gcal_token');
      setGoogleAccessToken(null);
      throw new Error(`Acesso negado. O e-mail "${loggedEmail}" não possui permissão de acesso à agenda da Dra. Adriana.`);
    }
  };

  /**
   * Login com E-mail e Senha (apenas para usuários já cadastrados no Firebase Console)
   */
  const loginWithEmail = async (email, password) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase não configurado. Por favor, configure o arquivo .env.local.");
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      await validateAdminAccess(userCredential.user);
      return userCredential.user;
    } catch (error) {
      console.error("Erro ao fazer login com e-mail e senha:", error);
      setAuthError(error.message);
      throw error;
    }
  };

  /**
   * Recuperação de senha por e-mail
   */
  const resetPassword = async (email) => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase não configurado. Por favor, configure o arquivo .env.local.");
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      setAuthError(error.message);
      throw error;
    }
  };

  /**
   * Login com Google
   */
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      throw new Error("Firebase não configurado. Por favor, configure o arquivo .env.local.");
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      if (token) {
        setGoogleAccessToken(token);
        sessionStorage.setItem('drica_gcal_token', token);
      }

      await validateAdminAccess(result.user);
      return result.user;
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setCurrentUser(null);
      setGoogleAccessToken(null);
      sessionStorage.removeItem('drica_gcal_token');
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  const value = {
    currentUser,
    isAdmin,
    adminEmails,
    googleAccessToken,
    loading,
    authError,
    loginWithEmail,
    resetPassword,
    loginWithGoogle,
    logout,
    isConfigured: isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
