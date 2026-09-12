"use client";

import {
  useState,
} from "react";

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
};


export function RecipeServingsForm({
  recipeId,
  initialValue,
}: RecipeServingsFormProps) {
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
          initialValue === null
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

    const result =
      await updateRecipeServingsAction(
        recipeId,
        values,
      );

    if (
      !result.success
    ) {
      const fieldMessage =
        result.fieldErrors
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
          null,
      );

      return;
    }

    setMessage(
      result.message ??
        "Raciones guardadas.",
    );
  }


  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Raciones
        </h2>

        <p className="mt-1 text-sm">
          Indica para cuántas personas están calculadas las cantidades originales de la receta.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-6 space-y-6"
      >
        <div>
          <label
            htmlFor="baseServings"
            className="mb-2 block font-medium"
          >
            Raciones base
          </label>

          <div className="flex max-w-xs items-center gap-3">
            <input
              id="baseServings"
              type="number"
              min={1}
              max={100}
              step={1}
              inputMode="numeric"
              {...register(
                "baseServings",
              )}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Ej. 4"
            />

            <span className="text-sm">
              personas
            </span>
          </div>

          <p className="mt-2 text-sm">
            Esta cantidad servirá como base para recalcular posteriormente los ingredientes según el número de comensales.
          </p>

          {errors.baseServings && (
            <p
              role="alert"
              className="mt-2 text-sm"
            >
              {
                errors
                  .baseServings
                  .message
              }
            </p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !isDirty
            }
            className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
          >
            {isSubmitting
              ? "Guardando..."
              : "Guardar raciones"}
          </button>

          {message && (
            <p
              role="status"
              className="text-sm"
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}