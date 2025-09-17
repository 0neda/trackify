'use client';

import { ApiError, authApi, User } from '@/lib/api';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
   user: User | null;
   token: string | null;
   isLoading: boolean;
   isAuthenticated: boolean;
   login: (username: string, password: string) => Promise<void>;
   register: (username: string, password: string, email?: string) => Promise<void>;
   logout: () => void;
   error: string | null;
   clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
   const [user, setUser] = useState<User | null>(null);
   const [token, setToken] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const isAuthenticated = !!user;

   // Load user from token on app start
   useEffect(() => {
      let isMounted = true;

      const verifyUser = async () => {
         const storedToken = localStorage.getItem('auth_token');
         if (storedToken) {
            try {
               // Set token immediately for subsequent API calls
               if (isMounted) {
                  setToken(storedToken);
               }
               const userData = await authApi.getProfile(storedToken);
               if (isMounted) {
                  setUser(userData);
               }
            } catch (error) {
               console.error("Authentication Error: Invalid token. Logging out.", error);
               localStorage.removeItem('auth_token');
               if (isMounted) {
                  setUser(null);
                  setToken(null);
               }
            }
         }
         // Only set loading to false after all checks are done
         if (isMounted) {
            setIsLoading(false);
         }
      };

      verifyUser();

      return () => {
         isMounted = false;
      };
   }, []);

   const login = async (username: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
         const response = await authApi.login({ username, password });
         localStorage.setItem('auth_token', response.access_token);
         setToken(response.access_token);

         // Get user profile
         const userData = await authApi.getProfile(response.access_token);
         setUser(userData);
      } catch (error) {
         if (error instanceof ApiError) {
            setError(error.message);
         } else {
            setError('Falha no login. Tente novamente.');
         }
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   const register = async (username: string, password: string, email?: string) => {
      setIsLoading(true);
      setError(null);

      try {
         const response = await authApi.register({ username, password, email });
         localStorage.setItem('auth_token', response.access_token);
         setToken(response.access_token);

         // Get user profile
         const userData = await authApi.getProfile(response.access_token);
         setUser(userData);
      } catch (error) {
         if (error instanceof ApiError) {
            setError(error.message);
         } else {
            setError('Falha no cadastro. Tente novamente.');
         }
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   const logout = () => {
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
      setError(null);
   };

   const clearError = () => {
      setError(null);
   };

   const value: AuthContextType = {
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      error,
      clearError,
   };

   return (
      <AuthContext.Provider value={value}>
         {children}
      </AuthContext.Provider>
   );
}

export function useAuth() {
   const context = useContext(AuthContext);
   if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
}
