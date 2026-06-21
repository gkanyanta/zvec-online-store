export function formatPrice(price: number): string {
  return `K${price.toLocaleString('en-ZM')}`;
}

export function calculateDiscount(original: number, sale: number): number {
  return Math.round(((original - sale) / original) * 100);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function nanoid(len = 12): string {
  return Math.random().toString(36).slice(2, 2 + len).padEnd(len, '0');
}
