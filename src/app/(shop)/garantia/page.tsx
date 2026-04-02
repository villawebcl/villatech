import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garantía',
  description: 'Condiciones generales de garantía de productos en VillaTech.',
}

export default function GarantiaPage() {
  return (
    <div className="container-site py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Garantía</h1>
        <p className="text-[#888888] text-sm mt-2">
          Condiciones generales sujetas a revisión técnica y políticas del fabricante.
        </p>
      </div>

      <div className="card p-6 space-y-5 text-sm text-[#888888] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Cobertura general
          </h2>
          <p>
            Los productos comercializados por VillaTech cuentan con garantía legal aplicable y, cuando
            corresponda, garantía comercial del fabricante o distribuidor autorizado.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Revisión técnica
          </h2>
          <p>
            Toda solicitud de garantía puede requerir inspección para validar la falla reportada. Los plazos
            dependen del tipo de producto y del procedimiento del servicio técnico correspondiente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Exclusiones comunes
          </h2>
          <p>
            La garantía no cubre daños por golpes, manipulación indebida, intervención no autorizada, mal uso,
            humedad, variaciones eléctricas u otras causas externas al defecto de fabricación.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Cómo solicitarla
          </h2>
          <p>
            Conserva boleta o comprobante de compra, número de pedido y evidencia del problema. Con esa
            información VillaTech podrá orientar el ingreso y seguimiento del caso.
          </p>
        </section>
      </div>
    </div>
  )
}
