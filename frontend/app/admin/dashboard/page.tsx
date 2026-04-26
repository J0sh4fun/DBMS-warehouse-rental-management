'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Warehouse, Users, FileText, TrendingUp } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 12000, contracts: 5 },
  { month: 'Feb', revenue: 19000, contracts: 8 },
  { month: 'Mar', revenue: 15000, contracts: 6 },
  { month: 'Apr', revenue: 24000, contracts: 10 },
  { month: 'May', revenue: 28000, contracts: 12 },
  { month: 'Jun', revenue: 32000, contracts: 14 },
];

const occupancyData = [
  { warehouse: 'WH-01', occupied: 85, available: 15 },
  { warehouse: 'WH-02', occupied: 92, available: 8 },
  { warehouse: 'WH-03', occupied: 65, available: 35 },
  { warehouse: 'WH-04', occupied: 78, available: 22 },
  { warehouse: 'WH-05', occupied: 88, available: 12 },
];

export default function AdminDashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Warehouse Rental Dashboard</h1>
          <p className="text-muted-foreground">Monitor your warehouse portfolio and rental operations</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Warehouses</CardTitle>
              <Warehouse className="w-4 h-4 text-sidebar-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active in portfolio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rented Units</CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">10</div>
              <p className="text-xs text-muted-foreground">83% occupancy rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <FileText className="w-4 h-4 text-sidebar-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$32,000</div>
              <p className="text-xs text-muted-foreground">+14% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Contracts by Month</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="contracts"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Warehouse Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle>Warehouse Occupancy Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="warehouse" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupied" stackId="a" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="available" stackId="a" fill="var(--muted)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Rental Contracts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 'CTR-001', customer: 'ABC Logistics', warehouse: 'WH-01', status: 'Active', duration: '12 months' },
                { id: 'CTR-002', customer: 'XYZ Storage', warehouse: 'WH-03', status: 'Active', duration: '6 months' },
                { id: 'CTR-003', customer: 'Tech Supply Co', warehouse: 'WH-02', status: 'Active', duration: '24 months' },
                { id: 'CTR-004', customer: 'Global Imports', warehouse: 'WH-04', status: 'Expiring Soon', duration: '2 months left' },
              ].map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">{contract.customer}</p>
                    <p className="text-sm text-muted-foreground">{contract.warehouse} • {contract.duration}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${contract.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {contract.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
