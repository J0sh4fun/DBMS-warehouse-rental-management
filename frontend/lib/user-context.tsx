'use client';

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppRole,
  authApi,
  clearStoredAuth,
  getStoredAuth,
  LoginRequest,
  RegisterRequest,
  roleFromBackend,
  saveStoredAuth,
  StoredAuth,
} from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AppRole;
  company?: string;
}

interface UserContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<User>;
  registerCustomer: (request: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function toUser(auth: StoredAuth): User {
  const role = roleFromBackend(auth.userRole);
  return {
    id: String(auth.userId),
    name: auth.username,
    email: `${auth.username}@local`,
    avatar: initials(auth.username),
    role,
    company: role === 'admin' ? 'Warehouse Admin' : 'Customer Tenant',
  };
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getStoredAuth();
    setCurrentUser(auth ? toUser(auth) : null);
    setLoading(false);
  }, []);

  const login = async (request: LoginRequest) => {
    const response = await authApi.login(request);
    const stored: StoredAuth = {
      token: response.token,
      tokenType: response.type || 'Bearer',
      userRole: response.userRole,
      userId: response.userId,
      username: request.username,
    };
    saveStoredAuth(stored);
    const user = toUser(stored);
    setCurrentUser(user);
    return user;
  };

  const registerCustomer = async (request: RegisterRequest) => {
    const response = await authApi.registerCustomer(request);
    const stored: StoredAuth = {
      token: response.token,
      tokenType: response.type || 'Bearer',
      userRole: response.userRole,
      userId: response.userId,
      username: request.username,
    };
    saveStoredAuth(stored);
    const user = toUser(stored);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    clearStoredAuth();
    setCurrentUser(null);
  };

  const value = useMemo(
    () => ({
      currentUser,
      loading,
      isAuthenticated: Boolean(currentUser),
      login,
      registerCustomer,
      logout,
    }),
    [currentUser, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
