export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  image: string;
  images?: string[];
  description: string;
  features?: string[];
  inStock: boolean;
  badge?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  createdAt: string;
}

export interface DocumentItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type DocumentType = 'quote' | 'invoice' | 'receipt';
export type DocumentStatus =
  | 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  | 'paid' | 'overdue' | 'cancelled' | 'issued';

export interface BizDocument {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: DocumentItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  notes?: string;
  dueDate?: string;
  linkedDocId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Package {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  products: string[];
  totalValue: number;
  packagePrice: number;
  icon: string;
  color: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'mobile_money' | 'bank_transfer';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    province: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  notes?: string;
}
