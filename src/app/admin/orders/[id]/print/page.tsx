import { sql, toOrder, ensureSchema } from '@/lib/db';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import PrintTrigger from './PrintTrigger';

export default async function PrintSlipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ensureSchema();
  const rows = await sql`SELECT * FROM orders WHERE id = ${id}`;
  if (!rows.length) notFound();
  const order = toOrder(rows[0]);

  const date = new Date(order.createdAt).toLocaleDateString('en-ZM', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <PrintTrigger />
      <div className="min-h-screen bg-white p-8 max-w-2xl mx-auto print:p-0 print:max-w-none font-sans">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
          <div>
            <h1 className="text-2xl font-black text-gray-900">ZVEC Online Store</h1>
            <p className="text-gray-500 text-sm mt-0.5">Lusaka, Zambia</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Packing Slip</p>
            <p className="font-mono font-black text-lg text-gray-900 mt-0.5">{order.id.toUpperCase()}</p>
            <p className="text-gray-500 text-sm">{date}</p>
          </div>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Deliver To</p>
            <p className="font-bold text-gray-900">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-gray-700 text-sm">{order.customer.address}</p>
            <p className="text-gray-700 text-sm">{order.customer.city}, {order.customer.province}</p>
            <p className="text-gray-900 font-semibold text-sm mt-1">{order.customer.phone}</p>
            {order.customer.email && <p className="text-gray-500 text-xs">{order.customer.email}</p>}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Order Info</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold capitalize text-gray-900">{order.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment</span>
                <span className="font-semibold text-gray-900">{order.paymentMethod.replace('_', ' ').toUpperCase()}</span>
              </div>
              {order.deliveryDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Date</span>
                  <span className="font-semibold text-gray-900">{order.deliveryDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b-2 border-gray-900">
              <th className="text-left py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Item</th>
              <th className="text-center py-2 text-xs font-bold text-gray-500 uppercase tracking-wide w-16">Qty</th>
              <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Price</th>
              <th className="text-right py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-sm font-medium text-gray-900">{item.productName}</td>
                <td className="py-3 text-sm text-center text-gray-700">{item.quantity}</td>
                <td className="py-3 text-sm text-right text-gray-700">{formatPrice(item.price)}</td>
                <td className="py-3 text-sm text-right font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-56 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span><span>{formatPrice(order.deliveryFee)}</span>
              </div>
            )}
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between text-teal-600">
                <span>Discount</span><span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-gray-900 pt-2 border-t-2 border-gray-900">
              <span>Total Due</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.customer.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-sm">
            <p className="font-semibold text-yellow-800 mb-1">Delivery Note:</p>
            <p className="text-yellow-700">{order.customer.notes}</p>
          </div>
        )}

        <p className="text-center text-gray-400 text-xs border-t border-gray-100 pt-4">
          Thank you for shopping with ZVEC Online Store
        </p>
      </div>
    </>
  );
}
