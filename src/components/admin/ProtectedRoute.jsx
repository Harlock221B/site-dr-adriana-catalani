import React from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLogin from './AdminLogin';
import { ShieldAlert, LogOut, ArrowLeft, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { currentUser, isAdmin, loading, isConfigured, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-drica-light flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-drica-orange/30 border-t-drica-orange rounded-full animate-spin"></div>
        <p className="mt-4 text-drica-dark font-medium text-sm animate-pulse">
          Verificando permissões de acesso...
        </p>
      </div>
    );
  }

  // Caso o Firebase ainda não tenha as chaves configuradas no .env.local
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-drica-light flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-amber-200">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
            <KeyRound size={28} />
          </div>
          <h2 className="text-2xl font-bold text-drica-dark mb-2">
            Configuração do Firebase Pendente
          </h2>
          <p className="text-sm text-drica-dark/70 mb-6 leading-relaxed">
            O sistema de banco de dados e autenticação ainda não recebeu as credenciais do seu projeto Firebase.
          </p>
          <div className="bg-amber-50 rounded-xl p-4 text-xs font-mono text-amber-900 mb-6 border border-amber-100">
            Edite o arquivo <strong className="text-amber-800">.env.local</strong> na raiz do projeto com as chaves do seu console Firebase:
            <ul className="list-disc pl-4 mt-2 space-y-1">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_ADMIN_EMAIL (Gmail da Adriana)</li>
            </ul>
          </div>
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-drica-dark text-drica-light rounded-xl font-bold hover:bg-black transition-colors"
          >
            <ArrowLeft size={18} />
            Voltar para o Site
          </Link>
        </div>
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de login
  if (!currentUser) {
    return <AdminLogin />;
  }

  // Se logado mas NÃO for o e-mail autorizado da Adriana
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-drica-light flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-red-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto mb-5">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-drica-dark mb-2">
            Acesso Restrito
          </h2>
          <p className="text-sm text-drica-dark/70 mb-4">
            Esta área é exclusiva para a <strong>Dra. Adriana Catalani</strong>.
          </p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-700 mb-6">
            Conectado como: <br />
            <strong className="font-semibold text-sm">{currentUser.email}</strong>
          </div>
          <div className="space-y-3">
            <button
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-drica-orange text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-sm"
            >
              <LogOut size={18} />
              Entrar com outra conta Gmail
            </button>
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 text-drica-dark rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Voltar para o Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Usuário é a Adriana e está autenticada
  return children;
}

