'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings } from 'lucide-react';
import { UserSwitcher } from './user-switcher';
import { adminApi, customerApi, formatError, RentalRequestResponse } from '@/lib/api';
import { useUser } from '@/lib/user-context';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function storageKey(userId: string, role: string) {
  return `warehousehub.notifications.read.${role}.${userId}`;
}

function getReadIds(key: string) {
  if (typeof window === 'undefined') return new Set<string>();
  try {
    return new Set<string>(JSON.parse(window.localStorage.getItem(key) || '[]'));
  } catch {
    return new Set<string>();
  }
}

function saveReadIds(key: string, ids: Set<string>) {
  window.localStorage.setItem(key, JSON.stringify(Array.from(ids)));
}

function buildAdminNotification(request: RentalRequestResponse): NotificationItem {
  return {
    id: `admin-rental-request-${request.requestId}`,
    title: `${request.customerName} requested ${request.warehouseName}`,
    body: `${request.startDate} - ${request.endDate} - ${Number(request.rentalPrice).toLocaleString()}`,
    href: '/admin/rental-requests',
    createdAt: request.createdAt,
  };
}

function buildCustomerNotification(request: RentalRequestResponse): NotificationItem {
  const approved = request.status === 'Approved';
  return {
    id: `customer-rental-request-${request.requestId}-${request.status}`,
    title: approved ? `Request #${request.requestId} was approved` : `Request #${request.requestId} was rejected`,
    body: approved && request.contractId ? `Contract #${request.contractId} created for ${request.warehouseName}` : request.reviewNote || request.warehouseName,
    href: '/rental-requests',
    createdAt: request.reviewedAt || request.createdAt,
  };
}

export function Header({ title, subtitle }: HeaderProps) {
  const { currentUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const readStorageKey = useMemo(
    () => (currentUser ? storageKey(currentUser.id, currentUser.role) : ''),
    [currentUser]
  );

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const nextItems =
        currentUser.role === 'admin'
          ? (await adminApi.rentalRequests('Pending')).map(buildAdminNotification)
          : (await customerApi.rentalRequests())
              .filter((request) => request.status === 'Approved' || request.status === 'Rejected')
              .map(buildCustomerNotification);
      setItems(nextItems);
      setError('');
    } catch (err) {
      setError(formatError(err));
    }
  }, [currentUser]);

  useEffect(() => {
    if (!readStorageKey) return;
    setReadIds(getReadIds(readStorageKey));
  }, [readStorageKey]);

  useEffect(() => {
    refreshNotifications();
    const interval = window.setInterval(refreshNotifications, 30000);
    window.addEventListener('focus', refreshNotifications);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshNotifications);
    };
  }, [pathname, refreshNotifications]);

  const unreadCount = items.filter((item) => !readIds.has(item.id)).length;
  const visibleItems = showUnreadOnly ? items.filter((item) => !readIds.has(item.id)) : items;

  const markRead = (id: string) => {
    if (!readStorageKey) return;
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    saveReadIds(readStorageKey, next);
  };

  const markAllRead = () => {
    if (!readStorageKey) return;
    const next = new Set(readIds);
    items.forEach((item) => next.add(item.id));
    setReadIds(next);
    saveReadIds(readStorageKey, next);
  };

  const openNotification = (item: NotificationItem) => {
    markRead(item.id);
    setOpen(false);
    router.push(item.href);
  };

  return (
    <header className="bg-card border-b border-border px-8 py-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            className="relative rounded-lg p-2 transition-colors hover:bg-muted"
            onClick={() => setOpen((value) => !value)}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-center text-xs font-bold leading-none text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          {open && (
            <div className="absolute right-0 top-12 z-50 w-96 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
              <div className="border-b border-border p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">Notifications</h2>
                  <button className="text-sm font-medium text-primary hover:underline" onClick={markAllRead}>
                    Mark all read
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    className={`rounded-full px-3 py-1 text-sm font-medium ${!showUnreadOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                    onClick={() => setShowUnreadOnly(false)}
                  >
                    All
                  </button>
                  <button
                    className={`rounded-full px-3 py-1 text-sm font-medium ${showUnreadOnly ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}
                    onClick={() => setShowUnreadOnly(true)}
                  >
                    Unread
                  </button>
                </div>
              </div>
              <div className="max-h-[420px] overflow-auto p-2">
                {error ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</div>
                ) : visibleItems.length === 0 ? (
                  <p className="px-3 py-6 text-sm text-muted-foreground">No notifications.</p>
                ) : (
                  visibleItems.map((item) => {
                    const unread = !readIds.has(item.id);
                    return (
                      <button
                        key={item.id}
                        className="flex w-full gap-3 rounded-md px-3 py-3 text-left hover:bg-muted"
                        onClick={() => openNotification(item)}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bell className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.body}</p>
                          <p className="mt-1 text-xs font-medium text-primary">{formatDateTime(item.createdAt)}</p>
                        </div>
                        {unread && <span className="mt-4 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <button className="p-2 hover:bg-muted rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
        <UserSwitcher />
      </div>
    </header>
  );
}
