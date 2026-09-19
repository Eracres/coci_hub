import {
  ChefHat,
} from "lucide-react";
import Link from "next/link";

import {
  Container,
} from "@/components/layout/container";

export function PublicFooter() {
  const currentYear =
    new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-page-muted">
      <Container className="py-10 md:py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr]">
          <div className="max-w-xl">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-lg"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-inverse shadow-sm">
                <ChefHat
                  className="size-5"
                  aria-hidden="true"
                />
              </span>

              <span className="font-serif text-xl font-semibold">
                Coci
                <span className="text-brand">
                  Hub
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">
              Un espacio para guardar,
              cocinar, compartir y disfrutar
              las recetas que merecen seguir
              pasando de una cocina a otra.
            </p>

            <p className="mt-4 font-serif text-sm italic text-foreground">
              Comer es un placer, cocinar un
              privilegio, enseñar una
              responsabilidad.
            </p>
          </div>

          <div>
            <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-foreground">
              Explorar
            </h2>

            <nav
              className="mt-4 flex flex-col items-start gap-3"
              aria-label="Navegación del pie"
            >
              <Link
                href="/"
                className="text-sm text-muted-foreground transition hover:text-brand"
              >
                Inicio
              </Link>

              <Link
                href="/recipes"
                className="text-sm text-muted-foreground transition hover:text-brand"
              >
                Recetas
              </Link>

              <Link
                href="/categories"
                className="text-sm text-muted-foreground transition hover:text-brand"
              >
                Categorías
              </Link>
            </nav>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6">
          <p className="text-xs leading-6 text-muted-foreground">
            © {currentYear} CociHub.
            Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}