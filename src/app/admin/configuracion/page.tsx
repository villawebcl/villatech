export const dynamic = 'force-dynamic'

import { isCloudinaryConfigured, isMercadoPagoConfigured } from '@/lib/env'
import { CHILE_REGIONS, getShippingRate } from '@/lib/utils'
import { formatCLP } from '@/lib/utils'

export default function AdminConfiguracionPage() {
  const integrations = [
    {
      name: 'Transbank Webpay Plus',
      env: 'TRANSBANK_COMMERCE_CODE',
      status: process.env.TRANSBANK_ENV === 'production' ? 'production' : 'integration',
    },
    {
      name: 'Cloudinary',
      env: 'CLOUDINARY_CLOUD_NAME',
      status: isCloudinaryConfigured() ? 'configured' : 'missing',
    },
    {
      name: 'MercadoPago',
      env: 'MERCADOPAGO_ACCESS_TOKEN',
      status: isMercadoPagoConfigured() ? 'configured' : 'optional',
    },
  ]

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl uppercase tracking-tight">Configuración</h1>
        <p className="text-[#888888] text-sm mt-1">Parámetros de la tienda</p>
      </div>

      <div className="space-y-6">
        {/* Datos de la tienda */}
        <div className="card p-6">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-5">
            Datos de la tienda
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre</label>
              <input defaultValue="VillaTech" className="input" disabled />
            </div>
            <div>
              <label className="label">Email de contacto</label>
              <input defaultValue="contacto@villatech.cl" className="input" />
            </div>
            <div className="col-span-2">
              <label className="label">URL del sitio</label>
              <input defaultValue="https://villatech.cl" className="input font-display text-sm" disabled />
            </div>
          </div>
          <p className="text-xs text-[#888888] mt-4">
            Para cambiar la URL del sitio, actualiza la variable de entorno{' '}
            <code className="font-display text-[#C0C0C0] bg-[#0A0A0A] px-1">NEXT_PUBLIC_URL</code>
          </p>
        </div>

        {/* Tarifas de envío */}
        <div className="card p-6">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-5">
            Tarifas de envío por región
          </h2>
          <p className="text-xs text-[#888888] mb-4">
            Las tarifas actuales están configuradas en{' '}
            <code className="font-display text-[#C0C0C0] bg-[#0A0A0A] px-1">lib/utils.ts → getShippingRate()</code>
          </p>
          <div className="border border-[#222222] rounded-[2px] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222222] bg-[#0A0A0A]">
                  <th className="px-4 py-2.5 text-left font-display text-[10px] uppercase tracking-widest text-[#888888]">Región</th>
                  <th className="px-4 py-2.5 text-right font-display text-[10px] uppercase tracking-widest text-[#888888]">Tarifa base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222]">
                {CHILE_REGIONS.map((region, i) => (
                  <tr key={region.code} className={i % 2 === 0 ? 'bg-[#111111]' : ''}>
                    <td className="px-4 py-2 text-xs text-[#888888]">
                      <span className="font-display text-[#555555] mr-2">{region.code}</span>
                      {region.name}
                    </td>
                    <td className="px-4 py-2 text-right font-display text-xs text-[#FAFAFA]">
                      {formatCLP(getShippingRate(region.code))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Integraciones */}
        <div className="card p-6">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#888888] mb-5">
            Integraciones
          </h2>
          <div className="space-y-4">
            {integrations.map((integration) => (
              <div key={integration.name} className="flex items-center justify-between py-3 border-b border-[#222222] last:border-0">
                <div>
                  <p className="text-sm text-[#FAFAFA]">{integration.name}</p>
                  <p className="text-[11px] text-[#555555] font-display mt-0.5">{integration.env}</p>
                </div>
                <span className={`badge ${
                  integration.status === 'production'
                    ? 'badge-success'
                    : integration.status === 'integration'
                    ? 'badge-warning'
                    : integration.status === 'missing'
                    ? 'border border-[#E53E3E]/40 bg-[#E53E3E]/10 text-[#E53E3E]'
                    : integration.status === 'optional'
                    ? 'badge-accent'
                    : 'badge-success'
                }`}>
                  {integration.status}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-[#888888] mt-4">
            Configura las variables de entorno en tu archivo{' '}
            <code className="font-display text-[#C0C0C0] bg-[#0A0A0A] px-1">.env</code>
          </p>
        </div>
      </div>
    </div>
  )
}
