export function formatCurrency(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString('vi-VN');
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('vi-VN');
}

export function statusClass(status: string) {
  switch (status) {
    case 'Active':
    case 'Completed':
      return 'bg-green-100 text-green-800';
    case 'Pending':
    case 'Draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'Maintenance':
      return 'bg-blue-100 text-blue-800';
    case 'Inactive':
    case 'Expired':
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
