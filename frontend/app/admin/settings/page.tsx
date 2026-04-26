'use client';

import React from "react"

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Lock, Bell, Users, BarChart3 } from 'lucide-react';

export default function AdminSettings() {
  const [savedStatus, setSavedStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState({
    companyName: 'WarehouseHub Management',
    email: 'admin@warehousehub.com',
    phone: '(555) 999-0000',
    address: '123 Business Ave, New York, NY 10001',
    currency: 'USD',
    taxRate: 8.5,
    maintenanceFee: 2.5,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSave = () => {
    setSavedStatus('success');
    setTimeout(() => setSavedStatus('idle'), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage platform and business settings</p>
        </div>

        {/* Notification */}
        {savedStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <Input
                  name="companyName"
                  value={settings.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <Input
                  name="email"
                  type="email"
                  value={settings.email}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  name="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={handleChange}
                  placeholder="(555) 000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Input
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  placeholder="123 Business Ave"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Business Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>JPY</option>
                  <option>VND</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
                <Input
                  name="taxRate"
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={handleChange}
                  placeholder="8.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Maintenance Fee (%)</label>
                <Input
                  name="maintenanceFee"
                  type="number"
                  step="0.1"
                  value={settings.maintenanceFee}
                  onChange={handleChange}
                  placeholder="2.5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Two-Factor Authentication</label>
              <div className="flex items-center justify-between p-3 border border-border rounded-md">
                <span className="text-sm">Enhance account security with 2FA</span>
                <Button variant="outline">Enable</Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Change Password</label>
              <Button variant="outline">Reset Password</Button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Active Sessions</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="text-sm font-medium">Current Session</p>
                    <p className="text-xs text-muted-foreground">Chrome on Windows</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Current
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { label: 'New contracts created', checked: true },
                { label: 'Contract expiration reminders', checked: true },
                { label: 'Payment received notifications', checked: true },
                { label: 'Monthly revenue reports', checked: false },
                { label: 'System maintenance alerts', checked: true },
              ].map((notif, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked={notif.checked} className="w-4 h-4 rounded border-border" />
                  <label className="text-sm">{notif.label}</label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Admin Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'John Administrator', email: 'john@warehousehub.com', role: 'Super Admin' },
                { name: 'Sarah Manager', email: 'sarah@warehousehub.com', role: 'Admin' },
              ].map((user, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-border rounded-md">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-sidebar-accent text-sidebar-accent-foreground rounded text-xs">{user.role}</span>
                </div>
              ))}
              <Button className="w-full mt-2 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
                Add New Admin User
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button onClick={handleSave} className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
          <Button variant="outline">Cancel</Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
