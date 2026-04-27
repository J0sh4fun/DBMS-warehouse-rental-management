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
import {
  CategoryResponse,
  customerApi,
  formatError,
  InboundReceiptResponse,
  InventoryResponse,
  LeaseContractResponse,
  ProductResponse,
  SupplierResponse,
} from '@/lib/api';
import { formatCurrency, formatDate, formatNumber, statusClass } from '@/lib/format';
import { CheckCircle2, Edit2, PackagePlus, Plus, RotateCw, Trash2, X } from 'lucide-react';

type ProductForm = {
  productName: string;
  categoryId: string;
  currentPrice: string;
  unitOfMeasure: string;
};

type SupplierForm = {
  supplierName: string;
  phoneNumber: string;
  address: string;
};

const productDefault: ProductForm = {
  productName: '',
  categoryId: '',
  currentPrice: '0',
  unitOfMeasure: 'pcs',
};

const supplierDefault: SupplierForm = {
  supplierName: '',
  phoneNumber: '',
  address: '',
};

const inboundDefault = {
  warehouseId: '',
  supplierId: '',
  receiptDate: new Date().toISOString().slice(0, 10),
  productId: '',
  batchNo: '',
  quantity: '1',
  importPrice: '0',
  expiryDate: '',
};

function toDateTime(date: string) {
  return date ? `${date}T00:00:00` : undefined;
}

export default function Inventory() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierResponse[]>([]);
  const [contracts, setContracts] = useState<LeaseContractResponse[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [receipts, setReceipts] = useState<InboundReceiptResponse[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(productDefault);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [supplierForm, setSupplierForm] = useState<SupplierForm>(supplierDefault);
  const [editingSupplierId, setEditingSupplierId] = useState<number | null>(null);
  const [inboundForm, setInboundForm] = useState(inboundDefault);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [categoryData, productData, supplierData, contractData, inventoryData, receiptData] = await Promise.all([
        customerApi.categories(),
        customerApi.products(),
        customerApi.suppliers(),
        customerApi.contracts(),
        customerApi.inventory(),
        customerApi.inboundReceipts(),
      ]);
      setCategories(categoryData);
      setProducts(productData);
      setSuppliers(supplierData);
      setContracts(contractData);
      setInventory(inventoryData);
      setReceipts(receiptData.content || []);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.categoryId, category.categoryName])), [categories]);
  const productById = useMemo(() => new Map(products.map((product) => [product.productId, product])), [products]);
  const warehouseOptions = useMemo(() => {
    const map = new Map<number, string>();
    contracts.forEach((contract) => map.set(contract.warehouseId, contract.warehouseName));
    inventory.forEach((item) => map.set(item.warehouseId, item.warehouseName));
    receipts.forEach((receipt) => map.set(receipt.warehouseId, receipt.warehouseName));
    return Array.from(map, ([warehouseId, warehouseName]) => ({ warehouseId, warehouseName }));
  }, [contracts, inventory, receipts]);

  const filteredInventory = inventory.filter(
    (item) =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.warehouseName.toLowerCase().includes(search.toLowerCase()) ||
      item.batchNo.toLowerCase().includes(search.toLowerCase())
  );

  const resetProductForm = () => {
    setProductForm(productDefault);
    setEditingProductId(null);
  };

  const resetSupplierForm = () => {
    setSupplierForm(supplierDefault);
    setEditingSupplierId(null);
  };

  const handleCategorySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingCategory) {
        await customerApi.updateCategory(editingCategory.categoryId, categoryName);
      } else {
        await customerApi.createCategory(categoryName);
      }
      setCategoryName('');
      setEditingCategory(null);
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleProductSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const request = {
        productName: productForm.productName,
        categoryId: Number(productForm.categoryId),
        currentPrice: Number(productForm.currentPrice),
        unitOfMeasure: productForm.unitOfMeasure,
      };
      if (editingProductId) {
        await customerApi.updateProduct(editingProductId, request);
      } else {
        await customerApi.createProduct(request);
      }
      resetProductForm();
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSupplierSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingSupplierId) {
        await customerApi.updateSupplier(editingSupplierId, supplierForm);
      } else {
        await customerApi.createSupplier(supplierForm);
      }
      resetSupplierForm();
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleInboundSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await customerApi.createInboundReceipt({
        warehouseId: Number(inboundForm.warehouseId),
        supplierId: Number(inboundForm.supplierId),
        receiptDate: toDateTime(inboundForm.receiptDate),
        status: 'Draft',
        details: [
          {
            productId: Number(inboundForm.productId),
            batchNo: inboundForm.batchNo,
            quantity: Number(inboundForm.quantity),
            importPrice: Number(inboundForm.importPrice),
            expiryDate: inboundForm.expiryDate || undefined,
          },
        ],
      });
      setInboundForm(inboundDefault);
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSaving(false);
    }
  };

  const completeReceipt = async (receiptId: number) => {
    setError('');
    try {
      await customerApi.completeInboundReceipt(receiptId);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const cancelReceipt = async (receiptId: number) => {
    setError('');
    try {
      await customerApi.cancelInboundReceipt(receiptId);
      await load();
    } catch (err) {
      setError(formatError(err));
    }
  };

  return (
    <DashboardLayout headerTitle="Inventory Management" headerSubtitle="Manage master data, inbound receipts, and current stock.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Products</p>
              <p className="text-3xl font-bold">{loading ? '-' : products.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-3xl font-bold">{loading ? '-' : categories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Inventory Batches</p>
              <p className="text-3xl font-bold">{loading ? '-' : inventory.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Stock Quantity</p>
              <p className="text-3xl font-bold">{loading ? '-' : formatNumber(inventory.reduce((sum, item) => sum + item.quantity, 0))}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="inbound">Inbound</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Current Stock</CardTitle>
                <CardDescription>Batch-level inventory returned by the backend.</CardDescription>
                <Input placeholder="Search product, warehouse, or batch..." value={search} onChange={(event) => setSearch(event.target.value)} className="mt-3 max-w-md" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-sm text-muted-foreground">Loading inventory...</p>
                ) : filteredInventory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No inventory found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Warehouse</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead className="text-right">Quantity</TableHead>
                          <TableHead>Unit</TableHead>
                          <TableHead>Last Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInventory.map((item) => (
                          <TableRow key={`${item.warehouseId}-${item.productId}-${item.batchNo}`}>
                            <TableCell>{item.warehouseName} #{item.warehouseId}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="font-medium">{item.batchNo}</TableCell>
                            <TableCell className="text-right">{formatNumber(item.quantity)}</TableCell>
                            <TableCell>{item.unitOfMeasure}</TableCell>
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

          <TabsContent value="inbound">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PackagePlus className="h-5 w-5" />
                    New Inbound Receipt
                  </CardTitle>
                  <CardDescription>Create as Draft, then complete to add inventory.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInboundSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Warehouse</Label>
                      <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        value={inboundForm.warehouseId}
                        onChange={(event) => setInboundForm({ ...inboundForm, warehouseId: event.target.value })}
                        required
                      >
                        <option value="">Select leased warehouse</option>
                        {warehouseOptions.map((warehouse) => (
                          <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                            {warehouse.warehouseName} #{warehouse.warehouseId}
                          </option>
                        ))}
                      </select>
                      {warehouseOptions.length === 0 && (
                        <p className="text-xs text-muted-foreground">No active warehouse contract is available for inbound receipts.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={inboundForm.supplierId} onChange={(event) => setInboundForm({ ...inboundForm, supplierId: event.target.value })} required>
                        <option value="">Select supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.supplierId} value={supplier.supplierId}>
                            {supplier.supplierName}
                          </option>
                        ))}
                      </select>
                      {suppliers.length === 0 && (
                        <p className="text-xs text-muted-foreground">No suppliers yet. Create one in the Suppliers tab.</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Receipt Date</Label>
                      <Input type="date" value={inboundForm.receiptDate} onChange={(event) => setInboundForm({ ...inboundForm, receiptDate: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Product</Label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={inboundForm.productId} onChange={(event) => setInboundForm({ ...inboundForm, productId: event.target.value })} required>
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product.productId} value={product.productId}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Batch No</Label>
                        <Input value={inboundForm.batchNo} onChange={(event) => setInboundForm({ ...inboundForm, batchNo: event.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" min="1" value={inboundForm.quantity} onChange={(event) => setInboundForm({ ...inboundForm, quantity: event.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Import Price</Label>
                        <Input type="number" min="0" step="0.01" value={inboundForm.importPrice} onChange={(event) => setInboundForm({ ...inboundForm, importPrice: event.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" value={inboundForm.expiryDate} onChange={(event) => setInboundForm({ ...inboundForm, expiryDate: event.target.value })} />
                      </div>
                    </div>
                    <Button type="submit" disabled={saving || warehouseOptions.length === 0 || products.length === 0 || suppliers.length === 0}>
                      <Plus className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Create Draft'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Inbound Receipts</CardTitle>
                </CardHeader>
                <CardContent>
                  {receipts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No inbound receipts found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Warehouse</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receipts.map((receipt) => (
                            <TableRow key={receipt.receiptId}>
                              <TableCell className="font-medium">{receipt.receiptId}</TableCell>
                              <TableCell>{receipt.warehouseName} #{receipt.warehouseId}</TableCell>
                              <TableCell>{receipt.supplierName}</TableCell>
                              <TableCell>
                                {receipt.details.map((detail) => (
                                  <div key={`${receipt.receiptId}-${detail.productId}-${detail.batchNo}`} className="text-sm">
                                    {detail.productName || productById.get(detail.productId)?.productName || detail.productId} / {detail.batchNo}: {formatNumber(detail.quantity)}
                                  </div>
                                ))}
                              </TableCell>
                              <TableCell>
                                <Badge className={statusClass(receipt.status)} variant="outline">
                                  {receipt.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {receipt.status === 'Draft' && (
                                  <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => completeReceipt(receipt.receiptId)}>
                                      <CheckCircle2 className="h-4 w-4" />
                                      Complete
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => cancelReceipt(receipt.receiptId)}>
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

          <TabsContent value="products">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{editingProductId ? 'Edit Product' : 'Create Product'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProductSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={productForm.productName} onChange={(event) => setProductForm({ ...productForm, productName: event.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" value={productForm.categoryId} onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })} required>
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input type="number" min="0" step="0.01" value={productForm.currentPrice} onChange={(event) => setProductForm({ ...productForm, currentPrice: event.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Unit</Label>
                        <Input value={productForm.unitOfMeasure} onChange={(event) => setProductForm({ ...productForm, unitOfMeasure: event.target.value })} required />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving || categories.length === 0}>
                        {saving ? 'Saving...' : editingProductId ? 'Save' : 'Create'}
                      </Button>
                      {editingProductId && (
                        <Button type="button" variant="outline" onClick={resetProductForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.productId}>
                              <TableCell className="font-medium">{product.productName}</TableCell>
                              <TableCell>{categoryById.get(product.categoryId) || product.categoryId}</TableCell>
                              <TableCell>{product.unitOfMeasure}</TableCell>
                              <TableCell className="text-right">{formatCurrency(product.currentPrice)}</TableCell>
                              <TableCell className="text-right">
                                <button
                                  onClick={() => {
                                    setEditingProductId(product.productId);
                                    setProductForm({
                                      productName: product.productName,
                                      categoryId: String(product.categoryId),
                                      currentPrice: String(product.currentPrice),
                                      unitOfMeasure: product.unitOfMeasure,
                                    });
                                  }}
                                  className="rounded-md p-2 hover:bg-muted"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Delete this product? Backend uses soft delete where configured.')) return;
                                    try {
                                      await customerApi.deleteProduct(product.productId);
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

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Category CRUD uses CustomerId from the JWT on the backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCategorySubmit} className="flex max-w-xl gap-2">
                  <Input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Category name" required />
                  <Button type="submit" disabled={saving}>
                    {editingCategory ? 'Save' : 'Create'}
                  </Button>
                  {editingCategory && (
                    <Button type="button" variant="outline" onClick={() => { setEditingCategory(null); setCategoryName(''); }}>
                      Cancel
                    </Button>
                  )}
                </form>
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((category) => (
                          <TableRow key={category.categoryId}>
                            <TableCell>{category.categoryId}</TableCell>
                            <TableCell className="font-medium">{category.categoryName}</TableCell>
                            <TableCell className="text-right">
                              <button
                                onClick={() => {
                                  setEditingCategory(category);
                                  setCategoryName(category.categoryName);
                                }}
                                className="rounded-md p-2 hover:bg-muted"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (!confirm('Delete this category?')) return;
                                  try {
                                    await customerApi.deleteCategory(category.categoryId);
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
          </TabsContent>

          <TabsContent value="suppliers">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{editingSupplierId ? 'Edit Supplier' : 'Create Supplier'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSupplierSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input value={supplierForm.supplierName} onChange={(event) => setSupplierForm({ ...supplierForm, supplierName: event.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={supplierForm.phoneNumber} onChange={(event) => setSupplierForm({ ...supplierForm, phoneNumber: event.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : editingSupplierId ? 'Save' : 'Create'}
                      </Button>
                      {editingSupplierId && (
                        <Button type="button" variant="outline" onClick={resetSupplierForm}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Suppliers</CardTitle>
                </CardHeader>
                <CardContent>
                  {suppliers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No suppliers found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {suppliers.map((supplier) => (
                            <TableRow key={supplier.supplierId}>
                              <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                              <TableCell>{supplier.phoneNumber || '-'}</TableCell>
                              <TableCell>{supplier.address || '-'}</TableCell>
                              <TableCell className="text-right">
                                <button
                                  onClick={() => {
                                    setEditingSupplierId(supplier.supplierId);
                                    setSupplierForm({
                                      supplierName: supplier.supplierName,
                                      phoneNumber: supplier.phoneNumber || '',
                                      address: supplier.address || '',
                                    });
                                  }}
                                  className="rounded-md p-2 hover:bg-muted"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    if (!confirm('Delete this supplier?')) return;
                                    try {
                                      await customerApi.deleteSupplier(supplier.supplierId);
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
        </Tabs>

        <Button variant="outline" onClick={load}>
          <RotateCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>
    </DashboardLayout>
  );
}
