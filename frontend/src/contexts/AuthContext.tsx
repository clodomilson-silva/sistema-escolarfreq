import { createContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

interface Admin {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'professor';
  disciplinas?: string[];
  ativo: boolean;
  criado_em: string;
  ultimo_login: string | null;
}

interface AuthContextType {
  admin: Admin | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Interceptor para lidar com tokens expirados e implementar retry
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          if (token) {
            console.log('Token expirado, fazendo logout...');
            logout();
            window.location.href = '/login';
          } else if (loading) {
            console.log('Token ainda sendo verificado, aguardando...');
            // Aguardar um pouco e rejeitar o erro para o componente tentar novamente
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [token, loading]);

  // Verificar se há token salvo ao inicializar
  useEffect(() => {
    const verificarToken = async (tokenToVerify: string) => {
      try {
        console.log('Verificando token...', tokenToVerify.substring(0, 20) + '...');
        const response = await api.get('/auth/verify', {
          headers: {
            Authorization: `Bearer ${tokenToVerify}`
          }
        });
        
        if (response.data.success) {
          console.log('Token válido, definindo usuário:', response.data.data.admin);
          setAdmin(response.data.data.admin);
          setToken(tokenToVerify);
          
          // Configurar token no interceptor ANTES de marcar como não carregando
          api.defaults.headers.common['Authorization'] = `Bearer ${tokenToVerify}`;
          console.log('Token configurado no interceptor da API');
        } else {
          console.log('Token inválido, fazendo logout');
          logout();
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
        logout();
      } finally {
        console.log('Finalizando verificação de token');
        setLoading(false);
      }
    };

    const verificarTokenSalvo = async () => {
      const savedToken = Cookies.get('auth_token');
      console.log('Token salvo encontrado:', !!savedToken);
      if (savedToken) {
        await verificarToken(savedToken);
      } else {
        console.log('Nenhum token salvo, definindo loading como false');
        setLoading(false);
      }
    };
    
    verificarTokenSalvo();
  }, []);

  // Configurar interceptor do axios
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, senha: string) => {
    try {
      console.log('Tentando fazer login...');
      const response = await api.post('/auth/login', { email, senha });
      
      if (response.data.success) {
        const { admin: adminData, token: authToken } = response.data.data;
        
        console.log('Login bem-sucedido, definindo estado:', adminData);
        
        // Salvar token no cookie por 24h
        Cookies.set('auth_token', authToken, { expires: 1 });
        
        // Definir estado
        setAdmin(adminData);
        setToken(authToken);
        
        // Aguardar um pouco para garantir que o estado foi atualizado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Estado de login atualizado com sucesso!');
      }
    } catch (error: unknown) {
      console.error('Erro no login:', error);
      
      let mensagem = 'Erro ao fazer login';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: {
            data?: { message?: string };
            status?: number;
          };
        };
        
        if (axiosError.response?.data?.message) {
          mensagem = axiosError.response.data.message;
        } else if (axiosError.response?.status === 401) {
          mensagem = 'Email ou senha inválidos';
        }
      }
      
      throw new Error(mensagem);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    Cookies.remove('auth_token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    admin,
    token,
    login,
    logout,
    isAuthenticated: !loading && !!admin && !!token,
    loading,
    isReady: !loading && (!!admin || !token) // true quando não está carregando e tem admin OU não tem token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
