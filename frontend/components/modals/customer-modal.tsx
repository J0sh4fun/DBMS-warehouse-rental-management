'use client';

import React from "react"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/lib/mock-data';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer;
  mode: 'add' | 'edit' | 'view';
}

export function CustomerModal({ isOpen, onClose, onSave, initialData, mode }: CustomerModalProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(
    initialData || {
      id: '',
      name: '',
      email: '',
      phone: '',
      warehousesRented: 0,
      rentalDuration: '',
      joinDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'warehousesRented' || name === 'totalSpent' ? Number(value) : value,
    });
  };

  const handleSave = () => {
    if (formData.id && formData.name && formData.email) {
      onSave(formData as Customer);
      onClose();
    }
  };

  const isViewOnly = mode === 'view';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Customer' : mode === 'edit' ? 'Edit Customer' : 'Customer Details'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Create a new customer account' : mode === 'edit' ? 'Update customer information' : 'View customer details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Customer ID</Label>
            <Input
              id="id"
              name="id"
              value={formData.id || ''}
              onChange={handleChange}
              placeholder="e.g., CUST-007"
              disabled={isViewOnly || mode === 'edit'}
            />
          </div>

          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g., ABC Logistics"
              disabled={isViewOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="contact@company.com"
                disabled={isViewOnly}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warehousesRented">Warehouses Rented</Label>
              <Input
                id="warehousesRented"
                name="warehousesRented"
                type="number"
                value={formData.warehousesRented || 0}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div>
              <Label htmlFor="rentalDuration">Rental Duration</Label>
              <Input
                id="rentalDuration"
                name="rentalDuration"
                value={formData.rentalDuration || ''}
                onChange={handleChange}
                placeholder="e.g., 12 months"
                disabled={isViewOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="joinDate">Join Date</Label>
              <Input
                id="joinDate"
                name="joinDate"
                type="date"
                value={formData.joinDate || ''}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
            <div>
              <Label htmlFor="totalSpent">Total Spent ($)</Label>
              <Input
                id="totalSpent"
                name="totalSpent"
                type="number"
                value={formData.totalSpent || 0}
                onChange={handleChange}
                disabled={isViewOnly}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {isViewOnly ? 'Close' : 'Cancel'}
          </Button>
          {!isViewOnly && (
            <Button onClick={handleSave} className="bg-sidebar-primary hover:bg-sidebar-primary/90">
              {mode === 'add' ? 'Add Customer' : 'Save Changes'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
