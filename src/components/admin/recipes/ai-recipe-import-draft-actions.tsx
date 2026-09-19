"use client";

import {
  Loader2,
  Save,
  TriangleAlert,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";

import type {
  AiRecipeDraftApiResponse,
} from "@/types/ai-recipe-draft-api";


type AiRecipeImportDraftActionsProps = {
  recipe:
    AiRecipeImport;
};


export function AiRecipeImportDraftActions({
  recipe,
}: AiRecipeImportDraftActionsProps) {
  const router =
    useRouter();


  const [
    isCreating,
    setIsCreating,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  async function createDraft() {
    if (
      isCreating
    ) {
      return;
    }


    setIsCreating(
      true,
    );

    setError(
      null,
    );


    try {
      const response =
        await fetch(
          "/api/admin/recipes/import/draft",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                recipe,
              ),
          },
        );


      const payload =
        (
          await response.json()
        ) as AiRecipeDraftApiResponse;


      if (
        !response.ok ||
        !payload.success
      ) {
        if (
          !payload.success &&
          payload.validationErrors &&
          payload.validationErrors.length >
            0
        ) {
          setError(
            `${payload.error} ${payload.validationErrors.join(
              " · ",
            )}`,
          );
        } else {
          setError(
            payload.success
              ? "No se pudo crear el borrador."
              : payload.error,
          );
        }


        return;
      }


      router.push(
        `/admin/recipes/${payload.recipeId}/edit`,
      );

      router.refresh();
    } catch (
      requestError
    ) {
      console.error(
        "AI CREATE DRAFT REQUEST ERROR:",
        requestError,
      );


      setError(
        "No se pudo conectar con el servicio de creación del borrador.",
      );
    } finally {
      setIsCreating(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
          Último paso
        </p>


        <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">
          Crear borrador en CociHub
        </h2>


        <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">
          Se guardará la información
          que acabas de revisar como
          una receta en estado
          borrador. Las sugerencias
          de clasificación solo se
          asociarán si ya existen
          en los catálogos de
          CociHub.
        </p>
      </div>


      {error ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-border bg-secondary/40 p-4">
          <TriangleAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-brand"
            aria-hidden="true"
          />

          <p className="text-sm leading-6 text-muted-foreground">
            {
              error
            }
          </p>
        </div>
      ) : null}


      <button
        type="button"
        onClick={
          createDraft
        }
        disabled={
          isCreating
        }
        className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 font-semibold text-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCreating ? (
          <>
            <Loader2
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            />

            Creando borrador...
          </>
        ) : (
          <>
            <Save
              className="h-4 w-4"
              aria-hidden="true"
            />

            Crear borrador en CociHub
          </>
        )}
      </button>
    </section>
  );
}