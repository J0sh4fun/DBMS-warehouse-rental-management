'use client';

import React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Order) => void;
  mode: 'add';
}

export function OrderModal({ isOpen, onClose, onSave, mode }: OrderModalProps) {
  const [formData, setFormData] = useState<Order>({
    id: `#ORD-${String(Math.floor(Math.random() * 10000)).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customer: '',
    items: [{ productName: '', quantity: 1, price: 0 }],
    total: 0,
    status: 'Pending',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    if (field === 'quantity' || field === 'price') {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    
    const total = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      total,
    }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productName: '', quantity: 1, price: 0 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const total = newItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    setFormData((prev) => ({
      ...prev,
      items: newItems,
      total,
    }));
  };

  const handleSave = () => {
    if (formData.customer.trim() === '' || formData.items.some(item => !item.productName.trim())) {
      alert('Please fill in all required fields');
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>Add a new order with products and details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer Name *</Label>
              <Input
                id="customer"
                name="customer"
                placeholder="Enter customer name"
                value={formData.customer}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Order Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Order Items</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                className="gap-1 bg-transparent"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-muted rounded-md">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Product Name</Label>
                    <Input
                      placeholder="Product name"
                      value={item.productName}
                      onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                      size="sm"
                      className="h-8"
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="w-24 space-y-1">
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="text-right w-20">
                    <p className="text-xs text-muted-foreground mb-1">Subtotal</p>
                    <p className="font-semibold text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 hover:bg-background rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sidebar-primary/10 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-sidebar-primary">${formData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90" onClick={handleSave}>
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
