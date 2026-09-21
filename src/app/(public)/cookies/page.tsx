import type {
  Metadata,
} from "next";

import {
  LegalPageLayout,
} from "@/components/legal/legal-page-layout";


export const metadata: Metadata = {
  title:
    "Política de cookies",

  description:
    "Información sobre el uso de cookies y tecnologías similares en CociHub.",
};


export default function CookiesPage() {
  return (
    <LegalPageLayout
      eyebrow="Cookies"
      title="Política de cookies"
      description="Información sobre las cookies y tecnologías similares que pueden utilizarse durante la navegación por CociHub."
    >
      <section>
        <h2 className="font-serif text-2xl font-bold">
          1. Qué son las cookies
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Las cookies son pequeños archivos
          que pueden almacenarse en el
          dispositivo del usuario cuando
          visita determinados sitios web y
          que permiten realizar distintas
          funciones relacionadas con la
          navegación.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          2. Cookies técnicas
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          CociHub puede utilizar cookies o
          mecanismos equivalentes
          estrictamente necesarios para
          funciones técnicas como la
          seguridad, el mantenimiento de
          sesiones administrativas o el
          funcionamiento correcto de la
          aplicación.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          3. Cookies no necesarias
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Antes de incorporar herramientas
          de analítica, publicidad u otras
          tecnologías que requieran
          consentimiento, CociHub deberá
          actualizar esta política e
          implementar el mecanismo de
          consentimiento correspondiente.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          4. Gestión del consentimiento
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Si en el futuro se utilizan
          cookies que requieran
          consentimiento, el usuario deberá
          poder aceptarlas o rechazarlas de
          forma clara antes de que se
          instalen, así como modificar sus
          preferencias posteriormente.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          5. Servicios de terceros
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          La utilización futura de
          servicios externos que instalen
          sus propias cookies deberá quedar
          identificada en esta política,
          indicando su finalidad y la
          información necesaria para que el
          usuario pueda tomar una decisión
          informada.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          6. Actualizaciones
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Esta política se actualizará
          cuando cambien las tecnologías o
          servicios utilizados por CociHub.
        </p>
      </section>
    </LegalPageLayout>
  );
}