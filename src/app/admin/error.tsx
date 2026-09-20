"use client";

import {
  useEffect,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";


type AdminErrorProps = {
  error:
    Error & {
      digest?:
        string;
    };

  reset:
    () => void;
};


export default function AdminError({
  error,
  reset,
}: AdminErrorProps) {
  useEffect(
    () => {
      console.error(
        "ADMIN ROUTE ERROR:",
        error,
      );
    },
    [
      error,
    ],
  );


  return (
    <main className="mx-auto max-w-5xl p-8">
      <section className="rounded-3xl border border-error/25 bg-surface p-6 shadow-md md:p-10">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-error/10 text-error">
          <AlertTriangle
            className="size-7"
            aria-hidden="true"
          />
        </span>


        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-error">
          Error inesperado
        </p>


        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
          No hemos podido completar
          esta operación
        </h1>


        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          Se ha producido un problema
          al cargar esta sección del
          panel de administración.
          Puedes intentarlo de nuevo
          sin necesidad de abandonar
          CociHub.
        </p>


        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={
              reset
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
          >
            <RefreshCcw
              className="size-4"
              aria-hidden="true"
            />

            Intentar de nuevo
          </button>


          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 font-semibold text-foreground transition hover:bg-page-muted"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver al panel
          </Link>
        </div>


        <div className="mt-8 rounded-2xl bg-page-muted px-4 py-3">
          <p className="text-xs leading-5 text-muted-foreground">
            Los detalles técnicos se
            registrarán en la consola
            para poder diagnosticar el
            problema sin mostrarlos
            directamente en la
            interfaz.
          </p>
        </div>
      </section>
    </main>
  );
}