import type { Order } from '@/types';

const FROM = process.env.RESEND_FROM_EMAIL ?? 'ZVEC Online Store <orders@zvec.co.zm>';

export async function sendOrderConfirmation(order: Order): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);
  const email = order.customer.email;
  if (!email) return;

  const itemRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151">${item.productName}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#374151;text-align:right">K${item.price.toLocaleString()}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:14px;font-weight:600;color:#0f172a;text-align:right">K${(item.price * item.quantity).toLocaleString()}</td>
        </tr>`
    )
    .join('');

  const discountRow =
    order.discountAmount && order.discountAmount > 0
      ? `<tr><td colspan="3" style="padding:6px 0;font-size:13px;color:#14b8a6">Discount (${order.discountCode})</td><td style="text-align:right;font-size:13px;color:#14b8a6">-K${order.discountAmount.toLocaleString()}</td></tr>`
      : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr><td style="background:#030712;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center">
          <p style="color:#f59e0b;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.5px">ZVEC Online Store</p>
          <p style="color:#9ca3af;font-size:13px;margin:6px 0 0">Your order is confirmed!</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:32px">
          <p style="font-size:16px;color:#374151;margin:0 0 6px">Hi ${order.customer.firstName},</p>
          <p style="font-size:14px;color:#6b7280;margin:0 0 24px">
            Thank you for your order. We&rsquo;ve received it and will be in touch to confirm delivery.
          </p>

          <div style="background:#f8fafc;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="font-size:12px;color:#9ca3af;margin:0 0 4px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px">Order Reference</p>
            <p style="font-size:18px;font-weight:800;color:#0f172a;margin:0;font-family:monospace">${order.id.toUpperCase()}</p>
          </div>

          <!-- Items -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px">
            <thead>
              <tr>
                <th style="text-align:left;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Item</th>
                <th style="text-align:center;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Qty</th>
                <th style="text-align:right;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Price</th>
                <th style="text-align:right;font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #e2e8f0">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- Totals -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td colspan="3" style="padding:4px 0;font-size:13px;color:#6b7280">Subtotal</td><td style="text-align:right;font-size:13px;color:#374151">K${order.subtotal.toLocaleString()}</td></tr>
            ${discountRow}
            <tr><td colspan="3" style="padding:4px 0;font-size:13px;color:#6b7280">Delivery</td><td style="text-align:right;font-size:13px;color:#374151">${order.deliveryFee > 0 ? `K${order.deliveryFee.toLocaleString()}` : 'Free'}</td></tr>
            <tr><td colspan="3" style="padding:12px 0 0;font-size:16px;font-weight:800;color:#0f172a;border-top:2px solid #e2e8f0">Total</td><td style="text-align:right;padding-top:12px;font-size:16px;font-weight:800;color:#0f172a;border-top:2px solid #e2e8f0">K${order.total.toLocaleString()}</td></tr>
          </table>

          <!-- Delivery info -->
          <div style="background:#f0fdf4;border-left:4px solid #14b8a6;border-radius:0 8px 8px 0;padding:14px 16px;margin-bottom:24px">
            <p style="font-size:13px;font-weight:700;color:#0f172a;margin:0 0 6px">Delivery Address</p>
            <p style="font-size:13px;color:#374151;margin:0;line-height:1.6">
              ${order.customer.firstName} ${order.customer.lastName}<br>
              ${order.customer.address}<br>
              ${order.customer.city}, ${order.customer.province}<br>
              ${order.customer.phone}
            </p>
          </div>

          <p style="font-size:13px;color:#6b7280;margin:0">
            Questions? WhatsApp us or call <strong>+260 966 000 000</strong>. We&rsquo;ll reach out to confirm your delivery slot.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f8fafc;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0">
          <p style="font-size:12px;color:#9ca3af;margin:0">ZVEC Online Store &middot; Lusaka, Zambia &middot; Genuine Electronics</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Order confirmed — ${order.id.toUpperCase()} | ZVEC`,
    html,
  });
}
