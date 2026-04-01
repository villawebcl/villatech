'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Resolver } from 'react-hook-form'
import { Plus, Trash2, Upload, X, GripVertical } from 'lucide-react'
import Image from 'next/image'
import { slugify } from '@/lib/utils'
import type { Category } from '@prisma/client'

const ProductSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  slug: z.string().min(3),
  description: z.string().min(10, 'Descripción muy corta'),
  price: z.coerce.number().int().positive('Precio requerido'),
  comparePrice: z.coerce.number().int().positive().optional().or(z.literal('')),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(1, 'SKU requerido'),
  categoryId: z.string().min(1, 'Categoría requerida'),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.array(z.object({ key: z.string(), value: z.string() })),
})

type ProductFormData = z.infer<typeof ProductSchema>

interface ProductFormProps {
  categories: Category[]
  initialData?: Omit<Partial<ProductFormData>, 'specs'> & {
    id?: string
    images?: string[]
    specs?: Record<string, string>
  }
  mode: 'create' | 'edit'
}

export function ProductForm({ categories, initialData, mode }: ProductFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cloudinaryEnabled = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

  const specEntries = Object.entries(initialData?.specs ?? {}).map(([key, value]) => ({
    key,
    value: String(value),
  }))

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema) as Resolver<ProductFormData>,
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      description: initialData?.description ?? '',
      price: initialData?.price,
      comparePrice: initialData?.comparePrice ?? '',
      stock: initialData?.stock ?? 0,
      sku: initialData?.sku ?? '',
      categoryId: initialData?.categoryId ?? '',
      isActive: initialData?.isActive ?? true,
      isFeatured: initialData?.isFeatured ?? false,
      specs: specEntries.length ? specEntries : [{ key: '', value: '' }],
    },
  })

  const { fields: specFields, append, remove } = useFieldArray({ control, name: 'specs' })

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('name', e.target.value)
    setValue('slug', slugify(e.target.value))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!cloudinaryEnabled) {
      setError('Configura NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME para subir imágenes')
      return
    }

    const files = e.target.files
    if (!files?.length) return

    setUploading(true)
    setError(null)
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'villatech_products')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      const data = await res.json()

      if (!res.ok) {
        setError(data.error?.message || 'No se pudo subir la imagen a Cloudinary')
        setUploading(false)
        e.target.value = ''
        return
      }

      uploaded.push(data.secure_url)
    }

    if (uploaded.length === 0) {
      setError('No se subió ninguna imagen')
      setUploading(false)
      e.target.value = ''
      return
    }

    setImages((prev) => [...prev, ...uploaded])
    setUploading(false)
    e.target.value = ''
  }

  async function onSubmit(data: ProductFormData) {
    if (images.length === 0) {
      setError('Agrega al menos una imagen')
      return
    }

    setSaving(true)
    setError(null)

    const specs = data.specs
      .filter((s) => s.key.trim())
      .reduce<Record<string, string>>((acc, s) => ({ ...acc, [s.key]: s.value }), {})

    const payload = {
      ...data,
      comparePrice: data.comparePrice || null,
      images,
      specs,
    }

    const url =
      mode === 'create'
        ? '/api/products'
        : `/api/products/${initialData?.id}`

    const res = await fetch(url, {
      method: mode === 'create' ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(JSON.stringify(err.error) || 'Error al guardar')
      setSaving(false)
      return
    }

    router.push('/admin/productos')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-3xl">
      {error && (
        <div className="p-4 border border-[#E53E3E]/40 bg-[#E53E3E]/10 rounded-[2px]">
          <p className="text-sm text-[#E53E3E]">{error}</p>
        </div>
      )}

      {/* ─── Info básica ─────────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
          Información básica
        </h2>

        <div>
          <label className="label">Nombre del producto</label>
          <input
            {...register('name')}
            onChange={handleNameChange}
            className="input"
            placeholder="MacBook Air M3 15 pulgadas"
          />
          {errors.name && <p className="text-xs text-[#E53E3E] mt-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Slug (URL)</label>
            <input {...register('slug')} className="input font-display text-sm" />
            {errors.slug && <p className="text-xs text-[#E53E3E] mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="label">SKU</label>
            <input {...register('sku')} className="input font-display text-sm" placeholder="MBP-M3-15-256" />
            {errors.sku && <p className="text-xs text-[#E53E3E] mt-1">{errors.sku.message}</p>}
          </div>
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            {...register('description')}
            className="input min-h-[120px] resize-none"
            placeholder="Descripción detallada del producto…"
          />
          {errors.description && <p className="text-xs text-[#E53E3E] mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Categoría</label>
          <select {...register('categoryId')} className="input">
            <option value="">Selecciona categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="text-xs text-[#E53E3E] mt-1">{errors.categoryId.message}</p>}
        </div>
      </div>

      {/* ─── Precios y stock ──────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-5">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
          Precio y stock
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Precio (CLP)</label>
            <input
              {...register('price')}
              type="number"
              min="0"
              className="input font-display"
              placeholder="599990"
            />
            {errors.price && <p className="text-xs text-[#E53E3E] mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="label">Precio tachado</label>
            <input
              {...register('comparePrice')}
              type="number"
              min="0"
              className="input font-display"
              placeholder="749990"
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              {...register('stock')}
              type="number"
              min="0"
              className="input font-display"
            />
            {errors.stock && <p className="text-xs text-[#E53E3E] mt-1">{errors.stock.message}</p>}
          </div>
        </div>
      </div>

      {/* ─── Imágenes ─────────────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
          Imágenes del producto
        </h2>

        {!cloudinaryEnabled && (
          <div className="p-3 border border-[#D69E2E]/40 bg-[#D69E2E]/10 rounded-[2px]">
            <p className="text-sm text-[#D69E2E]">
              Cloudinary no está configurado. Puedes probar la tienda con el seed, pero no subir imágenes nuevas.
            </p>
          </div>
        )}

        {/* Imágenes actuales */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {images.map((url, i) => (
              <div key={url} className="relative group">
                <div className="relative w-24 h-24 bg-[#0A0A0A] border border-[#333333] rounded-[2px] overflow-hidden">
                  <Image src={url} alt={`Imagen ${i + 1}`} fill className="object-contain p-2" sizes="96px" />
                </div>
                <button
                  type="button"
                  onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-[#E53E3E] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[9px] font-display text-[#888888] bg-[#0A0A0A]/80 px-1 rounded">
                    PRINCIPAL
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload */}
        <label className="flex flex-col items-center gap-3 p-8 border border-dashed border-[#333333] rounded-[2px] cursor-pointer hover:border-[#555555] transition-colors">
          <Upload size={20} className="text-[#888888]" />
          <div className="text-center">
            <p className="text-sm text-[#888888]">
              {uploading ? 'Subiendo…' : 'Arrastra imágenes o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-[#555555] mt-1">PNG, JPG, WebP — máx. 10MB por imagen</p>
            <p className="text-xs text-[#C0C0C0] mt-2 font-display uppercase tracking-wider">
              Preset: villatech_products
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>

      {/* ─── Especificaciones ─────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
            Especificaciones técnicas
          </h2>
          <button
            type="button"
            onClick={() => append({ key: '', value: '' })}
            className="btn-ghost text-xs flex items-center gap-1 py-1"
          >
            <Plus size={12} /> Agregar fila
          </button>
        </div>

        <div className="space-y-2">
          {specFields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-2">
              <GripVertical size={14} className="text-[#555555] flex-shrink-0" />
              <input
                {...register(`specs.${i}.key`)}
                className="input flex-1 text-sm py-2"
                placeholder="Propiedad (ej: RAM)"
              />
              <input
                {...register(`specs.${i}.value`)}
                className="input flex-1 text-sm py-2"
                placeholder="Valor (ej: 16 GB)"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="btn-ghost p-2 text-[#555555] hover:text-[#E53E3E]"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Estado ───────────────────────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xs uppercase tracking-widest text-[#888888]">
          Visibilidad
        </h2>

        <div className="space-y-3">
          {[
            { name: 'isActive', label: 'Producto activo', desc: 'Visible en la tienda' },
            { name: 'isFeatured', label: 'Producto destacado', desc: 'Aparece en el inicio y filtros' },
          ].map((field) => (
            <label key={field.name} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register(field.name as 'isActive' | 'isFeatured')}
                className="w-4 h-4 accent-[#FAFAFA]"
              />
              <div>
                <p className="text-sm text-[#FAFAFA]">{field.label}</p>
                <p className="text-xs text-[#888888]">{field.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ─── Actions ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
          disabled={saving}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? 'Guardando…' : mode === 'create' ? 'Crear producto' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}
