"use client";

import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Hourglass,
  Timer,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  updateRecipeTimesAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeTimesSchema,
  type RecipeTimesFormData,
} from "@/schemas/recipe-times-schema";


type RecipeTimesFormProps = {
  recipeId:
    string;

  initialValues: {
    preparationMinutes:
      number | null;

    elaborationMinutes:
      number | null;
  };
};


function parseMinutes(
  value:
    string | undefined,
) {
  if (
    !value ||
    value.trim() ===
      ""
  ) {
    return 0;
  }


  const parsed =
    Number(
      value,
    );


  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed <
      0
  ) {
    return 0;
  }


  return parsed;
}


export function RecipeTimesForm({
  recipeId,
  initialValues,
}: RecipeTimesFormProps) {
  const router =
    useRouter();


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=steps`;


  const nextStepHref =
    `/admin/recipes/${recipeId}/edit?step=image`;


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    reset,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeTimesFormData>({
      resolver:
        zodResolver(
          recipeTimesSchema,
        ),

      defaultValues: {
        preparationMinutes:
          initialValues
            .preparationMinutes ===
          null
            ? ""
            : String(
                initialValues
                  .preparationMinutes,
              ),
      },
    });


  const preparationMinutes =
    watch(
      "preparationMinutes",
    );


  const preparationValue =
    parseMinutes(
      preparationMinutes,
    );


  const elaborationMinutes =
    initialValues
      .elaborationMinutes;


  const totalMinutes =
    preparationValue +
    (
      elaborationMinutes ??
      0
    );


  async function onSubmit(
    values:
      RecipeTimesFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    if (
      values
        .preparationMinutes
        .trim() ===
      ""
    ) {
      setError(
        "preparationMinutes",
        {
          type:
            "manual",

          message:
            "Indica el tiempo de preparación. Si no existe, escribe 0.",
        },
      );


      return;
    }


    if (
      elaborationMinutes ===
      null
    ) {
      setMessage(
        "El tiempo de elaboración todavía no está disponible. Añade una duración a todos los pasos de elaboración.",
      );


      return;
    }


    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );


      return;
    }


    const result =
      await updateRecipeTimesAction(
        recipeId,
        values,
      );


    if (
      !result.success
    ) {
      if (
        result.fieldErrors
      ) {
        Object.entries(
          result.fieldErrors,
        ).forEach(
          ([
            field,
            messages,
          ]) => {
            const fieldMessage =
              messages?.[0];


            if (
              !fieldMessage
            ) {
              return;
            }


            setError(
              field as keyof RecipeTimesFormData,
              {
                type:
                  "server",

                message:
                  fieldMessage,
              },
            );
          },
        );
      }


      setMessage(
        result.message ??
        "No se pudieron guardar los tiempos.",
      );


      return;
    }


    reset(
      values,
    );


    router.refresh();


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      <div className="flex items-start gap-4">

        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

          <Timer
            className="size-5"
            aria-hidden="true"
          />

        </span>


        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 6 de 10
          </p>


          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
            Tiempos
          </h2>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Indica el tiempo necesario para preparar los
            ingredientes. El tiempo de elaboración se obtiene
            automáticamente sumando la duración de todos los pasos.
          </p>

        </div>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-7 space-y-5"
      >

        <div className="rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <Clock3
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="flex-1">

              <h3 className="font-semibold text-foreground">
                Tiempo de preparación
              </h3>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tiempo necesario para preparar los ingredientes
                antes de comenzar la elaboración.
              </p>


              <div className="mt-4 flex max-w-xs items-center gap-3">

                <input
                  type="number"
                  min={
                    0
                  }
                  step={
                    1
                  }
                  inputMode="numeric"
                  {...register(
                    "preparationMinutes",
                  )}
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="Ej. 15"
                />


                <span className="shrink-0 text-sm text-muted-foreground">
                  min
                </span>

              </div>


              {errors.preparationMinutes && (

                <p
                  role="alert"
                  className="mt-2 text-sm text-red-600"
                >
                  {
                    errors
                      .preparationMinutes
                      .message
                  }
                </p>

              )}

            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 sm:p-6">

          <div className="flex items-start gap-4">

            <Hourglass
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="font-semibold text-foreground">
                  Tiempo de elaboración
                </h3>


                <span className="rounded-full border border-brand/20 bg-surface px-2.5 py-1 text-xs font-semibold text-brand">
                  Automático
                </span>

              </div>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                CociHub suma las duraciones de todos los pasos,
                incluidos reposos, fermentaciones, maceraciones,
                horneados y cualquier otro tiempo indicado en ellos.
              </p>


              <div className="mt-4">

                {elaborationMinutes ===
                null ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                    <p className="text-sm font-medium text-amber-900">
                      Tiempo pendiente de cálculo
                    </p>


                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Añade una duración a todos los pasos de elaboración.
                    </p>

                  </div>
                ) : (
                  <div className="inline-flex items-baseline gap-2 rounded-xl border border-border bg-surface px-4 py-3">

                    <span className="text-xl font-semibold text-brand">
                      {
                        elaborationMinutes
                      }
                    </span>


                    <span className="text-sm text-muted-foreground">
                      min
                    </span>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>


        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-5">

          <div>

            <p className="font-semibold text-foreground">
              Tiempo total estimado
            </p>


            <p className="mt-1 text-xs text-muted-foreground">
              Preparación + elaboración
            </p>

          </div>


          <div className="flex items-baseline gap-2">

            <span className="text-xl font-semibold text-brand">
              {
                totalMinutes
              }
            </span>


            <span className="text-sm text-muted-foreground">
              min
            </span>

          </div>

        </div>


        {message && (

          <p
            role="status"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              message
            }
          </p>

        )}


        <div className="flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href={
              previousStepHref
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Anterior

          </Link>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar"
                : "Continuar"}


            {!isSubmitting && (

              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />

            )}

          </button>

        </div>

      </form>

    </section>
  );
}
