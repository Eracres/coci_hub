"use client";

import {
  ArrowRight,
  CircleAlert,
  FileText,
  Lightbulb,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";

import Image from "next/image";

import {
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import {
  slugify,
} from "@/lib/recipes/slugify";

import {
  recipeBasicInfoSchema,
  type RecipeBasicInfoFormData,
} from "@/schemas/recipe-basic-info-schema";

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


type MessageState = {
  type:
    "success" |
    "error";

  text:
    string;
} | null;


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
    useState<
      MessageState
    >(
      null,
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
    ) ??
    "";


  const slug =
    watch(
      "slug",
    ) ??
    "";


  const shortDescription =
    watch(
      "shortDescription",
    ) ??
    "";


  const introduction =
    watch(
      "introduction",
    ) ??
    "";


  // =======================================================
  // AUTOMATIC SLUG
  // =======================================================
  //
  // The public URL is always derived from the recipe title.
  // Users can see the generated slug, but cannot edit it.
  // =======================================================

  useEffect(
    () => {
      const generatedSlug =
        slugify(
          title,
        );


      if (
        generatedSlug ===
        slug
      ) {
        return;
      }


      setValue(
        "slug",
        generatedSlug,
        {
          shouldValidate:
            true,

          shouldDirty:
            true,
        },
      );
    },
    [
      title,
      slug,
      setValue,
    ],
  );


  // =======================================================
  // SAVE
  // =======================================================

  async function saveValues(
    values:
      RecipeBasicInfoFormData,

    continueAfterSave:
      boolean,
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


      setMessage({
        type:
          "error",

        text:
          result.message ??
          "No se pudieron guardar los cambios.",
      });


      return;
    }


    reset(
      values,
    );


    if (
      continueAfterSave
    ) {
      router.push(
        nextStepHref,
      );


      return;
    }


    setMessage({
      type:
        "success",

      text:
        result.message ??
        "Información básica guardada.",
    });


    router.refresh();
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      {/* ===================================================
          MAIN FORM
      =================================================== */}

      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">
        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="border-b border-border px-5 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <FileText
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                01 · Información básica
              </p>


              <h2 className="mt-1 font-serif text-3xl font-bold">
                Dale identidad a tu receta
              </h2>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Define cómo reconocerá y
                presentará CociHub tu receta
                antes de completar el resto
                de apartados.
              </p>
            </div>
          </div>
        </header>


        <form
          className="divide-y divide-border"
          onSubmit={
            handleSubmit(
              (
                values,
              ) =>
                saveValues(
                  values,
                  true,
                ),
            )
          }
        >
          {/* =============================================
              IDENTITY
          ============================================= */}

          <section className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-inverse">
                <Sparkles
                  className="size-4"
                  aria-hidden="true"
                />
              </span>


              <div>
                <h3 className="font-serif text-2xl font-bold">
                  Identidad de la receta
                </h3>


                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Nombre, resumen y dirección
                  pública de tu receta.
                </p>
              </div>
            </div>


            <div className="mt-6 space-y-6">
              {/* =========================================
                  TITLE
              ========================================= */}

              <div>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <label
                    htmlFor="title"
                    className="text-sm font-semibold"
                  >
                    Título de la receta
                  </label>


                  <span className="text-xs tabular-nums text-muted-foreground">
                    {
                      title.length
                    }
                    /120
                  </span>
                </div>


                <input
                  id="title"
                  type="text"
                  maxLength={120}
                  autoComplete="off"
                  placeholder="Por ejemplo, Gnocchi con gorgonzola y pera"
                  {...register(
                    "title",
                  )}
                  className="w-full rounded-xl border border-border bg-page px-4 py-3.5 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />


                <div className="mt-3 flex gap-3 rounded-xl border border-secondary/20 bg-secondary/[0.045] px-3 py-3">
                  <CircleAlert
                    className="mt-0.5 size-4 shrink-0 text-secondary-hover"
                    aria-hidden="true"
                  />

                  <p className="text-xs leading-5 text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Ya empezaste por aquí.
                    </span>{" "}
                    Este es el nombre que diste
                    a la receta al crear el
                    borrador. Puedes corregirlo
                    o cambiarlo si lo necesitas.
                  </p>
                </div>


                {errors.title ? (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-700"
                  >
                    {
                      errors
                        .title
                        .message
                    }
                  </p>
                ) : null}
              </div>


              {/* =========================================
                  SHORT DESCRIPTION
              ========================================= */}

              <div>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <label
                    htmlFor="shortDescription"
                    className="text-sm font-semibold"
                  >
                    Descripción corta
                  </label>


                  <span className="text-xs tabular-nums text-muted-foreground">
                    {
                      shortDescription.length
                    }
                    /180
                  </span>
                </div>


                <textarea
                  id="shortDescription"
                  rows={3}
                  maxLength={180}
                  placeholder="Por ejemplo: Gnocchi cremosos con gorgonzola y pera, una combinación irresistible entre el sabor intenso del queso y el dulzor de la fruta."
                  {...register(
                    "shortDescription",
                  )}
                  className="w-full resize-y rounded-xl border border-border bg-page px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-brand focus:ring-2 focus:ring-brand/15"
                />


                <div className="mt-3 flex gap-3 rounded-2xl border border-accent/30 bg-accent/[0.055] p-4">
                  <Lightbulb
                    className="mt-0.5 size-5 shrink-0 text-warning"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-semibold">
                      ¿Qué debería escribir aquí?
                    </p>


                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Resume en una o dos frases
                      qué es la receta y por qué
                      apetece. Piensa en el texto
                      que invitaría a alguien a
                      abrirla.
                    </p>


                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Esta descripción aparecerá
                      en tarjetas, listados y
                      búsquedas de CociHub.
                    </p>
                  </div>
                </div>


                {errors.shortDescription ? (
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
                ) : null}
              </div>


              {/* =========================================
                  SLUG
              ========================================= */}

              <div>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <label
                    htmlFor="slug"
                    className="text-sm font-semibold"
                  >
                    Dirección pública
                  </label>


                  <span className="rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-secondary-hover">
                    Automática
                  </span>
                </div>


                <div className="flex overflow-hidden rounded-xl border border-border bg-page-muted/65">
                  <span className="flex shrink-0 items-center gap-1.5 border-r border-border px-3 text-xs text-muted-foreground">
                    <Link2
                      className="size-3.5"
                      aria-hidden="true"
                    />

                    /recipes/
                  </span>


                  <input
                    id="slug"
                    type="text"
                    readOnly
                    tabIndex={-1}
                    aria-readonly="true"
                    {...register(
                      "slug",
                    )}
                    className="min-w-0 flex-1 cursor-default bg-transparent px-4 py-3.5 text-sm text-muted-foreground outline-none"
                  />
                </div>


                <div className="mt-3 flex gap-2.5 rounded-xl border border-border bg-page-muted/60 px-3 py-2.5">
                  <CircleAlert
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />

                  <p className="text-xs leading-5 text-muted-foreground">
                    CociHub genera esta dirección
                    automáticamente a partir del
                    título de tu receta. No
                    necesitas modificarla.
                  </p>
                </div>


                {errors.slug ? (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-red-700"
                  >
                    {
                      errors
                        .slug
                        .message
                    }
                  </p>
                ) : null}
              </div>
            </div>
          </section>


          {/* =============================================
              PRESENTATION
          ============================================= */}

          <section className="p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary-hover">
                  <FileText
                    className="size-4"
                    aria-hidden="true"
                  />
                </span>


                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-serif text-2xl font-bold">
                      Presentación
                    </h3>


                    <span className="rounded-full border border-secondary/25 bg-secondary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-secondary-hover">
                      Opcional
                    </span>
                  </div>


                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Dale personalidad y contexto
                    a la receta.
                  </p>
                </div>
              </div>
            </div>


            <div className="mt-6">
              <div className="mb-2 flex items-end justify-between gap-4">
                <label
                  htmlFor="introduction"
                  className="text-sm font-semibold"
                >
                  Introducción
                </label>


                <span className="text-xs tabular-nums text-muted-foreground">
                  {
                    introduction.length
                  }
                  /1500
                </span>
              </div>


              <textarea
                id="introduction"
                rows={8}
                maxLength={1500}
                placeholder="Por ejemplo: Esta receta nació una noche en la que queríamos preparar algo especial sin complicarnos demasiado..."
                {...register(
                  "introduction",
                )}
                className="w-full resize-y rounded-xl border border-border bg-page px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-muted-foreground/60 focus:border-brand focus:ring-2 focus:ring-brand/15"
              />


              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Aquí puedes contar la historia,
                el contexto, una anécdota,
                de dónde viene la receta o
                cuándo sueles prepararla.
                Aparecerá al inicio de la ficha
                pública.
              </p>


              {errors.introduction ? (
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
              ) : null}
            </div>
          </section>


          {/* =============================================
              RESULT MESSAGE
          ============================================= */}

          {message ? (
            <div className="px-5 py-4 sm:px-7">
              <div
                role={
                  message.type ===
                  "error"
                    ? "alert"
                    : "status"
                }
                className={`rounded-xl border px-4 py-3 text-sm ${
                  message.type ===
                  "success"
                    ? "border-secondary/30 bg-secondary/[0.07] text-secondary-hover"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {
                  message.text
                }
              </div>
            </div>
          ) : null}


          {/* =============================================
              FOOTER
          ============================================= */}

          <footer className="flex flex-col gap-3 bg-page-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CircleAlert
                className="size-4 text-warning"
                aria-hidden="true"
              />

              Título y descripción corta
              son obligatorios.
            </div>


            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !isDirty
                }
                onClick={
                  handleSubmit(
                    (
                      values,
                    ) =>
                      saveValues(
                        values,
                        false,
                      ),
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : null}

                Guardar borrador
              </button>


              <button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />

                    Guardando...
                  </>
                ) : (
                  <>
                    {isDirty
                      ? "Guardar y continuar"
                      : "Continuar"}

                    <ArrowRight
                      className="size-4"
                      aria-hidden="true"
                    />
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </section>


      {/* ===================================================
          HELP
      =================================================== */}

      <aside className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm xl:sticky xl:top-6">
        <div className="border-b border-border px-6 py-6 text-center">
          <Image
            src="/brand/cocihub-mark-outline.png"
            alt=""
            width={72}
            height={72}
            className="mx-auto size-[72px] object-contain"
            aria-hidden="true"
          />


          <h3 className="mt-4 font-serif text-2xl font-bold">
            Ayuda para este paso
          </h3>


          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Unas claves rápidas para que
            tu receta empiece con buen pie.
          </p>
        </div>


        <div className="space-y-6 p-6">
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              1
            </span>


            <div>
              <p className="text-sm font-bold">
                Elige un título claro
                y reconocible
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                El título ya viene del nombre
                que diste al crear el borrador.
                Solo tienes que cambiarlo si
                quieres corregirlo o mejorarlo.
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary-hover">
              2
            </span>


            <div>
              <p className="text-sm font-bold">
                Haz que la descripción
                abra el apetito
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Resume el plato en una o dos
                frases atractivas, destacando
                sabor, textura o aquello que
                lo hace especial.
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-warning">
              3
            </span>


            <div>
              <p className="text-sm font-bold">
                Usa la introducción para
                aportar contexto o historia
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Cuéntanos, si quieres, el origen
                del plato, una anécdota o cuándo
                te gusta prepararlo.
              </p>
            </div>
          </div>


          <div className="border-t border-border pt-5">
            <div className="flex gap-3 rounded-2xl bg-page-muted/60 p-4">
              <Lightbulb
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                No necesitas escribir como un
                chef profesional. Lo importante
                es explicar tu receta de forma
                clara, natural y apetecible.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}