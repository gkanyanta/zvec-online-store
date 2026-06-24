'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
interface Slide {
  id: string;
  image: string;
  title: string;
  tagline: string;
  linkUrl: string;
  badge?: string;
}

export default function HeroSlideshow({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  function transitionTo(index: number) {
    setTextVisible(false);
    setTimeout(() => {
      setCurrent(index);
      setTextVisible(true);
    }, 350);
  }

  function prev() {
    transitionTo((current - 1 + slides.length) % slides.length);
  }

  function next() {
    transitionTo((current + 1) % slides.length);
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTextVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % slides.length);
        setTextVisible(true);
      }, 350);
    }, 5500);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  if (!slides.length) return null;
  const slide = slides[current];
  const displayTitle  = slide.title;
  const displayBadge  = slide.badge ?? '';
  const displayLink   = slide.linkUrl;

  return (
    <section className="relative h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-gray-950">

      {/* Background slides — cross-fade */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={s.image}
            alt={s.title}
            className="w-full h-full object-cover scale-105"
          />
          {/* Gradient overlay: heavy on left so text is readable, lighter on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950/95 via-gray-950/65 to-gray-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-transparent to-gray-950/10" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <div className="max-w-xl">

            {/* Badge / category tag */}
            {displayBadge && (
              <div
                className={`inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest transition-all duration-400 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                style={{ transitionDelay: '0ms' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                {displayBadge}
              </div>
            )}

            {/* Title */}
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-5 transition-all duration-400 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: '60ms' }}
            >
              {displayTitle}
            </h1>

            {/* Tagline */}
            {slide.tagline && (
              <p
                className={`text-gray-300 text-lg mb-10 leading-relaxed transition-all duration-400 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
                style={{ transitionDelay: '110ms' }}
              >
                {slide.tagline}
              </p>
            )}

            {/* CTAs */}
            <div
              className={`flex flex-wrap gap-4 transition-all duration-400 ${textVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
              style={{ transitionDelay: '160ms' }}
            >
              <Link
                href={displayLink}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-gray-950 font-bold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-amber-500/25"
              >
                <ShoppingCart size={17} />
                Shop Now
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border border-white/25 hover:border-white/50 hover:bg-white/8 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 text-sm tracking-wide"
              >
                All Products <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={prev}
        aria-label="Previous"
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white rounded-full flex items-center justify-center transition-all hover:scale-110"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dot navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => transitionTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-7 h-2.5 bg-amber-500'
                : 'w-2.5 h-2.5 bg-white/35 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-7 right-6 z-20 hidden sm:flex items-center gap-1 text-white/40 text-xs font-mono tracking-widest">
        <span className="text-amber-400">{String(current + 1).padStart(2, '0')}</span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, '0')}</span>
      </div>

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div
          key={current}
          className="h-full bg-amber-500 origin-left"
          style={{ animation: 'progress 5.5s linear forwards' }}
        />
      </div>
      <style>{`@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
    </section>
  );
}
