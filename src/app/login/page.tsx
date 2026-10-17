import {
  ArrowLeft,
  ChefHat,
} from "lucide-react";

import Link from "next/link";

import {
  LoginForm,
} from "./login-form";


export default function LoginPage() {
  return (
    <main className="min-h-screen bg-page px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-lg">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a CociHub
        </Link>


        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand text-inverse shadow-sm">
              <ChefHat
                className="size-6"
                aria-hidden="true"
              />
            </div>


            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              CociHub
            </p>


            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Bienvenido de nuevo
            </h1>


            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Accede a tu cuenta para
              continuar cocinando,
              compartiendo y disfrutando
              de CociHub.
            </p>

          </div>


          <LoginForm />

        </section>


        <p className="mt-6 text-center font-serif text-sm italic text-muted-foreground">
          Comer es un placer,
          cocinar un privilegio,
          enseñar una responsabilidad.
        </p>

      </div>
    </main>
  );
}