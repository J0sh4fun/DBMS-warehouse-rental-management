'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, FileText, Edit2, Download, Trash2, Calendar } from 'lucide-react';
import { Contract, adminContracts } from '@/lib/mock-data';
import { ContractModal } from '@/components/modals/contract-modal';

export default function AdminContracts() {
  const [contracts, setContracts] = useState<Contract[]>(adminContracts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | undefined>();

  const filteredContracts = contracts.filter(
    (contract) =>
      (contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === 'all' || contract.status === statusFilter)
  );

  const handleViewContract = (contract: Contract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setContracts(contracts.filter((c) => c.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Rental Contracts</h1>
            <p className="text-muted-foreground">Manage and track all rental contracts</p>
          </div>
          <Button className="bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            New Contract
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Contracts</CardTitle>
            <div className="mt-4 flex gap-4">
              <Input
                placeholder="Search by customer or contract number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Monthly Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell className="font-medium">{contract.contractNumber}</TableCell>
                      <TableCell>{contract.customerName}</TableCell>
                      <TableCell className="text-sm">{contract.warehouseName}</TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {contract.startDate} - {contract.endDate}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">${contract.rentalPrice.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={contract.daysRemaining > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {contract.daysRemaining > 0 ? `${contract.daysRemaining} days` : `Expired ${Math.abs(contract.daysRemaining)} days ago`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewContract(contract)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="View Contract"
                          >
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-md transition-colors" title="Download">
                            <Download className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleDelete(contract.id)}
                            className="p-2 hover:bg-muted rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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
      </div>

      <ContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        contract={selectedContract}
      />
    </DashboardLayout>
  );
}
