function hasValue(value: string | undefined) {
  return Boolean(value && value.trim())
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
