'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, ChevronUp, ChevronDown, Info, ExternalLink, X, Save, Loader2 } from 'lucide-react';
import { adminFetch } from '@/lib/adminFetch';
import ImageUpload from '@/components/admin/ImageUpload';
import type { SlideshowBanner } from '@/types';

const EMPTY_FORM = { title: '', tagline: '', linkUrl: '/products', image: '', active: true };

export default function SlideshowPage() {
  const [banners, setBanners] = useState<SlideshowBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'new' | SlideshowBanner>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await adminFetch('/api/slideshow');
    if (res.ok) setBanners(await res.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setError('');
    setModal('new');
  }

  function openEdit(b: SlideshowBanner) {
    setForm({ title: b.title, tagline: b.tagline, linkUrl: b.linkUrl, image: b.image, active: b.active });
    setError('');
    setModal(b);
  }

  async function handleSave() {
    if (!form.image) { setError('Please upload an image.'); return; }
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      if (modal === 'new') {
        const res = await adminFetch('/api/slideshow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `slide_${Date.now()}`,
            ...form,
            sortOrder: banners.length,
          }),
        });
        if (!res.ok) throw new Error('Save failed');
      } else if (modal && typeof modal === 'object') {
        const res = await adminFetch(`/api/slideshow/${modal.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, sortOrder: modal.sortOrder }),
        });
        if (!res.ok) throw new Error('Save failed');
      }
      await load();
      setModal(null);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this slide?')) return;
    await adminFetch(`/api/slideshow/${id}`, { method: 'DELETE' });
    setBanners((b) => b.filter((x) => x.id !== id));
  }

  async function handleToggle(banner: SlideshowBanner) {
    const res = await adminFetch(`/api/slideshow/${banner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !banner.active }),
    });
    if (res.ok) setBanners((bs) => bs.map((b) => b.id === banner.id ? { ...b, active: !b.active } : b));
  }

  async function handleReorder(index: number, dir: -1 | 1) {
    const newBanners = [...banners];
    const target = index + dir;
    if (target < 0 || target >= newBanners.length) return;
    [newBanners[index], newBanners[target]] = [newBanners[target], newBanners[index]];
    // Update sort_order for swapped pair
    await Promise.all([
      adminFetch(`/api/slideshow/${newBanners[index].id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: index }),
      }),
      adminFetch(`/api/slideshow/${newBanners[target].id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sortOrder: target }),
      }),
    ]);
    setBanners(newBanners.map((b, i) => ({ ...b, sortOrder: i })));
  }

  const activeCount = banners.filter((b) => b.active).length;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Homepage Slideshow</h1>
          <p className="text-gray-500 text-sm mt-0.5">{activeCount} active slide{activeCount !== 1 ? 's' : ''} · up to 3 are shown</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {/* Dimension guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-3">
            <h2 className="font-bold text-blue-900 text-sm">Image Dimensions Guide</h2>

            {/* Visual safe-zone diagram */}
            <div className="bg-gray-900 rounded-xl overflow-hidden text-xs font-mono" style={{ maxWidth: 520 }}>
              <div className="px-3 py-1.5 bg-gray-800 text-gray-400 text-[11px]">Example layout — 1920 × 800 px</div>
              <div className="flex h-24">
                {/* Left dark zone */}
                <div className="flex-[2] bg-gray-950/90 flex flex-col items-start justify-center px-4 gap-1 border-r border-dashed border-gray-600">
                  <span className="text-amber-400 font-bold text-[10px]">TEXT ZONE</span>
                  <span className="text-gray-500 text-[9px]">dark overlay</span>
                  <span className="text-gray-500 text-[9px]">title + price here</span>
                </div>
                {/* Right image zone */}
                <div className="flex-[3] bg-gradient-to-l from-gray-700 to-gray-800 flex flex-col items-center justify-center gap-1">
                  <span className="text-white font-bold text-[10px]">PRODUCT ZONE</span>
                  <span className="text-gray-300 text-[9px]">image visible here</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm text-blue-800">
              <div><span className="font-bold">Recommended size:</span> 1920 × 800 px</div>
              <div><span className="font-bold">Minimum size:</span> 1280 × 600 px</div>
              <div><span className="font-bold">Aspect ratio:</span> Landscape only (wider than tall)</div>
              <div><span className="font-bold">Format:</span> JPG for photos (smaller file)</div>
              <div><span className="font-bold">Max file size:</span> 8 MB</div>
              <div><span className="font-bold">Subject placement:</span> Right half of image</div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 space-y-1">
              <p className="font-bold">⚠️ Avoid these to prevent cropping:</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>Portrait or square images — they will be stretched or cropped</li>
                <li>Important content in the far left — it will be covered by the dark text overlay</li>
                <li>Very small images (under 800 px wide) — they will appear blurry</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Slide list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-16 text-center">
          <div className="text-4xl mb-3">🖼️</div>
          <p className="font-semibold text-gray-700">No slides yet</p>
          <p className="text-gray-400 text-sm mt-1">Add up to 3 slides. The homepage will fall back to featured products while empty.</p>
          <button onClick={openNew} className="mt-5 inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
            <Plus size={15} /> Add First Slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner, i) => (
            <div key={banner.id} className={`bg-white border rounded-2xl overflow-hidden flex items-stretch gap-0 transition-all ${banner.active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              {/* Order indicator */}
              <div className="w-10 bg-gray-50 flex flex-col items-center justify-center gap-1 border-r border-gray-100 shrink-0">
                <span className="text-xs font-black text-gray-400">{i + 1}</span>
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => handleReorder(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 p-0.5"><ChevronUp size={14} /></button>
                  <button onClick={() => handleReorder(i, 1)} disabled={i === banners.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 p-0.5"><ChevronDown size={14} /></button>
                </div>
              </div>

              {/* Image preview (landscape) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={banner.image} alt={banner.title} className="w-48 h-24 object-cover shrink-0" />

              {/* Info */}
              <div className="flex-1 px-4 py-3 min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{banner.title || <span className="text-gray-400 italic">No title</span>}</p>
                    <p className="text-gray-500 text-xs mt-0.5 truncate">{banner.tagline || '—'}</p>
                  </div>
                  {i < 3 && banner.active && (
                    <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">LIVE</span>
                  )}
                  {i >= 3 && banner.active && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">QUEUED</span>
                  )}
                </div>
                <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline mt-1">
                  {banner.linkUrl} <ExternalLink size={10} />
                </a>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 px-3 border-l border-gray-100 shrink-0">
                <button onClick={() => handleToggle(banner)} title={banner.active ? 'Deactivate' : 'Activate'} className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors">
                  {banner.active ? <ToggleRight size={20} className="text-teal-500" /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => openEdit(banner)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(banner.id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {banners.length > 0 && (
        <p className="text-xs text-gray-400 text-center">Only the first 3 active slides appear on the homepage. Use the arrows to reorder.</p>
      )}

      {/* Add / Edit modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-black text-gray-900">{modal === 'new' ? 'Add New Slide' : 'Edit Slide'}</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {error && <p className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2.5 text-sm">{error}</p>}

              {/* Image upload — wide/landscape */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-700">Slide Image *</label>
                  <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                    Landscape · 1920 × 800 px recommended
                  </span>
                </div>
                {/* Wide preview */}
                {form.image && (
                  <div className="relative mb-3 rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '16/7' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                    {/* Overlay preview */}
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-950/50 to-transparent flex items-end p-4">
                      <div>
                        <p className="text-amber-400 text-xs font-bold uppercase tracking-widest">Tag</p>
                        <p className="text-white font-black text-base leading-tight">{form.title || 'Slide Title'}</p>
                        <p className="text-gray-300 text-xs mt-0.5">{form.tagline || 'Tagline preview'}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded">Preview</div>
                  </div>
                )}
                <ImageUpload
                  label=""
                  value={form.image}
                  onChange={(url) => setForm((f) => ({ ...f, image: url }))}
                  maxSizePx={1920}
                  quality={0.88}
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Use a landscape (wider than tall) image. Keep subject on the right side.</p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Samsung 55″ 4K Smart TV"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tagline <span className="text-gray-400 font-normal">— short description shown below the title</span></label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                  placeholder="e.g. Cinematic picture quality with built-in Netflix"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Button Link</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="/products or /packages"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">&quot;Shop Now&quot; button will link here. Use a path like /products or /packages.</p>
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 accent-teal-500"
                />
                <span className="text-sm font-medium text-gray-900">Show on homepage</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Slide</>}
              </button>
              <button onClick={() => setModal(null)} className="px-5 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-xl text-sm hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
