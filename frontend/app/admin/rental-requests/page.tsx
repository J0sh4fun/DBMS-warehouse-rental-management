'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, CheckCircle2, ClipboardList, XCircle } from 'lucide-react';
import { adminApi, formatError, RentalRequestResponse, RentalRequestStatus } from '@/lib/api';

function statusClass(status: RentalRequestResponse['status']) {
  switch (status) {
    case 'Approved':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'Rejected':
      return 'border-red-200 bg-red-50 text-red-700';
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700';
  }
}

export default function AdminRentalRequestsPage() {
  const [requests, setRequests] = useState<RentalRequestResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<RentalRequestStatus | 'all'>('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ action: 'approve' | 'reject'; request: RentalRequestResponse } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRequests(await adminApi.rentalRequests(statusFilter));
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const filteredRequests = useMemo(
    () =>
      requests.filter(
        (request) =>
          request.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(request.requestId).includes(searchTerm)
      ),
    [requests, searchTerm]
  );

  const openReviewDialog = (action: 'approve' | 'reject', request: RentalRequestResponse) => {
    setReviewNote('');
    setReviewDialog({ action, request });
  };

  const submitReview = async () => {
    if (!reviewDialog) return;
    const requestId = reviewDialog.request.requestId;
    const note = reviewNote.trim() || undefined;
    setReviewingId(requestId);
    setError('');
    try {
      if (reviewDialog.action === 'approve') {
        await adminApi.approveRentalRequest(requestId, note);
      } else {
        await adminApi.rejectRentalRequest(requestId, note);
      }
      setReviewDialog(null);
      setReviewNote('');
      await load();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <DashboardLayout headerTitle="Rental Requests" headerSubtitle="Review customer warehouse rental requests.">
      <div className="space-y-6 p-8">
        {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Customer Requests
            </CardTitle>
            <div className="mt-4 flex flex-wrap gap-4">
              <Input
                placeholder="Search by customer, warehouse, or request ID..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="max-w-sm"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as RentalRequestStatus | 'all')}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading requests...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rental requests found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contract</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request.requestId}>
                        <TableCell className="font-medium">{request.requestId}</TableCell>
                        <TableCell>{request.customerName} #{request.customerId}</TableCell>
                        <TableCell>{request.warehouseName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {request.startDate} - {request.endDate}
                          </div>
                        </TableCell>
                        <TableCell>{Number(request.rentalPrice).toLocaleString()}</TableCell>
                        <TableCell>{request.purpose || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusClass(request.status)} variant="outline">
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{request.contractId ? `#${request.contractId}` : '-'}</TableCell>
                        <TableCell className="text-right">
                          {request.status === 'Pending' ? (
                            <div className="flex justify-end gap-2">
                              <Button size="sm" onClick={() => openReviewDialog('approve', request)} disabled={reviewingId === request.requestId}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => openReviewDialog('reject', request)} disabled={reviewingId === request.requestId}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">{request.reviewNote || 'Reviewed'}</span>
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

      <Dialog open={reviewDialog !== null} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reviewDialog?.action === 'approve' ? 'Approve rental request' : 'Reject rental request'}</DialogTitle>
            <DialogDescription>
              {reviewDialog?.action === 'approve'
                ? 'This will approve the request and create a new active contract for the customer.'
                : 'This will reject the request and send the note back to the customer.'}
            </DialogDescription>
          </DialogHeader>
          {reviewDialog && (
            <div className="space-y-4">
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <p className="font-semibold">{reviewDialog.request.customerName} #{reviewDialog.request.customerId}</p>
                <p className="text-muted-foreground">
                  {reviewDialog.request.warehouseName} - {reviewDialog.request.startDate} - {reviewDialog.request.endDate}
                </p>
              </div>
              <div className="space-y-2">
                <Label>{reviewDialog.action === 'approve' ? 'Admin note (optional)' : 'Rejection note'}</Label>
                <Textarea
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder={reviewDialog.action === 'approve' ? 'Optional note for this approval' : 'Reason for rejection'}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)} disabled={reviewingId !== null}>
              Cancel
            </Button>
            <Button
              onClick={submitReview}
              disabled={reviewingId !== null}
              variant={reviewDialog?.action === 'reject' ? 'destructive' : 'default'}
            >
              {reviewingId !== null ? 'Processing...' : reviewDialog?.action === 'approve' ? 'Approve and Create Contract' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
