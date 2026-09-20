import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  ChefHat,
  Home,
  Search,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";


export function NotFoundContent() {
  return (
    <main className="relative flex min-h-[70vh] items-center overflow-hidden py-16 md:py-24">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-28 -left-24 size-80 rounded-full bg-secondary/20 blur-3xl"
        aria-hidden="true"
      />


      <Container className="relative">
        <section className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-brand text-inverse shadow-lg">
            <ChefHat
              className="size-10"
              aria-hidden="true"
            />
          </div>


          <p className="mt-8 font-serif text-7xl font-bold tracking-tight text-brand sm:text-8xl md:text-9xl">
            404
          </p>


          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary-hover">
            Parece que esta receta
            se nos ha quemado
          </p>


          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
            No encontramos la
            página que buscas
          </h1>


          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
            Puede que el contenido
            ya no exista, haya
            cambiado de dirección o
            que el enlace tenga algún
            error. Pero tranquilo:
            todavía queda mucho por
            cocinar en CociHub.
          </p>


          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
            >
              <Home
                className="size-4"
                aria-hidden="true"
              />

              Volver al inicio
            </Link>


            <Link
              href="/recipes"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-page-muted"
            >
              <Search
                className="size-4 text-brand"
                aria-hidden="true"
              />

              Explorar recetas
            </Link>


            <Link
              href="/categories"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-secondary hover:bg-page-muted"
            >
              <BookOpen
                className="size-4 text-secondary-hover"
                aria-hidden="true"
              />

              Ver categorías
            </Link>
          </div>


          <div className="mt-12 border-t border-border pt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-brand"
            >
              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Seguir navegando por
              CociHub
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}