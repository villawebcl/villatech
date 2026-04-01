import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

const Schema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
})

export async function PATCH(
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

  const { status, note } = parsed.data

  await prisma.$transaction([
    prisma.order.update({ where: { id }, data: { status } }),
    prisma.orderStatusHistory.create({
      data: { orderId: id, status, note },
    }),
  ])

  return NextResponse.json({ success: true })
}
