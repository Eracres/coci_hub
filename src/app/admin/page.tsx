import {
  BookOpen,
  ChefHat,
  Tags,
} from "lucide-react";

import Link from "next/link";

import {
  logout,
} from "./actions";


export default function AdminPage() {
  return (
    <main className="mx-auto max-w-5xl p-8">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-secondary-hover">
          Administración
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground">
          CociHub Admin
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Gestiona las recetas, la clasificación y el conocimiento alimentario que utiliza CociHub.
        </p>
      </header>


      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Link
          href="/admin/recipes"
          className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ChefHat
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-5 font-serif text-xl font-bold text-foreground">
            Recetas
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Crea, revisa, modera y publica recetas.
          </p>
        </Link>


        <Link
          href="/admin/categories"
          className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
            <BookOpen
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-5 font-serif text-xl font-bold text-foreground">
            Categorías
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gestiona la clasificación pública de recetas.
          </p>
        </Link>


        <Link
          href="/admin/ingredients"
          className="group rounded-2xl border border-border bg-surface p-6 shadow-sm transition hover:border-brand/40"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
            <Tags
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-5 font-serif text-xl font-bold text-foreground">
            Ingredientes
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Administra alimentos canónicos, alias y alérgenos deterministas.
          </p>
        </Link>
      </section>


      <form
        action={
          logout
        }
        className="mt-10 border-t border-border pt-6"
      >
        <button
          type="submit"
          className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-brand/40 hover:text-brand"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
