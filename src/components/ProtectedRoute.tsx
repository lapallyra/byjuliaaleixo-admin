import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LogIn, ArrowLeft } from 'lucide-react';
import { login } from '../lib/firebase';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    console.log('[Guard] ProtectedRoute State:', { 
      path: location.pathname, 
      loading, 
      authenticated: !!user, 
      isAdmin,
      userEmail: user?.email 
    });
  }, [location.pathname, loading, user, isAdmin]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white">
        <div className="w-12 h-12 border-4 border-lilac border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-lilac">Verificando Credenciais...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-lilac/10 rounded-[2rem] flex items-center justify-center mb-6 border border-lilac/20">
          <LogIn className="text-lilac" size={40} />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Painel Restrito</h2>
        <p className="text-slate-400 mb-8 max-w-sm font-sans text-xs uppercase tracking-widest leading-loose">
          Você precisa estar autenticado para acessar a área administrativa.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`${isLoggingIn ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'} bg-lilac text-black font-bold py-4 px-10 rounded-2xl transition-all shadow-[0_20px_60px_rgba(233,213,255,0.3)] uppercase tracking-widest text-[10px] flex items-center justify-center gap-2`}
          >
            {isLoggingIn && <div className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />}
            {isLoggingIn ? 'Carregando...' : 'Entrar com Google'}
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-slate-500 hover:text-white transition-all text-[9px] uppercase font-black tracking-[0.3em] mt-4 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={12} /> Sair da Área Restrita
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-500/20">
          <span className="text-4xl">🚫</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Acesso Negado</h1>
        <p className="text-slate-400 mb-8 max-w-sm font-sans text-xs uppercase tracking-widest leading-loose">
          Sua conta ({user.email}) não possui permissões administrativas. Entre em contato com o suporte se isso for um erro.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-white text-black font-bold py-4 px-10 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-[10px]"
          >
            Voltar para Loja
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
