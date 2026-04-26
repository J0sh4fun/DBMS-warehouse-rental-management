'use client';

import { useState } from 'react';
import { useUser } from '@/lib/user-context';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserSwitcher() {
  const { currentUser, setCurrentUser, allUsers } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
          {currentUser.avatar}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground">{currentUser.role === 'admin' ? 'Admin' : 'Tenant'}</div>
        </div>
        <ChevronDown className="w-4 h-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Admin Users</p>
          </div>
          <div className="p-2 space-y-1">
            {allUsers
              .filter((u) => u.role === 'admin')
              .map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                    currentUser.id === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs opacity-75">{user.email}</div>
                  </div>
                </button>
              ))}
          </div>

          <div className="p-3 border-t border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Tenant Users</p>
          </div>
          <div className="p-2 space-y-1">
            {allUsers
              .filter((u) => u.role === 'tenant')
              .map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full text-left flex items-center gap-2 px-3 py-2 rounded-md transition-colors',
                    currentUser.id === user.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs font-semibold">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs opacity-75">{user.email}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
