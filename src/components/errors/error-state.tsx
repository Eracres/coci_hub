"use client";

import Link from "next/link";

import {
  AlertTriangle,
  Home,
  RefreshCcw,
} from "lucide-react";


type ErrorStateProps = {
  title:
    string;

  description:
    string;

  reset:
    () => void;

  showHomeLink?:
    boolean;
};


export function ErrorState({
  title,
  description,
  reset,
  showHomeLink = true,
}: ErrorStateProps) {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-4 py-16">
      <div className="w-full rounded-3xl border border-error/25 bg-surface p-6 text-center shadow-md sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-error/10 text-error">
          <AlertTriangle
            className="size-8"
            aria-hidden="true"
          />
        </span>


        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-error">
          Algo no ha salido como
          esperábamos
        </p>


        <h1 className="mt-3 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          {title}
        </h1>


        <p className="mx-auto mt-4 max-w-xl leading-7 text-muted-foreground">
          {description}
        </p>


        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={
              reset
            }
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
          >
            <RefreshCcw
              className="size-4"
              aria-hidden="true"
            />

            Intentar de nuevo
          </button>


          {showHomeLink ? (
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-6 font-semibold text-foreground transition hover:bg-page-muted"
            >
              <Home
                className="size-4"
                aria-hidden="true"
              />

              Volver al inicio
            </Link>
          ) : null}
        </div>


        <p className="mt-7 text-xs leading-5 text-muted-foreground">
          Si el problema continúa,
          vuelve a intentarlo dentro
          de unos minutos.
        </p>
      </div>
    </section>
  );
}