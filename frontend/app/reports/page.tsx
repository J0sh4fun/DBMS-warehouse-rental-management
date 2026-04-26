'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Calendar } from 'lucide-react';

const inventoryData = [
  { month: 'Jan', stock: 12000, value: 45000 },
  { month: 'Feb', stock: 14200, value: 52000 },
  { month: 'Mar', stock: 13800, value: 48500 },
  { month: 'Apr', stock: 15600, value: 58000 },
  { month: 'May', stock: 16200, value: 61000 },
  { month: 'Jun', stock: 15800, value: 59500 },
];

const salesData = [
  { week: 'Week 1', orders: 45, revenue: 12500 },
  { week: 'Week 2', orders: 52, revenue: 14800 },
  { week: 'Week 3', orders: 48, revenue: 13600 },
  { week: 'Week 4', orders: 61, revenue: 17200 },
];

export default function Reports() {
  return (
    <DashboardLayout
      headerTitle="Reports"
      headerSubtitle="View detailed analytics and reports"
    >
      <div className="p-8 space-y-8">
        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <select className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm">
                  <option>Last 30 Days</option>
                  <option>Last 60 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export to PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">156</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">$287</div>
              <p className="text-xs text-muted-foreground mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Turnover</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">4.2x</div>
              <p className="text-xs text-muted-foreground mt-1">Healthy turnover rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fill Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">97.8%</div>
              <p className="text-xs text-muted-foreground mt-1">Order fulfillment rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Trends</CardTitle>
              <CardDescription>Stock quantity and inventory value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={inventoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--color-card))',
                      border: '1px solid hsl(var(--color-border))',
                      borderRadius: 'calc(var(--radius))',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="hsl(var(--color-chart-1))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--color-chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Sales Performance</CardTitle>
              <CardDescription>Orders and revenue by week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis stroke="hsl(var(--color-muted-foreground))" />
                  <YAxis stroke="hsl(var(--color-muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--color-card))',
                      border: '1px solid hsl(var(--color-border))',
                      borderRadius: 'calc(var(--radius))',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="orders" fill="hsl(var(--color-chart-1))" />
                  <Bar dataKey="revenue" fill="hsl(var(--color-chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Warehouse Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Warehouse Performance</CardTitle>
            <CardDescription>Key metrics by warehouse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['Warehouse A', 'Warehouse B', 'Warehouse C', 'Warehouse D'].map((warehouse) => (
                <div key={warehouse} className="p-4 border border-border rounded-lg">
                  <h4 className="font-semibold text-foreground mb-4">{warehouse}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Orders Handled</span>
                      <span className="font-semibold text-foreground">287</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Processing Time</span>
                      <span className="font-semibold text-foreground">2.3 hrs</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Efficiency Rate</span>
                      <span className="font-semibold text-foreground">94.5%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
