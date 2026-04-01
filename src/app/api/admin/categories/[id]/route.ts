import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { slugify } from '@/lib/utils'

const Schema = z.object({ name: z.string().min(2).optional(), order: z.number().int().optional() })

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
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })

  const { name, order } = parsed.data
  const category = await prisma.category.update({
    where: { id },
    data: {
      ...(name && { name, slug: slugify(name) }),
      ...(order !== undefined && { order }),
    },
    include: { _count: { select: { products: true } } },
  })

  return NextResponse.json(category)
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
  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
