import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Users,
  FolderOpen,
  Settings,
  LogOut,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
  { href: '/admin/categorias', label: 'Categorías', icon: FolderOpen },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/cupones', label: 'Cupones', icon: Tag },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/auth/login?callbackUrl=/admin')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#0A0A0A] border-r border-[#222222] flex flex-col">
        <div className="px-5 py-5 border-b border-[#222222]">
          <Logo size="sm" />
          <div className="mt-2 px-0">
            <span className="badge badge-accent text-[9px]">Admin Panel</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[2px] text-[13px] text-[#888888] hover:text-[#FAFAFA] hover:bg-[#111111] transition-colors group"
            >
              <Icon size={15} className="flex-shrink-0 group-hover:text-[#C0C0C0]" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[#222222] space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs text-[#888888] truncate">{session.user.email}</p>
          </div>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-[2px] text-[13px] text-[#888888] hover:text-[#FAFAFA] hover:bg-[#111111] transition-colors">
            <LogOut size={14} />
            Salir al sitio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0A]">{children}</main>
    </div>
  )
}
