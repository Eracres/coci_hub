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

    cookingMinutes:
      number | null;

    additionalMinutes:
      number | null;
  };
};


function valueToMinutes(
  value:
    string | undefined,
) {
  if (
    !value ||
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


function formatMinutes(
  minutes: number,
) {
  if (
    minutes < 60
  ) {
    return `${minutes} min`;
  }

  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (
    remainingMinutes === 0
  ) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}


export function RecipeTimesForm({
  recipeId,
  initialValues,
}: RecipeTimesFormProps) {
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
    reset,
    setError,

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

        cookingMinutes:
          initialValues
            .cookingMinutes ===
          null
            ? ""
            : String(
                initialValues
                  .cookingMinutes,
              ),

        additionalMinutes:
          initialValues
            .additionalMinutes ===
          null
            ? ""
            : String(
                initialValues
                  .additionalMinutes,
              ),
      },
    });


  const preparationMinutes =
    watch(
      "preparationMinutes",
    );

  const cookingMinutes =
    watch(
      "cookingMinutes",
    );

  const additionalMinutes =
    watch(
      "additionalMinutes",
    );


  const totalMinutes =
    valueToMinutes(
      preparationMinutes,
    ) +
    valueToMinutes(
      cookingMinutes,
    ) +
    valueToMinutes(
      additionalMinutes,
    );


  async function onSubmit(
    values:
      RecipeTimesFormData,
  ) {
    setMessage(
      null,
    );

    const result =
      await updateRecipeTimesAction(
        recipeId,
        values,
      );

    if (
      !result.success
    ) {
      const fields = [
        "preparationMinutes",
        "cookingMinutes",
        "additionalMinutes",
      ] as const;

      fields.forEach(
        (field) => {
          const fieldMessage =
            result
              .fieldErrors
              ?.[field]
              ?.[0];

          if (
            fieldMessage
          ) {
            setError(
              field,
              {
                type:
                  "server",

                message:
                  fieldMessage,
              },
            );
          }
        },
      );

      setMessage(
        result.message ??
          null,
      );

      return;
    }

    reset(
      values,
    );

    setMessage(
      result.message ??
        "Tiempos guardados.",
    );
  }


  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Tiempos
        </h2>

        <p className="mt-1 text-sm">
          Introduce los tiempos en minutos. El tiempo total se calcula automáticamente.
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
        <div className="grid gap-6 md:grid-cols-3">

          {/* PREPARATION */}

          <div>
            <label
              htmlFor="preparationMinutes"
              className="mb-2 block font-medium"
            >
              Preparación
            </label>

            <div className="flex items-center gap-3">
              <input
                id="preparationMinutes"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                {...register(
                  "preparationMinutes",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. 20"
              />

              <span className="text-sm">
                min
              </span>
            </div>

            {errors.preparationMinutes && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .preparationMinutes
                    .message
                }
              </p>
            )}
          </div>


          {/* COOKING */}

          <div>
            <label
              htmlFor="cookingMinutes"
              className="mb-2 block font-medium"
            >
              Cocción
            </label>

            <div className="flex items-center gap-3">
              <input
                id="cookingMinutes"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                {...register(
                  "cookingMinutes",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. 30"
              />

              <span className="text-sm">
                min
              </span>
            </div>

            {errors.cookingMinutes && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .cookingMinutes
                    .message
                }
              </p>
            )}
          </div>


          {/* ADDITIONAL */}

          <div>
            <label
              htmlFor="additionalMinutes"
              className="mb-2 block font-medium"
            >
              Tiempo adicional
            </label>

            <div className="flex items-center gap-3">
              <input
                id="additionalMinutes"
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                {...register(
                  "additionalMinutes",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. 10"
              />

              <span className="text-sm">
                min
              </span>
            </div>

            <p className="mt-2 text-sm">
              Reposo, enfriado, marinado, fermentación...
            </p>

            {errors.additionalMinutes && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .additionalMinutes
                    .message
                }
              </p>
            )}
          </div>
        </div>


        {/* TOTAL */}

        <div className="rounded-lg border p-4">
          <p className="text-sm">
            Tiempo total calculado
          </p>

          <p className="mt-1 text-xl font-semibold">
            {
              formatMinutes(
                totalMinutes,
              )
            }
          </p>

          <p className="mt-1 text-sm">
            El total no se almacena en la base de datos.
          </p>
        </div>


        {/* ACTION */}

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
              : "Guardar tiempos"}
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