"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Clock3,
  Hourglass,
  Timer,
} from "lucide-react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  communityRecipeTimesSchema,
  type CommunityRecipeTimesFormData,
} from "@/schemas/community-recipe-times-schema";

import {
  updateMyRecipeTimesAction,
} from "./times-actions";


type TimesFormProps = {
  recipeId:
    string;

  initialValues: {
    preparationMinutes:
      number | null;

    elaborationMinutes:
      number | null;
  };

  previousStepHref:
    string;

  nextStepHref:
    string;
};


function parseMinutes(
  value:
    string,
) {
  if (
    !/^\d+$/.test(
      value,
    )
  ) {
    return 0;
  }


  return Number(
    value,
  );
}


export function TimesForm({
  recipeId,
  initialValues,
  previousStepHref,
  nextStepHref,
}: TimesFormProps) {
  const router =
    useRouter();


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<
      CommunityRecipeTimesFormData
    >({
      resolver:
        zodResolver(
          communityRecipeTimesSchema,
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


  const elaborationMinutes =
    initialValues
      .elaborationMinutes;


  const totalMinutes =
    parseMinutes(
      preparationMinutes,
    ) +
    (
      elaborationMinutes ??
      0
    );


  async function onSubmit(
    values:
      CommunityRecipeTimesFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    if (
      elaborationMinutes ===
      null
    ) {
      setMessage(
        "Completa la duración de todos los pasos de elaboración para calcular el tiempo de elaboración.",
      );

      return;
    }


    const result =
      await updateMyRecipeTimesAction(
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
              field as
                keyof CommunityRecipeTimesFormData,
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


      if (
        result.message
      ) {
        setMessage(
          result.message,
        );
      }


      return;
    }


    reset(
      values,
    );


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 6 de 8
        </p>


        <div className="mt-2 flex items-center gap-2">

          <Timer
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h2 className="font-serif text-2xl font-semibold">
            Tiempos
          </h2>

        </div>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Indica cuánto tiempo necesitas para preparar
          los ingredientes. El tiempo de elaboración se
          obtiene automáticamente sumando la duración de
          todos los pasos.
        </p>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-8 space-y-5"
      >

        <div className="rounded-2xl border border-border bg-page-muted/30 p-5">

          <div className="flex items-start gap-3">

            <Clock3
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="min-w-0 flex-1">

              <label
                htmlFor="preparationMinutes"
                className="block font-semibold"
              >
                Tiempo de preparación
              </label>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Tiempo necesario para preparar los
                ingredientes antes de comenzar la elaboración.
              </p>


              <div className="mt-4 flex max-w-xs items-center gap-3">

                <input
                  id="preparationMinutes"
                  type="number"
                  min={
                    1
                  }
                  max={
                    10080
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
                  className="mt-2 text-sm text-red-700"
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


        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">

          <div className="flex items-start gap-3">

            <Hourglass
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />


            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">

                <p className="font-semibold">
                  Tiempo de elaboración
                </p>


                <span className="rounded-full border border-brand/20 bg-surface px-2.5 py-1 text-xs font-medium text-brand">
                  Automático
                </span>

              </div>


              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                CociHub suma las duraciones de todos los
                pasos de elaboración, incluidos reposos,
                fermentaciones, maceraciones, horneados y
                cualquier otro tiempo indicado en ellos.
              </p>


              <div className="mt-4">

                {elaborationMinutes ===
                null ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">

                    <p className="text-sm font-medium text-amber-900">
                      Tiempo pendiente de cálculo
                    </p>


                    <p className="mt-1 text-xs leading-5 text-amber-800">
                      Revisa Elaboración y asigna una
                      duración a todos los pasos.
                    </p>

                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2">

                    <span className="font-semibold leading-none text-brand">
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


        <div className="rounded-xl border border-border bg-page-muted/20 px-5 py-4">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold">
                Tiempo total estimado
              </p>


              <p className="mt-1 text-xs text-muted-foreground">
                Preparación + elaboración
              </p>

            </div>


            <div className="flex items-center gap-1.5">

              <span className="text-lg font-semibold text-brand">
                {
                  totalMinutes
                }
              </span>


              <span className="text-sm text-muted-foreground">
                min
              </span>

            </div>

          </div>

        </div>


        {message && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              message
            }
          </p>
        )}


        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">

          <Link
            href={
              previousStepHref
            }
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
          >
            ← Anterior
          </Link>


          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : isDirty
                ? "Guardar y continuar →"
                : "Continuar →"}
          </button>

        </div>

      </form>

    </section>
  );
}
