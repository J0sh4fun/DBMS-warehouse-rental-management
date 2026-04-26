'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, mockUsers, defaultUser } from './mock-users';

interface UserContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  allUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        allUsers: mockUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
