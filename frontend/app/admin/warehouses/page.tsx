'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2, Trash2, Plus, MapPin, MoreHorizontal } from 'lucide-react';
import { Warehouse, adminWarehouses } from '@/lib/mock-data';
import { WarehouseModal } from '@/components/modals/warehouse-modal';

export default function AdminWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(adminWarehouses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | undefined>();

  const filteredWarehouses = warehouses.filter(
    (wh) =>
      wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wh.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setSelectedWarehouse(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditClick = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setWarehouses(warehouses.filter((wh) => wh.id !== id));
  };

  const handleSave = (updatedWarehouse: Warehouse) => {
    if (modalMode === 'add') {
      setWarehouses([...warehouses, updatedWarehouse]);
    } else {
      setWarehouses(
        warehouses.map((wh) => (wh.id === updatedWarehouse.id ? updatedWarehouse : wh))
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Warehouse Management</h1>
            <p className="text-muted-foreground">Manage all warehouse properties and their details</p>
          </div>
          <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Warehouse
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Warehouses</CardTitle>
            <div className="mt-4">
              <Input
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Warehouse ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Capacity (m²)</TableHead>
                    <TableHead>Rental Price/month</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWarehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell className="font-medium">{warehouse.id}</TableCell>
                      <TableCell>{warehouse.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {warehouse.location}
                        </div>
                      </TableCell>
                      <TableCell>{warehouse.capacity.toLocaleString()}</TableCell>
                      <TableCell>${warehouse.rentalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            warehouse.status === 'Available'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {warehouse.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-sidebar-primary h-2 rounded-full"
                            style={{ width: `${warehouse.occupancy}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{warehouse.occupancy}%</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(warehouse)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(warehouse.id)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedWarehouse}
        mode={modalMode}
      />
    </DashboardLayout>
  );
}
