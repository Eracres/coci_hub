"use client";

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
  title: "",
  instructions: "",
  durationMinutes: "",
  tip: "",
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
    (step) => ({
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


    if (!validation.success) {
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


    setIsDirty(
      true,
    );

    setMessage(
      null,
    );

    clearEditor();
  }


  function editStep(
    index: number,
  ) {
    const step =
      steps[index];

    if (!step) {
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
    index: number,
  ) {
    const step =
      steps[index];

    if (!step) {
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
    index: number,
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

    setIsDirty(
      true,
    );

    setMessage(
      null,
    );
  }


  function moveStep(
    from: number,
    to: number,
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


        if (!moved) {
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


    setIsDirty(
      true,
    );

    setMessage(
      null,
    );
  }


  function buildPayload():
  RecipeStepsFormData {
    return {
      steps:
        steps.map(
          (step) => ({
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


  async function handleSave() {
    setMessage(
      null,
    );


    const payload =
      buildPayload();


    const validation =
      recipeStepsSchema.safeParse(
        payload,
      );


    if (!validation.success) {
      setMessage(
        validation.error
          .issues[0]
          ?.message ??
          "Hay pasos que no son válidos.",
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


      if (!result.success) {
        setMessage(
          result.message ??
            "No se pudo guardar la elaboración.",
        );

        return;
      }


      setIsDirty(
        false,
      );


      setMessage(
        result.message ??
          "Elaboración guardada.",
      );


      router.refresh();
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-xl border p-6">

      <div>
        <h2 className="text-xl font-semibold">
          Elaboración
        </h2>

        <p className="mt-1 text-sm">
          Añade los pasos de la receta en el orden en el que deben realizarse.
        </p>
      </div>


      {/* =============================================
          STEP LIST
      ============================================= */}

      <div className="mt-6 space-y-3">

        {steps.length ===
        0 ? (
          <p className="text-sm">
            Todavía no hay pasos de elaboración.
          </p>
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
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-medium">
                      Paso {index + 1}
                    </p>


                    {step.title && (
                      <h3 className="mt-1 font-semibold">
                        {step.title}
                      </h3>
                    )}


                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {
                        step.instructions
                      }
                    </p>


                    {step.durationMinutes && (
                      <p className="mt-2 text-xs">
                        Duración:{" "}
                        {
                          step.durationMinutes
                        }{" "}
                        min
                      </p>
                    )}


                    {step.tip && (
                      <p className="mt-2 text-sm">
                        Consejo:{" "}
                        {step.tip}
                      </p>
                    )}

                  </div>


                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        index === 0
                      }
                      onClick={() =>
                        moveStep(
                          index,
                          index - 1,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                    >
                      ↑
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
                          index + 1,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                    >
                      ↓
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        editStep(
                          index,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        duplicateStep(
                          index,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Duplicar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        removeStep(
                          index,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Eliminar
                    </button>

                  </div>
                </div>
              </article>
            ),
          )
        )}

      </div>


      {/* =============================================
          SINGLE STEP EDITOR
      ============================================= */}

      <div className="mt-6 rounded-lg border p-5">

        <h3 className="font-semibold">
          {editingIndex ===
          null
            ? "Nuevo paso"
            : `Editar paso ${editingIndex + 1}`}
        </h3>


        <div className="mt-5 space-y-5">

          <div>
            <label
              htmlFor="step-title"
              className="mb-2 block font-medium"
            >
              Título
            </label>

            <input
              id="step-title"
              type="text"
              maxLength={120}
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
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Opcional. Ej. Preparar las patatas"
            />
          </div>


          <div>
            <label
              htmlFor="step-instructions"
              className="mb-2 block font-medium"
            >
              Instrucciones
            </label>

            <textarea
              id="step-instructions"
              rows={6}
              maxLength={2500}
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
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Describe detalladamente qué debe hacerse en este paso."
            />
          </div>


          <div>
            <label
              htmlFor="step-duration"
              className="mb-2 block font-medium"
            >
              Duración aproximada
            </label>

            <div className="flex max-w-xs items-center gap-3">

              <input
                id="step-duration"
                type="number"
                min={0}
                step={1}
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
                className="w-full rounded-lg border px-4 py-3"
                placeholder="Ej. 10"
              />

              <span className="text-sm">
                min
              </span>

            </div>
          </div>


          <div>
            <label
              htmlFor="step-tip"
              className="mb-2 block font-medium"
            >
              Consejo
            </label>

            <textarea
              id="step-tip"
              rows={3}
              maxLength={800}
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
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Opcional. Ej. No subas demasiado el fuego."
            />
          </div>

        </div>


        {editorError && (
          <p
            role="alert"
            className="mt-4 text-sm"
          >
            {editorError}
          </p>
        )}


        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveStep
            }
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
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
              className="rounded-lg border px-4 py-2"
            >
              Cancelar edición
            </button>
          )}

        </div>

      </div>


      {/* =============================================
          SAVE ALL
      ============================================= */}

      <div className="mt-6 flex flex-wrap items-center gap-4">

        <button
          type="button"
          disabled={
            isSubmitting ||
            !isDirty
          }
          onClick={
            handleSave
          }
          className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : "Guardar elaboración"}
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

    </section>
  );
}