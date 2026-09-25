import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import icon from '../../assets/icons/icon.png';

export default function AdminLogin() {
  const { loginWithEmail, resetPassword, loginWithGoogle } = useAuth();
  
  // Modos: 'login' | 'forgot'
  const [mode, setMode] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const formatAuthError = (err) => {
    const code = err.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'E-mail ou senha incorretos. Verifique os dados digitados.';
    }
    if (code === 'auth/invalid-email') {
      return 'Formato de e-mail inválido.';
    }
    if (code === 'auth/user-disabled') {
      return 'Esta conta de usuário foi desativada pelo administrador.';
    }
    if (code === 'auth/operation-not-allowed') {
      return 'O provedor "E-mail/senha" precisa ser ativado no Firebase Console (Authentication > Sign-in method).';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'A janela do Google foi fechada antes de concluir o login.';
    }
    return err.message || 'Ocorreu um erro ao realizar o login.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setErrorMessage('Por favor, informe seu e-mail para receber o link de redefinição.');
          setIsSubmitting(false);
          return;
        }
        await resetPassword(email);
        setSuccessMessage(`Enviamos um link de redefinição de senha para "${email}". Verifique sua caixa de entrada e spam.`);
        setIsSubmitting(false);
        return;
      }

      // Login com E-mail e Senha pré-cadastrados no banco
      await loginWithEmail(email, password);
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await loginWithGoogle();
    } catch (err) {
      setErrorMessage(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col justify-center items-center p-6 selection:bg-[#fee64b]">
      {/* Luzes de Fundo Estéticas */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#fd6011]/8 via-[#fee64b]/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="fixed bottom-0 right-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#32a8e9]/8 via-[#fee64b]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#2d231a]/10 relative overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="text-center mb-7 relative z-10">
          <div className="inline-flex items-center justify-center p-3 bg-[#faf8f5] rounded-2xl mb-3 border border-[#fd6011]/20 shadow-xs">
            <img src={icon} alt="Adriana Catalani" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d231a]">
            Agenda do Consultório
          </h1>
          <p className="text-xs text-[#2d231a]/70 mt-1 flex items-center justify-center gap-1.5 font-medium">
            <Lock size={13} className="text-[#fd6011]" />
            Acesso restrito à Dra. Adriana Catalani
          </p>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORMULÁRIO DE LOGIN (APENAS E-MAIL E SENHA PRÉ-CADASTRADOS) */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-black text-[#2d231a] mb-1.5">
              E-mail
            </label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="seuemail@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full pl-9 pr-3.5 py-3 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-semibold text-[#2d231a] focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 transition-all"
              />
              <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {mode === 'login' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-[#2d231a]">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-[11px] font-bold text-[#fd6011] hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Digite sua senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-10 py-3 bg-[#faf8f5] border border-[#2d231a]/10 rounded-2xl text-xs font-semibold text-[#2d231a] focus:outline-none focus:ring-2 focus:ring-[#fd6011]/30 transition-all"
                />
                <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  title={showPassword ? "Ocultar senha" : "Ver senha"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#fd6011] to-[#ff7a38] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md shadow-[#fd6011]/25 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : mode === 'login' ? (
              <span>Entrar na Agenda</span>
            ) : (
              <span>Enviar Link de Redefinição</span>
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className="w-full text-center text-xs font-bold text-gray-500 hover:text-black py-1 cursor-pointer"
            >
              Voltar ao login
            </button>
          )}
        </form>

        {/* Divisor Visual */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[11px] font-bold text-gray-400 uppercase">
            ou acesse com
          </span>
        </div>

        {/* Botão Alternativo: Login com Google */}
        <button
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 text-[#2d231a] font-bold text-xs shadow-2xs hover:shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Entrar com Gmail</span>
        </button>

        {/* Link para voltar ao site */}
        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#2d231a]/60 hover:text-[#fd6011] transition-colors font-bold"
          >
            <ArrowLeft size={14} />
            Voltar para o site da Dra. Adriana
          </Link>
        </div>

      </div>
    </div>
  );
}
