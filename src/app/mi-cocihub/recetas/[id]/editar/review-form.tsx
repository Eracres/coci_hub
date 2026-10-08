"use client";

import {
  CheckCircle2,
  ChefHat,
  CircleAlert,
  Clock3,
  ImageIcon,
  ListChecks,
  Loader2,
  Send,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  submitMyRecipeForReviewAction,
} from "./review-actions";


type ChecklistItem = {
  key:
    string;

  label:
    string;

  complete:
    boolean;

  href:
    string;
};


type ReviewFormProps = {
  recipeId:
    string;

  title:
    string;

  shortDescription:
    string | null;

  imageUrl:
    string | null;

  imageAlt:
    string | null;

  baseServings:
    number | null;

  difficulty:
    string | null;

  ingredientCount:
    number;

  stepCount:
    number;

  times: {
    preparationMinutes:
      number | null;

    cookingMinutes:
      number | null;

    additionalMinutes:
      number | null;

    totalMinutes:
      number;
  };

  checklist:
    ChecklistItem[];

  canSubmit:
    boolean;

  previousStepHref:
    string;
};


function getDifficultyLabel(
  difficulty:
    string | null,
) {
  if (
    difficulty ===
    "easy"
  ) {
    return "Fácil";
  }


  if (
    difficulty ===
    "medium"
  ) {
    return "Media";
  }


  if (
    difficulty ===
    "hard"
  ) {
    return "Difícil";
  }


  return "Sin definir";
}


export function ReviewForm({
  recipeId,
  title,
  shortDescription,
  imageUrl,
  imageAlt,
  baseServings,
  difficulty,
  ingredientCount,
  stepCount,
  times,
  checklist,
  canSubmit,
  previousStepHref,
}: ReviewFormProps) {
  const router =
    useRouter();


  const [
    confirmed,
    setConfirmed,
  ] =
    useState(
      false,
    );


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
    useState<
      string | null
    >(
      null,
    );


  async function handleSubmit() {
    if (
      !canSubmit ||
      !confirmed
    ) {
      return;
    }


    setMessage(
      null,
    );


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await submitMyRecipeForReviewAction(
          recipeId,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
          "No se pudo enviar la receta.",
        );

        return;
      }


      router.push(
        "/mi-cocihub/recetas?status=pending_review",
      );


      router.refresh();

    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 8 de 8
          </p>


          <div className="mt-2 flex items-center gap-2">

            <ListChecks
              className="size-5 text-brand"
              aria-hidden="true"
            />


            <h2 className="font-serif text-2xl font-semibold">
              Revisión final
            </h2>

          </div>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Comprueba el resultado final antes de enviar
            tu receta al equipo de moderación de CociHub.
          </p>

        </div>


        {canSubmit && (
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-2 text-sm font-medium text-brand">

            <CheckCircle2
              className="size-4"
              aria-hidden="true"
            />

            Todo listo

          </div>
        )}

      </div>


      {/* =================================================
          MAIN SUMMARY
      ================================================= */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">

        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

          {/* IMAGE */}

          <div className="bg-page-muted">

            {imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={
                  imageUrl
                }
                alt={
                  imageAlt ??
                  title
                }
                className="aspect-[16/10] h-full w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[16/10] h-full min-h-64 items-center justify-center">

                <ImageIcon
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />

              </div>
            )}

          </div>


          {/* INFORMATION */}

          <div className="flex flex-col justify-between p-5 sm:p-6">

            <div>

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                Tu receta
              </p>


              <h3 className="mt-2 font-serif text-2xl font-semibold sm:text-3xl">
                {
                  title
                }
              </h3>


              {shortDescription && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {
                    shortDescription
                  }
                </p>
              )}

            </div>


            <div className="mt-6 grid grid-cols-2 gap-3">

              <div className="rounded-xl border border-border bg-page-muted/30 p-4">

                <div className="flex items-center gap-2 text-xs text-muted-foreground">

                  <Users
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Raciones

                </div>


                <p className="mt-2 text-sm font-semibold">
                  {
                    baseServings ??
                    "—"
                  }
                </p>

              </div>


              <div className="rounded-xl border border-border bg-page-muted/30 p-4">

                <div className="flex items-center gap-2 text-xs text-muted-foreground">

                  <ChefHat
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Dificultad

                </div>


                <p className="mt-2 text-sm font-semibold">
                  {
                    getDifficultyLabel(
                      difficulty,
                    )
                  }
                </p>

              </div>


              <div className="rounded-xl border border-border bg-page-muted/30 p-4">

                <div className="flex items-center gap-2 text-xs text-muted-foreground">

                  <UtensilsCrossed
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Ingredientes

                </div>


                <p className="mt-2 text-sm font-semibold">
                  {
                    ingredientCount
                  }
                </p>

              </div>


              <div className="rounded-xl border border-border bg-page-muted/30 p-4">

                <div className="flex items-center gap-2 text-xs text-muted-foreground">

                  <ListChecks
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  Pasos

                </div>


                <p className="mt-2 text-sm font-semibold">
                  {
                    stepCount
                  }
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          TIMES
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-border bg-page-muted/20 p-5">

        <div className="flex items-center gap-2">

          <Clock3
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h3 className="font-semibold">
            Tiempos
          </h3>

        </div>


        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-border bg-surface px-4 py-3">

            <p className="text-xs text-muted-foreground">
              Preparación
            </p>


            <p className="mt-1 text-sm font-semibold">
              {
                times.preparationMinutes ??
                0
              }{" "}
              <span className="font-normal text-muted-foreground">
                min
              </span>
            </p>

          </div>


          <div className="rounded-xl border border-border bg-surface px-4 py-3">

            <p className="text-xs text-muted-foreground">
              Cocinado
            </p>


            <p className="mt-1 text-sm font-semibold text-brand">
              {
                times.cookingMinutes ??
                0
              }{" "}
              <span className="font-normal text-muted-foreground">
                min
              </span>
            </p>

          </div>


          <div className="rounded-xl border border-border bg-surface px-4 py-3">

            <p className="text-xs text-muted-foreground">
              Adicional
            </p>


            <p className="mt-1 text-sm font-semibold">
              {
                times.additionalMinutes ??
                0
              }{" "}
              <span className="font-normal text-muted-foreground">
                min
              </span>
            </p>

          </div>


          <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">

            <p className="text-xs text-muted-foreground">
              Total
            </p>


            <p className="mt-1 text-base font-semibold text-brand">
              {
                times.totalMinutes
              }{" "}
              <span className="text-sm font-normal text-muted-foreground">
                min
              </span>
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CHECKLIST
      ================================================= */}

      <div className="mt-6">

        <div className="flex items-center justify-between gap-4">

          <div>

            <h3 className="font-semibold">
              Estado de la receta
            </h3>


            <p className="mt-1 text-sm text-muted-foreground">
              Puedes volver a cualquier apartado antes de enviarla.
            </p>

          </div>


          <span className="text-xs font-medium text-muted-foreground">
            {
              checklist.filter(
                (
                  item,
                ) =>
                  item.complete,
              ).length
            }
            /
            {
              checklist.length
            }
            {" "}
            completos
          </span>

        </div>


        <div className="mt-4 grid gap-2 sm:grid-cols-2">

          {checklist.map(
            (
              item,
            ) => (
              <Link
                key={
                  item.key
                }
                href={
                  item.href
                }
                className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition hover:bg-page-muted"
              >

                <div className="flex min-w-0 items-center gap-3">

                  {item.complete ? (
                    <CheckCircle2
                      className="size-5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleAlert
                      className="size-5 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                  )}


                  <span className="truncate text-sm font-medium">
                    {
                      item.label
                    }
                  </span>

                </div>


                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.complete
                    ? "Completo"
                    : "Revisar"}
                </span>

              </Link>
            ),
          )}

        </div>

      </div>


      {/* =================================================
          MODERATION
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/5 p-5">

        <div className="flex items-start gap-3">

          <Send
            className="mt-0.5 size-5 shrink-0 text-brand"
            aria-hidden="true"
          />


          <div>

            <h3 className="font-semibold">
              Enviar a revisión
            </h3>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Al enviarla, la receta pasará al estado
              «En revisión» y dejará de poder editarse
              temporalmente.
            </p>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              El equipo de moderación podrá aprobarla
              y publicarla o devolvértela indicando
              los cambios necesarios.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CONFIRMATION
      ================================================= */}

      <label
        className={`mt-5 flex items-start gap-3 rounded-xl border p-4 transition ${
          canSubmit
            ? "cursor-pointer border-border hover:bg-page-muted/40"
            : "cursor-not-allowed border-border bg-page-muted/30 opacity-70"
        }`}
      >

        <input
          type="checkbox"
          checked={
            confirmed
          }
          disabled={
            !canSubmit ||
            isSubmitting
          }
          onChange={(
            event,
          ) =>
            setConfirmed(
              event
                .target
                .checked,
            )
          }
          className="mt-1 size-4 accent-[var(--brand)]"
        />


        <span className="text-sm leading-6">
          He revisado la receta y entiendo que no podré
          editarla mientras esté pendiente de moderación.
        </span>

      </label>


      {/* =================================================
          WARNINGS / ERRORS
      ================================================= */}

      {!canSubmit && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Todavía quedan apartados por completar.
          Revisa los elementos marcados antes de enviar
          la receta.
        </p>
      )}


      {message && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {
            message
          }
        </p>
      )}


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

        <Link
          href={
            previousStepHref
          }
          className="inline-flex justify-center rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
        >
          ← Volver a Imagen
        </Link>


        <button
          type="button"
          disabled={
            !canSubmit ||
            !confirmed ||
            isSubmitting
          }
          onClick={
            handleSubmit
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >

          {isSubmitting ? (
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Send
              className="size-4"
              aria-hidden="true"
            />
          )}


          {isSubmitting
            ? "Enviando..."
            : "Enviar receta a revisión"}

        </button>

      </div>

    </section>
  );
}