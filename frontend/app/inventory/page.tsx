'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { ProductModal } from '@/components/modals/product-modal';

const inventory = [
  {
    id: 1,
    productName: 'Widget A',
    category: 'Electronics',
    quantity: 450,
    warehouse: 'Warehouse A',
    status: 'In Stock',
  },
  {
    id: 2,
    productName: 'Gadget Pro',
    category: 'Accessories',
    quantity: 120,
    warehouse: 'Warehouse B',
    status: 'Low Stock',
  },
  {
    id: 3,
    productName: 'Device X',
    category: 'Electronics',
    quantity: 0,
    warehouse: 'Warehouse C',
    status: 'Out of Stock',
  },
  {
    id: 4,
    productName: 'Tool Kit',
    category: 'Tools',
    quantity: 890,
    warehouse: 'Warehouse A',
    status: 'In Stock',
  },
  {
    id: 5,
    productName: 'Cable Set',
    category: 'Accessories',
    quantity: 35,
    warehouse: 'Warehouse D',
    status: 'Low Stock',
  },
  {
    id: 6,
    productName: 'Power Supply',
    category: 'Electronics',
    quantity: 200,
    warehouse: 'Warehouse B',
    status: 'In Stock',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Stock':
      return 'bg-green-100 text-green-800';
    case 'Low Stock':
      return 'bg-yellow-100 text-yellow-800';
    case 'Out of Stock':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface Product {
  id: number;
  productName: string;
  category: string;
  quantity: number;
  warehouse: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export default function Inventory() {
  const [products, setProducts] = useState(inventory);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();

  const filtered = products.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setSelectedProduct(undefined);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSave = (updatedProduct: Product) => {
    if (modalMode === 'add') {
      setProducts([...products, updatedProduct]);
    } else {
      setProducts(
        products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
    }
  };

  return (
    <DashboardLayout
      headerTitle="Inventory Management"
      headerSubtitle="Track and manage your product inventory"
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 mr-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card"
              />
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product List</CardTitle>
            <CardDescription>All products in your inventory across warehouses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.warehouse}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)} variant="outline">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1 hover:bg-muted rounded-md transition-colors">
                            <Eye className="w-4 h-4 text-foreground" />
                          </button>
                          <button
                            onClick={() => handleEditClick(item)}
                            className="p-1 hover:bg-muted rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1 hover:bg-muted rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          initialData={selectedProduct}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
}
