import type {
  Metadata,
} from "next";

import {
  LegalPageLayout,
} from "@/components/legal/legal-page-layout";


export const metadata: Metadata = {
  title:
    "Aviso legal",

  description:
    "Información legal relativa al acceso y utilización de CociHub.",
};


export default function LegalNoticePage() {
  return (
    <LegalPageLayout
      eyebrow="Información legal"
      title="Aviso legal"
      description="Información general sobre la titularidad, utilización y responsabilidades relacionadas con CociHub."
    >
      <section>
        <h2 className="font-serif text-2xl font-bold">
          1. Titular del sitio
        </h2>

        <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <p className="font-semibold text-warning">
            Información pendiente antes
            del despliegue público
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Estos datos deben sustituirse
            por la información real del
            responsable de CociHub antes
            de publicar la web.
          </p>
        </div>

        <dl className="mt-5 space-y-3 text-sm leading-7">
          <div>
            <dt className="font-semibold">
              Titular
            </dt>

            <dd className="text-muted-foreground">
              [PENDIENTE: nombre completo
              o denominación]
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Dirección de contacto
            </dt>

            <dd className="text-muted-foreground">
              [PENDIENTE]
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Correo electrónico
            </dt>

            <dd className="text-muted-foreground">
              [PENDIENTE]
            </dd>
          </div>

          <div>
            <dt className="font-semibold">
              Identificación fiscal
            </dt>

            <dd className="text-muted-foreground">
              [PENDIENTE, cuando resulte
              aplicable]
            </dd>
          </div>
        </dl>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          2. Objeto
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          CociHub es una plataforma
          destinada a organizar,
          consultar y compartir recetas
          de cocina y contenido
          relacionado con su preparación.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          3. Condiciones de utilización
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          El acceso a CociHub implica la
          utilización responsable del
          sitio y de sus contenidos. No
          deberán utilizarse sus servicios
          con fines ilícitos, perjudiciales
          o contrarios a los derechos de
          terceros.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          4. Contenidos culinarios
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Las recetas se ofrecen con una
          finalidad informativa y
          culinaria. Los tiempos,
          cantidades y resultados pueden
          variar según los ingredientes,
          utensilios, equipos y técnicas
          empleados por cada persona.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          5. Alérgenos
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          La información sobre alérgenos
          incluida en CociHub es
          orientativa. Las personas con
          alergias o intolerancias deben
          comprobar siempre el etiquetado
          de los productos utilizados y
          valorar posibles contaminaciones
          cruzadas.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          6. Propiedad intelectual
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          El diseño, estructura, elementos
          gráficos y desarrollo propio de
          CociHub están protegidos por la
          normativa que resulte aplicable.
          Las recetas procedentes de
          fuentes externas conservarán,
          cuando corresponda, la referencia
          a su procedencia y los derechos
          pertenecientes a sus respectivos
          titulares.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          7. Enlaces externos
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          CociHub puede incluir enlaces a
          sitios web externos. El contenido
          y las políticas de esos sitios
          son responsabilidad de sus
          respectivos titulares.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          8. Modificaciones
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Este aviso podrá actualizarse
          cuando cambien las funcionalidades
          de CociHub, sus condiciones de uso
          o las obligaciones aplicables.
        </p>
      </section>
    </LegalPageLayout>
  );
}