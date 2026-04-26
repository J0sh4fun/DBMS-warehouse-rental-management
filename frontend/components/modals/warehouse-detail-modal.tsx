'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Warehouse } from '@/lib/mock-data';
import { MapPin, Box, Zap, Calendar } from 'lucide-react';

interface WarehouseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouse?: Warehouse;
}

export function WarehouseDetailModal({ isOpen, onClose, warehouse }: WarehouseDetailModalProps) {
  if (!warehouse) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{warehouse.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {warehouse.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto flex-1 pr-4">
          {/* Status and Occupancy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Status</p>
              <Badge className={warehouse.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                {warehouse.status}
              </Badge>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Occupancy Rate</p>
              <p className="text-2xl font-bold text-foreground">{warehouse.occupancy}%</p>
            </div>
          </div>

          {/* Warehouse Details */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-4">Warehouse Specifications</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Box className="w-5 h-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-medium text-foreground">{warehouse.capacity.toLocaleString()} m²</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-sidebar-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Rental Price</p>
                  <p className="font-medium text-foreground">${warehouse.rentalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Bar */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-foreground">Space Usage</p>
              <p className="text-sm font-medium text-foreground">{warehouse.occupancy}% Used</p>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-sidebar-primary h-3 rounded-full"
                style={{ width: `${warehouse.occupancy}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((warehouse.capacity * warehouse.occupancy) / 100).toLocaleString()} m² used out of {warehouse.capacity.toLocaleString()} m²
            </p>
          </div>

          {/* Description */}
          {warehouse.description && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-foreground mb-2">Description</h3>
              <p className="text-sm text-foreground leading-relaxed">{warehouse.description}</p>
            </div>
          )}

          {/* Quick Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-foreground">
              📋 For more details or to modify your rental agreement, please contact the admin support team.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90">
            Manage Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
