'use client';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
export const AUTH_STORAGE_KEY = 'warehousehub.auth';

export type UserType = 'ADMIN' | 'CUSTOMER';
export type AppRole = 'admin' | 'tenant';

export interface StoredAuth {
  token: string;
  tokenType: string;
  userRole: 'ROLE_ADMIN' | 'ROLE_CUSTOMER' | string;
  userId: number;
  username: string;
}

export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  details?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  details?: Record<string, string>;

  constructor(status: number, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  return auth?.token ? { Authorization: `${auth.tokenType || 'Bearer'} ${auth.token}` } : {};
}

function toQuery(params?: Record<string, string | number | boolean | null | undefined>) {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Record<string, string | number | boolean | null | undefined> } = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  Object.entries(authHeader()).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(`${API_BASE_URL}${path}${toQuery(options.query)}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!response.ok) {
    const body = typeof data === 'object' ? (data as ApiErrorBody | null) : null;
    throw new ApiError(response.status, body?.error || response.statusText || 'Request failed', body?.details);
  }

  return data as T;
}

export interface LoginRequest {
  username: string;
  password: string;
  userType?: UserType;
}

export interface RegisterRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
}

export interface JwtAuthResponse {
  token: string;
  type: string;
  userRole: string;
  userId: number;
}

export interface WarehouseResponse {
  warehouseId: number;
  warehouseName: string;
  address?: string | null;
  area?: number | null;
  rentalPrice?: number | null;
  status: 'Active' | 'Maintenance' | 'Inactive';
  adminId: number;
  adminName: string;
}

export interface WarehouseRequest {
  warehouseName: string;
  address?: string;
  area?: number;
  rentalPrice: number;
  status?: WarehouseResponse['status'];
}

export interface AdminCustomerResponse {
  customerId: number;
  customerName: string;
  username: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface LeaseContractResponse {
  contractId: number;
  customerId: number;
  customerName: string;
  warehouseId: number;
  warehouseName: string;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  status: 'Pending' | 'Active' | 'Expired' | 'Cancelled';
  purpose?: string | null;
  createdAt: string;
}

export interface LeaseContractRequest {
  customerId: number;
  warehouseId: number;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  status?: LeaseContractResponse['status'];
  purpose?: string;
}

export type RentalRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface RentalRequestCreateRequest {
  warehouseId: number;
  startDate: string;
  endDate: string;
  purpose?: string;
}

export interface RentalRequestResponse {
  requestId: number;
  customerId: number;
  customerName: string;
  warehouseId: number;
  warehouseName: string;
  adminId: number;
  adminName: string;
  startDate: string;
  endDate: string;
  rentalPrice: number;
  purpose?: string | null;
  status: RentalRequestStatus;
  contractId?: number | null;
  reviewNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  customerId: number;
}

export interface ProductResponse {
  productId: number;
  productName: string;
  currentPrice: number;
  unitOfMeasure: string;
  categoryId: number;
  customerId: number;
}

export interface SupplierResponse {
  supplierId: number;
  supplierName: string;
  phoneNumber?: string | null;
  address?: string | null;
  customerId: number;
}

export interface BuyerResponse {
  buyerId: number;
  buyerName: string;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  customerId: number;
}

export interface InventoryResponse {
  warehouseId: number;
  warehouseName: string;
  productId: number;
  productName: string;
  unitOfMeasure: string;
  batchNo: string;
  quantity: number;
  batchValue: number;
  lastUpdated: string;
}

export interface InventorySummaryResponse {
  productId: number;
  productName: string;
  unitOfMeasure: string;
  totalQuantity: number;
}

export interface ReceiptDetailRequest {
  productId: number;
  batchNo: string;
  quantity: number;
  importPrice: number;
  expiryDate?: string;
}

export interface InboundReceiptResponse {
  receiptId: number;
  warehouseId: number;
  warehouseName: string;
  supplierId: number;
  supplierName: string;
  receiptDate: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  createdAt: string;
  details: Array<ReceiptDetailRequest & { productName: string }>;
}

export interface IssueDetailRequest {
  productId: number;
  batchNo: string;
  quantity: number;
  sellingPrice: number;
}

export interface OutboundIssueResponse {
  issueId: number;
  warehouseId: number;
  warehouseName: string;
  buyerId: number;
  buyerName: string;
  issueDate: string;
  status: 'Draft' | 'Completed' | 'Cancelled';
  createdAt: string;
  details: Array<IssueDetailRequest & { productName: string }>;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface InventoryValueResponse {
  totalValue: number;
}

export interface ExpiringBatchResponse {
  receiptId: number;
  warehouseId: number;
  warehouseName: string;
  supplierId: number;
  supplierName: string;
  productId: number;
  productName: string;
  batchNo: string;
  currentQuantity: number;
  expiryDate: string;
}

export interface TopProductResponse {
  productId: number;
  productName: string;
  totalQuantity: number;
}

export const authApi = {
  login: (request: LoginRequest) =>
    apiRequest<JwtAuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  registerCustomer: (request: RegisterRequest) =>
    apiRequest<JwtAuthResponse>('/api/auth/register-customer', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
};

export const adminApi = {
  warehouses: () => apiRequest<WarehouseResponse[]>('/api/admin/warehouses'),
  createWarehouse: (request: WarehouseRequest) =>
    apiRequest<WarehouseResponse>('/api/admin/warehouses', { method: 'POST', body: JSON.stringify(request) }),
  updateWarehouse: (id: number, request: WarehouseRequest) =>
    apiRequest<WarehouseResponse>(`/api/admin/warehouses/${id}`, { method: 'PUT', body: JSON.stringify(request) }),
  deleteWarehouse: (id: number) => apiRequest<void>(`/api/admin/warehouses/${id}`, { method: 'DELETE' }),
  customers: () => apiRequest<AdminCustomerResponse[]>('/api/admin/customers'),
  contracts: (status?: LeaseContractResponse['status']) =>
    apiRequest<LeaseContractResponse[]>('/api/admin/contracts', { query: { status } }),
  createContract: (request: LeaseContractRequest) =>
    apiRequest<LeaseContractResponse>('/api/admin/contracts', { method: 'POST', body: JSON.stringify(request) }),
  updateContract: (id: number, request: LeaseContractRequest) =>
    apiRequest<LeaseContractResponse>(`/api/admin/contracts/${id}`, { method: 'PUT', body: JSON.stringify(request) }),
  updateContractStatus: (id: number, status: LeaseContractResponse['status']) =>
    apiRequest<LeaseContractResponse>(`/api/admin/contracts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteContract: (id: number) => apiRequest<void>(`/api/admin/contracts/${id}`, { method: 'DELETE' }),
  rentalRequests: (status?: RentalRequestStatus | 'all') =>
    apiRequest<RentalRequestResponse[]>('/api/admin/rental-requests', { query: { status: status === 'all' ? undefined : status } }),
  approveRentalRequest: (id: number, note?: string) =>
    apiRequest<RentalRequestResponse>(`/api/admin/rental-requests/${id}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),
  rejectRentalRequest: (id: number, note?: string) =>
    apiRequest<RentalRequestResponse>(`/api/admin/rental-requests/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),
};

export const customerApi = {
  availableWarehouses: (startDate: string, endDate: string) =>
    apiRequest<WarehouseResponse[]>('/api/customer/warehouses/available', { query: { startDate, endDate } }),
  contracts: () => apiRequest<LeaseContractResponse[]>('/api/customer/contracts'),
  rentalRequests: () => apiRequest<RentalRequestResponse[]>('/api/customer/rental-requests'),
  createRentalRequest: (request: RentalRequestCreateRequest) =>
    apiRequest<RentalRequestResponse>('/api/customer/rental-requests', { method: 'POST', body: JSON.stringify(request) }),
  categories: () => apiRequest<CategoryResponse[]>('/api/customer/categories'),
  createCategory: (categoryName: string) =>
    apiRequest<CategoryResponse>('/api/customer/categories', {
      method: 'POST',
      body: JSON.stringify({ categoryName }),
    }),
  updateCategory: (id: number, categoryName: string) =>
    apiRequest<CategoryResponse>(`/api/customer/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ categoryName }),
    }),
  deleteCategory: (id: number) => apiRequest<void>(`/api/customer/categories/${id}`, { method: 'DELETE' }),
  products: () => apiRequest<ProductResponse[]>('/api/customer/products'),
  createProduct: (request: Omit<ProductResponse, 'productId' | 'customerId'>) =>
    apiRequest<ProductResponse>('/api/customer/products', { method: 'POST', body: JSON.stringify(request) }),
  updateProduct: (id: number, request: Omit<ProductResponse, 'productId' | 'customerId'>) =>
    apiRequest<ProductResponse>(`/api/customer/products/${id}`, { method: 'PUT', body: JSON.stringify(request) }),
  deleteProduct: (id: number) => apiRequest<void>(`/api/customer/products/${id}`, { method: 'DELETE' }),
  suppliers: () => apiRequest<SupplierResponse[]>('/api/customer/suppliers'),
  createSupplier: (request: Omit<SupplierResponse, 'supplierId' | 'customerId'>) =>
    apiRequest<SupplierResponse>('/api/customer/suppliers', { method: 'POST', body: JSON.stringify(request) }),
  updateSupplier: (id: number, request: Omit<SupplierResponse, 'supplierId' | 'customerId'>) =>
    apiRequest<SupplierResponse>(`/api/customer/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(request) }),
  deleteSupplier: (id: number) => apiRequest<void>(`/api/customer/suppliers/${id}`, { method: 'DELETE' }),
  buyers: () => apiRequest<BuyerResponse[]>('/api/customer/buyers'),
  createBuyer: (request: Omit<BuyerResponse, 'buyerId' | 'customerId'>) =>
    apiRequest<BuyerResponse>('/api/customer/buyers', { method: 'POST', body: JSON.stringify(request) }),
  updateBuyer: (id: number, request: Omit<BuyerResponse, 'buyerId' | 'customerId'>) =>
    apiRequest<BuyerResponse>(`/api/customer/buyers/${id}`, { method: 'PUT', body: JSON.stringify(request) }),
  deleteBuyer: (id: number) => apiRequest<void>(`/api/customer/buyers/${id}`, { method: 'DELETE' }),
  inventory: () => apiRequest<InventoryResponse[]>('/api/inventory'),
  inventorySummary: () => apiRequest<InventorySummaryResponse[]>('/api/inventory/summary'),
  inboundReceipts: () => apiRequest<PagedResponse<InboundReceiptResponse>>('/api/inbound-receipts', { query: { size: 100 } }),
  createInboundReceipt: (request: {
    warehouseId: number;
    supplierId: number;
    receiptDate?: string;
    status?: InboundReceiptResponse['status'];
    details: ReceiptDetailRequest[];
  }) => apiRequest<InboundReceiptResponse>('/api/inbound-receipts', { method: 'POST', body: JSON.stringify(request) }),
  completeInboundReceipt: (id: number) =>
    apiRequest<InboundReceiptResponse>(`/api/inbound-receipts/${id}/complete`, { method: 'PATCH' }),
  cancelInboundReceipt: (id: number) =>
    apiRequest<InboundReceiptResponse>(`/api/inbound-receipts/${id}/cancel`, { method: 'PATCH' }),
  outboundIssues: () => apiRequest<PagedResponse<OutboundIssueResponse>>('/api/outbound-issues', { query: { size: 100 } }),
  createOutboundIssue: (request: {
    warehouseId: number;
    buyerId: number;
    issueDate?: string;
    status?: OutboundIssueResponse['status'];
    details: IssueDetailRequest[];
  }) => apiRequest<OutboundIssueResponse>('/api/outbound-issues', { method: 'POST', body: JSON.stringify(request) }),
  completeOutboundIssue: (id: number) =>
    apiRequest<OutboundIssueResponse>(`/api/outbound-issues/${id}/complete`, { method: 'PATCH' }),
  cancelOutboundIssue: (id: number) =>
    apiRequest<OutboundIssueResponse>(`/api/outbound-issues/${id}/cancel`, { method: 'PATCH' }),
  inventoryValue: () => apiRequest<InventoryValueResponse>('/api/reports/inventory-value'),
  expiringBatches: (expiresOnOrBefore?: string) =>
    apiRequest<ExpiringBatchResponse[]>('/api/reports/expiring-batches', { query: { expiresOnOrBefore } }),
  topProducts: (month?: string, limit = 10) =>
    apiRequest<TopProductResponse[]>('/api/reports/top-products', { query: { month, limit } }),
};

export function formatError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details) {
      return Object.entries(error.details)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
    }
    return error.message;
  }
  return error instanceof Error ? error.message : 'Unexpected error';
}

export function roleFromBackend(userRole: string): AppRole {
  return userRole === 'ROLE_ADMIN' ? 'admin' : 'tenant';
}
