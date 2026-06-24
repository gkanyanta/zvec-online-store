'use client';

import { useRef, useState } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  maxSizePx?: number;
  quality?: number;
}

const MAX_OUTPUT_BYTES = 3_200_000; // ~3.2 MB data URL keeps JSON body well under Vercel's 4.5 MB limit

async function compressImage(file: File, maxSizePx = 900, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxSizePx || height > maxSizePx) {
            if (width > height) { height = Math.round((height / width) * maxSizePx); width = maxSizePx; }
            else { width = Math.round((width / height) * maxSizePx); height = maxSizePx; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not supported')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          // Reduce quality iteratively until output fits within limit
          let q = quality;
          let result = canvas.toDataURL('image/jpeg', q);
          while (result.length > MAX_OUTPUT_BYTES && q > 0.35) {
            q = Math.max(0.35, q - 0.1);
            result = canvas.toDataURL('image/jpeg', q);
          }
          resolve(result);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ value, onChange, label = 'Product Image', maxSizePx = 900, quality = 0.82 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('File is too large. Maximum 8MB.'); return; }
    setError('');
    setLoading(true);
    try {
      const compressed = await compressImage(file, maxSizePx, quality);
      onChange(compressed);
    } catch {
      setError('Failed to process image. Please try another file.');
    } finally {
      setLoading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {value ? (
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-36 h-36 object-cover rounded-xl border border-gray-200 shrink-0"
          />
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-xs text-gray-500 font-medium">Image selected ✓</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Upload size={13} /> Browse new image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-xs font-medium px-1"
            >
              <X size={13} /> Remove image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 hover:border-teal-400 rounded-xl p-8 cursor-pointer transition-colors bg-gray-50 hover:bg-teal-50"
        >
          {loading ? (
            <><Loader2 size={28} className="text-teal-500 animate-spin" /><p className="text-sm text-gray-500">Processing image…</p></>
          ) : (
            <>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                {value ? <ImageIcon size={22} className="text-gray-400" /> : <Upload size={22} className="text-gray-400" />}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 8MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1.5">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
