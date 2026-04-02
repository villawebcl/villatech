import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description: 'Términos y condiciones generales de uso y compra en VillaTech.',
}

export default function TerminosPage() {
  return (
    <div className="container-site py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Términos y condiciones</h1>
        <p className="text-[#888888] text-sm mt-2">
          Texto base para preview. Debe ser revisado y completado antes del lanzamiento comercial.
        </p>
      </div>

      <div className="card p-6 space-y-5 text-sm text-[#888888] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Uso del sitio
          </h2>
          <p>
            El uso de este sitio implica aceptar las condiciones generales de navegación, compra y contacto
            publicadas por VillaTech, así como la normativa aplicable en Chile.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Información comercial
          </h2>
          <p>
            Los precios, descripciones, promociones y disponibilidad pueden actualizarse sin previo aviso.
            VillaTech procurará mantener la información correcta, pero podrá rectificar errores evidentes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Confirmación de pedidos
          </h2>
          <p>
            La recepción de una orden no implica aceptación automática. El pedido puede requerir validaciones de
            stock, pago, identidad, despacho u otros controles internos antes de su confirmación final.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Versión vigente
          </h2>
          <p>
            Antes de salir a producción, este documento debe completarse con razón social, RUT, domicilio,
            canales formales de contacto y condiciones comerciales definitivas.
          </p>
        </section>
      </div>
    </div>
  )
}
