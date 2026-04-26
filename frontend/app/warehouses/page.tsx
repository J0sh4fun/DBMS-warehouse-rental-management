'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { tenantWarehouses } from '@/lib/mock-data';
import { WarehouseDetailModal } from '@/components/modals/warehouse-detail-modal';

const warehouses = tenantWarehouses; // Declare the warehouses variable

export default function Warehouses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<typeof tenantWarehouses[0] | undefined>();

  const handleViewDetails = (warehouse: typeof tenantWarehouses[0]) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout 
      headerTitle="My Warehouses" 
      headerSubtitle="Manage and view all your rented warehouses"
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your Warehouses ({tenantWarehouses.length})</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenantWarehouses.map((warehouse) => (
            <Card key={warehouse.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {warehouse.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{warehouse.occupancy}% Full</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                    <p className="font-semibold text-foreground">{warehouse.capacity.toLocaleString()} m²</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Rent</p>
                    <p className="font-semibold text-foreground">${warehouse.rentalPrice.toLocaleString()}</p>
                  </div>
                </div>

                {warehouse.description && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{warehouse.description}</p>
                  </div>
                )}

                {/* Occupancy Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground">Space Usage</p>
                    <p className="text-xs font-semibold text-foreground">{warehouse.occupancy}%</p>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${warehouse.occupancy}%` }}
                    ></div>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full bg-transparent" 
                  size="sm"
                  onClick={() => handleViewDetails(warehouse)}
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="bg-primary hover:bg-primary/90 mt-4">
          Add Warehouse
        </Button>
      </div>

      <WarehouseDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={selectedWarehouse}
      />
    </DashboardLayout>
  );
}
