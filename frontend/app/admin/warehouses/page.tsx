'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, MapPin, Plus, Trash2, X } from 'lucide-react';
import { adminApi, formatError, WarehouseRequest, WarehouseResponse } from '@/lib/api';

const defaultForm: WarehouseRequest = {
  warehouseName: '',
  address: '',
  area: 1,
  status: 'Active',
};

export default function AdminWarehouses() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [form, setForm] = useState<WarehouseRequest>(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadWarehouses = async () => {
    setLoading(true);
    setError('');
    try {
      setWarehouses(await adminApi.warehouses());
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const filteredWarehouses = useMemo(
    () =>
      warehouses.filter(
        (warehouse) =>
          warehouse.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (warehouse.address || '').toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [warehouses, searchTerm]
  );

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (warehouse: WarehouseResponse) => {
    setEditingId(warehouse.warehouseId);
    setForm({
      warehouseName: warehouse.warehouseName,
      address: warehouse.address || '',
      area: warehouse.area || 1,
      status: warehouse.status,
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminApi.updateWarehouse(editingId, form);
      } else {
        await adminApi.createWarehouse(form);
      }
      resetForm();
      await loadWarehouses();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (warehouseId: number) => {
    if (!confirm('Delete this warehouse? Referenced warehouses cannot be deleted.')) return;
    setError('');
    try {
      await adminApi.deleteWarehouse(warehouseId);
      await loadWarehouses();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <DashboardLayout headerTitle="Warehouse Management" headerSubtitle="Manage physical warehouse spaces.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Warehouse' : 'Add Warehouse'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="warehouseName">Name</Label>
                <Input
                  id="warehouseName"
                  value={form.warehouseName}
                  onChange={(event) => setForm({ ...form, warehouseName: event.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address || ''} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.area || 1}
                  onChange={(event) => setForm({ ...form, area: Number(event.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as WarehouseResponse['status'] })}
                >
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end gap-2 md:col-span-4">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Warehouse'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Warehouses</CardTitle>
            <Input
              placeholder="Search by name or address..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-4 max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading warehouses...</p>
            ) : filteredWarehouses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No warehouses found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWarehouses.map((warehouse) => (
                      <TableRow key={warehouse.warehouseId}>
                        <TableCell className="font-medium">{warehouse.warehouseId}</TableCell>
                        <TableCell>{warehouse.warehouseName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {warehouse.address || 'No address'}
                          </div>
                        </TableCell>
                        <TableCell>{warehouse.area?.toLocaleString() || 0}</TableCell>
                        <TableCell>{warehouse.status}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(warehouse)} className="rounded-md p-2 hover:bg-muted">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(warehouse.warehouseId)} className="rounded-md p-2 hover:bg-muted">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
