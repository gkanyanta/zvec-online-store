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

export interface Order {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  paymentMethod: 'cod' | 'mobile_money' | 'bank_transfer';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
  deliveryAddress: string;
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
