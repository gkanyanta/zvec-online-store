'use client';

import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, total } = useCartStore();

  if (!isOpen) return null;

  const cartTotal = total();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart size={20} className="text-green-600" />
            Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
              <ShoppingCart size={48} strokeWidth={1} />
              <p className="font-medium">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-green-600 font-medium hover:underline text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3 bg-gray-50 p-3 rounded-xl">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">
                    {item.product.name}
                  </h4>
                  <p className="text-green-700 font-bold text-sm">{formatPrice(item.product.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 hover:text-green-600"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:border-green-500 hover:text-green-600"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-lg text-gray-900">{formatPrice(cartTotal)}</span>
            </div>
            <p className="text-xs text-gray-500">Delivery fee calculated at checkout. COD available.</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-bold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
