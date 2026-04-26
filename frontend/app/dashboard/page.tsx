'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  customerApi,
  formatError,
  InboundReceiptResponse,
  InventoryResponse,
  InventorySummaryResponse,
  InventoryValueResponse,
  OutboundIssueResponse,
  TopProductResponse,
} from '@/lib/api';
import { formatCurrency, formatDate, formatNumber, statusClass } from '@/lib/format';
import { DollarSign, Package, TrendingUp, Warehouse } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function issueTotal(issue: OutboundIssueResponse) {
  return issue.details.reduce((sum, detail) => sum + Number(detail.sellingPrice || 0) * detail.quantity, 0);
}

export default function Dashboard() {
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [summary, setSummary] = useState<InventorySummaryResponse[]>([]);
  const [inventoryValue, setInventoryValue] = useState<InventoryValueResponse | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductResponse[]>([]);
  const [inbound, setInbound] = useState<InboundReceiptResponse[]>([]);
  const [outbound, setOutbound] = useState<OutboundIssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [inventoryData, summaryData, valueData, topProductData, inboundData, outboundData] = await Promise.all([
          customerApi.inventory(),
          customerApi.inventorySummary(),
          customerApi.inventoryValue(),
          customerApi.topProducts(new Date().toISOString().slice(0, 7), 5),
          customerApi.inboundReceipts(),
          customerApi.outboundIssues(),
        ]);
        setInventory(inventoryData);
        setSummary(summaryData);
        setInventoryValue(valueData);
        setTopProducts(topProductData);
        setInbound(inboundData.content || []);
        setOutbound(outboundData.content || []);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const warehouseCount = new Set(inventory.map((item) => item.warehouseId)).size;
  const totalStock = summary.reduce((sum, item) => sum + item.totalQuantity, 0);
  const completedOutbound = outbound.filter((issue) => issue.status === 'Completed');
  const outboundRevenue = completedOutbound.reduce((sum, issue) => sum + issueTotal(issue), 0);

  const stockByWarehouse = useMemo(() => {
    const map = new Map<string, number>();
    inventory.forEach((item) => map.set(item.warehouseName, (map.get(item.warehouseName) || 0) + item.quantity));
    return Array.from(map, ([name, quantity]) => ({ name, quantity }));
  }, [inventory]);

  const stockDistribution = useMemo(
    () => summary.slice(0, 6).map((item) => ({ name: item.productName, value: item.totalQuantity })),
    [summary]
  );

  const activities = useMemo(() => {
    const inboundActivities = inbound.map((receipt) => ({
      id: `in-${receipt.receiptId}`,
      type: 'Inbound',
      ref: `Receipt #${receipt.receiptId}`,
      partner: receipt.supplierName,
      warehouse: receipt.warehouseName,
      status: receipt.status,
      date: receipt.receiptDate || receipt.createdAt,
    }));
    const outboundActivities = outbound.map((issue) => ({
      id: `out-${issue.issueId}`,
      type: 'Outbound',
      ref: `Issue #${issue.issueId}`,
      partner: issue.buyerName,
      warehouse: issue.warehouseName,
      status: issue.status,
      date: issue.issueDate || issue.createdAt,
    }));
    return [...inboundActivities, ...outboundActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [inbound, outbound]);

  return (
    <DashboardLayout headerTitle="Dashboard" headerSubtitle="Live operational overview from the backend.">
      <div className="space-y-8 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Warehouses in Use</CardTitle>
                <Warehouse className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : warehouseCount}</div>
              <p className="mt-1 text-xs text-muted-foreground">Derived from inventory batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
                <Package className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : summary.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Products with stock summary</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : formatNumber(totalStock)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Units across all batches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : formatCurrency(inventoryValue?.totalValue)}</div>
              <p className="mt-1 text-xs text-muted-foreground">Outbound revenue: {formatCurrency(outboundRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Stock by Warehouse</CardTitle>
              <CardDescription>Current inventory grouped by warehouse.</CardDescription>
            </CardHeader>
            <CardContent>
              {stockByWarehouse.length === 0 ? (
                <p className="text-sm text-muted-foreground">No stock data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stockByWarehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Stock Distribution</CardTitle>
              <CardDescription>Top products by available quantity.</CardDescription>
            </CardHeader>
            <CardContent>
              {stockDistribution.length === 0 ? (
                <p className="text-sm text-muted-foreground">No product stock data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={stockDistribution} dataKey="value" nameKey="name" outerRadius={90} label>
                      {stockDistribution.map((entry, index) => (
                        <Cell key={entry.name} fill={['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Exported Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed outbound data this month.</p>
              ) : (
                <div className="space-y-3">
                  {topProducts.map((product) => (
                    <div key={product.productId} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">Product #{product.productId}</p>
                      </div>
                      <span className="font-semibold">{formatNumber(product.totalQuantity)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inbound or outbound activity found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Partner</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activities.map((activity) => (
                        <TableRow key={activity.id}>
                          <TableCell>{activity.type}</TableCell>
                          <TableCell className="font-medium">{activity.ref}</TableCell>
                          <TableCell>{activity.partner}</TableCell>
                          <TableCell>
                            <Badge className={statusClass(activity.status)} variant="outline">
                              {activity.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(activity.date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
