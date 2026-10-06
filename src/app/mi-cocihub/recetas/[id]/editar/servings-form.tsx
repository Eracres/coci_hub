"use client";

import {
  useState,
} from "react";

import Link from "next/link";

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
  recipeServingsSchema,
  type RecipeServingsFormData,
} from "@/schemas/recipe-servings-schema";

import {
  updateMyRecipeServingsAction,
} from "./servings-actions";


type ServingsFormProps = {
  recipeId:
    string;

  initialValue:
    number | null;

  previousStepHref:
    string;

  nextStepHref:
    string;
};


export function ServingsForm({
  recipeId,
  initialValue,
  previousStepHref,
  nextStepHref,
}: ServingsFormProps) {
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


    const result =
      await updateMyRecipeServingsAction(
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
          Paso 2 de 8
        </p>

        <h2 className="mt-2 font-serif text-2xl font-semibold">
          Raciones
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Indica para cuántas personas
          están calculadas las cantidades
          originales de esta receta.
        </p>
      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-8 space-y-6"
      >

        <div>

          <label
            htmlFor="baseServings"
            className="mb-2 block text-sm font-medium"
          >
            Raciones base
          </label>


          <div className="flex max-w-sm items-center gap-3">

            <input
              id="baseServings"
              type="number"
              min={1}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="4"
              {...register(
                "baseServings",
              )}
              className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />


            <span className="shrink-0 text-sm text-muted-foreground">
              personas
            </span>

          </div>


          <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
            Esta será la cantidad de referencia
            para recalcular los ingredientes
            cuando alguien cambie las raciones
            en la receta publicada.
          </p>


          {errors.baseServings && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors
                  .baseServings
                  .message
              }
            </p>
          )}

        </div>


        {message && (
          <p
            role="alert"
            className="text-sm text-red-700"
          >
            {
              message
            }
          </p>
        )}


        <div className="flex flex-wrap items-center justify-between gap-4">

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