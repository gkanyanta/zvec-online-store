import { NextResponse } from 'next/server';
import { sql, ensureSchema } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const authErr = requireAdmin(req);
  if (authErr) return authErr;
  await ensureSchema();

  const [totals, monthly, byStatus, topProducts] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int                                              AS order_count,
        COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0) AS revenue,
        COALESCE(AVG(total) FILTER (WHERE status != 'cancelled'), 0) AS avg_order
      FROM orders
    `,
    sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
        DATE_TRUNC('month', created_at)                      AS month_date,
        COUNT(*)::int                                         AS orders,
        COALESCE(SUM(total) FILTER (WHERE status != 'cancelled'), 0) AS revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY 2, 1
      ORDER BY 2 ASC
    `,
    sql`
      SELECT status, COUNT(*)::int AS count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `,
    sql`
      SELECT
        item->>'productId'   AS product_id,
        item->>'productName' AS product_name,
        SUM((item->>'price')::numeric * (item->>'quantity')::numeric)::numeric AS revenue,
        SUM((item->>'quantity')::numeric)::int                                  AS units_sold
      FROM orders, jsonb_array_elements(items::jsonb) AS item
      WHERE status != 'cancelled'
      GROUP BY 1, 2
      ORDER BY revenue DESC
      LIMIT 10
    `,
  ]);

  return NextResponse.json({
    totals: totals[0],
    monthly: monthly.map((r) => ({
      month: r.month,
      orders: r.orders,
      revenue: Number(r.revenue),
    })),
    byStatus: byStatus.map((r) => ({ status: r.status, count: r.count })),
    topProducts: topProducts.map((r) => ({
      productId: r.product_id,
      productName: r.product_name,
      revenue: Number(r.revenue),
      unitsSold: r.units_sold,
    })),
  });
}
