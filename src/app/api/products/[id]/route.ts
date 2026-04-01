import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

// GET /api/products/[id] — por id o slug (público)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Intentar primero por slug, luego por id
  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: [{ slug: id }, { id }],
    },
    include: { category: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }

  return NextResponse.json(product)
}

const ProductUpdateSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  price: z.number().int().positive().optional(),
  comparePrice: z.number().int().positive().nullable().optional(),
  stock: z.number().int().min(0).optional(),
  sku: z.string().min(1).max(50).optional(),
  images: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().min(1).optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = ProductUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { specs, categoryId, ...rest } = parsed.data

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(specs !== undefined && { specs: specs as object }),
      ...(categoryId !== undefined && { categoryId }),
    },
    include: { category: true },
  })

  return NextResponse.json(product)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  // Soft delete para preservar historial de pedidos
  await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
