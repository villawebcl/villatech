import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Despachos',
  description: 'Información de envíos y despachos de VillaTech en Chile.',
}

export default function DespachosPage() {
  return (
    <div className="container-site py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Despachos</h1>
        <p className="text-[#888888] text-sm mt-2">
          Información general para compras en etapa de prueba y coordinación operativa.
        </p>
      </div>

      <div className="card p-6 space-y-5 text-sm text-[#888888] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Cobertura
          </h2>
          <p>
            Realizamos despachos dentro de Chile. La disponibilidad exacta por comuna y tiempos de entrega
            pueden variar según operador logístico, volumen y dirección final.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Plazos estimados
          </h2>
          <p>
            Una vez confirmado el pago, los pedidos suelen procesarse en 1 a 2 días hábiles. El tránsito
            posterior depende del destino y del courier asignado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Costos de envío
          </h2>
          <p>
            El costo se calcula según la región informada en checkout. Para compras especiales, voluminosas o
            con condiciones particulares, VillaTech puede confirmar el valor final antes del despacho.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Incidencias
          </h2>
          <p>
            Si tu pedido llega con daño visible, embalaje comprometido o falta de productos, escríbenos apenas
            lo recibas para revisar el caso con respaldo fotográfico.
          </p>
        </section>
      </div>
    </div>
  )
}
