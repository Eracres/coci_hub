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
  recipeClassificationSchema,
  type RecipeClassificationFormData,
} from "@/schemas/recipe-classification-schema";

import {
  updateRecipeClassificationAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import type {
  CategoryOption,
  RecipeTypeOption,
  TagOption,
} from "@/services/recipes/recipe-service";

type RecipeClassificationFormProps = {
  recipeId: string;

  recipeTypes:
    RecipeTypeOption[];

  categories:
    CategoryOption[];

  tags:
    TagOption[];

  initialValues: {
    recipeTypeId:
      string | null;

    difficulty:
      | "easy"
      | "medium"
      | "hard"
      | null;

    categoryIds:
      string[];

    tagIds:
      string[];

    featured:
      boolean;
  };
};

export function RecipeClassificationForm({
  recipeId,
  recipeTypes,
  categories,
  tags,
  initialValues,
}: RecipeClassificationFormProps) {
  const [message, setMessage] =
    useState<string | null>(
      null,
    );

  const {
    register,
    handleSubmit,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeClassificationFormData>({
      resolver:
        zodResolver(
          recipeClassificationSchema,
        ),

      defaultValues: {
        recipeTypeId:
          initialValues
            .recipeTypeId ??
          "",

        difficulty:
          initialValues
            .difficulty ??
          "",

        categoryIds:
          initialValues
            .categoryIds,

        tagIds:
          initialValues
            .tagIds,

        featured:
          initialValues
            .featured,
      },
    });


  async function onSubmit(
    values:
      RecipeClassificationFormData,
  ) {
    setMessage(null);

    const result =
      await updateRecipeClassificationAction(
        recipeId,
        values,
      );

    setMessage(
      result.message ??
        null,
    );
  }


  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Clasificación
        </h2>

        <p className="mt-1 text-sm">
          Organiza la receta para facilitar su búsqueda y navegación.
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

        {/* TYPE */}

        <div>
          <label
            htmlFor="recipeTypeId"
            className="mb-2 block font-medium"
          >
            Tipo de receta
          </label>

          <select
            id="recipeTypeId"
            {...register(
              "recipeTypeId",
            )}
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="">
              Sin seleccionar
            </option>

            {recipeTypes.map(
              (type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name}
                </option>
              ),
            )}
          </select>

          {errors.recipeTypeId && (
            <p className="mt-2 text-sm">
              {
                errors
                  .recipeTypeId
                  .message
              }
            </p>
          )}
        </div>


        {/* DIFFICULTY */}

        <div>
          <label
            htmlFor="difficulty"
            className="mb-2 block font-medium"
          >
            Dificultad
          </label>

          <select
            id="difficulty"
            {...register(
              "difficulty",
            )}
            className="w-full rounded-lg border px-4 py-3"
          >
            <option value="">
              Sin seleccionar
            </option>

            <option value="easy">
              Fácil
            </option>

            <option value="medium">
              Media
            </option>

            <option value="hard">
              Difícil
            </option>
          </select>
        </div>


        {/* CATEGORIES */}

        <fieldset>
          <legend className="font-medium">
            Categorías
          </legend>

          {categories.length === 0 ? (
            <p className="mt-3 text-sm">
              Todavía no hay categorías creadas.
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map(
                (category) => (
                  <label
                    key={
                      category.id
                    }
                    className="flex items-center gap-2"
                  >
                    <input
                      type="checkbox"
                      value={
                        category.id
                      }
                      {...register(
                        "categoryIds",
                      )}
                    />

                    {category.name}
                  </label>
                ),
              )}
            </div>
          )}
        </fieldset>


        {/* TAGS */}

        <fieldset>
          <legend className="font-medium">
            Etiquetas
          </legend>

          {tags.length === 0 ? (
            <p className="mt-3 text-sm">
              Todavía no hay etiquetas creadas.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-3">
              {tags.map(
                (tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      value={tag.id}
                      {...register(
                        "tagIds",
                      )}
                    />

                    {tag.name}
                  </label>
                ),
              )}
            </div>
          )}
        </fieldset>


        {/* FEATURED */}

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            {...register(
              "featured",
            )}
          />

          <span>
            Marcar como receta destacada
          </span>
        </label>


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
              : "Guardar clasificación"}
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