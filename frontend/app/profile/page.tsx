'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/user-context';
import { clearStoredAuth, getStoredAuth } from '@/lib/api';
import { KeyRound, Mail, Shield, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { currentUser, logout } = useUser();
  const router = useRouter();
  const auth = getStoredAuth();

  const handleLogout = () => {
    clearStoredAuth();
    logout();
    router.push('/login');
  };

  return (
    <DashboardLayout headerTitle="Profile" headerSubtitle="Account information from your current login token.">
      <div className="max-w-4xl space-y-6 p-8">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Backend currently exposes authentication data through JWT login, not a separate profile API.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-2xl font-bold">{currentUser?.name || 'Unknown user'}</h3>
                <p className="mt-1 flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {currentUser?.email || 'No email from token'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserRound className="h-4 w-4" />
                User ID
              </p>
              <p className="mt-2 font-semibold">{currentUser?.id || auth?.userId || '-'}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Role
              </p>
              <p className="mt-2 font-semibold">{currentUser?.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <KeyRound className="h-4 w-4" />
                Token Type
              </p>
              <p className="mt-2 font-semibold">{auth?.tokenType || 'Bearer'}</p>
            </div>
            <div className="rounded-md border p-4">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                Backend Authority
              </p>
              <p className="mt-2 font-semibold">{auth?.userRole || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout}>
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
