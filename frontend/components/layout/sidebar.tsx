'use client';

import { useState } from "react"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, Warehouse, ShoppingCart, FileText, User, LogOut, Users, LucideContrast as FileContract, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/user-context';

const tenantNavigation = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Warehouses', href: '/warehouses', icon: Warehouse },
  { label: 'Inventory', href: '/inventory', icon: Package },
  { label: 'Orders', href: '/orders', icon: ShoppingCart },
  { label: 'Reports', href: '/reports', icon: FileText },
];

const adminNavigation = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Warehouses', href: '/admin/warehouses', icon: Warehouse },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Rental Contracts', href: '/admin/contracts', icon: FileContract },
  { label: 'Reports', href: '/admin/reports', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser } = useUser();
  const isAdmin = currentUser.role === 'admin';
  const navigation = isAdmin ? adminNavigation : tenantNavigation;

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <Warehouse className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <span className="font-bold text-lg block">WarehouseHub</span>
            <span className="text-xs opacity-75">{isAdmin ? 'Admin' : 'Tenant'}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link
          href="/profile"
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-md text-sm transition-colors',
            pathname === '/profile'
              ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
              : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground'
          )}
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
