import type {
  Metadata,
} from "next";

import Link from "next/link";

import {
  ArrowLeft,
  Bot,
} from "lucide-react";

import {
  AiRecipeImportUploader,
} from "@/components/admin/recipes/ai-recipe-import-uploader";

import {
  Container,
} from "@/components/layout/container";


export const metadata: Metadata = {
  title:
    "Importar receta con IA",
};


export default function AiRecipeImportPage() {
  return (
    <main className="min-h-screen py-10 md:py-14">
      <Container>
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin/recipes"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Volver a recetas
          </Link>


          <header className="mt-7">
            <div className="flex items-center gap-3 text-brand">
              <Bot
                className="h-6 w-6"
                aria-hidden="true"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.16em]">
                Inteligencia artificial
              </p>
            </div>


            <h1 className="mt-3 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Importar receta
            </h1>


            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Convierte una imagen
              de una receta en un
              borrador estructurado
              de CociHub y revisa
              los datos antes de
              guardarlos.
            </p>
          </header>


          <div className="mt-10">
            <AiRecipeImportUploader />
          </div>
        </div>
      </Container>
    </main>
  );
}