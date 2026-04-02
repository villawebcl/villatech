function hasValue(value: string | undefined) {
  return Boolean(value && value.trim())
}

export function requireEnv(name: string) {
  const value = process.env[name]

  if (!hasValue(value)) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value!.trim()
}

export function getPublicAppUrl() {
  return requireEnv('NEXT_PUBLIC_URL')
}

export function isGoogleAuthEnabled() {
  return hasValue(process.env.GOOGLE_CLIENT_ID) && hasValue(process.env.GOOGLE_CLIENT_SECRET)
}

export function isCloudinaryConfigured() {
  return (
    hasValue(process.env.CLOUDINARY_CLOUD_NAME) &&
    hasValue(process.env.CLOUDINARY_API_KEY) &&
    hasValue(process.env.CLOUDINARY_API_SECRET) &&
    hasValue(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)
  )
}

export function isMercadoPagoConfigured() {
  return hasValue(process.env.MERCADOPAGO_ACCESS_TOKEN)
}
