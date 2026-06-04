import { OrderStatus } from '@/store/orders';

const config: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-yellow-100 text-yellow-800' },
  confirmed:  { label: 'Confirmed',  className: 'bg-blue-100 text-blue-800' },
  processing: { label: 'Processing', className: 'bg-purple-100 text-purple-800' },
  shipped:    { label: 'Shipped',    className: 'bg-indigo-100 text-indigo-800' },
  delivered:  { label: 'Delivered',  className: 'bg-green-100 text-green-800' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-800' },
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
