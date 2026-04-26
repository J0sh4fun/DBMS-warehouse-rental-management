'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi, AdminCustomerResponse, formatError, LeaseContractResponse, WarehouseResponse } from '@/lib/api';
import { formatCurrency, formatDate, statusClass } from '@/lib/format';
import { FileText, TrendingUp, Users, Warehouse } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  Active: '#22c55e',
  Maintenance: '#3b82f6',
  Inactive: '#ef4444',
  Pending: '#f59e0b',
  Expired: '#ef4444',
  Cancelled: '#64748b',
};

function daysRemaining(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export default function AdminDashboard() {
  const [warehouses, setWarehouses] = useState<WarehouseResponse[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerResponse[]>([]);
  const [contracts, setContracts] = useState<LeaseContractResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [warehouseData, customerData, contractData] = await Promise.all([
          adminApi.warehouses(),
          adminApi.customers(),
          adminApi.contracts(),
        ]);
        setWarehouses(warehouseData);
        setCustomers(customerData);
        setContracts(contractData);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const metrics = useMemo(() => {
    const activeContracts = contracts.filter((contract) => contract.status === 'Active');
    const activeWarehouseIds = new Set(activeContracts.map((contract) => contract.warehouseId));
    const monthlyRevenue = activeContracts.reduce((sum, contract) => sum + Number(contract.rentalPrice || 0), 0);
    return {
      totalWarehouses: warehouses.length,
      rentedWarehouses: activeWarehouseIds.size,
      currentTenants: customers.length,
      monthlyRevenue,
      occupancyRate: warehouses.length ? Math.round((activeWarehouseIds.size / warehouses.length) * 100) : 0,
    };
  }, [contracts, customers.length, warehouses.length]);

  const warehouseStatusData = useMemo(() => {
    const counts = warehouses.reduce<Record<string, number>>((acc, warehouse) => {
      acc[warehouse.status] = (acc[warehouse.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [warehouses]);

  const contractStatusData = useMemo(() => {
    const counts = contracts.reduce<Record<string, number>>((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [contracts]);

  const revenueByWarehouse = useMemo(
    () =>
      warehouses.map((warehouse) => {
        const relatedContracts = contracts.filter((contract) => contract.warehouseId === warehouse.warehouseId && contract.status === 'Active');
        return {
          name: warehouse.warehouseName,
          revenue: relatedContracts.reduce((sum, contract) => sum + Number(contract.rentalPrice || 0), 0),
          contracts: relatedContracts.length,
        };
      }),
    [contracts, warehouses]
  );

  const recentContracts = [...contracts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <DashboardLayout headerTitle="Admin Dashboard" headerSubtitle="Overview from live backend data.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouses</CardTitle>
              <Warehouse className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : metrics.totalWarehouses}</div>
              <p className="text-xs text-muted-foreground">Managed by admin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rented Warehouses</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : metrics.rentedWarehouses}</div>
              <p className="text-xs text-muted-foreground">{metrics.occupancyRate}% active occupancy by contract</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Tenants</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : metrics.currentTenants}</div>
              <p className="text-xs text-muted-foreground">From active tenant list</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '-' : formatCurrency(metrics.monthlyRevenue)}</div>
              <p className="text-xs text-muted-foreground">Active contracts only</p>
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
                <p className="text-sm text-muted-foreground">No warehouse data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium">Warehouses</p>
                {warehouseStatusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={warehouseStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {warehouseStatusData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Contracts</p>
                {contractStatusData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={contractStatusData} dataKey="value" nameKey="name" outerRadius={80} label>
                        {contractStatusData.map((entry) => (
                          <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading contracts...</p>
            ) : recentContracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentContracts.map((contract) => (
                      <TableRow key={contract.contractId}>
                        <TableCell className="font-medium">{contract.contractId}</TableCell>
                        <TableCell>{contract.customerName}</TableCell>
                        <TableCell>{contract.warehouseName}</TableCell>
                        <TableCell>
                          {formatDate(contract.endDate)}
                          <span className="ml-2 text-xs text-muted-foreground">({daysRemaining(contract.endDate)} days)</span>
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
