"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Clock3,
  Copy,
  Lightbulb,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import Link from "next/link";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeStepsAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeStepSchema,
  recipeStepsSchema,
  type RecipeStepFormData,
  type RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";


type RecipeStepsFormProps = {
  recipeId:
    string;

  initialSteps:
    RecipeStepsFormData["steps"];
};


type EditableStep =
  RecipeStepFormData & {
    clientId:
      string;
  };


const emptyStep:
RecipeStepFormData = {
  title:
    "",

  instructions:
    "",

  durationMinutes:
    "",

  tip:
    "",
};


function createClientId() {
  return `step-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function createEditableSteps(
  steps:
    RecipeStepsFormData["steps"],
): EditableStep[] {
  return steps.map(
    (
      step,
    ) => ({
      clientId:
        createClientId(),

      ...step,
    }),
  );
}


export function RecipeStepsForm({
  recipeId,
  initialSteps,
}: RecipeStepsFormProps) {
  const router =
    useRouter();


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=ingredients`;


  const nextStepHref =
    `/admin/recipes/${recipeId}/edit?step=times`;


  const [
    steps,
    setSteps,
  ] =
    useState<EditableStep[]>(
      () =>
        createEditableSteps(
          initialSteps,
        ),
    );


  const [
    stepDraft,
    setStepDraft,
  ] =
    useState<RecipeStepFormData>({
      ...emptyStep,
    });


  const [
    editingIndex,
    setEditingIndex,
  ] =
    useState<number | null>(
      null,
    );


  const [
    editorError,
    setEditorError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const [
    isDirty,
    setIsDirty,
  ] =
    useState(
      false,
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const cookingMinutes =
    steps.reduce(
      (
        total,
        step,
      ) => {
        const duration =
          Number(
            step.durationMinutes,
          );


        if (
          !Number.isFinite(
            duration,
          ) ||
          duration <
            0
        ) {
          return total;
        }


        return (
          total +
          duration
        );
      },
      0,
    );


  function markDirty() {
    setIsDirty(
      true,
    );


    setMessage(
      null,
    );


    setValidationError(
      null,
    );
  }


  function clearEditor() {
    setStepDraft({
      ...emptyStep,
    });


    setEditingIndex(
      null,
    );


    setEditorError(
      null,
    );
  }


  function saveStep() {
    const validation =
      recipeStepSchema.safeParse(
        stepDraft,
      );


    if (
      !validation.success
    ) {
      setEditorError(
        validation.error
          .issues[0]
          ?.message ??
          "El paso no es válido.",
      );

      return;
    }


    if (
      editingIndex ===
      null
    ) {
      setSteps(
        (
          current,
        ) => [
          ...current,

          {
            clientId:
              createClientId(),

            ...validation.data,
          },
        ],
      );
    } else {
      setSteps(
        (
          current,
        ) =>
          current.map(
            (
              step,
              index,
            ) =>
              index ===
              editingIndex
                ? {
                    clientId:
                      step.clientId,

                    ...validation.data,
                  }
                : step,
          ),
      );
    }


    markDirty();


    clearEditor();
  }


  function editStep(
    index:
      number,
  ) {
    const step =
      steps[
        index
      ];


    if (
      !step
    ) {
      return;
    }


    setStepDraft({
      title:
        step.title,

      instructions:
        step.instructions,

      durationMinutes:
        step.durationMinutes,

      tip:
        step.tip,
    });


    setEditingIndex(
      index,
    );


    setEditorError(
      null,
    );
  }


  function duplicateStep(
    index:
      number,
  ) {
    const step =
      steps[
        index
      ];


    if (
      !step
    ) {
      return;
    }


    setStepDraft({
      title:
        step.title,

      instructions:
        step.instructions,

      durationMinutes:
        step.durationMinutes,

      tip:
        step.tip,
    });


    setEditingIndex(
      null,
    );


    setEditorError(
      null,
    );
  }


  function removeStep(
    index:
      number,
  ) {
    setSteps(
      (
        current,
      ) =>
        current.filter(
          (
            _step,
            currentIndex,
          ) =>
            currentIndex !==
            index,
        ),
    );


    if (
      editingIndex ===
      index
    ) {
      clearEditor();
    } else if (
      editingIndex !==
        null &&
      editingIndex >
        index
    ) {
      setEditingIndex(
        editingIndex -
          1,
      );
    }


    markDirty();
  }


  function moveStep(
    from:
      number,

    to:
      number,
  ) {
    if (
      to < 0 ||
      to >=
        steps.length
    ) {
      return;
    }


    setSteps(
      (
        current,
      ) => {
        const copy = [
          ...current,
        ];


        const [
          moved,
        ] =
          copy.splice(
            from,
            1,
          );


        if (
          !moved
        ) {
          return current;
        }


        copy.splice(
          to,
          0,
          moved,
        );


        return copy;
      },
    );


    if (
      editingIndex ===
      from
    ) {
      setEditingIndex(
        to,
      );
    } else if (
      editingIndex !==
        null &&
      from <
        to &&
      editingIndex >
        from &&
      editingIndex <=
        to
    ) {
      setEditingIndex(
        editingIndex -
          1,
      );
    } else if (
      editingIndex !==
        null &&
      to <
        from &&
      editingIndex >=
        to &&
      editingIndex <
        from
    ) {
      setEditingIndex(
        editingIndex +
          1,
      );
    }


    markDirty();
  }


  function buildPayload():
  RecipeStepsFormData {
    return {
      steps:
        steps.map(
          (
            step,
          ) => ({
            title:
              step.title,

            instructions:
              step.instructions,

            durationMinutes:
              step.durationMinutes,

            tip:
              step.tip,
          }),
        ),
    };
  }


  async function handleContinue() {
    setMessage(
      null,
    );


    setValidationError(
      null,
    );


    const payload =
      buildPayload();


    const validation =
      recipeStepsSchema.safeParse(
        payload,
      );


    if (
      !validation.success
    ) {
      setValidationError(
        validation.error
          .issues[0]
          ?.message ??
          "Hay pasos que no son válidos.",
      );

      return;
    }


    if (
      validation.data
        .steps
        .length ===
      0
    ) {
      setValidationError(
        "Añade al menos un paso de elaboración para continuar.",
      );

      return;
    }


    /*
     * Si la elaboración ya estaba guardada
     * y no hemos cambiado nada,
     * simplemente avanzamos.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeStepsAction(
          recipeId,
          validation.data,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
          "No se pudo guardar la elaboración.",
        );

        return;
      }


      setIsDirty(
        false,
      );


      /*
       * El backend sincroniza automáticamente
       * cooking_minutes a partir de la duración
       * de los pasos guardados.
       */
      router.push(
        nextStepHref,
      );

    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-start gap-4">

        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

          <ListOrdered
            className="size-5"
            aria-hidden="true"
          />

        </span>


        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 5 de 10
          </p>


          <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
            Elaboración
          </h2>


          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Añade los pasos de la receta
            en el orden exacto en el que
            deben realizarse.
          </p>

        </div>

      </div>


      {/* =================================================
          COOKING TIME INFO
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-brand/20 bg-brand/5 p-5">

        <div className="flex items-start justify-between gap-5">

          <div className="flex items-start gap-4">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

              <Clock3
                className="size-5"
                aria-hidden="true"
              />

            </span>


            <div>

              <h3 className="font-semibold text-foreground">
                Tiempo de cocinado automático
              </h3>


              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                CociHub sumará la duración
                indicada en todos los pasos y
                utilizará ese resultado como
                tiempo de cocinado de la receta.
              </p>

            </div>

          </div>


          <div className="shrink-0 rounded-xl border border-border bg-surface px-4 py-3 text-right">

            <p className="text-xl font-semibold text-brand">
              {
                cookingMinutes
              }{" "}
              <span className="text-sm font-normal text-muted-foreground">
                min
              </span>
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          STEP LIST
      ================================================= */}

      <div className="mt-7 space-y-3">

        {steps.length ===
        0 ? (

          <div className="rounded-2xl border border-dashed border-border bg-page-muted/20 px-6 py-8 text-center">

            <ListOrdered
              className="mx-auto size-7 text-brand"
              aria-hidden="true"
            />


            <h3 className="mt-4 font-semibold text-foreground">
              Todavía no hay pasos
            </h3>


            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Añade al menos un paso para
              poder completar la elaboración.
            </p>

          </div>

        ) : (

          steps.map(
            (
              step,
              index,
            ) => (
              <article
                key={
                  step.clientId
                }
                className="rounded-2xl border border-border bg-page-muted/20 p-5"
              >

                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-inverse">
                        {
                          index +
                          1
                        }
                      </span>


                      {step.title ? (

                        <h3 className="font-semibold text-foreground">
                          {
                            step.title
                          }
                        </h3>

                      ) : (

                        <h3 className="font-semibold text-muted-foreground">
                          Paso{" "}
                          {
                            index +
                            1
                          }
                        </h3>

                      )}


                      {step.durationMinutes && (

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground">

                          <Clock3
                            className="size-3.5 text-brand"
                            aria-hidden="true"
                          />

                          {
                            step.durationMinutes
                          }{" "}
                          min

                        </span>

                      )}

                    </div>


                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
                      {
                        step.instructions
                      }
                    </p>


                    {step.tip && (

                      <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">

                        <Lightbulb
                          className="mt-0.5 size-4 shrink-0 text-brand"
                          aria-hidden="true"
                        />


                        <div>

                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                            Consejo
                          </p>


                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {
                              step.tip
                            }
                          </p>

                        </div>

                      </div>

                    )}

                  </div>


                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        index ===
                        0
                      }
                      onClick={
                        () =>
                          moveStep(
                            index,
                            index -
                              1,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover paso hacia arriba"
                    >

                      <ArrowUp
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      disabled={
                        index ===
                        steps.length -
                          1
                      }
                      onClick={
                        () =>
                          moveStep(
                            index,
                            index +
                              1,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover paso hacia abajo"
                    >

                      <ArrowDown
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          editStep(
                            index,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted"
                      aria-label="Editar paso"
                    >

                      <Pencil
                        className="size-4 text-brand"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          duplicateStep(
                            index,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted"
                      aria-label="Duplicar paso"
                    >

                      <Copy
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>


                    <button
                      type="button"
                      onClick={
                        () =>
                          removeStep(
                            index,
                          )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-red-200 bg-surface text-red-600 transition hover:bg-red-50"
                      aria-label="Eliminar paso"
                    >

                      <Trash2
                        className="size-4"
                        aria-hidden="true"
                      />

                    </button>

                  </div>

                </div>

              </article>
            ),
          )
        )}

      </div>


      {/* =================================================
          SINGLE STEP EDITOR
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-border bg-page-muted/20 p-5 sm:p-6">

        <div className="flex items-center gap-3">

          <span className="flex size-9 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

            <Plus
              className="size-4"
              aria-hidden="true"
            />

          </span>


          <div>

            <h3 className="font-semibold text-foreground">

              {editingIndex ===
              null
                ? "Nuevo paso"
                : `Editar paso ${editingIndex + 1}`}

            </h3>


            <p className="mt-0.5 text-xs text-muted-foreground">
              Describe una única acción o
              fase de la elaboración.
            </p>

          </div>

        </div>


        <div className="mt-6 space-y-5">

          {/* TITLE */}

          <div>

            <label
              htmlFor="step-title"
              className="text-sm font-semibold text-foreground"
            >
              Título
            </label>


            <input
              id="step-title"
              type="text"
              maxLength={
                120
              }
              value={
                stepDraft.title
              }
              onChange={(
                event,
              ) =>
                setStepDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    title:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Opcional. Ej. Dorar el cerdo"
            />

          </div>


          {/* INSTRUCTIONS */}

          <div>

            <label
              htmlFor="step-instructions"
              className="text-sm font-semibold text-foreground"
            >
              Instrucciones
            </label>


            <textarea
              id="step-instructions"
              rows={
                6
              }
              maxLength={
                2500
              }
              value={
                stepDraft.instructions
              }
              onChange={(
                event,
              ) =>
                setStepDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    instructions:
                      event.target.value,
                  }),
                )
              }
              className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Describe detalladamente qué debe hacerse en este paso."
            />


            <p className="mt-2 text-xs text-muted-foreground">
              Máximo 2500 caracteres.
            </p>

          </div>


          {/* DURATION */}

          <div>

            <label
              htmlFor="step-duration"
              className="text-sm font-semibold text-foreground"
            >
              Duración aproximada
            </label>


            <div className="mt-2 flex max-w-xs items-center gap-3">

              <input
                id="step-duration"
                type="number"
                min={
                  0
                }
                step={
                  1
                }
                inputMode="numeric"
                value={
                  stepDraft.durationMinutes
                }
                onChange={(
                  event,
                ) =>
                  setStepDraft(
                    (
                      current,
                    ) => ({
                      ...current,

                      durationMinutes:
                        event.target.value,
                    }),
                  )
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. 10"
              />


              <span className="shrink-0 text-sm text-muted-foreground">
                min
              </span>

            </div>


            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Se sumará automáticamente al
              tiempo total de cocinado.
            </p>

          </div>


          {/* TIP */}

          <div>

            <label
              htmlFor="step-tip"
              className="text-sm font-semibold text-foreground"
            >
              Consejo
            </label>


            <textarea
              id="step-tip"
              rows={
                3
              }
              maxLength={
                800
              }
              value={
                stepDraft.tip
              }
              onChange={(
                event,
              ) =>
                  setStepDraft(
                    (
                      current,
                    ) => ({
                      ...current,

                      tip:
                        event.target.value,
                    }),
                  )
              }
              className="mt-2 w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 leading-6 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Opcional. Ej. No subas demasiado el fuego."
            />


            <p className="mt-2 text-xs text-muted-foreground">
              Opcional · Máximo 800 caracteres.
            </p>

          </div>

        </div>


        {/* EDITOR ERROR */}

        {editorError && (

          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {
              editorError
            }
          </p>

        )}


        {/* EDITOR ACTIONS */}

        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveStep
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
          >

            <Plus
              className="size-4"
              aria-hidden="true"
            />


            {editingIndex ===
            null
              ? "Añadir paso"
              : "Guardar cambios"}

          </button>


          {editingIndex !==
            null && (

            <button
              type="button"
              onClick={
                clearEditor
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-border bg-surface px-4 text-sm font-semibold transition hover:bg-page-muted"
            >
              Cancelar edición
            </button>

          )}

        </div>

      </div>


      {/* =================================================
          VALIDATION
      ================================================= */}

      {validationError && (

        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {
            validationError
          }
        </p>

      )}


      {message && (

        <p
          role="status"
          className="mt-6 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          {
            message
          }
        </p>

      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

        <Link
          href={
            previousStepHref
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Anterior

        </Link>


        <button
          type="button"
          disabled={
            isSubmitting
          }
          onClick={
            handleContinue
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >

          {isSubmitting
            ? "Guardando..."
            : isDirty
              ? "Guardar y continuar"
              : "Continuar"}


          {!isSubmitting && (

            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />

          )}

        </button>

      </div>

    </section>
  );
}