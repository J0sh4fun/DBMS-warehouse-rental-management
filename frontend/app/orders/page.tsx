'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye } from 'lucide-react';
import { OrderModal } from '@/components/modals/order-modal';
import { useState } from 'react';

const orders = [
  {
    id: '#ORD-001',
    date: '2024-01-15',
    customer: 'Acme Corp',
    items: 3,
    total: '$1,250.00',
    status: 'Delivered',
  },
  {
    id: '#ORD-002',
    date: '2024-01-14',
    customer: 'Tech Solutions',
    items: 5,
    total: '$2,340.50',
    status: 'Processing',
  },
  {
    id: '#ORD-003',
    date: '2024-01-13',
    customer: 'Global Traders',
    items: 2,
    total: '$890.00',
    status: 'Shipped',
  },
  {
    id: '#ORD-004',
    date: '2024-01-12',
    customer: 'Metro Logistics',
    items: 7,
    total: '$3,450.75',
    status: 'Delivered',
  },
  {
    id: '#ORD-005',
    date: '2024-01-11',
    customer: 'Prime Retail',
    items: 4,
    total: '$1,680.00',
    status: 'Cancelled',
  },
  {
    id: '#ORD-006',
    date: '2024-01-10',
    customer: 'Express Sales',
    items: 6,
    total: '$2,945.25',
    status: 'Processing',
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Delivered':
      return 'bg-green-100 text-green-800';
    case 'Processing':
      return 'bg-blue-100 text-blue-800';
    case 'Shipped':
      return 'bg-purple-100 text-purple-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  customer: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export default function Orders() {
  const [allOrders, setAllOrders] = useState(
    orders.map((order) => ({
      ...order,
      items: [],
      total: parseFloat(order.total.replace('$', '').replace(',', '')),
      status: order.status as 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled',
    }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddOrder = (newOrder: Order) => {
    setAllOrders([...allOrders, newOrder]);
  };

  return (
    <DashboardLayout
      headerTitle="Sales & Orders"
      headerSubtitle="Manage your sales orders and shipments"
    >
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Order History</h2>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>All sales orders from your customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell className="text-right">{order.items.length}</TableCell>
                      <TableCell className="text-right font-semibold">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)} variant="outline">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="p-1 hover:bg-muted rounded-md transition-colors">
                          <Eye className="w-4 h-4 text-foreground" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">127</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">8</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting shipment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$42.5K</div>
              <p className="text-xs text-muted-foreground mt-1">This month</p>
            </CardContent>
          </Card>
        </div>

        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddOrder}
          mode="add"
        />
      </div>
    </DashboardLayout>
  );
}
