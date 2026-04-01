'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  images: string[]
  name: string
}

export function ProductGallery({ images, name }: ProductGalleryProps) {
  const [active, setActive] = useState(0)

  const safeImages = images.length > 0 ? images : ['/placeholder-product.jpg']

  function prev() {
    setActive((i) => (i === 0 ? safeImages.length - 1 : i - 1))
  }

  function next() {
    setActive((i) => (i === safeImages.length - 1 ? 0 : i + 1))
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Imagen principal */}
      <div className="relative aspect-square bg-[#111111] border border-[#222222] rounded-[2px] overflow-hidden group">
        <Image
          src={safeImages[active]}
          alt={`${name} - imagen ${active + 1}`}
          fill
          className="object-contain p-8 transition-opacity duration-200"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-[#0A0A0A]/80 border border-[#333333] rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity text-[#FAFAFA] hover:bg-[#1A1A1A]"
              aria-label="Imagen anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-[#0A0A0A]/80 border border-[#333333] rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity text-[#FAFAFA] hover:bg-[#1A1A1A]"
              aria-label="Siguiente imagen"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-16 h-16 bg-[#111111] border rounded-[2px] overflow-hidden transition-colors ${
                i === active
                  ? 'border-[#C0C0C0]'
                  : 'border-[#222222] hover:border-[#444444]'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${name} miniatura ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
