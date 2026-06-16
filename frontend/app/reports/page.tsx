'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  customerApi,
  ExpiringBatchResponse,
  formatError,
  InventorySummaryResponse,
  InventoryValueResponse,
  TopProductResponse,
} from '@/lib/api';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, RotateCw } from 'lucide-react';

function defaultExpiryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function wrapAxisLabel(value: string, maxCharsPerLine = 12) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return ['-'];

  const lines: string[] = [];
  let currentLine = '';

  normalized.split(' ').forEach((word) => {
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }

      for (let index = 0; index < word.length; index += maxCharsPerLine) {
        lines.push(word.slice(index, index + maxCharsPerLine));
      }
      return;
    }

    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function WrappedAxisTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string | number };
}) {
  const lines = wrapAxisLabel(String(payload?.value ?? ''));

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="middle" fill="currentColor" className="text-xs text-muted-foreground">
        {lines.map((line, index) => (
          <tspan key={`${line}-${index}`} x={0} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

export default function Reports() {
  const [inventoryValue, setInventoryValue] = useState<InventoryValueResponse | null>(null);
  const [expiringBatches, setExpiringBatches] = useState<ExpiringBatchResponse[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductResponse[]>([]);
  const [summary, setSummary] = useState<InventorySummaryResponse[]>([]);
  const [expiresOnOrBefore, setExpiresOnOrBefore] = useState(defaultExpiryDate());
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [valueData, expiringData, topProductData, summaryData] = await Promise.all([
        customerApi.inventoryValue(),
        customerApi.expiringBatches(expiresOnOrBefore),
        customerApi.topProducts(month, 10),
        customerApi.inventorySummary(),
      ]);
      setInventoryValue(valueData);
      setExpiringBatches(expiringData);
      setTopProducts(topProductData);
      setSummary(summaryData);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalStock = summary.reduce((sum, item) => sum + item.totalQuantity, 0);
  const lowStockCount = summary.filter((item) => item.totalQuantity > 0 && item.totalQuantity <= 10).length;
  const expiringQuantity = expiringBatches.reduce((sum, batch) => sum + batch.currentQuantity, 0);

  const stockChart = useMemo(
    () => summary.slice(0, 10).map((item) => ({ name: item.productName, quantity: item.totalQuantity })),
    [summary]
  );

  return (
    <DashboardLayout headerTitle="Reports" headerSubtitle="Inventory value, expiry tracking, and top outbound products.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>These filters map to the backend report query parameters.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Expiring on or before</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={expiresOnOrBefore} onChange={(event) => setExpiresOnOrBefore(event.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Top products month</label>
                <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
              </div>
              <Button onClick={load} disabled={loading}>
                <RotateCw className="h-4 w-4" />
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : formatCurrency(inventoryValue?.totalValue)}</div>
              <p className="text-xs text-muted-foreground">Quantity x current price</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : formatNumber(totalStock)}</div>
              <p className="text-xs text-muted-foreground">Across all products</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expiring Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : expiringBatches.length}</div>
              <p className="text-xs text-muted-foreground">{formatNumber(expiringQuantity)} units affected</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? '-' : lowStockCount}</div>
              <p className="text-xs text-muted-foreground">Threshold: 10 units</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Products Exported</CardTitle>
              <CardDescription>From `/api/reports/top-products`.</CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No completed outbound data for this month.</p>
              ) : (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={topProducts} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="productName" interval={0} height={84} tick={<WrappedAxisTick />} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalQuantity" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription>Top 10 products by stock quantity.</CardDescription>
            </CardHeader>
            <CardContent>
              {stockChart.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inventory summary available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart data={stockChart} margin={{ top: 8, right: 8, left: 0, bottom: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} height={84} tick={<WrappedAxisTick />} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expiring Batches</CardTitle>
          </CardHeader>
          <CardContent>
            {expiringBatches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No batches are expiring by {formatDate(expiresOnOrBefore)}.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Expiry Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringBatches.map((batch) => (
                      <TableRow key={`${batch.receiptId}-${batch.productId}-${batch.batchNo}`}>
                        <TableCell>{batch.warehouseName} #{batch.warehouseId}</TableCell>
                        <TableCell>{batch.supplierName}</TableCell>
                        <TableCell>{batch.productName}</TableCell>
                        <TableCell className="font-medium">{batch.batchNo}</TableCell>
                        <TableCell className="text-right">{formatNumber(batch.currentQuantity)}</TableCell>
                        <TableCell>{formatDate(batch.expiryDate)}</TableCell>
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
