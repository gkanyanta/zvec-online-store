import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface OrdersStore {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
}

const SEED_ORDERS: Order[] = [
  {
    id: 'ZVE-ABC123',
    customer: { firstName: 'Mwansa', lastName: 'Chanda', phone: '+260977123456', email: 'mwansa@email.com', address: '12 Kabelenga Rd, Roma', city: 'Lusaka', province: 'Lusaka Province' },
    items: [
      { productId: 'r001', productName: 'Hisense 230L Double Door Refrigerator', productImage: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80', price: 4800, quantity: 1 },
      { productId: 't001', productName: 'Hisense 43" 4K Smart TV', productImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=80', price: 3200, quantity: 1 },
    ],
    subtotal: 8000, deliveryFee: 50, total: 8050, paymentMethod: 'cod', status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'ZVE-DEF456',
    customer: { firstName: 'Thandiwe', lastName: 'Phiri', phone: '+260966234567', email: '', address: '45 Great East Rd', city: 'Lusaka', province: 'Lusaka Province', notes: 'Call before delivery' },
    items: [
      { productId: 'l001', productName: 'Lenovo IdeaPad 15" Laptop', productImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80', price: 4500, quantity: 1 },
      { productId: 's002', productName: 'HP DeskJet Ink Advantage Printer', productImage: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80', price: 1450, quantity: 1 },
    ],
    subtotal: 5950, deliveryFee: 50, total: 6000, paymentMethod: 'cod', status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'ZVE-GHI789',
    customer: { firstName: 'Bwalya', lastName: 'Mutale', phone: '+260955345678', email: 'bwalya@work.com', address: '7 Nkana Rd', city: 'Kitwe', province: 'Copperbelt Province' },
    items: [
      { productId: 'pkg001', productName: 'Civil Servant Package', productImage: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80', price: 8500, quantity: 1 },
    ],
    subtotal: 8500, deliveryFee: 150, total: 8650, paymentMethod: 'cod', status: 'processing',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: 'ZVE-JKL012',
    customer: { firstName: 'Chilufya', lastName: 'Banda', phone: '+260979456789', email: 'chilufya@gmail.com', address: '22 Independence Ave', city: 'Ndola', province: 'Copperbelt Province' },
    items: [
      { productId: 'm001', productName: 'Samsung Galaxy A35 5G', productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80', price: 3200, quantity: 2 },
    ],
    subtotal: 6400, deliveryFee: 150, total: 6550, paymentMethod: 'cod', status: 'shipped',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'ZVE-MNO345',
    customer: { firstName: 'Namukolo', lastName: 'Sikaala', phone: '+260960567890', email: '', address: '5 Livingstone Way', city: 'Livingstone', province: 'Southern Province' },
    items: [
      { productId: 'f001', productName: '3-Seater Fabric Sofa Set', productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', price: 3500, quantity: 1 },
      { productId: 'f002', productName: 'Queen Size Bed Frame with Mattress', productImage: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80', price: 4200, quantity: 1 },
    ],
    subtotal: 7700, deliveryFee: 150, total: 7850, paymentMethod: 'cod', status: 'delivered',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'ZVE-PQR678',
    customer: { firstName: 'Mulenga', lastName: 'Kapasa', phone: '+260977678901', email: 'mulenga@email.com', address: 'Plot 15, Kabulonga', city: 'Lusaka', province: 'Lusaka Province' },
    items: [
      { productId: 'pkg004', productName: 'New Home Package', productImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80', price: 14500, quantity: 1 },
    ],
    subtotal: 14500, deliveryFee: 50, total: 14550, paymentMethod: 'cod', status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'ZVE-STU901',
    customer: { firstName: 'Kayumba', lastName: 'Tembo', phone: '+260966789012', email: '', address: 'Room 14, Unza Hostels', city: 'Lusaka', province: 'Lusaka Province' },
    items: [
      { productId: 'pkg002', productName: 'Student Package', productImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80', price: 4500, quantity: 1 },
    ],
    subtotal: 4500, deliveryFee: 50, total: 4550, paymentMethod: 'cod', status: 'confirmed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
];

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      orders: SEED_ORDERS,
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      updateStatus: (id, status) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id ? { ...o, status, updatedAt: new Date().toISOString() } : o
          ),
        })),
      deleteOrder: (id) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
    }),
    { name: 'zvec-orders' }
  )
);
