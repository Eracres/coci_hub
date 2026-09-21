import type {
  ReactNode,
} from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Scale,
} from "lucide-react";

import {
  Container,
} from "@/components/layout/container";


type LegalPageLayoutProps = {
  eyebrow:
    string;

  title:
    string;

  description:
    string;

  children:
    ReactNode;
};


export function LegalPageLayout({
  eyebrow,
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-border bg-page-muted/50">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-28 -left-24 size-72 rounded-full bg-secondary/20 blur-3xl"
          aria-hidden="true"
        />


        <Container className="relative py-14 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-brand transition hover:bg-brand/10 hover:text-brand-hover"
          >
            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Volver al inicio
          </Link>


          <div className="mt-7 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand">
              <Scale
                className="size-4"
                aria-hidden="true"
              />

              {eyebrow}
            </div>


            <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>


            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
        </Container>
      </section>


      <section className="py-12 md:py-16">
        <Container>
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface p-6 shadow-sm md:p-10">
            <div className="space-y-10 text-foreground">
              {children}
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}