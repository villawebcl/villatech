import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formatea un valor entero como precio CLP */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Genera el número de orden en formato VT-2025-0001 */
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear()
  const padded = String(sequence).padStart(4, '0')
  return `VT-${year}-${padded}`
}

/** Valida RUT chileno con módulo 11 */
export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return false

  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)

  let sum = 0
  let factor = 2

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }

  const remainder = 11 - (sum % 11)
  const expected =
    remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder)

  return dv === expected
}

/** Formatea RUT: 12.345.678-9 */
export function formatRut(rut: string): string {
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (clean.length < 2) return clean
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

/** Genera un slug desde un string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/** Calcula el descuento de un producto */
export function getDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

/** Regiones de Chile para envío */
export const CHILE_REGIONS = [
  { code: 'RM', name: 'Región Metropolitana' },
  { code: 'I', name: 'Tarapacá' },
  { code: 'II', name: 'Antofagasta' },
  { code: 'III', name: 'Atacama' },
  { code: 'IV', name: 'Coquimbo' },
  { code: 'V', name: "Valparaíso" },
  { code: 'VI', name: "O'Higgins" },
  { code: 'VII', name: 'Maule' },
  { code: 'VIII', name: 'Biobío' },
  { code: 'IX', name: 'La Araucanía' },
  { code: 'X', name: 'Los Lagos' },
  { code: 'XI', name: 'Aysén' },
  { code: 'XII', name: 'Magallanes' },
  { code: 'XIV', name: 'Los Ríos' },
  { code: 'XV', name: 'Arica y Parinacota' },
  { code: 'XVI', name: 'Ñuble' },
] as const

/** Tarifa de envío base por región (CLP) */
export function getShippingRate(regionCode: string): number {
  const rates: Record<string, number> = {
    RM: 3990,
    V: 5990,
    VI: 5990,
    VII: 6990,
    VIII: 6990,
    XVI: 6990,
    IV: 7990,
    IX: 7990,
    XIV: 7990,
    X: 8990,
    I: 9990,
    II: 9990,
    III: 9990,
    XV: 9990,
    XI: 12990,
    XII: 14990,
  }
  return rates[regionCode] ?? 9990
}
