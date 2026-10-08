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
        Revisa los datos principales de tu receta antes
        de enviarla al equipo de moderación de CociHub.
      </p>


      {/* =================================================
          IMAGE + TITLE
      ================================================= */}

      <div className="mt-8 overflow-hidden rounded-2xl border border-border">

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
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center bg-page-muted">

            <ImageIcon
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />

          </div>
        )}


        <div className="p-5">

          <h3 className="font-serif text-2xl font-semibold">
            {
              title
            }
          </h3>


          {shortDescription && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {
                shortDescription
              }
            </p>
          )}

        </div>

      </div>


      {/* =================================================
          RECIPE SUMMARY
      ================================================= */}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        <div className="rounded-xl border border-border bg-page-muted/30 p-4">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <Users
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Raciones

          </div>


          <p className="mt-2 font-semibold">
            {
              baseServings ??
              "—"
            }
          </p>

        </div>


        <div className="rounded-xl border border-border bg-page-muted/30 p-4">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <ChefHat
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Dificultad

          </div>


          <p className="mt-2 font-semibold">
            {
              getDifficultyLabel(
                difficulty,
              )
            }
          </p>

        </div>


        <div className="rounded-xl border border-border bg-page-muted/30 p-4">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <UtensilsCrossed
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Ingredientes

          </div>


          <p className="mt-2 font-semibold">
            {
              ingredientCount
            }
          </p>

        </div>


        <div className="rounded-xl border border-border bg-page-muted/30 p-4">

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <ListChecks
              className="size-4 text-brand"
              aria-hidden="true"
            />

            Pasos

          </div>


          <p className="mt-2 font-semibold">
            {
              stepCount
            }
          </p>

        </div>

      </div>


      {/* =================================================
          TIMES
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-border bg-page-muted/30 p-5">

        <div className="flex items-center gap-2">

          <Clock3
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h3 className="font-semibold">
            Tiempos
          </h3>

        </div>


        <dl className="mt-4 space-y-3 text-sm">

          <div className="flex justify-between gap-4">

            <dt className="text-muted-foreground">
              Preparación
            </dt>


            <dd className="font-medium">
              {
                times.preparationMinutes ??
                0
              } min
            </dd>

          </div>


          <div className="flex justify-between gap-4">

            <dt className="text-muted-foreground">
              Cocinado
            </dt>


            <dd className="font-medium">
              {
                times.cookingMinutes ??
                0
              } min
            </dd>

          </div>


          <div className="flex justify-between gap-4">

            <dt className="text-muted-foreground">
              Adicional
            </dt>


            <dd className="font-medium">
              {
                times.additionalMinutes ??
                0
              } min
            </dd>

          </div>


          <div className="border-t border-border pt-3">

            <div className="flex items-center justify-between gap-4">

              <dt className="font-semibold">
                Tiempo total
              </dt>


              <dd className="font-serif text-2xl font-semibold text-brand">
                {
                  times.totalMinutes
                } min
              </dd>

            </div>

          </div>

        </dl>

      </div>


      {/* =================================================
          CHECKLIST
      ================================================= */}

      <div className="mt-6">

        <h3 className="font-semibold">
          Estado de la receta
        </h3>


        <div className="mt-4 space-y-2">

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
                className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 transition hover:bg-page-muted"
              >

                <div className="flex items-center gap-3">

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


                  <span className="text-sm font-medium">
                    {
                      item.label
                    }
                  </span>

                </div>


                <span className="text-xs text-muted-foreground">
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
          MODERATION NOTICE
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
              Cuando envíes la receta dejará de poder
              editarse temporalmente y pasará al estado
              «En revisión».
            </p>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Un administrador podrá aprobarla y publicarla
              o devolvértela indicando los cambios necesarios.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          CONFIRMATION
      ================================================= */}

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4">

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
          className="mt-1 size-4"
        />


        <span className="text-sm leading-6">
          He revisado la receta y entiendo que no podré
          editarla mientras esté pendiente de moderación.
        </span>

      </label>


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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

        <Link
          href={
            previousStepHref
          }
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
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
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
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
