'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Contract } from '@/lib/mock-data';
import { Calendar, User, MapPin, DollarSign, FileText } from 'lucide-react';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract;
}

export function ContractModal({ isOpen, onClose, contract }: ContractModalProps) {
  if (!contract) return null;

  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Expired: 'bg-red-100 text-red-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Terminated: 'bg-gray-100 text-gray-800',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contract Details
          </DialogTitle>
          <DialogDescription>Contract #{contract.contractNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Contract Status</p>
              <Badge className={statusColors[contract.status]}>
                {contract.status}
              </Badge>
            </div>
            {contract.daysRemaining > 0 && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Days Remaining</p>
                <p className="text-2xl font-bold text-foreground">{contract.daysRemaining}</p>
              </div>
            )}
          </div>

          {/* Contract Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Contract Number</p>
              <p className="font-semibold text-foreground">{contract.contractNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly Rental Price</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {contract.rentalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer ID</p>
                <p className="text-sm text-foreground">{contract.customerId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer Name</p>
                <p className="text-sm font-medium text-foreground">{contract.customerName}</p>
              </div>
            </div>
          </div>

          {/* Warehouse Information */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Warehouse Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Warehouse ID</p>
                <p className="text-sm text-foreground">{contract.warehouseId}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Warehouse Name</p>
                <p className="text-sm font-medium text-foreground">{contract.warehouseName}</p>
              </div>
            </div>
          </div>

          {/* Rental Period */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Rental Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                <p className="text-sm font-medium text-foreground">{contract.startDate}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">End Date</p>
                <p className="text-sm font-medium text-foreground">{contract.endDate}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-3">Contract Actions</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                Download PDF
              </Button>
              <Button className="flex-1 bg-sidebar-primary hover:bg-sidebar-primary/90">
                Print Contract
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
