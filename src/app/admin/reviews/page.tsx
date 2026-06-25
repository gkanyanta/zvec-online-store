'use client';

import { useState, useEffect } from 'react';
import { Trash2, Star, Loader2, MessageSquare } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import type { Review } from '@/types';

type ReviewWithProduct = Review & { productName: string };

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <Star key={n} size={12} className={n <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/reviews')
      .then((r) => r.json())
      .then((data) => { setReviews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this review?')) return;
    await adminFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    setReviews((rs) => rs.filter((r) => r.id !== id));
  }

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Customer Reviews</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} · avg rating {avg}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <MessageSquare size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-700">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Reviews from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Stars rating={review.rating} />
                  <span className="font-semibold text-gray-900 text-sm">{review.authorName}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-teal-600 font-medium mb-1">{review.productName}</p>
                {review.comment && (
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(review.id)}
                className="p-1.5 text-gray-300 hover:text-red-500 transition-colors shrink-0 self-start"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
