'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BuyerResponse, customerApi, formatError, InventoryResponse, OutboundIssueResponse, ProductResponse } from '@/lib/api';
import { formatCurrency, formatDate, formatNumber, statusClass } from '@/lib/format';
import { CheckCircle2, Edit2, PackageMinus, Plus, RotateCw, Trash2, X } from 'lucide-react';

type BuyerForm = {
  buyerName: string;
  email: string;
  phoneNumber: string;
  address: string;
};

const buyerDefault: BuyerForm = {
  buyerName: '',
  email: '',
  phoneNumber: '',
  address: '',
};

const outboundDefault = {
  warehouseId: '',
  buyerId: '',
  issueDate: new Date().toISOString().slice(0, 10),
  productId: '',
  batchNo: '',
  quantity: '1',
  sellingPrice: '0',
};

function toDateTime(date: string) {
  return date ? `${date}T00:00:00` : undefined;
}

function issueTotal(issue: OutboundIssueResponse) {
  return issue.details.reduce((sum, detail) => sum + Number(detail.sellingPrice || 0) * detail.quantity, 0);
}

export default function Orders() {
  const [buyers, setBuyers] = useState<BuyerResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [issues, setIssues] = useState<OutboundIssueResponse[]>([]);
  const [buyerForm, setBuyerForm] = useState<BuyerForm>(buyerDefault);
  const [editingBuyerId, setEditingBuyerId] = useState<number | null>(null);
  const [outboundForm, setOutboundForm] = useState(outboundDefault);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [buyerData, productData, inventoryData, issueData] = await Promise.all([
        customerApi.buyers(),
        customerApi.products(),
        customerApi.inventory(),
        customerApi.outboundIssues(),
      ]);
      setBuyers(buyerData);
      setProducts(productData);
      setInventory(inventoryData);
      setIssues(issueData.content || []);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const productById = useMemo(() => new Map(products.map((product) => [product.productId, product])), [products]);
  const warehouseOptions = useMemo(() => {
    const map = new Map<number, string>();
    inventory.forEach((item) => map.set(item.warehouseId, item.warehouseName));
    issues.forEach((issue) => map.set(issue.warehouseId, issue.warehouseName));
    return Array.from(map, ([warehouseId, warehouseName]) => ({ warehouseId, warehouseName }));
  }, [inventory, issues]);

  const batchOptions = useMemo(
    () =>
      inventory.filter(
        (item) =>
          (!outboundForm.productId || item.productId === Number(outboundForm.productId)) &&
          (!outboundForm.warehouseId || item.warehouseId === Number(outboundForm.warehouseId)) &&
          item.quantity > 0
      ),
    [inventory, outboundForm.productId, outboundForm.warehouseId]
  );

  const resetBuyerForm = () => {
    setBuyerForm(buyerDefault);
    setEditingBuyerId(null);
  };

  const handleBuyerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingBuyerId) {
        await customerApi.updateBuyer(editingBuyerId, buyerForm);
      } else {
        await customerApi.createBuyer(buyerForm);
      }
      resetBuyerForm();
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleOutboundSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await customerApi.createOutboundIssue({
        warehouseId: Number(outboundForm.warehouseId),
        buyerId: Number(outboundForm.buyerId),
        issueDate: toDateTime(outboundForm.issueDate),
        status: 'Draft',
        details: [
          {
            productId: Number(outboundForm.productId),
            batchNo: outboundForm.batchNo,
            quantity: Number(outboundForm.quantity),
            sellingPrice: Number(outboundForm.sellingPrice),
          },
        ],
      });
      setOutboundForm(outboundDefault);
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const completeIssue = async (issueId: number) => {
    setError('');
    try {
      await customerApi.completeOutboundIssue(issueId);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const cancelIssue = async (issueId: number) => {
    setError('');
    try {
      await customerApi.cancelOutboundIssue(issueId);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const completedIssues = issues.filter((issue) => issue.status === 'Completed');
  const totalRevenue = completedIssues.reduce((sum, issue) => sum + issueTotal(issue), 0);
  const pendingIssues = issues.filter((issue) => issue.status === 'Draft').length;

  return (
    <DashboardLayout headerTitle="Outbound Issues" headerSubtitle="Create outbound documents and manage buyers.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Outbound Issues</p>
              <p className="text-3xl font-bold">{loading ? '-' : issues.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Draft Issues</p>
              <p className="text-3xl font-bold">{loading ? '-' : pendingIssues}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Completed Revenue</p>
              <p className="text-3xl font-bold">{loading ? '-' : formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="issues">Outbound</TabsTrigger>
            <TabsTrigger value="buyers">Buyers</TabsTrigger>
            <TabsTrigger value="stock">Batch Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="issues">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackageMinus className="h-5 w-5" />
                    New Outbound Issue
                  </CardTitle>
                  <CardDescription>Create as Draft, then complete to subtract inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleOutboundSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Warehouse ID</Label>
                      <Input list="warehouse-options-outbound" type="number" min="1" value={outboundForm.warehouseId} onChange={(event) => setOutboundForm({ ...outboundForm, warehouseId: event.target.value, batchNo: '' })} required />
                      <datalist id="warehouse-options-outbound">
                        {warehouseOptions.map((warehouse) => (
                          <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                            {warehouse.warehouseName}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="space-y-2">
                      <Label>Buyer</Label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={outboundForm.buyerId} onChange={(event) => setOutboundForm({ ...outboundForm, buyerId: event.target.value })} required>
                        <option value="">Select buyer</option>
                        {buyers.map((buyer) => (
                          <option key={buyer.buyerId} value={buyer.buyerId}>
                            {buyer.buyerName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input type="date" value={outboundForm.issueDate} onChange={(event) => setOutboundForm({ ...outboundForm, issueDate: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Product</Label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={outboundForm.productId} onChange={(event) => setOutboundForm({ ...outboundForm, productId: event.target.value, batchNo: '' })} required>
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.productId} value={product.productId}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Batch No</Label>
                      <Input list="batch-options" value={outboundForm.batchNo} onChange={(event) => setOutboundForm({ ...outboundForm, batchNo: event.target.value })} required />
                      <datalist id="batch-options">
                        {batchOptions.map((item) => (
                          <option key={`${item.warehouseId}-${item.productId}-${item.batchNo}`} value={item.batchNo}>
                            {item.productName} / {item.warehouseName} / {formatNumber(item.quantity)}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" min="1" value={outboundForm.quantity} onChange={(event) => setOutboundForm({ ...outboundForm, quantity: event.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Selling Price</Label>
                        <Input type="number" min="0" step="0.01" value={outboundForm.sellingPrice} onChange={(event) => setOutboundForm({ ...outboundForm, sellingPrice: event.target.value })} required />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving || buyers.length === 0 || products.length === 0}>
                      <Plus className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Create Draft'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Outbound Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {issues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No outbound issues found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {issues.map((issue) => (
                            <TableRow key={issue.issueId}>
                              <TableCell className="font-medium">{issue.issueId}</TableCell>
                              <TableCell>{issue.warehouseName} #{issue.warehouseId}</TableCell>
                              <TableCell>{issue.buyerName}</TableCell>
                              <TableCell>
                                {issue.details.map((detail) => (
                                  <div key={`${issue.issueId}-${detail.productId}-${detail.batchNo}`} className="text-sm">
                                    {detail.productName || productById.get(detail.productId)?.productName || detail.productId} / {detail.batchNo}: {formatNumber(detail.quantity)}
                                  </div>
                                ))}
                              </TableCell>
                              <TableCell>{formatCurrency(issueTotal(issue))}</TableCell>
                              <TableCell>
                                <Badge className={statusClass(issue.status)} variant="outline">
                                  {issue.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {issue.status === 'Draft' && (
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => completeIssue(issue.issueId)}>
                                      <CheckCircle2 className="h-4 w-4" />
                                      Complete
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => cancelIssue(issue.issueId)}>
                                      <X className="h-4 w-4" />
                                      Cancel
                                    </Button>
                                  </div>
                                )}
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
          </TabsContent>

          <TabsContent value="buyers">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{editingBuyerId ? 'Edit Buyer' : 'Create Buyer'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBuyerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={buyerForm.buyerName} onChange={(event) => setBuyerForm({ ...buyerForm, buyerName: event.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={buyerForm.email} onChange={(event) => setBuyerForm({ ...buyerForm, email: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={buyerForm.phoneNumber} onChange={(event) => setBuyerForm({ ...buyerForm, phoneNumber: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={buyerForm.address} onChange={(event) => setBuyerForm({ ...buyerForm, address: event.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : editingBuyerId ? 'Save' : 'Create'}
                      </Button>
                      {editingBuyerId && (
                        <Button type="button" variant="outline" onClick={resetBuyerForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Buyers</CardTitle>
                </CardHeader>
                <CardContent>
                  {buyers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No buyers found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {buyers.map((buyer) => (
                            <TableRow key={buyer.buyerId}>
                              <TableCell className="font-medium">{buyer.buyerName}</TableCell>
                              <TableCell>{buyer.email || '-'}</TableCell>
                              <TableCell>{buyer.phoneNumber || '-'}</TableCell>
                              <TableCell>{buyer.address || '-'}</TableCell>
                              <TableCell className="text-right">
                                <button
                                  onClick={() => {
                                    setEditingBuyerId(buyer.buyerId);
                                    setBuyerForm({
                                      buyerName: buyer.buyerName,
                                      email: buyer.email || '',
                                      phoneNumber: buyer.phoneNumber || '',
                                      address: buyer.address || '',
                                    });
                                  }}
                                  className="rounded-md p-2 hover:bg-muted"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Delete this buyer?')) return;
                                    try {
                                      await customerApi.deleteBuyer(buyer.buyerId);
                                      await load();
                                    } catch (err) {
                                      setError(formatError(err));
                                    }
                                  }}
                                  className="rounded-md p-2 hover:bg-muted"
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </button>
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
          </TabsContent>

          <TabsContent value="stock">
            <Card>
              <CardHeader>
                <CardTitle>Available Batch Stock</CardTitle>
                <CardDescription>Use this table to choose the exact batch for outbound issues.</CardDescription>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventory.map((item) => (
                          <TableRow key={`${item.warehouseId}-${item.productId}-${item.batchNo}`}>
                            <TableCell>{item.warehouseName} #{item.warehouseId}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="font-medium">{item.batchNo}</TableCell>
                            <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                            <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button variant="outline" onClick={load}>
          <RotateCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </DashboardLayout>
  );
}
