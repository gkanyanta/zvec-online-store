'use client';

import { useState, useEffect } from 'react';
import { Star, Send, Loader2, ThumbsUp } from 'lucide-react';
import type { Review } from '@/types';

function Stars({ rating, size = 16, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            className={
              n <= (hovered || rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200 fill-gray-200'
            }
          />
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const counts = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div className="flex items-center gap-6 flex-wrap">
      <div className="text-center shrink-0">
        <div className="text-4xl font-black text-gray-900">{avg.toFixed(1)}</div>
        <Stars rating={Math.round(avg)} size={14} />
        <div className="text-xs text-gray-400 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
      </div>
      <div className="flex-1 min-w-[160px] space-y-1.5">
        {counts.map(({ n, count }) => (
          <div key={n} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-3">{n}</span>
            <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-4 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-ZM', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div className="py-5 border-b border-gray-100 last:border-0">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{review.authorName}</span>
            <Stars rating={review.rating} size={13} />
          </div>
          <span className="text-gray-400 text-xs">{date}</span>
        </div>
      </div>
      {review.comment && (
        <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
      )}
    </div>
  );
}

const EMPTY_FORM = { authorName: '', rating: 0, comment: '' };

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/reviews/${productId}`)
      .then((r) => r.json())
      .then((data) => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.authorName.trim()) { setError('Please enter your name.'); return; }
    if (!form.rating) { setError('Please select a star rating.'); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch(`/api/reviews/${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: `rev_${Date.now()}`, ...form }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      const saved: Review = await res.json();
      setReviews((rs) => [saved, ...rs]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setSubmitted(true);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-black text-gray-900">Customer Reviews</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={Math.round(avg)} size={14} />
              <span className="text-sm text-gray-500">{avg.toFixed(1)} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Star size={14} className="fill-amber-400 text-amber-400" /> Write a Review
          </button>
        )}
      </div>

      {/* Success notice */}
      {submitted && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-3 mb-6">
          <ThumbsUp size={16} className="text-teal-600 shrink-0" />
          <p className="text-teal-700 text-sm font-medium">Thank you! Your review has been posted.</p>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-bold text-gray-900">Your Review</h3>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl px-3 py-2">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <Stars rating={form.rating} size={28} interactive onChange={(r) => { setForm((f) => ({ ...f, rating: r })); setError(''); }} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name *</label>
            <input
              type="text"
              value={form.authorName}
              onChange={(e) => { setForm((f) => ({ ...f, authorName: e.target.value })); setError(''); }}
              placeholder="e.g. John B."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Review <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              placeholder="What did you think of this product?"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-200 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setError(''); }}
              className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Summary */}
      {reviews.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-4">
          <RatingSummary reviews={reviews} />
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={22} className="animate-spin text-gray-300" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl">
          <Star size={32} className="mx-auto text-gray-200 fill-gray-200 mb-3" />
          <p className="font-medium text-gray-500">No reviews yet</p>
          <p className="text-gray-400 text-sm mt-1">Be the first to review this product.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl px-6">
          {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </section>
  );
}
