import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

const FOOTER_LINKS = {
  'Tienda': [
    { href: '/productos', label: 'Todos los productos' },
    { href: '/categorias/notebooks', label: 'Notebooks' },
    { href: '/categorias/componentes', label: 'Componentes' },
    { href: '/categorias/gaming', label: 'Gaming' },
    { href: '/categorias/perifericos', label: 'Periféricos' },
  ],
  'Ayuda': [
    { href: '/despachos', label: 'Despachos' },
    { href: '/garantia', label: 'Garantía' },
    { href: '/terminos', label: 'Términos y condiciones' },
    { href: '/privacidad', label: 'Privacidad' },
  ],
  'Cuenta': [
    { href: '/cuenta', label: 'Mi cuenta' },
    { href: '/cuenta', label: 'Mis pedidos' },
    { href: '/buscar', label: 'Buscar productos' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[#222222] bg-[#0A0A0A] mt-24">
      {/* Contenido principal */}
      <div className="container-site pt-24 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Marca */}
          <div className="lg:col-span-1">
            <Logo size="md" />
            <p className="mt-5 text-[#888888] text-sm leading-relaxed max-w-[260px]">
              Tu tienda de tecnología de confianza en Chile. Productos originales, garantía real, soporte técnico especializado.
            </p>
            {/* Trust badges */}
            <div className="mt-6 flex flex-col gap-2.5">
              {[
                '✓ Envío a todo Chile',
                '✓ Garantía oficial',
                '✓ Pago 100% seguro',
              ].map((badge) => (
                <span key={badge} className="text-[12px] text-[#888888] font-display">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-[11px] tracking-widest uppercase text-[#888888] mb-5">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#FAFAFA]/70 hover:text-[#FAFAFA] transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="border-t border-[#222222]">
        <div className="container-site py-9 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            {/* Íconos de pago simplificados */}
            {['Webpay', 'Transferencia', 'Visa', 'Mastercard'].map((method) => (
              <div
                key={method}
                className="px-2.5 py-1 border border-[#333333] rounded-[2px] bg-[#111111]"
              >
                <span className="text-[10px] font-display text-[#888888] uppercase tracking-wider">
                  {method}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-[#555555]">
            © {new Date().getFullYear()} VillaTech — Desarrollado por{' '}
            <a
              href="https://villaweb.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#888888] hover:text-[#C0C0C0] transition-colors duration-150"
            >
              Villaweb.cl
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
