import type {
  Metadata,
} from "next";

import {
  LegalPageLayout,
} from "@/components/legal/legal-page-layout";


export const metadata: Metadata = {
  title:
    "Política de privacidad",

  description:
    "Información sobre privacidad y tratamiento de datos personales en CociHub.",
};


export default function PrivacyPage() {
  return (
    <LegalPageLayout
      eyebrow="Privacidad"
      title="Política de privacidad"
      description="Información sobre cómo CociHub trata los datos personales cuando utiliza sus servicios."
    >
      <section>
        <h2 className="font-serif text-2xl font-bold">
          1. Responsable
        </h2>

        <div className="mt-4 rounded-2xl border border-warning/30 bg-warning/5 p-5">
          <p className="font-semibold text-warning">
            Información pendiente antes
            del despliegue público
          </p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Deben añadirse los datos
            reales del responsable y un
            correo de contacto para
            cuestiones relacionadas con
            privacidad.
          </p>
        </div>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          2. Datos tratados
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          CociHub podrá tratar los datos
          estrictamente necesarios para el
          funcionamiento, seguridad y
          administración del servicio.
        </p>

        <p className="mt-3 leading-7 text-muted-foreground">
          Las funcionalidades futuras que
          impliquen registro de usuarios,
          publicación de recetas personales
          u otras formas de participación
          requerirán la actualización de
          esta política antes de ponerse a
          disposición del público.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          3. Finalidades
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Cuando exista tratamiento de
          datos personales, se utilizarán
          únicamente para las finalidades
          informadas en cada momento, como
          gestionar el acceso al servicio,
          mantener su seguridad o responder
          a comunicaciones dirigidas a
          CociHub.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          4. Base jurídica
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          La base jurídica dependerá de la
          finalidad concreta del
          tratamiento y podrá incluir la
          ejecución de un servicio
          solicitado, el cumplimiento de
          obligaciones legales, el interés
          legítimo cuando resulte aplicable
          o el consentimiento de la persona
          interesada.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          5. Conservación
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Los datos personales se
          conservarán únicamente durante el
          tiempo necesario para cumplir la
          finalidad para la que fueron
          recogidos y, posteriormente,
          durante los periodos que puedan
          resultar exigibles.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          6. Terceros y proveedores
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Para prestar determinadas
          funciones, CociHub puede apoyarse
          en proveedores tecnológicos.
          Antes del lanzamiento público se
          revisarán los proveedores
          utilizados y la información que
          deba ofrecerse sobre ellos.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          7. Derechos
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Las personas cuyos datos sean
          tratados podrán ejercer los
          derechos que les reconozca la
          normativa aplicable mediante el
          canal de contacto indicado por
          CociHub.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          8. Seguridad
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          CociHub adopta medidas técnicas y
          organizativas destinadas a
          proteger la información y limitar
          el acceso administrativo a las
          personas autorizadas.
        </p>
      </section>


      <section>
        <h2 className="font-serif text-2xl font-bold">
          9. Cambios futuros
        </h2>

        <p className="mt-4 leading-7 text-muted-foreground">
          Esta política deberá revisarse
          cuando CociHub incorpore nuevas
          funcionalidades que impliquen
          tratamientos de datos diferentes
          a los actuales.
        </p>
      </section>
    </LegalPageLayout>
  );
}