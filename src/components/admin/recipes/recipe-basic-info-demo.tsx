"use client";

import { useMemo, useState } from "react";

import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const SHORT_DESCRIPTION_MAX = 180;
const INTRODUCTION_MAX = 1500;

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function RecipeBasicInfoDemo() {
  const [title, setTitle] = useState(
    "Falafel de remolacha",
  );

  const [slug, setSlug] = useState(
    "falafel-de-remolacha",
  );

  const [isSlugEdited, setIsSlugEdited] =
    useState(false);

  const [shortDescription, setShortDescription] =
    useState(
      "Falafel casero de garbanzos y remolacha, crujiente por fuera y jugoso por dentro.",
    );

  const [introduction, setIntroduction] =
    useState("");

  const generatedUrl = useMemo(
    () =>
      slug
        ? `cocihub.es/recetas/${slug}`
        : "cocihub.es/recetas/...",
    [slug],
  );

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!isSlugEdited) {
      setSlug(createSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugEdited(true);
    setSlug(createSlug(value));
  }

  function resetSlug() {
    setIsSlugEdited(false);
    setSlug(createSlug(title));
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div>
        <h3 className="font-serif text-xl font-bold">
          Información básica
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Define cómo se identificará y presentará la
          receta dentro de CociHub.
        </p>
      </div>

      <div className="mt-6 grid gap-6">
        <FormField
          htmlFor="recipe-title"
          label="Título de la receta"
          description="Utiliza un nombre claro y reconocible."
          required
        >
          <Input
            id="recipe-title"
            value={title}
            onChange={(event) =>
              handleTitleChange(event.target.value)
            }
            placeholder="Ej. Falafel de remolacha"
            maxLength={120}
            aria-describedby="recipe-title-description"
          />
        </FormField>

        <FormField
          htmlFor="recipe-slug"
          label="URL de la receta"
          description={
            isSlugEdited
              ? "Has modificado manualmente la URL."
              : "Se genera automáticamente a partir del título."
          }
        >
          <div className="space-y-3">
            <Input
              id="recipe-slug"
              value={slug}
              onChange={(event) =>
                handleSlugChange(event.target.value)
              }
              placeholder="falafel-de-remolacha"
              maxLength={140}
              aria-describedby="recipe-slug-description"
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-sm text-muted-foreground">
                {generatedUrl}
              </p>

              {isSlugEdited && (
                <button
                  type="button"
                  onClick={resetSlug}
                  className="text-left text-sm font-semibold text-brand hover:underline sm:text-right"
                >
                  Volver a generar
                </button>
              )}
            </div>
          </div>
        </FormField>

        <FormField
          htmlFor="recipe-short-description"
          label="Descripción corta"
          description="Se utilizará en tarjetas, buscadores y metadatos."
          required
        >
          <div>
            <Textarea
              id="recipe-short-description"
              value={shortDescription}
              onChange={(event) =>
                setShortDescription(
                  event.target.value,
                )
              }
              placeholder="Describe brevemente la receta..."
              maxLength={SHORT_DESCRIPTION_MAX}
              className="min-h-28"
              aria-describedby="recipe-short-description-description"
            />

            <p className="mt-2 text-right text-xs text-muted-foreground">
              {shortDescription.length} /{" "}
              {SHORT_DESCRIPTION_MAX}
            </p>
          </div>
        </FormField>

        <FormField
          htmlFor="recipe-introduction"
          label="Introducción"
          description="Cuenta el origen, contexto o alguna historia relacionada con la receta."
        >
          <div>
            <Textarea
              id="recipe-introduction"
              value={introduction}
              onChange={(event) =>
                setIntroduction(
                  event.target.value,
                )
              }
              placeholder="Ej. Esta receta surgió como una forma diferente de preparar..."
              maxLength={INTRODUCTION_MAX}
              className="min-h-44"
              aria-describedby="recipe-introduction-description"
            />

            <p className="mt-2 text-right text-xs text-muted-foreground">
              {introduction.length} /{" "}
              {INTRODUCTION_MAX}
            </p>
          </div>
        </FormField>
      </div>
    </section>
  );
}