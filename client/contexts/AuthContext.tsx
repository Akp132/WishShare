'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '@/lib/types';
import { authAPI } from '@/lib/api';
import socketManager from '@/lib/socket';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          setState(prev => ({
            ...prev,
            user,
            token,
            isAuthenticated: true,
          }));
          
          // Verify token with server
          try {
            const response = await authAPI.me();
            const verifiedUser = response.data.user;
            
            setState(prev => ({
              ...prev,
              user: verifiedUser,
              isLoading: false,
            }));
            
            // Connect socket
            socketManager.connect();
          } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setState(prev => ({
              ...prev,
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            }));
          }
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        token,
        isAuthenticated: true,
      }));
      
      // Connect socket
      socketManager.connect();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    console.log('🚀 signup function called with:', { email, password: '***', displayName });
    try {
      console.log('📡 About to call authAPI.signup...');
      const response = await authAPI.signup({ email, password, displayName });
      console.log('✅ authAPI.signup response:', response);
      
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setState(prev => ({
        ...prev,
        user,
        token,
        isAuthenticated: true,
      }));
      
      // Connect socket
      socketManager.connect();
      console.log('✅ signup completed successfully');
    } catch (error: any) {
      console.error('❌ signup error:', error);
      console.error('❌ error response:', error.response);
      throw new Error(error.response?.data?.error || 'Signup failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    // Disconnect socket
    socketManager.disconnect();
  };

  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
    }));
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};