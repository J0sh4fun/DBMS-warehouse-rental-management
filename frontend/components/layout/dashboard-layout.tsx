'use client';

import React, { useEffect } from "react"

import { Sidebar } from './sidebar';
import { Header } from './header';
import { useUser } from '@/lib/user-context';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

export function DashboardLayout({
  children,
  headerTitle,
  headerSubtitle,
}: DashboardLayoutProps) {
  const { currentUser, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login');
    }
    if (!loading && currentUser?.role !== 'admin' && pathname.startsWith('/admin')) {
      router.replace('/dashboard');
    }
    if (!loading && currentUser?.role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
      router.replace('/admin/dashboard');
    }
  }, [currentUser, loading, pathname, router]);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-background text-foreground">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={headerTitle || 'WarehouseHub'} subtitle={headerSubtitle} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
