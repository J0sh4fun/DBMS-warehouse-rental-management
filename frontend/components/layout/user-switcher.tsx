'use client';

import { useUser } from '@/lib/user-context';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function UserSwitcher() {
  const { currentUser, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
          {currentUser.avatar}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-foreground">{currentUser.name}</div>
          <div className="text-xs text-muted-foreground">{currentUser.role === 'admin' ? 'Admin' : 'Tenant'}</div>
        </div>
      </div>
      <button onClick={handleLogout} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Logout">
        <LogOut className="w-5 h-5 text-foreground" />
      </button>
    </div>
  );
}
