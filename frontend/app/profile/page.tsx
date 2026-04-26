'use client';

import React from "react"

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Edit2, Save } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@warehousehub.com',
    phone: '+1 (555) 123-4567',
    company: 'ABC Logistics Inc.',
    address: '123 Commerce Street',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
  };

  return (
    <DashboardLayout
      headerTitle="Profile Settings"
      headerSubtitle="Manage your account and preferences"
    >
      <div className="p-8 max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Your account information and settings</CardDescription>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                {isEditing ? (
                  <Save className="w-5 h-5 text-primary" />
                ) : (
                  <Edit2 className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-2xl">
                JD
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">John Doe</h3>
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  john.doe@warehousehub.com
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-card"
              />
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
              <Input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Address</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="bg-card"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">City</label>
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">State</label>
                <Input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Zip Code</label>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="bg-card"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Account Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <h4 className="font-medium text-foreground">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground">Enhance your account security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <h4 className="font-medium text-foreground">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Manage notification preferences</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between py-4">
              <div>
                <h4 className="font-medium text-foreground">Change Password</h4>
                <p className="text-sm text-muted-foreground">Update your password regularly</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
