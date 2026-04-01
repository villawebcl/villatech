import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'VillaTech — Tecnología que trabaja para ti',
    template: '%s | VillaTech',
  },
  description:
    'Tienda online de tecnología y computación en Chile. Notebooks, componentes, periféricos, almacenamiento y más. Envío a todo Chile.',
  keywords: ['computación', 'tecnología', 'notebooks', 'componentes', 'Chile', 'VillaTech'],
  authors: [{ name: 'VillaTech', url: 'https://villatech.cl' }],
  creator: 'Villaweb.cl',
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://villatech.cl',
    siteName: 'VillaTech',
    title: 'VillaTech — Tecnología que trabaja para ti',
    description: 'Tienda online de tecnología y computación en Chile.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VillaTech',
    description: 'Tienda online de tecnología y computación en Chile.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#FAFAFA] antialiased">
        {children}
      </body>
    </html>
  )
}
