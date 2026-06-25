import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import WhatsAppBubble from '@/components/WhatsAppBubble';

export const metadata: Metadata = {
  title: 'ZVEC Online Store — Trusted Zambian Shopping',
  description: 'Shop household goods, electronics, laptops, TVs, refrigerators and more. Delivered nationwide across Zambia. Cash on Delivery available.',
  keywords: 'ZVEC, online store, Zambia, electronics, household, refrigerator, laptop, TV, delivery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50 antialiased">
        <Header />
        <CartSidebar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppBubble />
      </body>
    </html>
  );
}
