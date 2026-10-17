"use client";

import {
  useEffect,
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
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

import {
  slugify,
} from "@/lib/recipes/slugify";

import {
  updateMyRecipeBasicInfoAction,
} from "./actions";


type BasicInfoFormProps = {
  recipeId:
    string;

  nextStepHref:
    string;

  initialValues: {
    title:
      string;

    slug:
      string;

    shortDescription:
      string | null;

    introduction:
      string | null;
  };
};


export function BasicInfoForm({
  recipeId,
  nextStepHref,
  initialValues,
}: BasicInfoFormProps) {
  const router =
    useRouter();


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const [
    slugEditedManually,
    setSlugEditedManually,
  ] =
    useState(
      true,
    );


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    reset,

    formState: {
      errors,
      isSubmitting,
      isDirty,
    },
  } =
    useForm<RecipeBasicInfoFormData>({
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
    watch(
      "title",
    );


  /* =======================================================
     AUTOMATIC SLUG
  ======================================================= */

  useEffect(
    () => {
      if (
        !slugEditedManually
      ) {
        setValue(
          "slug",
          slugify(
            title ??
            "",
          ),
          {
            shouldValidate:
              true,

            shouldDirty:
              true,
          },
        );
      }
    },
    [
      title,
      slugEditedManually,
      setValue,
    ],
  );


  /* =======================================================
     SUBMIT
  ======================================================= */

  async function onSubmit(
    values:
      RecipeBasicInfoFormData,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    const result =
      await updateMyRecipeBasicInfoAction(
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
                keyof RecipeBasicInfoFormData,
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


    /*
     * Guardamos correctamente y avanzamos
     * al siguiente paso.
     */
    router.push(
      nextStepHref,
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 1 de 8
        </p>

        <h2 className="mt-2 font-serif text-2xl font-semibold">
          Información básica
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Añade los datos principales con los
          que identificaremos y presentaremos
          tu receta.
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
            htmlFor="title"
            className="mb-2 block text-sm font-medium"
          >
            Título
          </label>

          <input
            id="title"
            type="text"
            maxLength={120}
            {...register(
              "title",
            )}
            className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          {errors.title && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors.title.message
              }
            </p>
          )}
        </div>


        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">

            <label
              htmlFor="slug"
              className="text-sm font-medium"
            >
              Dirección de la receta
            </label>


            <button
              type="button"
              className="text-sm font-medium text-brand underline-offset-4 hover:underline"
              onClick={
                () => {
                  setSlugEditedManually(
                    false,
                  );


                  setValue(
                    "slug",
                    slugify(
                      title ??
                      "",
                    ),
                    {
                      shouldValidate:
                        true,

                      shouldDirty:
                        true,
                    },
                  );
                }
              }
            >
              Generar desde el título
            </button>

          </div>


          <div className="flex overflow-hidden rounded-xl border border-border bg-page focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">

            <span className="flex items-center border-r border-border bg-page-muted px-3 text-xs text-muted-foreground">
              /recipes/
            </span>

            <input
              id="slug"
              type="text"
              maxLength={140}
              {...register(
                "slug",
                {
                  onChange:
                    () => {
                      setSlugEditedManually(
                        true,
                      );
                    },
                },
              )}
              className="min-w-0 flex-1 bg-transparent px-4 py-3 outline-none"
            />

          </div>


          {errors.slug && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors.slug.message
              }
            </p>
          )}
        </div>


        <div>
          <label
            htmlFor="shortDescription"
            className="mb-2 block text-sm font-medium"
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
            className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Máximo 180 caracteres.
          </p>

          {errors.shortDescription && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors
                  .shortDescription
                  .message
              }
            </p>
          )}
        </div>


        <div>
          <label
            htmlFor="introduction"
            className="mb-2 block text-sm font-medium"
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
            className="w-full rounded-xl border border-border bg-page px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Puedes contar brevemente qué tiene
            de especial esta receta, de dónde
            viene o cuándo sueles prepararla.
          </p>

          {errors.introduction && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-700"
            >
              {
                errors
                  .introduction
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


        <div className="flex justify-end">

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