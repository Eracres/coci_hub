"use client";

import {
  ArrowLeft,
  ArrowRight,
  UsersRound,
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
  updateRecipeServingsAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeServingsSchema,
  type RecipeServingsFormData,
} from "@/schemas/recipe-servings-schema";


type RecipeServingsFormProps = {
  recipeId:
    string;

  initialValue:
    number | null;

  previousStepHref:
    string;

  nextStepHref:
    string;
};


export function RecipeServingsForm({
  recipeId,
  initialValue,
  previousStepHref,
  nextStepHref,
}: RecipeServingsFormProps) {
  const router =
    useRouter();


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
    setError,
    clearErrors,
    reset,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeServingsFormData>({
      resolver:
        zodResolver(
          recipeServingsSchema,
        ),

      defaultValues: {
        baseServings:
          initialValue ===
          null
            ? ""
            : String(
                initialValue,
              ),
      },
    });


  async function onSubmit(
    values:
      RecipeServingsFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    /*
     * Si el apartado ya estaba guardado
     * y no hemos cambiado nada,
     * simplemente avanzamos.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    const result =
      await updateRecipeServingsAction(
        recipeId,
        values,
      );


    if (
      !result.success
    ) {
      const fieldMessage =
        result
          .fieldErrors
          ?.baseServings
          ?.[0];


      if (
        fieldMessage
      ) {
        setError(
          "baseServings",
          {
            type:
              "server",

            message:
              fieldMessage,
          },
        );
      }


      setMessage(
        result.message ??
        "No se pudieron guardar las raciones.",
      );


      return;
    }


    /*
     * Los valores actuales pasan a
     * considerarse guardados.
     */
    reset(
      values,
    );


    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start gap-4">

        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

          <UsersRound
            className="size-5"
            aria-hidden="true"
          />

        </span>


        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 2 de 10
          </p>


          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
            Raciones
          </h2>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Indica para cuántas personas
            están calculadas las cantidades
            originales de la receta.
          </p>

        </div>

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-7"
      >

        <div className="rounded-2xl border border-border bg-page-muted/30 p-5 sm:p-6">

          <label
            htmlFor="baseServings"
            className="text-sm font-semibold text-foreground"
          >
            Raciones base
          </label>


          <div className="mt-3 flex max-w-sm items-center gap-3">

            <input
              id="baseServings"
              type="number"
              min={
                1
              }
              max={
                100
              }
              step={
                1
              }
              inputMode="numeric"
              {...register(
                "baseServings",
              )}
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Ej. 4"
            />


            <span className="shrink-0 text-sm text-muted-foreground">
              personas
            </span>

          </div>


          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Esta cantidad servirá como base
            para recalcular posteriormente
            los ingredientes según el número
            de comensales.
          </p>


          {errors.baseServings && (
            <p
              role="alert"
              className="mt-3 text-sm text-red-600"
            >
              {
                errors
                  .baseServings
                  .message
              }
            </p>
          )}

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

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