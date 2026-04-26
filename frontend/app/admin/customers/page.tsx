'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi, AdminCustomerResponse, formatError } from '@/lib/api';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<AdminCustomerResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        setCustomers(await adminApi.customers());
      } catch (err) {
        setError(formatError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.username.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [customers, searchTerm]
  );

  return (
    <DashboardLayout headerTitle="Current Tenants" headerSubtitle="Customers with active leases in your warehouses.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
            <Input
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="mt-4 max-w-sm"
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading tenants...</p>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No current tenants found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((customer) => (
                      <TableRow key={customer.customerId}>
                        <TableCell className="font-medium">{customer.customerId}</TableCell>
                        <TableCell>{customer.customerName}</TableCell>
                        <TableCell>{customer.username}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phoneNumber || '-'}</TableCell>
                        <TableCell>{customer.address || '-'}</TableCell>
                        <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
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
