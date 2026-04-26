'use client';

import React from "react"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Warehouse } from '@/lib/mock-data';
import { X } from 'lucide-react';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: Warehouse) => void;
  initialData?: Warehouse;
  mode: 'add' | 'edit';
}

export function WarehouseModal({ isOpen, onClose, onSave, initialData, mode }: WarehouseModalProps) {
  const [formData, setFormData] = useState<Partial<Warehouse>>(
    initialData || {
      id: '',
      name: '',
      location: '',
      capacity: 0,
      rentalPrice: 0,
      status: 'Available',
      occupancy: 0,
      description: '',
    }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'capacity' || name === 'rentalPrice' || name === 'occupancy' ? Number(value) : value,
    });
  };

  const handleSave = () => {
    if (formData.id && formData.name && formData.location) {
      onSave(formData as Warehouse);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Warehouse' : 'Edit Warehouse'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Create a new warehouse property' : 'Update warehouse details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="id">Warehouse ID</Label>
            <Input
              id="id"
              name="id"
              value={formData.id || ''}
              onChange={handleChange}
              placeholder="e.g., WH-07"
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <Label htmlFor="name">Warehouse Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="e.g., Downtown Hub"
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              placeholder="e.g., New York, NY"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity">Capacity (m²)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity || 0}
                onChange={handleChange}
                placeholder="5000"
              />
            </div>
            <div>
              <Label htmlFor="rentalPrice">Rental Price/Month ($)</Label>
              <Input
                id="rentalPrice"
                name="rentalPrice"
                type="number"
                value={formData.rentalPrice || 0}
                onChange={handleChange}
                placeholder="2500"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Add warehouse details..."
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-sidebar-primary hover:bg-sidebar-primary/90">
            {mode === 'add' ? 'Add Warehouse' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
