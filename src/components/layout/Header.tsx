'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useCartStore } from '@/store/cart'
import { Logo } from '@/components/ui/Logo'

const NAV_LINKS = [
  { href: '/productos', label: 'Productos' },
  { href: '/categorias/notebooks', label: 'Notebooks' },
  { href: '/categorias/componentes', label: 'Componentes' },
  { href: '/categorias/gaming', label: 'Gaming' },
  { href: '/categorias/perifericos', label: 'Periféricos' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openCart, totalItems } = useCartStore()
  const cartCount = totalItems()
  const iconButtonClass =
    'inline-flex items-center justify-center rounded-[2px] p-2 text-[#888888] transition-colors duration-150 hover:bg-[#111111] hover:text-[#FAFAFA]'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled
            ? 'bg-[#0A0A0A]/95 backdrop-blur-sm border-b border-[#222222]'
            : 'bg-[#0A0A0A] border-b border-[#222222]'
        }`}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Logo size="md" />

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-[13px] font-body transition-colors duration-150 rounded-[2px] ${
                    pathname === link.href
                      ? 'text-[#FAFAFA]'
                      : 'text-[#888888] hover:text-[#FAFAFA]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Acciones */}
            <div className="flex items-center gap-1">
              {/* Búsqueda */}
              <Link
                href="/buscar"
                className={iconButtonClass}
                aria-label="Buscar productos"
              >
                <Search size={18} />
              </Link>

              {/* Cuenta */}
              <Link
                href="/cuenta"
                className={`${iconButtonClass} hidden sm:inline-flex`}
                aria-label="Mi cuenta"
              >
                <User size={18} />
              </Link>

              {/* Carrito */}
              <button
                onClick={openCart}
                className={`${iconButtonClass} relative`}
                aria-label={`Carrito (${cartCount} items)`}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 bg-[#FAFAFA] text-[#0A0A0A] text-[9px] font-display font-bold rounded-full">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </button>

              {/* Menú mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`${iconButtonClass} md:hidden`}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menú mobile */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#222222] bg-[#0A0A0A] animate-fade-in">
            <nav className="container-site py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-3 text-[14px] font-body rounded-[2px] transition-colors ${
                    pathname === link.href
                      ? 'text-[#FAFAFA] bg-[#111111]'
                      : 'text-[#888888] hover:text-[#FAFAFA] hover:bg-[#111111]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-[#222222] my-2" />
              <Link
                href="/cuenta"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-3 text-[14px] text-[#888888] hover:text-[#FAFAFA] flex items-center gap-2"
              >
                <User size={16} /> Mi cuenta
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer para el fixed header */}
      <div className="h-16" />
    </>
  )
}
