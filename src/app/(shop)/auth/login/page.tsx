import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { isGoogleAuthEnabled } from '@/lib/env'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm googleEnabled={isGoogleAuthEnabled()} />
    </Suspense>
  )
}
