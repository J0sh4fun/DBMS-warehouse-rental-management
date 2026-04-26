'use client';

import React from "react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Product {
  id: number;
  productName: string;
  category: string;
  quantity: number;
  warehouse: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialData?: Product;
  mode: 'add' | 'edit';
}

export function ProductModal({ isOpen, onClose, onSave, initialData, mode }: ProductModalProps) {
  const [formData, setFormData] = useState<Product>(
    initialData || {
      id: Math.random(),
      productName: '',
      category: '',
      quantity: 0,
      warehouse: '',
      status: 'In Stock',
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) : value,
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new product to your inventory' : 'Update product information'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              name="productName"
              placeholder="Enter product name"
              value={formData.productName}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Input
              id="category"
              name="category"
              placeholder="e.g., Electronics, Tools, Accessories"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="0"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse">Warehouse *</Label>
            <select
              id="warehouse"
              name="warehouse"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              value={formData.warehouse}
              onChange={handleInputChange}
            >
              <option value="">Select a warehouse</option>
              <option value="Warehouse A">Warehouse A</option>
              <option value="Warehouse B">Warehouse B</option>
              <option value="Warehouse C">Warehouse C</option>
              <option value="Warehouse D">Warehouse D</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90" onClick={handleSave}>
            {mode === 'add' ? 'Add Product' : 'Update Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
