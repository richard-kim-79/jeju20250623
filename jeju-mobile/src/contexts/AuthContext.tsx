import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  socialLogin: (idToken: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // 앱 시작 시 저장된 토큰 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          token,
          isLoading: false,
          isAuthenticated: true,
        });

        // 토큰 유효성 확인
        try {
          await authAPI.getProfile();
        } catch (error) {
          // 토큰이 유효하지 않으면 로그아웃
          await logout();
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    } catch (error) {
      console.error('인증 상태 확인 실패:', error);
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authAPI.login(email, password);
      const { token, user } = response;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authAPI.signup(email, password, username);
      const { token, user } = response;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const socialLogin = async (idToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const response = await authAPI.socialLogin(idToken);
      const { token, user } = response;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        user,
        token,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');

      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    socialLogin,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 