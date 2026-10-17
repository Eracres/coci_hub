"use client";

import {
  ArrowRight,
  Save,
} from "lucide-react";

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
  updateRecipeBasicInfoAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  slugify,
} from "@/lib/recipes/slugify";

import {
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";


type RecipeBasicInfoFormProps = {
  recipeId:
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

  nextStepHref:
    string;
};


export function RecipeBasicInfoForm({
  recipeId,
  initialValues,
  nextStepHref,
}: RecipeBasicInfoFormProps) {
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
          initialValues
            .shortDescription ??
          "",

        introduction:
          initialValues
            .introduction ??
          "",
      },
    });


  const title =
    watch(
      "title",
    );


  const slug =
    watch(
      "slug",
    );


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


  function generateSlugFromTitle() {
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


  async function onSubmit(
    values:
      RecipeBasicInfoFormData,
  ) {
    setMessage(
      null,
    );


    const result =
      await updateRecipeBasicInfoAction(
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
              field as keyof RecipeBasicInfoFormData,
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
        "No se pudieron guardar los cambios.",
      );


      return;
    }


    /*
     * Marcamos los valores actuales como guardados.
     * Así react-hook-form deja de considerar
     * el formulario como dirty.
     */
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

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 1 de 10
        </p>


        <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Información básica
        </h2>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Define cómo se identificará y
          presentará la receta dentro de
          CociHub.
        </p>

      </div>


      <form
        onSubmit={
          handleSubmit(
            onSubmit,
          )
        }
        className="mt-7 space-y-6"
      >

        {/* =================================================
            TITLE
        ================================================= */}

        <div>

          <label
            htmlFor="title"
            className="text-sm font-semibold text-foreground"
          >
            Título
          </label>


          <input
            id="title"
            type="text"
            maxLength={
              120
            }
            {...register(
              "title",
            )}
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />


          {errors.title && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {
                errors
                  .title
                  .message
              }
            </p>
          )}

        </div>


        {/* =================================================
            SLUG
        ================================================= */}

        <div>

          <div className="flex flex-wrap items-center justify-between gap-3">

            <label
              htmlFor="slug"
              className="text-sm font-semibold text-foreground"
            >
              Slug
            </label>


            <button
              type="button"
              onClick={
                generateSlugFromTitle
              }
              className="text-sm font-medium text-brand transition hover:text-brand-hover"
            >
              Generar desde título
            </button>

          </div>


          <input
            id="slug"
            type="text"
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
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />


          <p className="mt-2 text-xs text-muted-foreground">
            /recipes/
            {
              slug
            }
          </p>


          {errors.slug && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {
                errors
                  .slug
                  .message
              }
            </p>
          )}

        </div>


        {/* =================================================
            SHORT DESCRIPTION
        ================================================= */}

        <div>

          <label
            htmlFor="shortDescription"
            className="text-sm font-semibold text-foreground"
          >
            Descripción corta
          </label>


          <textarea
            id="shortDescription"
            rows={
              3
            }
            maxLength={
              180
            }
            {...register(
              "shortDescription",
            )}
            className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="Una descripción breve y apetecible de la receta."
          />


          <p className="mt-2 text-xs text-muted-foreground">
            Máximo 180 caracteres.
          </p>


          {errors.shortDescription && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {
                errors
                  .shortDescription
                  .message
              }
            </p>
          )}

        </div>


        {/* =================================================
            INTRODUCTION
        ================================================= */}

        <div>

          <label
            htmlFor="introduction"
            className="text-sm font-semibold text-foreground"
          >
            Introducción
          </label>


          <textarea
            id="introduction"
            rows={
              7
            }
            maxLength={
              1500
            }
            {...register(
              "introduction",
            )}
            className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="Contexto, historia, características o cualquier información útil sobre la receta."
          />


          <div className="mt-2 flex justify-between gap-4">

            <p className="text-xs text-muted-foreground">
              Opcional
            </p>


            <p className="text-xs text-muted-foreground">
              Máximo 1500 caracteres.
            </p>

          </div>


          {errors.introduction && (
            <p
              role="alert"
              className="mt-2 text-sm text-red-600"
            >
              {
                errors
                  .introduction
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
            className="rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-end">

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !isDirty
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting ? (
              <>
                <Save
                  className="size-4"
                  aria-hidden="true"
                />

                Guardando...
              </>
            ) : (
              <>
                Guardar y continuar

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />
              </>
            )}

          </button>

        </div>

      </form>

    </section>
  );
}