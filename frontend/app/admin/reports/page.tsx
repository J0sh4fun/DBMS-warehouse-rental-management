'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Filter } from 'lucide-react';

const revenueByWarehouse = [
  { name: 'WH-01', revenue: 30000, contracts: 1 },
  { name: 'WH-02', revenue: 38400, contracts: 1 },
  { name: 'WH-03', revenue: 0, contracts: 0 },
  { name: 'WH-04', revenue: 33600, contracts: 1 },
  { name: 'WH-05', revenue: 0, contracts: 0 },
  { name: 'WH-06', revenue: 42000, contracts: 1 },
];

const rentalDurationStats = [
  { duration: '3 months', count: 2, revenue: 8400 },
  { duration: '6 months', count: 3, revenue: 19200 },
  { duration: '12 months', count: 8, revenue: 108000 },
  { duration: '18 months', count: 2, revenue: 81000 },
  { duration: '24 months', count: 1, revenue: 67200 },
];

const contractDistribution = [
  { name: 'Active', value: 4, color: '#10b981' },
  { name: 'Expired', value: 2, color: '#ef4444' },
  { name: 'Pending', value: 1, color: '#f59e0b' },
];

const monthlyMetrics = [
  { month: 'Jan', revenue: 12000, newContracts: 2, occupancy: 70 },
  { month: 'Feb', revenue: 15000, newContracts: 2, occupancy: 72 },
  { month: 'Mar', revenue: 18000, newContracts: 3, occupancy: 75 },
  { month: 'Apr', revenue: 22000, newContracts: 2, occupancy: 80 },
  { month: 'May', revenue: 25000, newContracts: 2, occupancy: 82 },
  { month: 'Jun', revenue: 28000, newContracts: 1, occupancy: 83 },
];

export default function AdminReports() {
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-06-30' });

  const totalRevenue = revenueByWarehouse.reduce((sum, wh) => sum + wh.revenue, 0);
  const totalContracts = revenueByWarehouse.reduce((sum, wh) => sum + wh.contracts, 0);
  const avgRevenue = totalRevenue / (revenueByWarehouse.filter((wh) => wh.revenue > 0).length || 1);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business insights and performance metrics</p>
        </div>

        {/* Date Filter */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="max-w-xs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="max-w-xs"
                />
              </div>
              <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground gap-2">
                <Filter className="w-4 h-4" />
                Apply Filter
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(totalRevenue / 1000).toFixed(0)}K</div>
              <p className="text-xs text-muted-foreground">Period {dateRange.start} to {dateRange.end}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalContracts}</div>
              <p className="text-xs text-muted-foreground">Across all warehouses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${(avgRevenue / 1000).toFixed(1)}K</div>
              <p className="text-xs text-muted-foreground">Monthly average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Warehouse */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Warehouse</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByWarehouse}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Contract Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={contractDistribution} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {contractDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="occupancy" stroke="var(--accent)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rental Duration Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Rental Duration Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Duration</th>
                    <th className="text-left py-2 px-4">Count</th>
                    <th className="text-left py-2 px-4">Total Revenue</th>
                    <th className="text-left py-2 px-4">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {rentalDurationStats.map((stat, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted transition-colors">
                      <td className="py-2 px-4">{stat.duration}</td>
                      <td className="py-2 px-4 font-medium">{stat.count}</td>
                      <td className="py-2 px-4 font-medium">${stat.revenue.toLocaleString()}</td>
                      <td className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div className="bg-sidebar-primary h-2 rounded-full" style={{ width: `${(stat.revenue / 108000) * 100}%` }} />
                          </div>
                          <span className="text-sm text-muted-foreground">{Math.round((stat.revenue / 283800) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
