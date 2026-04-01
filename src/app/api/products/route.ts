import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

// ─── Schema validación ─────────────────────────────────────────────────────────

const ProductCreateSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10),
  price: z.number().int().positive(),
  comparePrice: z.number().int().positive().optional().nullable(),
  stock: z.number().int().min(0),
  sku: z.string().min(1).max(50),
  images: z.array(z.string()).min(1),
  specs: z.record(z.string(), z.string()).default({}),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().min(1),
})

// ─── GET /api/products ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(48, Math.max(4, parseInt(searchParams.get('limit') ?? '12')))
  const skip = (page - 1) * limit

  const categorySlug = searchParams.get('category') || undefined
  const search = searchParams.get('q') || undefined
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
  const sortBy = searchParams.get('sort') || 'newest'
  const featured = searchParams.get('featured') === 'true'

  const where = {
    isActive: true,
    ...(featured && { isFeatured: true }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { sku: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  }

  const orderBy =
    sortBy === 'price_asc'
      ? { price: 'asc' as const }
      : sortBy === 'price_desc'
      ? { price: 'desc' as const }
      : sortBy === 'featured'
      ? { isFeatured: 'desc' as const }
      : { createdAt: 'desc' as const }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    data: products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// ─── POST /api/products — solo admin ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = ProductCreateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, ...rest } = parsed.data
  const slug = slugify(name)

  // Verificar slug único
  const existing = await prisma.product.findUnique({ where: { slug } })
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const product = await prisma.product.create({
    data: {
      name,
      slug: finalSlug,
      description: rest.description,
      price: rest.price,
      comparePrice: rest.comparePrice,
      stock: rest.stock,
      sku: rest.sku,
      images: rest.images,
      specs: rest.specs as object,
      isActive: rest.isActive,
      isFeatured: rest.isFeatured,
      categoryId: rest.categoryId,
    },
    include: { category: true },
  })

  return NextResponse.json(product, { status: 201 })
}
