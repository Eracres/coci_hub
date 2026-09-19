import {
  ChefHat,
  Menu,
} from "lucide-react";
import Link from "next/link";

import {
  Container,
} from "@/components/layout/container";

const navigationItems = [
  {
    href: "/",
    label: "Inicio",
  },
  {
    href: "/recipes",
    label: "Recetas",
  },
  {
    href: "/categories",
    label: "Categorías",
  },
] as const;

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-page/95 backdrop-blur-md">
      <Container className="flex min-h-16 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-lg"
          aria-label="Ir al inicio de CociHub"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-inverse shadow-sm transition group-hover:bg-brand-hover">
            <ChefHat
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <span className="font-serif text-xl font-semibold tracking-tight">
            <span className="text-foreground">
              Coci
            </span>

            <span className="text-brand">
              Hub
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Navegación principal"
        >
          {navigationItems.map(
            (
              item,
            ) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}

          <Link
            href="/recipes"
            className="ml-3 inline-flex items-center justify-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
          >
            Explorar recetas
          </Link>
        </nav>

        <details className="group relative md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-foreground shadow-xs transition hover:bg-page-muted [&::-webkit-details-marker]:hidden">
            <span className="sr-only">
              Abrir menú de navegación
            </span>

            <Menu
              className="size-5"
              aria-hidden="true"
            />
          </summary>

          <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-xl border border-border bg-surface p-2 shadow-lg">
            <nav
              className="flex flex-col"
              aria-label="Navegación móvil"
            >
              {navigationItems.map(
                (
                  item,
                ) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ),
              )}

              <div className="my-2 border-t border-border" />

              <Link
                href="/recipes"
                className="rounded-lg bg-brand px-4 py-3 text-center text-sm font-semibold text-inverse transition hover:bg-brand-hover"
              >
                Explorar recetas
              </Link>
            </nav>
          </div>
        </details>
      </Container>
    </header>
  );
}