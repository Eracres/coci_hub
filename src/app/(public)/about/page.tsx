import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChefHat,
  Heart,
  Scale,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";


export const metadata: Metadata = {
  title:
    "Sobre CociHub",

  description:
    "Conoce la filosofía de CociHub: conservar, cocinar y compartir recetas de una forma clara, práctica y cercana.",
};


export default function AboutPage() {
  return (
    <main>
      {/* =============================================
          HERO
      ============================================= */}

      <section className="relative overflow-hidden border-b border-border bg-page-muted/50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-32 -left-24 size-80 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden="true"
        />


        <Container className="relative py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              <ChefHat
                className="size-4"
                aria-hidden="true"
              />

              Sobre CociHub
            </div>


            <h1 className="mt-7 font-serif text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Las buenas recetas
              merecen seguir pasando
              de una cocina a otra
            </h1>


            <p className="mx-auto mt-6 max-w-3xl font-serif text-2xl leading-relaxed text-secondary-hover md:text-3xl">
              Comer es un placer,
              cocinar un privilegio,
              enseñar una
              responsabilidad.
            </p>


            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              CociHub nace como un
              espacio donde guardar,
              organizar, cocinar y
              compartir esas recetas
              que merece la pena
              conservar.
            </p>
          </div>
        </Container>
      </section>


      {/* =============================================
          POR QUÉ EXISTE
      ============================================= */}

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                El origen
              </p>


              <h2 className="mt-3 font-serif text-3xl font-bold leading-tight text-foreground md:text-4xl">
                Una receta es mucho
                más que una lista de
                ingredientes
              </h2>


              <div className="mt-6 space-y-5 text-base leading-8 text-muted-foreground">
                <p>
                  Algunas recetas
                  nacen en un libro,
                  otras aparecen en
                  una captura de
                  pantalla y muchas
                  sobreviven durante
                  años escritas a mano
                  en una libreta o
                  transmitidas dentro
                  de una familia.
                </p>


                <p>
                  CociHub busca reunir
                  toda esa información
                  en un mismo lugar y
                  presentarla de una
                  forma clara para que
                  cocinar resulte más
                  sencillo.
                </p>


                <p>
                  El objetivo no es
                  solamente almacenar
                  recetas, sino
                  conseguir que sean
                  útiles cuando
                  realmente llega el
                  momento de ponerse
                  delante de los
                  fogones.
                </p>
              </div>
            </div>


            <div className="rounded-3xl border border-border bg-surface p-6 shadow-lg md:p-8">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Heart
                  className="size-7"
                  aria-hidden="true"
                />
              </span>


              <h2 className="mt-6 font-serif text-3xl font-bold text-foreground">
                Una cocina pensada
                para conservar
              </h2>


              <p className="mt-4 leading-7 text-muted-foreground">
                Cada receta puede
                mantener su propia
                historia, sus
                ingredientes, sus
                pasos, sus consejos y
                su procedencia sin
                perder la sencillez
                necesaria para
                cocinarla.
              </p>


              <div className="mt-7 rounded-2xl bg-page-muted p-5">
                <p className="font-serif text-lg italic leading-7 text-foreground">
                  “Que una receta
                  vuelva a cocinarse
                  es la mejor forma
                  de conservarla.”
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* =============================================
          PRINCIPIOS
      ============================================= */}

      <section className="border-y border-border bg-page-muted/60 py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary-hover">
              Nuestra forma de
              entender la cocina
            </p>


            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Tres ideas detrás de
              CociHub
            </h2>
          </div>


          <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ChefHat
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
                Cocinar
              </h3>


              <p className="mt-3 leading-7 text-muted-foreground">
                La información debe
                estar organizada para
                poder consultarla
                mientras cocinas, sin
                tener que descifrar
                una receta cada vez
                que la preparas.
              </p>
            </article>


            <article className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover">
                <BookOpen
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
                Enseñar
              </h3>


              <p className="mt-3 leading-7 text-muted-foreground">
                Una buena receta no
                debería limitarse a
                decir qué hacer.
                También puede
                explicar pequeños
                trucos, tiempos,
                sustituciones y
                detalles que ayudan a
                repetir el resultado.
              </p>
            </article>


            <article className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/20 text-warning">
                <Users
                  className="size-6"
                  aria-hidden="true"
                />
              </span>


              <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
                Compartir
              </h3>


              <p className="mt-3 leading-7 text-muted-foreground">
                Una receta gana valor
                cuando otra persona
                puede cocinarla.
                CociHub está pensado
                para facilitar ese
                intercambio de una
                forma sencilla.
              </p>
            </article>
          </div>
        </Container>
      </section>


      {/* =============================================
          CÓMO AYUDA COCIHUB
      ============================================= */}

      <section className="py-16 md:py-20">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
                Cocinar con menos
                fricción
              </p>


              <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">
                La receta se adapta a
                la cocina, no al revés
              </h2>


              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                CociHub intenta
                presentar únicamente
                la información que
                necesitas cuando vas
                a preparar una receta.
              </p>
            </div>


            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <article className="flex gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                  <Scale
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Cantidades
                    adaptables
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Las cantidades
                    escalables pueden
                    recalcularse según
                    el número de
                    comensales.
                  </p>
                </div>
              </article>


              <article className="flex gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <BookOpen
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Pasos claros
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Ingredientes,
                    tiempos y
                    elaboración se
                    organizan de forma
                    independiente para
                    facilitar la
                    consulta.
                  </p>
                </div>
              </article>


              <article className="flex gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-warning">
                  <Sparkles
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Importación
                    asistida
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Una receta puede
                    extraerse desde
                    una imagen para
                    preparar un
                    borrador que
                    siempre debe ser
                    revisado antes de
                    publicarse.
                  </p>
                </div>
              </article>


              <article className="flex gap-4 rounded-3xl border border-border bg-surface p-6 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
                  <Heart
                    className="size-5"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <h3 className="font-serif text-xl font-bold text-foreground">
                    Recetas con
                    historia
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    CociHub permite
                    indicar la
                    procedencia de una
                    receta para no
                    perder de dónde
                    vino.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </Container>
      </section>


      {/* =============================================
          CTA FINAL
      ============================================= */}

      <section className="pb-16 md:pb-20">
        <Container>
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-secondary-hover px-6 py-12 text-center text-inverse shadow-lg md:px-12 md:py-14">
            <div
              className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-20 -left-16 size-64 rounded-full bg-accent/20 blur-3xl"
              aria-hidden="true"
            />


            <div className="relative">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
                La cocina está lista
              </p>


              <h2 className="mx-auto mt-3 max-w-2xl font-serif text-3xl font-bold md:text-4xl">
                Ahora solo falta
                elegir qué cocinar
              </h2>


              <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">
                Explora el recetario
                de CociHub o navega
                entre sus categorías
                para encontrar tu
                próxima receta.
              </p>


              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/recipes"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
                >
                  Explorar recetas

                  <ArrowRight
                    className="size-4"
                    aria-hidden="true"
                  />
                </Link>


                <Link
                  href="/categories"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/5 px-6 font-semibold text-inverse transition duration-200 hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Ver categorías
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}