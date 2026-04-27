'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, ClipboardList, Send } from 'lucide-react';
import { customerApi, formatError, RentalRequestCreateRequest, RentalRequestResponse, WarehouseResponse } from '@/lib/api';

const defaultForm: RentalRequestCreateRequest = {
  warehouseId: 0,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  purpose: '',
};

function statusClass(status: RentalRequestResponse['status']) {
  switch (status) {
    case 'Approved':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'Rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export default function RentalRequestsPage() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [requests, setRequests] = useState<RentalRequestResponse[]>([]);
  const [form, setForm] = useState<RentalRequestCreateRequest>(defaultForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadWarehouses = async (startDate = form.startDate, endDate = form.endDate) => {
    const warehouseData = await customerApi.availableWarehouses(startDate, endDate);
    setWarehouses(warehouseData);
    setForm((current) => ({
      ...current,
      warehouseId: warehouseData.some((warehouse) => warehouse.warehouseId === current.warehouseId)
        ? current.warehouseId
        : warehouseData[0]?.warehouseId || 0,
    }));
  };

  const loadRequests = async () => {
    setRequests(await customerApi.rentalRequests());
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      await Promise.all([loadWarehouses(), loadRequests()]);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refreshWarehouses = async () => {
      setError('');
      try {
        const warehouseData = await customerApi.availableWarehouses(form.startDate, form.endDate);
        if (cancelled) return;
        setWarehouses(warehouseData);
        setForm((current) => ({
          ...current,
          warehouseId: warehouseData.some((warehouse) => warehouse.warehouseId === current.warehouseId)
            ? current.warehouseId
            : warehouseData[0]?.warehouseId || 0,
        }));
      } catch (err) {
        if (!cancelled) {
          setError(formatError(err));
        }
      }
    };
    refreshWarehouses();
    return () => {
      cancelled = true;
    };
  }, [form.startDate, form.endDate]);

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(request.requestId).includes(searchTerm)
      ),
    [requests, searchTerm]
  );

  const selectedWarehouse = useMemo(
    () => warehouses.find((warehouse) => warehouse.warehouseId === form.warehouseId),
    [form.warehouseId, warehouses]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await customerApi.createRentalRequest(form);
      setForm({
        ...defaultForm,
        warehouseId: warehouses[0]?.warehouseId || 0,
      });
      await Promise.all([loadWarehouses(defaultForm.startDate, defaultForm.endDate), loadRequests()]);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout headerTitle="Rental Requests" headerSubtitle="Request additional warehouse space.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              New Rental Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <select
                  id="warehouse"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  value={form.warehouseId || ''}
                  onChange={(event) => setForm({ ...form, warehouseId: Number(event.target.value) })}
                  required
                  disabled={warehouses.length === 0}
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
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input id="endDate" type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rentalPrice">Rental Price</Label>
                <Input
                  id="rentalPrice"
                  type="number"
                  value={selectedWarehouse?.rentalPrice != null ? Number(selectedWarehouse.rentalPrice).toString() : ''}
                  readOnly
                />
              </div>
              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="purpose">Purpose</Label>
                <Input id="purpose" value={form.purpose || ''} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
              </div>
              <div className="flex items-end md:col-span-1">
                <Button type="submit" disabled={saving || warehouses.length === 0 || !selectedWarehouse}>
                  {saving ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              My Requests
            </CardTitle>
            <Input
              placeholder="Search by warehouse, status, or request ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-4 max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rental requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.requestId}>
                        <TableCell className="font-medium">{request.requestId}</TableCell>
                        <TableCell>{request.warehouseName}</TableCell>
                        <TableCell>{request.adminName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {request.startDate} - {request.endDate}
                          </div>
                        </TableCell>
                        <TableCell>{Number(request.rentalPrice).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={statusClass(request.status)} variant="outline">
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.contractId ? `#${request.contractId}` : '-'}</TableCell>
                        <TableCell>{request.reviewNote || '-'}</TableCell>
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
