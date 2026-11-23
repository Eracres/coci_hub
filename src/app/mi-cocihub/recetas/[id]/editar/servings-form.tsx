"use client";

import {
  ArrowLeft,
  ArrowRight,
  Info,
  Lightbulb,
  Loader2,
  Minus,
  Plus,
  UsersRound,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

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
  requiredRecipeServingsSchema,
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


type MessageState = {
  type:
    "success" |
    "error";

  text:
    string;
} | null;


const QUICK_SERVINGS = [
  1,
  2,
  4,
  6,
  8,
  12,
] as const;


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
    useForm<RecipeServingsFormData>({
      resolver:
        zodResolver(
          requiredRecipeServingsSchema,
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


  const baseServings =
    watch(
      "baseServings",
    ) ??
    "";


  const numericServings =
    /^\d+$/.test(
      baseServings,
    )
      ? Number(
          baseServings,
        )
      : null;


  // =======================================================
  // VALUE HELPERS
  // =======================================================

  function changeServings(
    value:
      number,
  ) {
    const safeValue =
      Math.min(
        100,
        Math.max(
          1,
          value,
        ),
      );


    setValue(
      "baseServings",
      String(
        safeValue,
      ),
      {
        shouldDirty:
          true,

        shouldValidate:
          true,
      },
    );


    setMessage(
      null,
    );
  }


  function decrementServings() {
    changeServings(
      numericServings &&
      numericServings >
        1
        ? numericServings -
            1
        : 1,
    );
  }


  function incrementServings() {
    changeServings(
      numericServings
        ? numericServings +
            1
        : 1,
    );
  }


  // =======================================================
  // SAVE
  // =======================================================

  async function saveValues(
    values:
      RecipeServingsFormData,

    continueAfterSave:
      boolean,
  ) {
    setMessage(
      null,
    );


    clearErrors();


    if (
      !isDirty &&
      continueAfterSave
    ) {
      router.push(
        nextStepHref,
      );


      return;
    }


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


      setMessage({
        type:
          "error",

        text:
          result.message ??
          fieldMessage ??
          "No se pudieron guardar las raciones.",
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
        "Raciones guardadas correctamente.",
    });


    router.refresh();
  }


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">
        {/* ===============================================
            HEADER
        =============================================== */}

        <header className="border-b border-border px-5 py-6 sm:px-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <UsersRound
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                02 · Raciones
              </p>


              <h2 className="mt-1 font-serif text-3xl font-bold">
                ¿Cuánto rinde tu receta?
              </h2>


              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Indica cuántas raciones o
                porciones obtienes con las
                cantidades originales de
                la receta.
              </p>
            </div>
          </div>
        </header>


        <form
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
          <section className="p-5 sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand text-inverse">
                <UsersRound
                  className="size-4"
                  aria-hidden="true"
                />
              </span>


              <div>
                <h3 className="font-serif text-2xl font-bold">
                  Raciones base
                </h3>


                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Es la cantidad de raciones o
                  porciones que obtienes al
                  preparar la receta con las
                  cantidades que vas a introducir.
                </p>
              </div>
            </div>


            {/* ===========================================
                SELECTOR
            =========================================== */}

            <div className="mx-auto mt-8 max-w-sm">
              <div className="grid grid-cols-[64px_minmax(0,1fr)_64px] overflow-hidden rounded-2xl border border-border bg-page shadow-sm">
                <button
                  type="button"
                  onClick={
                    decrementServings
                  }
                  disabled={
                    isSubmitting ||
                    numericServings ===
                      1
                  }
                  aria-label="Restar una ración"
                  className="flex min-h-20 items-center justify-center border-r border-border bg-page-muted/50 text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus
                    className="size-6"
                    aria-hidden="true"
                  />
                </button>


                <input
                  id="baseServings"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={3}
                  aria-label="Raciones base"
                  {...register(
                    "baseServings",
                    {
                      onChange:
                        (
                          event,
                        ) => {
                          const rawValue =
                            event
                              .target
                              .value;


                          const numericValue =
                            rawValue
                              .replace(
                                /\D/g,
                                "",
                              )
                              .slice(
                                0,
                                3,
                              );


                          setValue(
                            "baseServings",
                            numericValue,
                            {
                              shouldDirty:
                                true,

                              shouldValidate:
                                true,
                            },
                          );


                          setMessage(
                            null,
                          );
                        },
                    },
                  )}
                  className="min-h-20 min-w-0 bg-transparent px-2 text-center font-serif text-foreground outline-none"
                  style={{
                    fontSize:
                      "3.5rem",

                    lineHeight:
                      1,

                    fontWeight:
                      700,
                  }}
                  placeholder="4"
                />


                <button
                  type="button"
                  onClick={
                    incrementServings
                  }
                  disabled={
                    isSubmitting ||
                    numericServings ===
                      100
                  }
                  aria-label="Añadir una ración"
                  className="flex min-h-20 items-center justify-center border-l border-border bg-page-muted/50 text-brand transition hover:bg-brand/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus
                    className="size-6"
                    aria-hidden="true"
                  />
                </button>
              </div>


              <p className="mt-3 text-center text-sm font-semibold text-muted-foreground">
                raciones / porciones
              </p>


              {errors.baseServings ? (
                <p
                  role="alert"
                  className="mt-3 text-center text-sm text-red-700"
                >
                  {
                    errors
                      .baseServings
                      .message
                  }
                </p>
              ) : null}
            </div>


            {/* ===========================================
                QUICK VALUES
            =========================================== */}

            <div className="mt-8">
              <p className="text-sm font-semibold">
                Valores rápidos
              </p>


              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_SERVINGS.map(
                  (
                    value,
                  ) => {
                    const selected =
                      numericServings ===
                      value;


                    return (
                      <button
                        key={
                          value
                        }
                        type="button"
                        disabled={
                          isSubmitting
                        }
                        onClick={
                          () =>
                            changeServings(
                              value,
                            )
                        }
                        className={`min-w-14 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                          selected
                            ? "border-brand bg-brand/10 text-brand shadow-sm"
                            : "border-border bg-surface hover:border-brand/30 hover:bg-page-muted"
                        }`}
                      >
                        {
                          value
                        }
                      </button>
                    );
                  },
                )}
              </div>
            </div>


            {/* ===========================================
                EXAMPLES
            =========================================== */}

            <div className="mt-7 flex gap-3 rounded-2xl border border-accent/30 bg-accent/[0.055] p-4 sm:p-5">
              <Lightbulb
                className="mt-0.5 size-5 shrink-0 text-warning"
                aria-hidden="true"
              />


              <div>
                <p className="text-sm font-bold">
                  ¿Qué número debo poner?
                </p>


                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Usa la cantidad que obtienes
                  al preparar la receta con las
                  cantidades originales.
                </p>


                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
                    <span>
                      Un guiso para 4 personas
                    </span>

                    <span className="font-bold text-foreground">
                      → 4
                    </span>
                  </div>


                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
                    <span>
                      Una tarta cortada en 8 porciones
                    </span>

                    <span className="font-bold text-foreground">
                      → 8
                    </span>
                  </div>


                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
                    <span>
                      Una receta que produce 12 magdalenas
                    </span>

                    <span className="font-bold text-foreground">
                      → 12
                    </span>
                  </div>
                </div>
              </div>
            </div>


            {/* ===========================================
                WHY
            =========================================== */}

            <div className="mt-4 flex gap-3 rounded-2xl bg-page-muted/60 p-4 sm:p-5">
              <Info
                className="mt-0.5 size-5 shrink-0 text-secondary-hover"
                aria-hidden="true"
              />


              <div>
                <p className="text-sm font-bold">
                  ¿Para qué utiliza CociHub este dato?
                </p>


                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Esta será la referencia para
                  recalcular automáticamente los
                  ingredientes cuando alguien
                  cambie las raciones en la
                  receta publicada.
                </p>


                {numericServings ? (
                  <div className="mt-4 rounded-xl border border-border bg-surface p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Ejemplo
                    </p>


                    <p className="mt-2 text-sm leading-6">
                      Si tu receta está calculada
                      para{" "}
                      <span className="font-bold text-brand">
                        {
                          numericServings
                        }{" "}
                        {
                          numericServings ===
                          1
                            ? "ración"
                            : "raciones"
                        }
                      </span>
                      , CociHub utilizará esa
                      cantidad como referencia
                      para ajustar los
                      ingredientes.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>


          {/* =============================================
              MESSAGE
          ============================================= */}

          {message ? (
            <div className="border-t border-border px-5 py-4 sm:px-7">
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

          <footer className="flex flex-col gap-3 border-t border-border bg-page-muted/20 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <Link
              href={
                previousStepHref
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold transition hover:bg-page-muted"
            >
              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Información básica
            </Link>


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
            las raciones de tu receta
            queden claras.
          </p>
        </div>


        <div className="space-y-6 p-6">
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              1
            </span>


            <div>
              <p className="text-sm font-bold">
                Usa la cantidad original
                de tu receta
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Indica cuántas raciones o
                porciones obtienes con las
                cantidades que vas a
                introducir.
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-sm font-bold text-secondary-hover">
              2
            </span>


            <div>
              <p className="text-sm font-bold">
                No pienses solo en
                “personas”
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                También puede ser el número
                de porciones, unidades o piezas,
                según el tipo de receta:
                tartas, magdalenas, galletas,
                croquetas...
              </p>
            </div>
          </div>


          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-warning">
              3
            </span>


            <div>
              <p className="text-sm font-bold">
                CociHub usará este número
                para ajustar ingredientes
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Si alguien cambia las raciones
                en la receta publicada, las
                cantidades se recalcularán
                automáticamente.
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
                Si dudas entre dos cantidades,
                piensa en cómo servirías
                normalmente esa receta y usa
                esa cifra como referencia.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}