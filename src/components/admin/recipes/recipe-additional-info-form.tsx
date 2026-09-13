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
  updateRecipeAdditionalInfoAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeAdditionalInfoSchema,
  type RecipeAdditionalInfoFormData,
  type RecipeSourceType,
} from "@/schemas/recipe-additional-info-schema";


type RecipeAdditionalInfoFormProps = {
  recipeId:
    string;

  initialValues: {
    tips:
      string | null;

    substitutions:
      string | null;

    storage:
      string | null;

    freezing:
      string | null;

    reheating:
      string | null;

    sourceType:
      RecipeSourceType | null;

    sourceTitle:
      string | null;

    sourceAuthor:
      string | null;

    sourcePage:
      string | null;

    sourceUrl:
      string | null;

    sourceNotes:
      string | null;
  };
};


const sourceOptions = [
  {
    value:
      "own",

    label:
      "Receta propia",
  },

  {
    value:
      "family",

    label:
      "Receta familiar",
  },

  {
    value:
      "book",

    label:
      "Libro",
  },

  {
    value:
      "magazine",

    label:
      "Revista",
  },

  {
    value:
      "web",

    label:
      "Página web",
  },

  {
    value:
      "handwritten",

    label:
      "Receta manuscrita",
  },

  {
    value:
      "other",

    label:
      "Otra fuente",
  },
] as const;


export function RecipeAdditionalInfoForm({
  recipeId,
  initialValues,
}: RecipeAdditionalInfoFormProps) {
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
    reset,
    setError,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeAdditionalInfoFormData>({
      resolver:
        zodResolver(
          recipeAdditionalInfoSchema,
        ),

      defaultValues: {
        tips:
          initialValues.tips ??
          "",

        substitutions:
          initialValues
            .substitutions ??
          "",

        storage:
          initialValues.storage ??
          "",

        freezing:
          initialValues.freezing ??
          "",

        reheating:
          initialValues.reheating ??
          "",

        sourceType:
          initialValues
            .sourceType ??
          "",

        sourceTitle:
          initialValues
            .sourceTitle ??
          "",

        sourceAuthor:
          initialValues
            .sourceAuthor ??
          "",

        sourcePage:
          initialValues
            .sourcePage ??
          "",

        sourceUrl:
          initialValues
            .sourceUrl ??
          "",

        sourceNotes:
          initialValues
            .sourceNotes ??
          "",
      },
    });


  async function onSubmit(
    values:
      RecipeAdditionalInfoFormData,
  ) {
    setMessage(
      null,
    );


    const result =
      await updateRecipeAdditionalInfoAction(
        recipeId,
        values,
      );


    if (!result.success) {
      const fieldNames = [
        "tips",
        "substitutions",
        "storage",
        "freezing",
        "reheating",
        "sourceType",
        "sourceTitle",
        "sourceAuthor",
        "sourcePage",
        "sourceUrl",
        "sourceNotes",
      ] as const;


      fieldNames.forEach(
        (fieldName) => {
          const fieldMessage =
            result
              .fieldErrors
              ?.[fieldName]
              ?.[0];

          if (fieldMessage) {
            setError(
              fieldName,
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
          "No se pudo guardar la información adicional.",
      );

      return;
    }


    reset(
      values,
    );


    setMessage(
      result.message ??
        "Información adicional guardada.",
    );
  }


  return (
    <section className="rounded-xl border p-6">

      <div>
        <h2 className="text-xl font-semibold">
          Información adicional
        </h2>

        <p className="mt-1 text-sm">
          Añade consejos, conservación, sustituciones y el origen de la receta.
        </p>
      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-6 space-y-8"
      >

        {/* ===========================================
            GENERAL INFORMATION
        =========================================== */}

        <div className="space-y-6">

          <div>
            <label
              htmlFor="tips"
              className="mb-2 block font-medium"
            >
              Consejos
            </label>

            <textarea
              id="tips"
              rows={5}
              maxLength={2500}
              {...register(
                "tips",
              )}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Consejos generales para obtener un mejor resultado."
            />

            {errors.tips && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .tips
                    .message
                }
              </p>
            )}
          </div>


          <div>
            <label
              htmlFor="substitutions"
              className="mb-2 block font-medium"
            >
              Sustituciones
            </label>

            <textarea
              id="substitutions"
              rows={4}
              maxLength={2500}
              {...register(
                "substitutions",
              )}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Alternativas posibles para ingredientes o técnicas."
            />

            {errors.substitutions && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .substitutions
                    .message
                }
              </p>
            )}
          </div>


          <div>
            <label
              htmlFor="storage"
              className="mb-2 block font-medium"
            >
              Conservación
            </label>

            <textarea
              id="storage"
              rows={4}
              maxLength={2500}
              {...register(
                "storage",
              )}
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Ej. Conservar en frigorífico hasta 3 días."
            />

            {errors.storage && (
              <p
                role="alert"
                className="mt-2 text-sm"
              >
                {
                  errors
                    .storage
                    .message
                }
              </p>
            )}
          </div>


          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label
                htmlFor="freezing"
                className="mb-2 block font-medium"
              >
                Congelación
              </label>

              <textarea
                id="freezing"
                rows={4}
                maxLength={2500}
                {...register(
                  "freezing",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="¿Puede congelarse? ¿Durante cuánto tiempo?"
              />

              {errors.freezing && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .freezing
                      .message
                  }
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="reheating"
                className="mb-2 block font-medium"
              >
                Recalentado
              </label>

              <textarea
                id="reheating"
                rows={4}
                maxLength={2500}
                {...register(
                  "reheating",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Indicaciones para recalentar correctamente."
              />

              {errors.reheating && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .reheating
                      .message
                  }
                </p>
              )}
            </div>

          </div>

        </div>


        {/* ===========================================
            SOURCE / PROVENANCE
        =========================================== */}

        <fieldset className="rounded-xl border p-5">

          <legend className="px-2 font-semibold">
            Fuente u origen
          </legend>


          <p className="mb-5 text-sm">
            Opcional. Permite conservar la procedencia original de la receta.
          </p>


          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label
                htmlFor="sourceType"
                className="mb-2 block font-medium"
              >
                Tipo de fuente
              </label>

              <select
                id="sourceType"
                {...register(
                  "sourceType",
                )}
                className="w-full rounded-lg border px-4 py-3"
              >
                <option value="">
                  Sin especificar
                </option>

                {sourceOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  ),
                )}
              </select>

              {errors.sourceType && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourceType
                      .message
                  }
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="sourceTitle"
                className="mb-2 block font-medium"
              >
                Título
              </label>

              <input
                id="sourceTitle"
                type="text"
                maxLength={180}
                {...register(
                  "sourceTitle",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. Cocina tradicional española"
              />

              {errors.sourceTitle && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourceTitle
                      .message
                  }
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="sourceAuthor"
                className="mb-2 block font-medium"
              >
                Autor
              </label>

              <input
                id="sourceAuthor"
                type="text"
                maxLength={120}
                {...register(
                  "sourceAuthor",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Nombre del autor o persona de origen"
              />

              {errors.sourceAuthor && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourceAuthor
                      .message
                  }
                </p>
              )}
            </div>


            <div>
              <label
                htmlFor="sourcePage"
                className="mb-2 block font-medium"
              >
                Página
              </label>

              <input
                id="sourcePage"
                type="text"
                maxLength={30}
                {...register(
                  "sourcePage",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. 124"
              />

              {errors.sourcePage && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourcePage
                      .message
                  }
                </p>
              )}
            </div>


            <div className="md:col-span-2">
              <label
                htmlFor="sourceUrl"
                className="mb-2 block font-medium"
              >
                URL
              </label>

              <input
                id="sourceUrl"
                type="url"
                maxLength={2000}
                {...register(
                  "sourceUrl",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="https://..."
              />

              {errors.sourceUrl && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourceUrl
                      .message
                  }
                </p>
              )}
            </div>


            <div className="md:col-span-2">
              <label
                htmlFor="sourceNotes"
                className="mb-2 block font-medium"
              >
                Notas sobre la fuente
              </label>

              <textarea
                id="sourceNotes"
                rows={4}
                maxLength={1500}
                {...register(
                  "sourceNotes",
                )}
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. Adaptada de la receta original de mi abuela."
              />

              {errors.sourceNotes && (
                <p
                  role="alert"
                  className="mt-2 text-sm"
                >
                  {
                    errors
                      .sourceNotes
                      .message
                  }
                </p>
              )}
            </div>

          </div>

        </fieldset>


        {/* ===========================================
            SAVE
        =========================================== */}

        <div className="flex flex-wrap items-center gap-4">

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
              : "Guardar información adicional"}
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