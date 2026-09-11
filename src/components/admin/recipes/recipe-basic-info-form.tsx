"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import {
  updateRecipeBasicInfoAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  slugify,
} from "@/lib/recipes/slugify";

type RecipeBasicInfoFormProps = {
  recipeId: string;

  initialValues: {
    title: string;
    slug: string;
    shortDescription: string | null;
    introduction: string | null;
  };
};

export function RecipeBasicInfoForm({
  recipeId,
  initialValues,
}: RecipeBasicInfoFormProps) {
  const router = useRouter();

  const [message, setMessage] =
    useState<string | null>(null);

  const [slugEditedManually, setSlugEditedManually] =
    useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } = useForm<RecipeBasicInfoFormData>({
    resolver:
      zodResolver(
        recipeBasicInfoSchema,
      ),

    defaultValues: {
      title:
        initialValues.title,

      slug:
        initialValues.slug,

      shortDescription:
        initialValues.shortDescription ??
        "",

      introduction:
        initialValues.introduction ??
        "",
    },
  });

  const title =
    watch("title");

  useEffect(() => {
    if (
      !slugEditedManually
    ) {
      setValue(
        "slug",
        slugify(title ?? ""),
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );
    }
  }, [
    title,
    slugEditedManually,
    setValue,
  ]);

  async function onSubmit(
    values: RecipeBasicInfoFormData,
  ) {
    setMessage(null);

    const result =
      await updateRecipeBasicInfoAction(
        recipeId,
        values,
      );

    if (!result.success) {
      if (
        result.fieldErrors
      ) {
        Object.entries(
          result.fieldErrors,
        ).forEach(
          ([field, messages]) => {
            const message =
              messages?.[0];

            if (!message) {
              return;
            }

            setError(
              field as keyof RecipeBasicInfoFormData,
              {
                type: "server",
                message,
              },
            );
          },
        );
      }

      if (result.message) {
        setMessage(
          result.message,
        );
      }

      return;
    }

    setMessage(
      result.message ??
        "Cambios guardados.",
    );

    router.refresh();
  }

  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Información básica
        </h2>

        <p className="mt-1 text-sm">
          Datos principales utilizados para identificar y presentar la receta.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit(onSubmit)
        }
        className="mt-6 space-y-6"
      >
        {/* TITLE */}

        <div>
          <label
            htmlFor="title"
            className="mb-2 block font-medium"
          >
            Título
          </label>

          <input
            id="title"
            type="text"
            maxLength={120}
            {...register("title")}
            className="w-full rounded-lg border px-4 py-3"
          />

          {errors.title && (
            <p className="mt-2 text-sm">
              {errors.title.message}
            </p>
          )}
        </div>


        {/* SLUG */}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="slug"
              className="font-medium"
            >
              Slug
            </label>

            <button
              type="button"
              className="text-sm underline"
              onClick={() => {
                setSlugEditedManually(
                  false,
                );

                setValue(
                  "slug",
                  slugify(
                    title ?? "",
                  ),
                  {
                    shouldValidate:
                      true,
                    shouldDirty:
                      true,
                  },
                );
              }}
            >
              Generar desde título
            </button>
          </div>

          <input
            id="slug"
            type="text"
            maxLength={140}
            {...register(
              "slug",
              {
                onChange: () => {
                  setSlugEditedManually(
                    true,
                  );
                },
              },
            )}
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-2 text-sm">
            /recipes/{watch("slug")}
          </p>

          {errors.slug && (
            <p className="mt-2 text-sm">
              {errors.slug.message}
            </p>
          )}
        </div>


        {/* SHORT DESCRIPTION */}

        <div>
          <label
            htmlFor="shortDescription"
            className="mb-2 block font-medium"
          >
            Descripción corta
          </label>

          <textarea
            id="shortDescription"
            rows={3}
            maxLength={180}
            {...register(
              "shortDescription",
            )}
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-2 text-sm">
            Máximo 180 caracteres.
          </p>

          {errors.shortDescription && (
            <p className="mt-2 text-sm">
              {
                errors
                  .shortDescription
                  .message
              }
            </p>
          )}
        </div>


        {/* INTRODUCTION */}

        <div>
          <label
            htmlFor="introduction"
            className="mb-2 block font-medium"
          >
            Introducción
          </label>

          <textarea
            id="introduction"
            rows={7}
            maxLength={1500}
            {...register(
              "introduction",
            )}
            className="w-full rounded-lg border px-4 py-3"
          />

          <p className="mt-2 text-sm">
            Máximo 1500 caracteres.
          </p>

          {errors.introduction && (
            <p className="mt-2 text-sm">
              {
                errors
                  .introduction
                  .message
              }
            </p>
          )}
        </div>


        {/* ACTIONS */}

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
              : "Guardar cambios"}
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