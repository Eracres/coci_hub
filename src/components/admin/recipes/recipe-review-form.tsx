"use client";

import {
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  approveRecipeReviewAction,
  returnRecipeReviewAction,
} from "@/app/admin/recipes/[id]/edit/review-actions";


type ReviewMode =
  | "approve"
  | "return"
  | null;


type RecipeReviewFormProps = {
  recipeId:
    string;

  recipeTitle:
    string;

  submittedAt:
    string | null;
};


function formatDateTime(
  value:
    string | null,
) {
  if (
    !value
  ) {
    return "Sin fecha registrada";
  }


  return new Intl.DateTimeFormat(
    "es-ES",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


export function RecipeReviewForm({
  recipeId,
  recipeTitle,
  submittedAt,
}: RecipeReviewFormProps) {
  const router =
    useRouter();


  const [
    mode,
    setMode,
  ] =
    useState<ReviewMode>(
      null,
    );


  const [
    reviewNotes,
    setReviewNotes,
  ] =
    useState(
      "",
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  function closeMode() {
    if (
      isSubmitting
    ) {
      return;
    }


    setMode(
      null,
    );


    setMessage(
      null,
    );
  }


  async function handleApprove() {
    setMessage(
      null,
    );


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await approveRecipeReviewAction(
          recipeId,
        );


      setMessage(
        result.message ??
        null,
      );


      if (
        result.success
      ) {
        setMode(
          null,
        );


        router.refresh();
      }

    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  async function handleReturn() {
    setMessage(
      null,
    );


    if (
      reviewNotes
        .trim()
        .length ===
      0
    ) {
      setMessage(
        "Escribe las correcciones que debe realizar el autor.",
      );

      return;
    }


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await returnRecipeReviewAction(
          recipeId,
          reviewNotes,
        );


      setMessage(
        result.message ??
        null,
      );


      if (
        result.success
      ) {
        setMode(
          null,
        );


        router.refresh();
      }

    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="border-b border-border bg-page-muted/50 p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex items-start gap-4">

            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

              <ShieldCheck
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                Moderación
              </p>


              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Receta pendiente de revisión
              </h2>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Esta receta ha sido enviada por un usuario
                y está bloqueada temporalmente mientras se
                toma una decisión.
              </p>

            </div>

          </div>


          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm font-medium">

            <Clock3
              className="size-4 text-brand"
              aria-hidden="true"
            />

            En revisión

          </span>

        </div>

      </div>


      {/* =================================================
          RECIPE INFO
      ================================================= */}

      <div className="p-6">

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-border bg-page-muted/30 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Receta
            </p>


            <p className="mt-2 font-semibold">
              {
                recipeTitle
              }
            </p>

          </div>


          <div className="rounded-xl border border-border bg-page-muted/30 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Enviada
            </p>


            <p className="mt-2 text-sm font-semibold">
              {
                formatDateTime(
                  submittedAt,
                )
              }
            </p>

          </div>

        </div>


        <div className="mt-5 rounded-xl border border-brand/20 bg-brand/5 p-4">

          <div className="flex items-start gap-3">

            <Eye
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="flex-1">

              <p className="font-semibold">
                Revisa primero la receta completa
              </p>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Utiliza la vista previa para comprobar cómo
                se presentará al usuario antes de aprobarla.
              </p>


              <Link
                href={`/admin/recipes/${recipeId}/preview`}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
              >

                <Eye
                  className="size-4"
                  aria-hidden="true"
                />

                Abrir vista previa

              </Link>

            </div>

          </div>

        </div>


        {/* =================================================
            INITIAL ACTIONS
        ================================================= */}

        {!mode && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => {
                setMessage(
                  null,
                );


                setMode(
                  "return",
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
            >

              <RotateCcw
                className="size-4"
                aria-hidden="true"
              />

              Devolver con cambios

            </button>


            <button
              type="button"
              onClick={() => {
                setMessage(
                  null,
                );


                setMode(
                  "approve",
                );
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
            >

              <CheckCircle2
                className="size-4"
                aria-hidden="true"
              />

              Aprobar y publicar

            </button>

          </div>
        )}


        {/* =================================================
            APPROVE CONFIRMATION
        ================================================= */}

        {mode ===
          "approve" && (
          <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-5">

            <div className="flex items-start gap-3">

              <CheckCircle2
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />


              <div>

                <h3 className="font-semibold">
                  ¿Aprobar y publicar esta receta?
                </h3>


                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  La receta quedará publicada y será
                  visible para toda la comunidad.
                </p>

              </div>

            </div>


            <div className="mt-5 flex flex-wrap justify-end gap-3">

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeMode
                }
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:opacity-50"
              >

                <X
                  className="size-4"
                  aria-hidden="true"
                />

                Cancelar

              </button>


              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  handleApprove
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSubmitting ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <CheckCircle2
                    className="size-4"
                    aria-hidden="true"
                  />
                )}


                {isSubmitting
                  ? "Publicando..."
                  : "Sí, aprobar y publicar"}

              </button>

            </div>

          </div>
        )}


        {/* =================================================
            RETURN FORM
        ================================================= */}

        {mode ===
          "return" && (
          <div className="mt-6 rounded-2xl border border-border bg-page-muted/30 p-5">

            <div className="flex items-start gap-3">

              <MessageSquareText
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />


              <div className="flex-1">

                <h3 className="font-semibold">
                  Solicitar cambios
                </h3>


                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Explica al autor de forma clara qué debe
                  modificar antes de volver a enviar la receta.
                </p>


                <label
                  htmlFor="reviewNotes"
                  className="mt-5 block text-sm font-semibold"
                >
                  Observaciones para el autor
                </label>


                <textarea
                  id="reviewNotes"
                  value={
                    reviewNotes
                  }
                  maxLength={
                    1500
                  }
                  disabled={
                    isSubmitting
                  }
                  onChange={(
                    event,
                  ) =>
                    setReviewNotes(
                      event
                        .target
                        .value,
                    )
                  }
                  rows={
                    6
                  }
                  placeholder="Ej. Explica con más detalle el segundo paso y revisa la cantidad de sal indicada..."
                  className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                />


                <div className="mt-2 flex justify-end">

                  <span className="text-xs text-muted-foreground">
                    {
                      reviewNotes
                        .length
                    }
                    /1500
                  </span>

                </div>

              </div>

            </div>


            <div className="mt-5 flex flex-wrap justify-end gap-3">

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={
                  closeMode
                }
                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:opacity-50"
              >
                Cancelar
              </button>


              <button
                type="button"
                disabled={
                  isSubmitting ||
                  reviewNotes
                    .trim()
                    .length ===
                    0
                }
                onClick={
                  handleReturn
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSubmitting ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <RotateCcw
                    className="size-4"
                    aria-hidden="true"
                  />
                )}


                {isSubmitting
                  ? "Devolviendo..."
                  : "Devolver al autor"}

              </button>

            </div>

          </div>
        )}


        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm"
          >
            {
              message
            }
          </p>
        )}

      </div>

    </section>
  );
}
