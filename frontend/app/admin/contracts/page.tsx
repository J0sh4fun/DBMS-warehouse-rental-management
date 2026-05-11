'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Edit2, Plus, Trash2, X } from 'lucide-react';
import { adminApi, AdminCustomerResponse, formatError, LeaseContractRequest, LeaseContractResponse, WarehouseResponse } from '@/lib/api';

const defaultForm: LeaseContractRequest = {
  customerId: 0,
  warehouseId: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  rentalPrice: 1,
  status: 'Pending',
  purpose: '',
};

function daysRemaining(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export default function AdminContracts() {
  const [contracts, setContracts] = useState<LeaseContractResponse[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerResponse[]>([]);
  const [form, setForm] = useState<LeaseContractRequest>(defaultForm);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [contractData, warehouseData, customerData] = await Promise.all([adminApi.contracts(), adminApi.warehouses(), adminApi.customers()]);
      setContracts(contractData);
      setWarehouses(warehouseData);
      setCustomers(customerData.sort((left, right) => left.customerId - right.customerId));
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredContracts = useMemo(
    () =>
      contracts.filter(
        (contract) =>
          (contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contract.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(contract.contractId).includes(searchTerm)) &&
          (statusFilter === 'all' || contract.status === statusFilter)
      ),
    [contracts, searchTerm, statusFilter]
  );

  const resetForm = () => {
    setForm(defaultForm);
    setCustomerQuery('');
    setCustomerDropdownOpen(false);
    setEditingId(null);
  };

  const handleEdit = (contract: LeaseContractResponse) => {
    setEditingId(contract.contractId);
    setForm({
      customerId: contract.customerId,
      warehouseId: contract.warehouseId,
      startDate: contract.startDate,
      endDate: contract.endDate,
      rentalPrice: contract.rentalPrice,
      status: contract.status,
      purpose: contract.purpose || '',
    });
    setCustomerQuery(String(contract.customerId));
    setCustomerDropdownOpen(false);
  };

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim();
    if (!query) return customers.slice(0, 12);

    return customers.filter((customer) => String(customer.customerId).startsWith(query)).slice(0, 12);
  }, [customerQuery, customers]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.customerId === form.customerId) ?? null,
    [customers, form.customerId]
  );

  const handleCustomerInputChange = (value: string) => {
    const nextValue = value.replace(/\D/g, '');
    setCustomerQuery(nextValue);
    setCustomerDropdownOpen(true);
    setForm((current) => ({
      ...current,
      customerId: nextValue ? Number(nextValue) : 0,
    }));
  };

  const handleCustomerSelect = (customer: AdminCustomerResponse) => {
    setCustomerQuery(String(customer.customerId));
    setCustomerDropdownOpen(false);
    setForm((current) => ({
      ...current,
      customerId: customer.customerId,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedCustomer) {
      setError('Please choose a valid Customer ID from the suggestion list.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await adminApi.updateContract(editingId, form);
      } else {
        await adminApi.createContract(form);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (contractId: number, status: LeaseContractResponse['status']) => {
    setError('');
    try {
      await adminApi.updateContractStatus(contractId, status);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleDelete = async (contractId: number) => {
    if (!confirm('Delete this contract from the database?')) return;
    setError('');
    try {
      await adminApi.deleteContract(contractId);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <DashboardLayout headerTitle="Rental Contracts" headerSubtitle="Manage customer lease contracts.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? 'Edit Contract' : 'New Contract'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-6">
              <div className="relative space-y-2">
                <Label>Customer ID</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Type customer ID"
                  value={customerQuery}
                  onFocus={() => setCustomerDropdownOpen(true)}
                  onBlur={() => {
                    window.setTimeout(() => setCustomerDropdownOpen(false), 120);
                  }}
                  onChange={(event) => handleCustomerInputChange(event.target.value)}
                  required
                />
                {customerDropdownOpen && (
                  <div className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border border-border bg-popover shadow-md">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">No matching customer IDs.</div>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <button
                          key={customer.customerId}
                          type="button"
                          className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <span className="font-medium">{customer.customerId}</span>
                          <span className="text-xs text-muted-foreground">
                            {customer.customerName} · {customer.email}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <p className="min-h-4 text-xs text-muted-foreground">
                  {selectedCustomer ? `${selectedCustomer.customerName} · ${selectedCustomer.email}` : 'Type an ID to see matching customers.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.warehouseId || ''}
                  onChange={(event) => setForm({ ...form, warehouseId: Number(event.target.value) })}
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                      {warehouse.warehouseId} - {warehouse.warehouseName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Rental Price (VNĐ)</Label>
                <Input
                  type="text"
                  value={form.rentalPrice ? form.rentalPrice.toLocaleString('vi-VN') : ''}
                  onChange={(event) => {
                    const rawValue = event.target.value.replace(/\./g, '').replace(/\D/g, '');
                    setForm({ ...form, rentalPrice: rawValue ? Number(rawValue) : 0 });
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as LeaseContractResponse['status'] })}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-4">
                <Label>Purpose</Label>
                <Input value={form.purpose || ''} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
              </div>
              <div className="flex items-end gap-2 md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Contract'}
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
            <CardTitle>All Contracts</CardTitle>
            <div className="mt-4 flex flex-wrap gap-4">
              <Input
                placeholder="Search by customer, warehouse, or contract ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading contracts...</p>
            ) : filteredContracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => {
                      const remaining = daysRemaining(contract.endDate);
                      return (
                        <TableRow key={contract.contractId}>
                          <TableCell className="font-medium">{contract.contractId}</TableCell>
                          <TableCell>{contract.customerName} #{contract.customerId}</TableCell>
                          <TableCell>{contract.warehouseName}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {contract.startDate} - {contract.endDate}
                            </div>
                          </TableCell>
                          <TableCell>{Number(contract.rentalPrice).toLocaleString()}</TableCell>
                          <TableCell>
                            <select
                              value={contract.status}
                              onChange={(event) => handleStatusChange(contract.contractId, event.target.value as LeaseContractResponse['status'])}
                              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Active">Active</option>
                              <option value="Expired">Expired</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </TableCell>
                          <TableCell className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {remaining >= 0 ? `${remaining} days` : `Expired ${Math.abs(remaining)} days ago`}
                          </TableCell>
                          <TableCell className="text-right">
                            <button onClick={() => handleEdit(contract)} className="rounded-md p-2 hover:bg-muted">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => handleDelete(contract.contractId)} className="rounded-md p-2 hover:bg-muted">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
