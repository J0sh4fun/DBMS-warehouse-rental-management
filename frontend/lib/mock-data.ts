export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  rentalPrice: number;
  status: 'Available' | 'Rented';
  occupancy: number;
  customerId?: string;
  description?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  warehousesRented: number;
  rentalDuration: string;
  joinDate: string;
  totalSpent: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  customerId: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  rentalPrice: number;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Expired' | 'Pending' | 'Terminated';
  daysRemaining: number;
}

export interface InventoryItem {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  warehouseId: string;
  warehouseName: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  status: 'Delivered' | 'Processing' | 'Shipped' | 'Cancelled';
  amount: number;
}

// Admin Warehouses
export const adminWarehouses: Warehouse[] = [
  { id: 'WH-01', name: 'Downtown Hub', location: 'New York, NY', capacity: 5000, rentalPrice: 2500, status: 'Rented', occupancy: 85, customerId: 'CUST-001', description: 'Prime location warehouse' },
  { id: 'WH-02', name: 'Metro Warehouse', location: 'Los Angeles, CA', capacity: 8000, rentalPrice: 3200, status: 'Rented', occupancy: 92, customerId: 'CUST-003', description: 'Large capacity facility' },
  { id: 'WH-03', name: 'Industrial Park', location: 'Chicago, IL', capacity: 10000, rentalPrice: 3800, status: 'Available', occupancy: 0, description: 'State-of-the-art facility' },
  { id: 'WH-04', name: 'Tech Center Storage', location: 'San Francisco, CA', capacity: 6000, rentalPrice: 2800, status: 'Rented', occupancy: 78, customerId: 'CUST-005', description: 'Climate controlled' },
  { id: 'WH-05', name: 'Logistics Hub', location: 'Dallas, TX', capacity: 7500, rentalPrice: 3000, status: 'Available', occupancy: 0, description: 'Modern logistics facility' },
  { id: 'WH-06', name: 'Distribution Center', location: 'Atlanta, GA', capacity: 9000, rentalPrice: 3500, status: 'Rented', occupancy: 88, customerId: 'CUST-002', description: 'Central distribution point' },
];

// Admin Customers
export const adminCustomers: Customer[] = [
  { id: 'CUST-001', name: 'ABC Logistics', email: 'contact@abclogistics.com', phone: '(555) 123-4567', warehousesRented: 2, rentalDuration: '12 months', joinDate: '2023-06-15', totalSpent: 60000 },
  { id: 'CUST-002', name: 'XYZ Storage', email: 'info@xyzstorage.com', phone: '(555) 234-5678', warehousesRented: 1, rentalDuration: '6 months', joinDate: '2023-09-20', totalSpent: 19200 },
  { id: 'CUST-003', name: 'Tech Supply Co', email: 'sales@techsupply.com', phone: '(555) 345-6789', warehousesRented: 2, rentalDuration: '24 months', joinDate: '2022-12-01', totalSpent: 134400 },
  { id: 'CUST-004', name: 'Global Imports', email: 'admin@globalimports.com', phone: '(555) 456-7890', warehousesRented: 1, rentalDuration: '12 months', joinDate: '2023-03-10', totalSpent: 45600 },
  { id: 'CUST-005', name: 'Premium Distribution', email: 'contact@premdist.com', phone: '(555) 567-8901', warehousesRented: 3, rentalDuration: '18 months', joinDate: '2023-01-15', totalSpent: 162000 },
  { id: 'CUST-006', name: 'Quick Movers LLC', email: 'quotes@quickmovers.com', phone: '(555) 678-9012', warehousesRented: 1, rentalDuration: '3 months', joinDate: '2024-01-05', totalSpent: 8400 },
];

// Admin Contracts
export const adminContracts: Contract[] = [
  { id: 'CT-001', contractNumber: 'CNT-2024-001', customerId: 'CUST-001', customerName: 'ABC Logistics', warehouseId: 'WH-01', warehouseName: 'Downtown Hub', rentalPrice: 2500, startDate: '2023-06-15', endDate: '2024-06-15', status: 'Active', daysRemaining: 45 },
  { id: 'CT-002', contractNumber: 'CNT-2024-002', customerId: 'CUST-003', customerName: 'Tech Supply Co', warehouseId: 'WH-02', warehouseName: 'Metro Warehouse', rentalPrice: 3200, startDate: '2023-01-01', endDate: '2025-01-01', status: 'Active', daysRemaining: 127 },
  { id: 'CT-003', contractNumber: 'CNT-2024-003', customerId: 'CUST-005', customerName: 'Premium Distribution', warehouseId: 'WH-04', warehouseName: 'Tech Center Storage', rentalPrice: 2800, startDate: '2023-08-01', endDate: '2024-08-01', status: 'Active', daysRemaining: 78 },
  { id: 'CT-004', contractNumber: 'CNT-2024-004', customerId: 'CUST-002', customerName: 'XYZ Storage', warehouseId: 'WH-06', warehouseName: 'Distribution Center', rentalPrice: 3500, startDate: '2023-10-01', endDate: '2024-04-01', status: 'Expired', daysRemaining: 0 },
  { id: 'CT-005', contractNumber: 'CNT-2024-005', customerId: 'CUST-004', customerName: 'Global Imports', warehouseId: 'WH-05', warehouseName: 'Logistics Hub', rentalPrice: 3000, startDate: '2024-02-01', endDate: '2025-02-01', status: 'Pending', daysRemaining: 200 },
];

// Tenant Warehouses (for customers)
export const tenantWarehouses: Warehouse[] = [
  { id: 'WH-01', name: 'Downtown Hub', location: 'New York, NY', capacity: 5000, occupancy: 65, rentalPrice: 2500, status: 'Rented', description: 'Your primary warehouse location' },
  { id: 'WH-02', name: 'Metro Warehouse', location: 'Los Angeles, CA', capacity: 8000, occupancy: 45, rentalPrice: 3200, status: 'Rented', description: 'Secondary storage facility' },
  { id: 'WH-03', name: 'Chicago Distribution', location: 'Chicago, IL', capacity: 6000, occupancy: 38, rentalPrice: 2800, status: 'Rented', description: 'Regional distribution center' },
];

// Inventory Items
export const inventoryItems: InventoryItem[] = [
  { id: 'INV-001', productName: 'Electronic Components', category: 'Electronics', quantity: 1500, warehouseId: 'WH-01', warehouseName: 'Downtown Hub', status: 'In Stock' },
  { id: 'INV-002', productName: 'Office Furniture', category: 'Furniture', quantity: 45, warehouseId: 'WH-01', warehouseName: 'Downtown Hub', status: 'In Stock' },
  { id: 'INV-003', productName: 'Textiles & Fabrics', category: 'Textiles', quantity: 3200, warehouseId: 'WH-02', warehouseName: 'Metro Warehouse', status: 'In Stock' },
  { id: 'INV-004', productName: 'Automotive Parts', category: 'Auto Parts', quantity: 12, warehouseId: 'WH-02', warehouseName: 'Metro Warehouse', status: 'Low Stock' },
  { id: 'INV-005', productName: 'Raw Materials', category: 'Materials', quantity: 0, warehouseId: 'WH-03', warehouseName: 'Chicago Distribution', status: 'Out of Stock' },
  { id: 'INV-006', productName: 'Consumer Goods', category: 'General', quantity: 5600, warehouseId: 'WH-01', warehouseName: 'Downtown Hub', status: 'In Stock' },
  { id: 'INV-007', productName: 'Medical Supplies', category: 'Healthcare', quantity: 890, warehouseId: 'WH-03', warehouseName: 'Chicago Distribution', status: 'In Stock' },
  { id: 'INV-008', productName: 'Industrial Equipment', category: 'Equipment', quantity: 34, warehouseId: 'WH-02', warehouseName: 'Metro Warehouse', status: 'In Stock' },
];

// Orders
export const orders: Order[] = [
  { id: 'ORD-001', orderNumber: 'ORD-2024-001', customerName: 'Client A', date: '2024-01-15', status: 'Delivered', amount: 5200 },
  { id: 'ORD-002', orderNumber: 'ORD-2024-002', customerName: 'Client B', date: '2024-01-18', status: 'Shipped', amount: 3400 },
  { id: 'ORD-003', orderNumber: 'ORD-2024-003', customerName: 'Client C', date: '2024-01-20', status: 'Processing', amount: 7800 },
  { id: 'ORD-004', orderNumber: 'ORD-2024-004', customerName: 'Client D', date: '2024-01-21', status: 'Delivered', amount: 2100 },
  { id: 'ORD-005', orderNumber: 'ORD-2024-005', customerName: 'Client E', date: '2024-01-22', status: 'Shipped', amount: 4500 },
  { id: 'ORD-006', orderNumber: 'ORD-2024-006', customerName: 'Client F', date: '2024-01-23', status: 'Processing', amount: 6200 },
];
