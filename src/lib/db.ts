import type { PoolConfig } from 'pg'

function shouldAllowSelfSignedCert() {
  return (
    process.env.PGSSL_ALLOW_SELF_SIGNED === 'true' ||
    process.env.DATABASE_URL?.includes('pooler.supabase.com') === true
  )
}

export function getPgConnectionConfig(connectionString: string): PoolConfig {
  return {
    connectionString,
    ...(shouldAllowSelfSignedCert()
      ? {
          ssl: {
            rejectUnauthorized: false,
          },
        }
      : {}),
  }
}
