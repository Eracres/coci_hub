"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Copy,
  Lightbulb,
  ListOrdered,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import {
  recipeStepSchema,
  recipeStepsSchema,
  type RecipeStepFormData,
  type RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";

import {
  updateMyRecipeStepsAction,
} from "./steps-actions";


type StepsFormProps = {
  recipeId:
    string;

  initialSteps:
    RecipeStepsFormData["steps"];

  previousStepHref:
    string;

  nextStepHref:
    string;
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


/* =========================================================
   CLIENT ID
========================================================= */

function createClientId() {
  return `step-${Date.now()}-${Math.random()
    .toString(
      36,
    )
    .slice(
      2,
    )}`;
}


/* =========================================================
   EDITABLE DATA
========================================================= */

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


/* =========================================================
   STEPS FORM
========================================================= */

export function StepsForm({
  recipeId,
  initialSteps,
  previousStepHref,
  nextStepHref,
}: StepsFormProps) {
  const router =
    useRouter();


  const [
    steps,
    setSteps,
  ] =
    useState<
      EditableStep[]
    >(
      () =>
        createEditableSteps(
          initialSteps,
        ),
    );


  const [
    stepDraft,
    setStepDraft,
  ] =
    useState<
      RecipeStepFormData
    >({
      ...emptyStep,
    });


  const [
    editingIndex,
    setEditingIndex,
  ] =
    useState<
      number | null
    >(
      null,
    );


  const [
    editorError,
    setEditorError,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<
      string | null
    >(
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


  /* =======================================================
     EDITOR HELPERS
  ======================================================= */

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


  /* =======================================================
     ADD / UPDATE STEP
  ======================================================= */

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


  /* =======================================================
     EDIT
  ======================================================= */

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


  /* =======================================================
     DUPLICATE
  ======================================================= */

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


    /*
     * Igual que en Ingredientes:
     *
     * cargamos una copia en el editor pero no la insertamos
     * hasta que el usuario confirme.
     */

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


  /* =======================================================
     REMOVE
  ======================================================= */

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


    markDirty();


    if (
      editingIndex ===
      index
    ) {
      clearEditor();
    }
  }


  /* =======================================================
     MOVE
  ======================================================= */

  function moveStep(
    from:
      number,

    to:
      number,
  ) {
    if (
      to <
        0 ||
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


    markDirty();
  }


  /* =======================================================
     PAYLOAD
  ======================================================= */

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


  /* =======================================================
     SAVE + CONTINUE
  ======================================================= */

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
          "Hay pasos de elaboración que no son válidos.",
      );

      return;
    }


    if (
      validation.data.steps.length <
      1
    ) {
      setValidationError(
        "Añade al menos un paso de elaboración para continuar.",
      );

      return;
    }


    /*
     * Si no hemos cambiado nada, los pasos ya estaban
     * persistidos y podemos avanzar directamente.
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
        await updateMyRecipeStepsAction(
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


      router.push(
        nextStepHref,
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 5 de 8
        </p>


        <div className="mt-2 flex items-center gap-2">

          <ListOrdered
            className="size-5 text-brand"
            aria-hidden="true"
          />


          <h2 className="font-serif text-2xl font-semibold">
            Elaboración
          </h2>

        </div>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Explica la receta paso a paso y en el orden en
          el que debe prepararse.
        </p>


        <div className="mt-4 rounded-xl border border-border bg-page-muted/40 px-4 py-3">

          <div className="flex items-start gap-3">

            <Clock3
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />


            <p className="text-xs leading-5 text-muted-foreground">
              Si indicas la duración de los pasos,
              CociHub calculará automáticamente el tiempo
              de cocinado de la receta.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          STEP LIST
      ================================================= */}

      <div className="mt-7 space-y-4">

        {steps.length ===
        0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-page-muted/30 p-6 text-center">

            <ListOrdered
              className="mx-auto size-6 text-brand"
              aria-hidden="true"
            />


            <p className="mt-3 font-medium">
              Todavía no hay pasos de elaboración.
            </p>


            <p className="mt-1 text-sm text-muted-foreground">
              Añade el primero utilizando el formulario
              inferior.
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
                className="rounded-2xl border border-border bg-page-muted/30 p-4 sm:p-5"
              >

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand">
                      Paso {
                        index +
                        1
                      }
                    </p>


                    {step.title && (
                      <h3 className="mt-1 font-semibold">
                        {
                          step.title
                        }
                      </h3>
                    )}


                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                      {
                        step.instructions
                      }
                    </p>


                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">

                      {step.durationMinutes && (
                        <span className="inline-flex items-center gap-1.5">

                          <Clock3
                            className="size-3.5 text-brand"
                            aria-hidden="true"
                          />

                          {
                            step.durationMinutes
                          } min

                        </span>
                      )}


                      {step.tip && (
                        <span className="inline-flex items-center gap-1.5">

                          <Lightbulb
                            className="size-3.5 text-brand"
                            aria-hidden="true"
                          />

                          Consejo incluido

                        </span>
                      )}

                    </div>


                    {step.tip && (
                      <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">

                        <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">

                          <Lightbulb
                            className="mt-1 size-4 shrink-0 text-brand"
                            aria-hidden="true"
                          />

                          <span>
                            {
                              step.tip
                            }
                          </span>

                        </p>

                      </div>
                    )}

                  </div>


                  <div className="flex shrink-0 flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        index ===
                        0
                      }
                      onClick={() =>
                        moveStep(
                          index,
                          index -
                            1,
                        )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover paso hacia arriba"
                      title="Mover paso hacia arriba"
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
                      onClick={() =>
                        moveStep(
                          index,
                          index +
                            1,
                        )
                      }
                      className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-surface transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Mover paso hacia abajo"
                      title="Mover paso hacia abajo"
                    >
                      <ArrowDown
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        editStep(
                          index,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition hover:bg-page-muted"
                    >
                      <Pencil
                        className="size-4"
                        aria-hidden="true"
                      />

                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        duplicateStep(
                          index,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition hover:bg-page-muted"
                    >
                      <Copy
                        className="size-4"
                        aria-hidden="true"
                      />

                      Duplicar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        removeStep(
                          index,
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium transition hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2
                        className="size-4"
                        aria-hidden="true"
                      />

                      Eliminar
                    </button>

                  </div>

                </div>

              </article>
            ),
          )
        )}

      </div>


      {/* =================================================
          STEP EDITOR
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-border bg-page-muted/30 p-4 sm:p-5">

        <div className="flex items-center gap-2">

          <Plus
            className="size-4 text-brand"
            aria-hidden="true"
          />


          <h3 className="font-semibold">
            {editingIndex ===
            null
              ? "Añadir paso"
              : `Editar paso ${editingIndex + 1}`}
          </h3>

        </div>


        <div className="mt-5 space-y-5">

          {/* TITLE */}

          <div>

            <label
              htmlFor="step-title"
              className="mb-2 block text-sm font-medium"
            >
              Título del paso
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
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Opcional. Ej. Preparar las patatas"
            />

          </div>


          {/* INSTRUCTIONS */}

          <div>

            <label
              htmlFor="step-instructions"
              className="mb-2 block text-sm font-medium"
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
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Describe detalladamente qué debe hacerse en este paso."
            />


            <p className="mt-2 text-xs text-muted-foreground">
              Mínimo 10 caracteres.
            </p>

          </div>


          {/* DURATION */}

          <div>

            <label
              htmlFor="step-duration"
              className="mb-2 block text-sm font-medium"
            >
              Duración aproximada
            </label>


            <div className="flex max-w-xs items-center gap-3">

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
                        event
                          .target
                          .value,
                    }),
                  )
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                placeholder="Ej. 10"
              />


              <span className="text-sm text-muted-foreground">
                min
              </span>

            </div>


            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Opcional. La suma de las duraciones se utiliza
              para calcular automáticamente el tiempo de cocinado.
            </p>

          </div>


          {/* TIP */}

          <div>

            <label
              htmlFor="step-tip"
              className="mb-2 block text-sm font-medium"
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
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
              placeholder="Opcional. Ej. No subas demasiado el fuego."
            />

          </div>

        </div>


        {editorError && (
          <p
            role="alert"
            className="mt-4 text-sm text-red-700"
          >
            {
              editorError
            }
          </p>
        )}


        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveStep
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
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
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
            >
              Cancelar edición
            </button>
          )}

        </div>

      </div>


      {/* =================================================
          FEEDBACK
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
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {
            message
          }
        </p>
      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

        <Link
          href={
            previousStepHref
          }
          className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
        >
          ← Anterior
        </Link>


        <button
          type="button"
          disabled={
            isSubmitting
          }
          onClick={
            handleContinue
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

    </section>
  );
}
