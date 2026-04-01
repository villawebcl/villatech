import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadProductImage(
  file: string,
  productSlug: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(file, {
    folder: `villatech/products/${productSlug}`,
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto:best', fetch_format: 'auto' },
    ],
  })
  return result.secure_url
}

export async function deleteProductImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

/** Extrae el public_id de una URL de Cloudinary */
export function getPublicIdFromUrl(url: string): string {
  const parts = url.split('/')
  const uploadIndex = parts.indexOf('upload')
  const withoutVersion = parts.slice(uploadIndex + 2)
  const withoutExt = withoutVersion.join('/').replace(/\.[^.]+$/, '')
  return withoutExt
}
