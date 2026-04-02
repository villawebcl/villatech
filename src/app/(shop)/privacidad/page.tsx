import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacidad',
  description: 'Política general de privacidad y tratamiento de datos de VillaTech.',
}

export default function PrivacidadPage() {
  return (
    <div className="container-site py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl uppercase tracking-tight">Privacidad</h1>
        <p className="text-[#888888] text-sm mt-2">
          Política base para entorno de prueba. Debe completarse con datos legales definitivos antes del lanzamiento.
        </p>
      </div>

      <div className="card p-6 space-y-5 text-sm text-[#888888] leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Datos recopilados
          </h2>
          <p>
            VillaTech puede recopilar datos entregados por el usuario durante registro, compra, contacto o
            navegación, como nombre, correo, teléfono, dirección y datos asociados al pedido.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Finalidad
          </h2>
          <p>
            Los datos se utilizan para gestionar cuentas, procesar pedidos, coordinar pagos, despachos,
            postventa y comunicaciones relacionadas con la compra o soporte.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Resguardo y terceros
          </h2>
          <p>
            Parte de la operación puede apoyarse en terceros tecnológicos o logísticos. VillaTech buscará usar
            proveedores confiables y limitar el tratamiento de datos a fines operativos razonables.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-xs uppercase tracking-widest text-[#FAFAFA]">
            Actualización pendiente
          </h2>
          <p>
            Antes del lanzamiento comercial, esta política debe completarse con identificación del responsable,
            base legal, plazos de conservación y mecanismos formales de solicitud o eliminación de datos.
          </p>
        </section>
      </div>
    </div>
  )
}
