'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, CreditCard, Truck } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatCLP, validateRut, formatRut, CHILE_REGIONS, getShippingRate } from '@/lib/utils'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'

// ─── Schema por paso ───────────────────────────────────────────────────────────

const PersonalSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellido muy corto'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(8, 'Teléfono inválido'),
  invoiceType: z.enum(['BOLETA', 'FACTURA']),
  rut: z.string().optional(),
})

const ShippingSchema = z.object({
  street: z.string().min(3, 'Calle requerida'),
  number: z.string().min(1, 'Número requerido'),
  apartment: z.string().optional(),
  regionCode: z.string().min(1, 'Región requerida'),
  commune: z.string().min(2, 'Comuna requerida'),
})

type PersonalData = z.infer<typeof PersonalSchema>
type ShippingData = z.infer<typeof ShippingSchema>

const STEPS = [
  { number: 1, label: 'Datos' },
  { number: 2, label: 'Envío' },
  { number: 3, label: 'Pago' },
]

// ─── Sub-formulario paso 1 ─────────────────────────────────────────────────────

function PersonalStep({
  onNext,
}: {
  onNext: (data: PersonalData) => void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalData>({
    resolver: zodResolver(PersonalSchema),
    defaultValues: { invoiceType: 'BOLETA' },
  })

  const invoiceType = watch('invoiceType')
  const rutValue = watch('rut') || ''

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre</label>
          <input {...register('firstName')} className="input" placeholder="Juan" />
          {errors.firstName && <p className="text-xs text-[#E53E3E] mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="label">Apellido</label>
          <input {...register('lastName')} className="input" placeholder="Pérez" />
          {errors.lastName && <p className="text-xs text-[#E53E3E] mt-1">{errors.lastName.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Email</label>
        <input {...register('email')} type="email" className="input" placeholder="juan@email.com" />
        {errors.email && <p className="text-xs text-[#E53E3E] mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Teléfono</label>
        <input {...register('phone')} className="input" placeholder="+56 9 1234 5678" />
        {errors.phone && <p className="text-xs text-[#E53E3E] mt-1">{errors.phone.message}</p>}
      </div>

      {/* Tipo de documento */}
      <div>
        <label className="label">Tipo de documento</label>
        <div className="flex gap-3">
          {(['BOLETA', 'FACTURA'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setValue('invoiceType', type)}
              className={`flex-1 py-2.5 text-sm font-display uppercase tracking-wider rounded-[2px] border transition-colors ${
                invoiceType === type
                  ? 'bg-[#FAFAFA] text-[#0A0A0A] border-[#FAFAFA]'
                  : 'border-[#333333] text-[#888888] hover:border-[#555555] hover:text-[#FAFAFA]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {invoiceType === 'FACTURA' && (
        <div>
          <label className="label">RUT empresa</label>
          <input
            {...register('rut')}
            className="input font-display"
            placeholder="12.345.678-9"
            value={rutValue}
            onChange={(e) => setValue('rut', formatRut(e.target.value))}
          />
          {rutValue && !validateRut(rutValue) && (
            <p className="text-xs text-[#E53E3E] mt-1">RUT inválido</p>
          )}
        </div>
      )}

      <button type="submit" className="btn-primary w-full justify-center">
        Continuar al envío →
      </button>
    </form>
  )
}

// ─── Sub-formulario paso 2 ─────────────────────────────────────────────────────

function ShippingStep({
  onNext,
  onBack,
  cartSubtotal,
}: {
  onNext: (data: ShippingData) => void
  onBack: () => void
  cartSubtotal: number
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ShippingData>({ resolver: zodResolver(ShippingSchema) })

  const regionCode = watch('regionCode')
  const shippingCost = regionCode ? getShippingRate(regionCode) : null

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">Calle</label>
          <input {...register('street')} className="input" placeholder="Av. Providencia" />
          {errors.street && <p className="text-xs text-[#E53E3E] mt-1">{errors.street.message}</p>}
        </div>
        <div>
          <label className="label">Número</label>
          <input {...register('number')} className="input" placeholder="1234" />
          {errors.number && <p className="text-xs text-[#E53E3E] mt-1">{errors.number.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Departamento / Oficina (opcional)</label>
        <input {...register('apartment')} className="input" placeholder="Depto 301" />
      </div>

      <div>
        <label className="label">Región</label>
        <select {...register('regionCode')} className="input">
          <option value="">Selecciona región</option>
          {CHILE_REGIONS.map((r) => (
            <option key={r.code} value={r.code}>{r.name}</option>
          ))}
        </select>
        {errors.regionCode && <p className="text-xs text-[#E53E3E] mt-1">{errors.regionCode.message}</p>}
      </div>

      <div>
        <label className="label">Comuna</label>
        <input {...register('commune')} className="input" placeholder="Providencia" />
        {errors.commune && <p className="text-xs text-[#E53E3E] mt-1">{errors.commune.message}</p>}
      </div>

      {shippingCost !== null && (
        <div className="card p-4 flex items-center gap-3">
          <Truck size={16} className="text-[#C0C0C0]" />
          <div>
            <p className="text-sm text-[#FAFAFA]">
              Envío a {CHILE_REGIONS.find((r) => r.code === regionCode)?.name}
            </p>
            <p className="text-xs text-[#888888]">
              Costo de envío: <span className="text-[#FAFAFA] font-display">{formatCLP(shippingCost)}</span>
            </p>
            <p className="text-xs text-[#888888]">
              Total con envío:{' '}
              <span className="text-[#FAFAFA] font-display">
                {formatCLP(cartSubtotal + shippingCost)}
              </span>
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1 justify-center">
          ← Volver
        </button>
        <button type="submit" className="btn-primary flex-1 justify-center">
          Continuar al pago →
        </button>
      </div>
    </form>
  )
}

// ─── Paso 3: Pago ─────────────────────────────────────────────────────────────

function PaymentStep({
  onBack,
  onSubmit,
  loading,
  total,
}: {
  onBack: () => void
  onSubmit: (method: 'webpay' | 'mercadopago') => void
  loading: boolean
  total: number
}) {
  const [method, setMethod] = useState<'webpay' | 'mercadopago'>('webpay')

  const PAYMENT_METHODS = [
    {
      id: 'webpay' as const,
      name: 'Webpay Plus',
      desc: 'Tarjeta débito o crédito · Transbank',
      icon: '🏦',
      enabled: true,
    },
    {
      id: 'mercadopago' as const,
      name: 'MercadoPago',
      desc: 'Próximamente',
      icon: '💳',
      enabled: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {PAYMENT_METHODS.map((pm) => (
          <button
            key={pm.id}
            type="button"
            onClick={() => pm.enabled && setMethod(pm.id)}
            disabled={!pm.enabled}
            className={`w-full flex items-center gap-4 p-4 border rounded-[2px] transition-colors text-left ${
              method === pm.id
                ? 'border-[#FAFAFA] bg-[#111111]'
                : 'border-[#333333] hover:border-[#555555]'
            } ${!pm.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className="text-2xl">{pm.icon}</span>
            <div className="flex-1">
              <p className="font-display text-sm text-[#FAFAFA] uppercase tracking-wide">{pm.name}</p>
              <p className="text-xs text-[#888888] mt-0.5">{pm.desc}</p>
            </div>
            <div
              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                method === pm.id ? 'border-[#FAFAFA] bg-[#FAFAFA]' : 'border-[#555555]'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Resumen total */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#888888]">
          <Lock size={13} />
          <span className="text-xs">Pago 100% seguro y cifrado</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#888888]">Total a pagar</p>
          <p className="font-display text-lg text-[#FAFAFA]">{formatCLP(total)}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-secondary flex-1 justify-center" disabled={loading}>
          ← Volver
        </button>
        <button
          type="button"
          onClick={() => onSubmit(method)}
          disabled={loading}
          className="btn-primary flex-1 justify-center"
        >
          <CreditCard size={16} />
          {loading ? 'Procesando…' : 'Pagar ahora'}
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────────

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, subtotal, clearCart } = useCartStore()
  const [step, setStep] = useState(1)
  const [personalData, setPersonalData] = useState<PersonalData | null>(null)
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const couponCode = searchParams.get('coupon') || undefined
  const sub = subtotal()

  const shippingCost =
    shippingData?.regionCode ? getShippingRate(shippingData.regionCode) : 0
  const total = sub + shippingCost

  if (items.length === 0) {
    router.replace('/carro')
    return null
  }

  async function handlePayment(method: 'webpay' | 'mercadopago') {
    if (!personalData || !shippingData) return
    if (method !== 'webpay') {
      setError('Por ahora solo Webpay Plus está disponible')
      return
    }
    setLoading(true)
    setError(null)

    try {
      const region = CHILE_REGIONS.find((r) => r.code === shippingData.regionCode)

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
          shipping: {
            firstName: personalData.firstName,
            lastName: personalData.lastName,
            email: personalData.email,
            phone: personalData.phone,
            street: shippingData.street,
            number: shippingData.number,
            apartment: shippingData.apartment,
            commune: shippingData.commune,
            region: region?.name ?? shippingData.regionCode,
            regionCode: shippingData.regionCode,
          },
          invoiceType: personalData.invoiceType,
          rut: personalData.rut,
          couponCode,
          paymentMethod: method,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Error al crear el pedido')

      if (method === 'webpay') {
        const payRes = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderData.orderId }),
        })
        const payData = await payRes.json()
        if (!payRes.ok) throw new Error(payData.error || 'Error al iniciar el pago')

        clearCart()
        window.location.href = payData.redirectUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
      setLoading(false)
    }
  }

  return (
    <div className="container-site py-10 max-w-2xl">
      <h1 className="font-display text-2xl uppercase tracking-tight mb-8 text-center">
        Checkout
      </h1>

      <CheckoutStepper currentStep={step} steps={STEPS} />

      <div className="mt-10">
        {error && (
          <div className="mb-6 p-4 border border-[#E53E3E]/40 bg-[#E53E3E]/10 rounded-[2px]">
            <p className="text-sm text-[#E53E3E]">{error}</p>
          </div>
        )}

        {step === 1 && (
          <PersonalStep
            onNext={(data) => {
              setPersonalData(data)
              setStep(2)
            }}
          />
        )}

        {step === 2 && (
          <ShippingStep
            onNext={(data) => {
              setShippingData(data)
              setStep(3)
            }}
            onBack={() => setStep(1)}
            cartSubtotal={sub}
          />
        )}

        {step === 3 && (
          <PaymentStep
            onBack={() => setStep(2)}
            onSubmit={handlePayment}
            loading={loading}
            total={total}
          />
        )}
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
