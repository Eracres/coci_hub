import Link from "next/link";
import { Container } from "@/components/layout/container";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center py-16">
      <Container>
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand">
            Proyecto en desarrollo
          </p>

          <h1 className="mt-4 font-serif text-5xl font-bold leading-tight md:text-6xl">
            CociHub
          </h1>

          <p className="mt-3 font-serif text-2xl text-secondary-hover">
            Tus recetas, siempre a mano.
          </p>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Plataforma de recetas personales diseñada para consultar,
            organizar, adaptar y compartir recetas desde cualquier dispositivo.
          </p>

          <Link
            href="/design-system"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-md bg-brand px-5 font-semibold text-inverse transition-colors hover:bg-brand-hover"
          >
            Ver sistema de diseño
          </Link>
        </div>
      </Container>
    </main>
  );
}