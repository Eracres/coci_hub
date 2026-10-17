"use client";

import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileCheck2,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeStatusAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import type {
  PublicationReadiness,
} from "@/lib/recipes/get-publication-readiness";

import type {
  RecipeStatus,
} from "@/schemas/recipe-publication-schema";


type RecipePublicationFormProps = {
  recipeId:
    string;

  status:
    RecipeStatus;

  readiness:
    PublicationReadiness;
};


function getStatusLabel(
  status:
    RecipeStatus,
) {
  if (
    status ===
    "published"
  ) {
    return "Publicada";
  }


  if (
    status ===
    "archived"
  ) {
    return "Archivada";
  }


  return "Borrador";
}


function getStatusDescription(
  status:
    RecipeStatus,
) {
  if (
    status ===
    "published"
  ) {
    return "La receta es visible públicamente en CociHub.";
  }


  if (
    status ===
    "archived"
  ) {
    return "La receta está archivada y no aparece públicamente.";
  }


  return "La receta todavía no es visible públicamente.";
}


export function RecipePublicationForm({
  recipeId,
  status,
  readiness,
}: RecipePublicationFormProps) {
  const router =
    useRouter();


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const completedCount =
    readiness.requirements.filter(
      (
        requirement,
      ) =>
        requirement.valid,
    ).length;


  const missingCount =
    readiness.requirements.length -
    completedCount;


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=allergens`;


  const previewHref =
    `/admin/recipes/${recipeId}/preview`;


  async function changeStatus(
    nextStatus:
      RecipeStatus,
  ) {
    setMessage(
      null,
    );


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeStatusAction(
          recipeId,
          nextStatus,
        );


      setMessage(
        result.message ??
        null,
      );


      if (
        result.success
      ) {
        router.refresh();
      }
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <div className="flex flex-wrap items-center gap-3">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 10 de 10
          </p>


          <span className="rounded-full border border-border bg-page-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Paso final
          </span>

        </div>


        <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Publicación
        </h2>


        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Revisa que la receta cumple todos
          los requisitos obligatorios antes
          de hacerla visible públicamente en
          CociHub.
        </p>

      </div>


      {/* =================================================
          CURRENT STATUS
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Estado actual
            </p>


            <div className="mt-2 flex flex-wrap items-center gap-3">

              <p className="font-serif text-2xl font-semibold text-foreground">
                {
                  getStatusLabel(
                    status,
                  )
                }
              </p>


              {status ===
                "published" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand">

                  <CheckCircle2
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Visible públicamente

                </span>
              )}


              {status ===
                "archived" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">

                  <Archive
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Archivada

                </span>
              )}

            </div>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {
                getStatusDescription(
                  status,
                )
              }
            </p>

          </div>


          <Link
            href={
              previewHref
            }
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-page-muted"
          >

            <Eye
              className="size-4"
              aria-hidden="true"
            />

            Vista previa

          </Link>

        </div>

      </div>


      {/* =================================================
          PROGRESS SUMMARY
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-5">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex items-start gap-4">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

              <FileCheck2
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <h3 className="font-semibold text-foreground">
                Comprobación de publicación
              </h3>


              <p className="mt-1 text-sm text-muted-foreground">

                {
                  completedCount
                }{" "}
                de{" "}
                {
                  readiness
                    .requirements
                    .length
                }{" "}
                requisitos completos.

              </p>

            </div>

          </div>


          <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center">

            <p className="text-2xl font-semibold text-brand">

              {
                completedCount
              }
              /
              {
                readiness
                  .requirements
                  .length
              }

            </p>


            <p className="mt-0.5 text-xs text-muted-foreground">
              requisitos
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CHECKLIST
      ================================================= */}

      <div className="mt-7">

        <h3 className="font-serif text-xl font-semibold text-foreground">
          Requisitos obligatorios
        </h3>


        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Todos deben estar completados para
          poder publicar la receta.
        </p>


        <div className="mt-4 grid gap-3 sm:grid-cols-2">

          {readiness.requirements.map(
            (
              requirement,
            ) => (
              <div
                key={
                  requirement.key
                }
                className={
                  requirement.valid
                    ? "flex items-center gap-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3"
                    : "flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                }
              >

                {requirement.valid ? (

                  <CheckCircle2
                    className="size-5 shrink-0 text-brand"
                    aria-hidden="true"
                  />

                ) : (

                  <XCircle
                    className="size-5 shrink-0 text-red-600"
                    aria-hidden="true"
                  />

                )}


                <span
                  className={
                    requirement.valid
                      ? "text-sm font-medium text-foreground"
                      : "text-sm font-medium text-red-700"
                  }
                >
                  {
                    requirement.label
                  }
                </span>

              </div>
            ),
          )}

        </div>

      </div>


      {/* =================================================
          READINESS
      ================================================= */}

      {readiness.canPublish ? (

        <div className="mt-7 rounded-2xl border border-brand/20 bg-brand/5 p-5">

          <div className="flex items-start gap-4">

            <CheckCircle2
              className="mt-0.5 size-6 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div>

              <h3 className="font-semibold text-foreground">
                La receta está lista
              </h3>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Todos los requisitos
                obligatorios están completos.
                Puedes publicarla cuando quieras.
              </p>

            </div>

          </div>

        </div>

      ) : (

        <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-start gap-4">

            <CircleAlert
              className="mt-0.5 size-6 shrink-0 text-red-600"
              aria-hidden="true"
            />


            <div>

              <h3 className="font-semibold text-red-800">
                La receta todavía no puede publicarse
              </h3>


              <p className="mt-1 text-sm leading-6 text-red-700">

                Falta completar{" "}
                {
                  missingCount
                }{" "}
                requisito
                {
                  missingCount ===
                  1
                    ? ""
                    : "s"
                }{" "}
                obligatorio
                {
                  missingCount ===
                  1
                    ? ""
                    : "s"
                }.

              </p>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          OPTIONAL DATA
      ================================================= */}

      <div className="mt-6 rounded-xl border border-border bg-page-muted/30 px-4 py-4">

        <p className="text-sm leading-6 text-muted-foreground">
          La información adicional y la
          revisión manual de alérgenos son
          apartados opcionales y no bloquean
          técnicamente la publicación.
          Los alérgenos detectados
          automáticamente se conservan de
          forma independiente.
        </p>

      </div>


      {/* =================================================
          PUBLICATION ACTIONS
      ================================================= */}

      <div className="mt-7 border-t border-border pt-6">

        <h3 className="font-serif text-xl font-semibold text-foreground">
          Acciones
        </h3>


        <div className="mt-4 flex flex-wrap gap-3">

          {/* ===============================================
              DRAFT
          =============================================== */}

          {status ===
            "draft" && (
            <>

              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !readiness.canPublish
                }
                onClick={() =>
                  changeStatus(
                    "published",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
              >

                <Send
                  className="size-4"
                  aria-hidden="true"
                />


                {isSubmitting
                  ? "Publicando..."
                  : "Publicar receta"}

              </button>


              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  changeStatus(
                    "archived",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Archive
                  className="size-4"
                  aria-hidden="true"
                />

                Archivar

              </button>

            </>
          )}


          {/* ===============================================
              PUBLISHED
          =============================================== */}

          {status ===
            "published" && (
            <>

              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  changeStatus(
                    "draft",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RotateCcw
                  className="size-4"
                  aria-hidden="true"
                />

                Despublicar

              </button>


              <button
                type="button"
                disabled={
                  isSubmitting
                }
                onClick={() =>
                  changeStatus(
                    "archived",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
              >

                <Archive
                  className="size-4"
                  aria-hidden="true"
                />

                Archivar

              </button>

            </>
          )}


          {/* ===============================================
              ARCHIVED
          =============================================== */}

          {status ===
            "archived" && (
            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() =>
                changeStatus(
                  "draft",
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RotateCcw
                className="size-4"
                aria-hidden="true"
              />

              {isSubmitting
                ? "Restaurando..."
                : "Restaurar como borrador"}

            </button>
          )}

        </div>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <p
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-foreground"
        >
          {
            message
          }
        </p>
      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          disabled={
            isSubmitting
          }
          onClick={() =>
            router.push(
              previousStepHref,
            )
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Anterior

        </button>


        <Link
          href="/admin/recipes"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
        >
          Volver al listado
        </Link>

      </div>

    </section>
  );
}