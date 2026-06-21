import { NextResponse } from 'next/server';

const SID   = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM  = process.env.TWILIO_WHATSAPP_FROM;   // e.g. whatsapp:+14155238886
const ADMIN = process.env.ADMIN_WHATSAPP_NUMBER;   // e.g. +260574641838

function toE164(phone: string): string {
  const stripped = phone.replace(/[\s\-().+]/g, '');
  if (stripped.startsWith('260')) return `+${stripped}`;
  if (stripped.startsWith('0') && stripped.length === 10) return `+260${stripped.slice(1)}`;
  return `+${stripped}`;
}

async function sendWhatsApp(to: string, body: string) {
  if (!SID || !TOKEN || !FROM) return;
  const normalized = to.startsWith('whatsapp:') ? to : `whatsapp:${toE164(to)}`;
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: FROM, To: normalized, Body: body }).toString(),
  });
}

export async function POST(req: Request) {
  try {
    const { event, order } = await req.json();

    if (event === 'order_placed') {
      const itemsList = order.items
        .map((i: { productName: string; quantity: number }) => `• ${i.productName} ×${i.quantity}`)
        .join('\n');

      if (ADMIN) {
        await sendWhatsApp(
          ADMIN,
          `🛒 *New Order — ${order.id}*\n\n` +
          `Customer: ${order.customer.firstName} ${order.customer.lastName}\n` +
          `Phone: ${order.customer.phone}\n` +
          `City: ${order.customer.city}\n\n` +
          `Items:\n${itemsList}\n\n` +
          `Total: K${order.total.toLocaleString()}\n` +
          `Payment: ${order.paymentMethod.replace('_', ' ').toUpperCase()}`
        );
      }

      if (order.customer.phone) {
        await sendWhatsApp(
          order.customer.phone,
          `Hi ${order.customer.firstName}! 👋\n\n` +
          `Your order *${order.id}* has been received by ZVEC.\n\n` +
          `Total: *K${order.total.toLocaleString()}*\n` +
          `Payment: Cash on Delivery\n\n` +
          `We'll confirm your order shortly. Thank you for shopping with us! 🙏`
        );
      }
    }

    if (event === 'status_update') {
      const messages: Record<string, string> = {
        confirmed:
          `Hi ${order.customer.firstName}! ✅\n\nYour order *${order.id}* has been confirmed and is being prepared. We'll update you when it ships.`,
        shipped:
          `Hi ${order.customer.firstName}! 🚚\n\nGreat news! Your order *${order.id}* is on its way to ${order.customer.city}.\n\nPlease have *K${order.total.toLocaleString()}* ready for Cash on Delivery.`,
        delivered:
          `Hi ${order.customer.firstName}! 🎉\n\nYour order *${order.id}* has been delivered. Thank you for shopping with ZVEC!\n\nWe hope you enjoy your purchase. 😊`,
        cancelled:
          `Hi ${order.customer.firstName}, your order *${order.id}* has been cancelled. Please contact us if you have any questions: ${ADMIN ?? 'our support line'}.`,
      };

      const msg = messages[order.status];
      if (msg && order.customer.phone) {
        await sendWhatsApp(order.customer.phone, msg);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('WhatsApp notify error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
