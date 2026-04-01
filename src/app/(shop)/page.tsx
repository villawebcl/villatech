export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Cpu, Monitor, Gamepad2, HardDrive, Wifi, Mouse } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/components/product/ProductCard'
import type { ProductWithCategory } from '@/types'

// ─── Datos estáticos ───────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'notebooks', label: 'Notebooks', icon: Monitor, desc: 'Para trabajo y estudio' },
  { slug: 'componentes', label: 'Componentes', icon: Cpu, desc: 'Arma tu PC' },
  { slug: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'Equipo de alto rendimiento' },
  { slug: 'almacenamiento', label: 'Almacenamiento', icon: HardDrive, desc: 'SSD, HDD y más' },
  { slug: 'redes', label: 'Redes', icon: Wifi, desc: 'Conectividad total' },
  { slug: 'perifericos', label: 'Periféricos', icon: Mouse, desc: 'Teclados, mouse y más' },
]

const TRUST_BADGES = [
  {
    icon: '🚚',
    title: 'Envío a todo Chile',
    desc: 'Despacho en 24-72 hrs hábiles por Starken o Chilexpress',
  },
  {
    icon: '🛡️',
    title: 'Garantía oficial',
    desc: 'Productos originales con garantía de fábrica vigente',
  },
  {
    icon: '🔒',
    title: 'Pago 100% seguro',
    desc: 'Webpay Plus y MercadoPago con SSL en todos los pasos',
  },
  {
    icon: '📞',
    title: 'Soporte técnico',
    desc: 'Equipo especializado lista para ayudarte antes y después',
  },
]

// ─── Componentes ───────────────────────────────────────────────────────────────

function HeroSection({ featuredProduct }: { featuredProduct: ProductWithCategory | null }) {
  return (
    <section className="relative min-h-[75vh] flex items-center overflow-hidden border-b border-[#222222]">
      {/* Grid de fondo */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#FAFAFA 1px, transparent 1px), linear-gradient(90deg, #FAFAFA 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container-site relative z-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-[#333333] px-3 py-1.5 rounded-[2px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              <span className="text-[11px] font-display text-[#888888] uppercase tracking-widest">
                Stock disponible
              </span>
            </div>

            <div>
              <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl leading-[0.95] text-[#FAFAFA]">
                TECNOLOGÍA
                <br />
                <span className="text-[#C0C0C0]">QUE TRABAJA</span>
                <br />
                PARA TI
              </h1>
            </div>

            <p className="text-[#888888] text-lg max-w-md leading-relaxed font-body">
              Equipos y componentes de computación para profesionales y entusiastas en Chile.
              Precios reales, stock real.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/productos" className="btn-primary">
                Ver productos
                <ArrowRight size={16} />
              </Link>
              <Link href="/categorias/notebooks" className="btn-secondary">
                Notebooks
              </Link>
            </div>
          </div>

          {/* Producto destacado */}
          {featuredProduct ? (
            <Link
              href={`/productos/${featuredProduct.slug}`}
              className="group relative bg-[#111111] border border-[#222222] rounded-[2px] p-8 flex items-center justify-center min-h-[380px] hover:border-[#333333] transition-colors"
            >
              <div className="relative w-full aspect-square max-w-xs">
                <Image
                  src={featuredProduct.images[0] || '/placeholder-product.jpg'}
                  alt={featuredProduct.name}
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[11px] font-display text-[#888888] uppercase tracking-widest mb-1">
                  {featuredProduct.category.name}
                </p>
                <h2 className="font-body text-[#FAFAFA] line-clamp-2 text-lg">
                  {featuredProduct.name}
                </h2>
              </div>
            </Link>
          ) : (
            <div className="bg-[#111111] border border-[#222222] rounded-[2px] min-h-[380px] flex items-center justify-center">
              <span className="font-display text-[#333333] text-sm uppercase tracking-widest">
                VillaTech
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  return (
    <section className="py-16 border-b border-[#222222]">
      <div className="container-site">
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-display text-2xl uppercase tracking-tight">
            Categorías
          </h2>
          <Link href="/productos" className="text-sm text-[#888888] hover:text-[#FAFAFA] transition-colors flex items-center gap-1">
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(({ slug, label, icon: Icon, desc }) => (
            <Link
              key={slug}
              href={`/categorias/${slug}`}
              className="card group flex flex-col items-center gap-3 p-5 text-center hover:bg-[#1A1A1A] hover:border-[#333333] transition-colors duration-150"
            >
              <div className="w-12 h-12 rounded-[2px] bg-[#0A0A0A] border border-[#333333] flex items-center justify-center group-hover:border-[#C0C0C0] transition-colors">
                <Icon size={20} className="text-[#C0C0C0]" />
              </div>
              <div>
                <p className="font-display text-xs text-[#FAFAFA] uppercase tracking-wide leading-tight">
                  {label}
                </p>
                <p className="text-[10px] text-[#888888] mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="py-12 border-b border-[#222222]">
      <div className="container-site">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_BADGES.map((badge) => (
            <div key={badge.title} className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">{badge.icon}</span>
              <div>
                <h3 className="font-display text-xs text-[#FAFAFA] uppercase tracking-wide">
                  {badge.title}
                </h3>
                <p className="text-[12px] text-[#888888] mt-1 leading-relaxed">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [featuredProduct, latestProducts] = await Promise.all([
    prisma.product.findFirst({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  return (
    <div>
      <HeroSection featuredProduct={featuredProduct as ProductWithCategory | null} />
      <TrustSection />
      <CategoriesSection />

      {/* Últimos productos */}
      <section className="py-16">
        <div className="container-site">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-2xl uppercase tracking-tight">
              Últimos productos
            </h2>
            <Link
              href="/productos"
              className="text-sm text-[#888888] hover:text-[#FAFAFA] transition-colors flex items-center gap-1"
            >
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>

          {latestProducts.length === 0 ? (
            <div className="text-center py-20 text-[#555555] font-display text-sm uppercase tracking-widest">
              Próximamente — estamos cargando el catálogo
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(latestProducts as ProductWithCategory[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
