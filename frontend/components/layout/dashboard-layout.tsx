'use client';

import React from "react"

import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  headerTitle: string;
  headerSubtitle?: string;
}

export function DashboardLayout({
  children,
  headerTitle,
  headerSubtitle,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={headerTitle} subtitle={headerSubtitle} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
