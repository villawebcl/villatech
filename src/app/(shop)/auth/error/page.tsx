import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: 'No tienes permisos para completar esta acción.',
  Configuration: 'La autenticación no está bien configurada en este entorno.',
  OAuthSignin: 'No se pudo iniciar el login con el proveedor externo.',
  OAuthCallback: 'El proveedor devolvió una respuesta inválida o incompleta.',
  OAuthCreateAccount: 'No fue posible crear la cuenta con el proveedor externo.',
  EmailCreateAccount: 'No fue posible crear la cuenta con ese correo.',
  Callback: 'La autenticación falló durante la validación de la sesión.',
  OAuthAccountNotLinked: 'Ese correo ya existe con otro método de acceso.',
  SessionRequired: 'Debes iniciar sesión para acceder a esa sección.',
  Default: 'No fue posible iniciar sesión. Inténtalo nuevamente.',
}

interface AuthErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { error } = await searchParams
  const message = ERROR_MESSAGES[error ?? ''] ?? ERROR_MESSAGES.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <Logo size="lg" />
          <h1 className="font-display text-xl uppercase tracking-tight mt-6">
            Error de acceso
          </h1>
        </div>

        <div className="p-4 border border-[#E53E3E]/40 bg-[#E53E3E]/10 rounded-[2px]">
          <p className="text-sm text-[#E53E3E]">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/login" className="btn-primary justify-center">
            Volver al login
          </Link>
          <Link href="/" className="btn-secondary justify-center">
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
