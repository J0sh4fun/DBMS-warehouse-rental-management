'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { customerApi, formatError, InboundReceiptResponse, InventoryResponse, OutboundIssueResponse } from '@/lib/api';
import { formatDate, formatNumber } from '@/lib/format';
import { MapPin, Package, ReceiptText, Send } from 'lucide-react';

type WarehouseSummary = {
  warehouseId: number;
  warehouseName: string;
  stockQuantity: number;
  batchCount: number;
  inboundCount: number;
  outboundCount: number;
  lastActivity?: string;
};

export default function Warehouses() {
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [receipts, setReceipts] = useState<InboundReceiptResponse[]>([]);
  const [issues, setIssues] = useState<OutboundIssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [inventoryData, receiptData, issueData] = await Promise.all([
          customerApi.inventory(),
          customerApi.inboundReceipts(),
          customerApi.outboundIssues(),
        ]);
        setInventory(inventoryData);
        setReceipts(receiptData.content || []);
        setIssues(issueData.content || []);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const warehouses = useMemo(() => {
    const map = new Map<number, WarehouseSummary>();
    const ensure = (warehouseId: number, warehouseName: string) => {
      if (!map.has(warehouseId)) {
        map.set(warehouseId, {
          warehouseId,
          warehouseName,
          stockQuantity: 0,
          batchCount: 0,
          inboundCount: 0,
          outboundCount: 0,
        });
      }
      return map.get(warehouseId)!;
    };

    inventory.forEach((item) => {
      const row = ensure(item.warehouseId, item.warehouseName);
      row.stockQuantity += item.quantity;
      row.batchCount += 1;
      row.lastActivity = row.lastActivity && row.lastActivity > item.lastUpdated ? row.lastActivity : item.lastUpdated;
    });

    receipts.forEach((receipt) => {
      const row = ensure(receipt.warehouseId, receipt.warehouseName);
      row.inboundCount += 1;
      const date = receipt.receiptDate || receipt.createdAt;
      row.lastActivity = row.lastActivity && row.lastActivity > date ? row.lastActivity : date;
    });

    issues.forEach((issue) => {
      const row = ensure(issue.warehouseId, issue.warehouseName);
      row.outboundCount += 1;
      const date = issue.issueDate || issue.createdAt;
      row.lastActivity = row.lastActivity && row.lastActivity > date ? row.lastActivity : date;
    });

    return Array.from(map.values()).sort((a, b) => a.warehouseId - b.warehouseId);
  }, [inventory, issues, receipts]);

  return (
    <DashboardLayout headerTitle="My Warehouses" headerSubtitle="Warehouses inferred from your inventory and documents.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Warehouses in Use</p>
              <p className="text-3xl font-bold">{loading ? '-' : warehouses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Stock</p>
              <p className="text-3xl font-bold">{loading ? '-' : formatNumber(warehouses.reduce((sum, warehouse) => sum + warehouse.stockQuantity, 0))}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Operational Documents</p>
              <p className="text-3xl font-bold">{loading ? '-' : receipts.length + issues.length}</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Loading warehouses...</p>
            </CardContent>
          </Card>
        ) : warehouses.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No warehouse data yet</CardTitle>
              <CardDescription>
                The backend does not currently expose a customer warehouse endpoint. Create inbound/outbound records or inventory first, then this page can infer warehouses in use.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {warehouses.map((warehouse) => (
              <Card key={warehouse.warehouseId}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="h-4 w-4" />
                        {warehouse.warehouseName}
                      </CardTitle>
                      <CardDescription>Warehouse #{warehouse.warehouseId}</CardDescription>
                    </div>
                    <Badge variant="outline">In use</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        Stock
                      </p>
                      <p className="font-semibold">{formatNumber(warehouse.stockQuantity)}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ReceiptText className="h-3 w-3" />
                        Inbound
                      </p>
                      <p className="font-semibold">{warehouse.inboundCount}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Send className="h-3 w-3" />
                        Outbound
                      </p>
                      <p className="font-semibold">{warehouse.outboundCount}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Batches: {warehouse.batchCount}</p>
                  <p className="text-sm text-muted-foreground">Last activity: {formatDate(warehouse.lastActivity)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Warehouse Source Data</CardTitle>
            <CardDescription>Inventory rows grouped by warehouse.</CardDescription>
          </CardHeader>
          <CardContent>
            {inventory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No inventory rows available.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={`${item.warehouseId}-${item.productId}-${item.batchNo}`}>
                        <TableCell>{item.warehouseName} #{item.warehouseId}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.batchNo}</TableCell>
                        <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
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
