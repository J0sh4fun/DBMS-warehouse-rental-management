'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi, formatError, LeaseContractResponse, WarehouseResponse } from '@/lib/api';
import { formatCurrency, formatDate, statusClass } from '@/lib/format';
import { Download, Filter } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Pending: '#f59e0b',
  Expired: '#ef4444',
  Cancelled: '#64748b',
};

function overlapsRange(contract: LeaseContractResponse, start: string, end: string) {
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const contractStart = new Date(contract.startDate).getTime();
  const contractEnd = new Date(contract.endDate).getTime();
  return contractStart <= endMs && contractEnd >= startMs;
}

function durationLabel(contract: LeaseContractResponse) {
  const days = Math.max(1, Math.ceil((new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / 86400000));
  const months = Math.max(1, Math.round(days / 30));
  if (months <= 3) return '1-3 months';
  if (months <= 6) return '4-6 months';
  if (months <= 12) return '7-12 months';
  return '12+ months';
}

export default function AdminReports() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [contracts, setContracts] = useState<LeaseContractResponse[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [warehouseData, contractData] = await Promise.all([adminApi.warehouses(), adminApi.contracts()]);
      setWarehouses(warehouseData);
      setContracts(contractData);
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
    () => contracts.filter((contract) => overlapsRange(contract, dateRange.start, dateRange.end)),
    [contracts, dateRange.end, dateRange.start]
  );

  const activeContracts = filteredContracts.filter((contract) => contract.status === 'Active');
  const totalRevenue = activeContracts.reduce((sum, contract) => sum + Number(contract.rentalPrice || 0), 0);
  const avgRevenue = activeContracts.length ? totalRevenue / activeContracts.length : 0;

  const revenueByWarehouse = useMemo(
    () =>
      warehouses.map((warehouse) => {
        const related = activeContracts.filter((contract) => contract.warehouseId === warehouse.warehouseId);
        return {
          name: warehouse.warehouseName,
          revenue: related.reduce((sum, contract) => sum + Number(contract.rentalPrice || 0), 0),
          contracts: related.length,
        };
      }),
    [activeContracts, warehouses]
  );

  const statusDistribution = useMemo(() => {
    const counts = filteredContracts.reduce<Record<string, number>>((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredContracts]);

  const durationStats = useMemo(() => {
    const buckets = filteredContracts.reduce<Record<string, { count: number; revenue: number }>>((acc, contract) => {
      const label = durationLabel(contract);
      acc[label] = acc[label] || { count: 0, revenue: 0 };
      acc[label].count += 1;
      acc[label].revenue += Number(contract.rentalPrice || 0);
      return acc;
    }, {});
    return Object.entries(buckets).map(([duration, stat]) => ({ duration, ...stat }));
  }, [filteredContracts]);

  return (
    <DashboardLayout headerTitle="Admin Reports" headerSubtitle="Client-side analytics from current backend endpoints.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Start Date</label>
                <Input type="date" value={dateRange.start} onChange={(event) => setDateRange({ ...dateRange, start: event.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">End Date</label>
                <Input type="date" value={dateRange.end} onChange={(event) => setDateRange({ ...dateRange, end: event.target.value })} />
              </div>
              <Button onClick={load} disabled={loading}>
                <Filter className="mr-2 h-4 w-4" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
              <Button variant="outline" type="button" disabled>
                <Download className="mr-2 h-4 w-4" />
                Export disabled
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Within selected contract period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredContracts.length}</div>
              <p className="text-xs text-muted-foreground">{activeContracts.length} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Active Rent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(avgRevenue)}</div>
              <p className="text-xs text-muted-foreground">Per active contract</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              {revenueByWarehouse.length === 0 ? (
                <p className="text-sm text-muted-foreground">No warehouse data found.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contract Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statusDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contract data in this period.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="value" nameKey="name" outerRadius={100} label>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contract Duration Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {durationStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts found for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Duration</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Total Rent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {durationStats.map((stat) => (
                      <TableRow key={stat.duration}>
                        <TableCell className="font-medium">{stat.duration}</TableCell>
                        <TableCell>{stat.count}</TableCell>
                        <TableCell>{formatCurrency(stat.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contracts in Period</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredContracts.length === 0 ? (
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
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContracts.map((contract) => (
                      <TableRow key={contract.contractId}>
                        <TableCell className="font-medium">{contract.contractId}</TableCell>
                        <TableCell>{contract.customerName}</TableCell>
                        <TableCell>{contract.warehouseName}</TableCell>
                        <TableCell>
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </TableCell>
                        <TableCell>{formatCurrency(contract.rentalPrice)}</TableCell>
                        <TableCell>
                          <Badge className={statusClass(contract.status)} variant="outline">
                            {contract.status}
                          </Badge>
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
