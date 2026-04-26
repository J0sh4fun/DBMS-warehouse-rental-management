export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'tenant';
  company?: string;
}

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@warehousehub.com',
    avatar: 'NV',
    role: 'admin',
    company: 'WarehouseHub Admin',
  },
  {
    id: 'admin-2',
    name: 'Trần Thị Manager',
    email: 'manager@warehousehub.com',
    avatar: 'TT',
    role: 'admin',
    company: 'WarehouseHub Admin',
  },
  {
    id: 'tenant-1',
    name: 'Hoàng Công Minh',
    email: 'hoang@textile-co.vn',
    avatar: 'HM',
    role: 'tenant',
    company: 'Công ty Dệt Minh',
  },
  {
    id: 'tenant-2',
    name: 'Phạm Thị Hoa',
    email: 'pham@export-trade.vn',
    avatar: 'PH',
    role: 'tenant',
    company: 'Công ty Thương mại Xuất khẩu',
  },
  {
    id: 'tenant-3',
    name: 'Đỗ Minh Tâm',
    email: 'do@logistics-vn.vn',
    avatar: 'DM',
    role: 'tenant',
    company: 'Công ty Logistics Đỗ Minh',
  },
];

export const defaultUser = mockUsers[0];
