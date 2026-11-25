"use client";

import {
  useState,
  type MouseEvent,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  GripVertical,
  Info,
  Lightbulb,
  ListOrdered,
  Pencil,
  Plus,
  Save,
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


function createClientId() {
  return "step-" + Date.now() + "-" + Math.random()
    .toString(36)
    .slice(2);
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


function formatMinutes(
  minutes:
    number,
) {
  const hours =
    Math.floor(
      minutes / 60,
    );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return minutes + " min";
  }

  if (remainingMinutes === 0) {
    return hours + " h";
  }

  return hours + " h " + remainingMinutes + " min";
}


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
    useState<RecipeStepFormData>(
      {
        ...emptyStep,
      },
    );

  const [
    editingClientId,
    setEditingClientId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    expandedStepIds,
    setExpandedStepIds,
  ] =
    useState<Set<string>>(
      () => new Set(),
    );

  const [
    pendingDeleteClientId,
    setPendingDeleteClientId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isReorderMode,
    setIsReorderMode,
  ] =
    useState(false);

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
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isDirty,
    setIsDirty,
  ] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const draftHasContent =
    Boolean(
      stepDraft.title.trim() ||
      stepDraft.instructions.trim() ||
      stepDraft.durationMinutes.trim() ||
      stepDraft.tip.trim(),
    );

  const hasUnconfirmedStep =
    editingClientId !== null ||
    draftHasContent;

  const stepsWithDuration =
    steps.filter(
      (step) =>
        step.durationMinutes.trim() !== "",
    );

  const indicatedMinutes =
    stepsWithDuration.reduce(
      (total, step) =>
        total + Number(step.durationMinutes),
      0,
    );

  const hasPartialDuration =
    stepsWithDuration.length > 0 &&
    stepsWithDuration.length < steps.length;

  const hasCompleteDuration =
    steps.length > 0 &&
    stepsWithDuration.length === steps.length;

  function clearEditor() {
    setStepDraft({
      ...emptyStep,
    });

    setEditingClientId(
      null,
    );

    setEditorError(
      null,
    );
  }


  function markDirty() {
    setIsDirty(true);
    setMessage(null);
    setValidationError(null);
  }


  function toggleExpanded(
    clientId:
      string,
  ) {
    setExpandedStepIds(
      (current) => {
        const next =
          new Set(current);

        if (next.has(clientId)) {
          next.delete(clientId);
        } else {
          next.add(clientId);
        }

        return next;
      },
    );
  }


  function saveStep() {
    const validation =
      recipeStepSchema.safeParse(
        stepDraft,
      );

    if (!validation.success) {
      setEditorError(
        validation.error.issues[0]?.message ??
          "El paso no es válido.",
      );

      return;
    }

    const savedClientId =
      editingClientId ??
      createClientId();

    if (editingClientId === null) {
      setSteps(
        (current) => [
          ...current,
          {
            clientId: savedClientId,
            ...validation.data,
          },
        ],
      );
    } else {
      setSteps(
        (current) =>
          current.map(
            (step) =>
              step.clientId === editingClientId
                ? {
                    clientId: step.clientId,
                    ...validation.data,
                  }
                : step,
          ),
      );
    }

    setExpandedStepIds(
      (current) =>
        new Set([
          ...current,
          savedClientId,
        ]),
    );

    markDirty();
    clearEditor();
  }


  function blockPendingStepReplacement() {
    if (!hasUnconfirmedStep) {
      return false;
    }

    setValidationError(
      editingClientId !== null
        ? "Confirma o cancela la edición actual antes de abrir otro paso."
        : "Añade o descarta el paso que estás escribiendo antes de abrir otro.",
    );

    document
      .getElementById("step-editor")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

    return true;
  }


  function editStep(
    clientId:
      string,
  ) {
    if (blockPendingStepReplacement()) {
      return;
    }

    const step =
      steps.find(
        (item) =>
          item.clientId === clientId,
      );

    if (!step) {
      return;
    }

    setStepDraft({
      title: step.title,
      instructions: step.instructions,
      durationMinutes: step.durationMinutes,
      tip: step.tip,
    });

    setEditingClientId(
      step.clientId,
    );

    setPendingDeleteClientId(
      null,
    );

    setExpandedStepIds(
      (current) =>
        new Set([
          ...current,
          step.clientId,
        ]),
    );

    setEditorError(null);
    setMessage(null);
    setValidationError(null);
  }


  function duplicateStep(
    clientId:
      string,
  ) {
    if (blockPendingStepReplacement()) {
      return;
    }

    const step =
      steps.find(
        (item) =>
          item.clientId === clientId,
      );

    if (!step) {
      return;
    }

    setStepDraft({
      title: step.title,
      instructions: step.instructions,
      durationMinutes: step.durationMinutes,
      tip: step.tip,
    });

    setEditingClientId(null);
    setPendingDeleteClientId(null);
    setEditorError(null);
    setMessage(null);
    setValidationError(null);
  }


  function requestRemoveStep(
    clientId:
      string,
  ) {
    if (blockPendingStepReplacement()) {
      return;
    }

    setPendingDeleteClientId(
      clientId,
    );
  }


  function confirmRemoveStep(
    clientId:
      string,
  ) {
    setSteps(
      (current) =>
        current.filter(
          (step) =>
            step.clientId !== clientId,
        ),
    );

    setExpandedStepIds(
      (current) => {
        const next =
          new Set(current);

        next.delete(clientId);

        return next;
      },
    );

    if (editingClientId === clientId) {
      clearEditor();
    }

    setPendingDeleteClientId(null);
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
      to >= steps.length ||
      from === to
    ) {
      return;
    }

    setSteps(
      (current) => {
        const next = [
          ...current,
        ];

        const [
          moved,
        ] =
          next.splice(
            from,
            1,
          );

        if (!moved) {
          return current;
        }

        next.splice(
          to,
          0,
          moved,
        );

        return next;
      },
    );

    markDirty();
  }


  function buildPayload():
  RecipeStepsFormData {
    return {
      steps:
        steps.map(
          (step) => ({
            title: step.title,
            instructions: step.instructions,
            durationMinutes: step.durationMinutes,
            tip: step.tip,
          }),
        ),
    };
  }


  async function persistSteps(
    advance:
      boolean,
  ) {
    setMessage(null);
    setValidationError(null);

    if (hasUnconfirmedStep) {
      setValidationError(
        editingClientId !== null
          ? "Guarda los cambios del paso que estás editando o cancela la edición antes de continuar."
          : "Confirma el paso que estás escribiendo o descártalo antes de guardar.",
      );

      return;
    }

    const validation =
      recipeStepsSchema.safeParse(
        buildPayload(),
      );

    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message ??
          "Hay pasos de elaboración que no son válidos.",
      );

      return;
    }

    if (validation.data.steps.length < 1) {
      setValidationError(
        "Añade al menos un paso de elaboración para continuar.",
      );

      return;
    }

    if (!isDirty) {
      if (advance) {
        router.push(nextStepHref);
      } else {
        setMessage(
          "No hay cambios pendientes que guardar.",
        );
      }

      return;
    }

    setIsSubmitting(true);

    try {
      const result =
        await updateMyRecipeStepsAction(
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

      setIsDirty(false);

      if (advance) {
        router.push(nextStepHref);
      } else {
        setMessage(
          "Borrador de elaboración guardado correctamente.",
        );
      }
    } catch {
      setMessage(
        "No se pudo guardar la elaboración. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  function handlePreviousClick(
    event:
      MouseEvent<HTMLAnchorElement>,
  ) {
    if (
      !isDirty &&
      !hasUnconfirmedStep
    ) {
      return;
    }

    const shouldLeave =
      window.confirm(
        "Tienes cambios de elaboración sin guardar. ¿Quieres salir de este apartado?",
      );

    if (!shouldLeave) {
      event.preventDefault();
    }
  }


  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface">

        <div className="p-5 sm:p-6">

          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex min-w-0 items-start gap-4">

              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                <ListOrdered
                  className="size-7"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                  05 · Elaboración
                </p>

                <h2 className="mt-1 font-serif text-2xl font-semibold">
                  Enseña a preparar tu receta
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Describe cada paso para que cualquiera pueda reproducir tu elaboración.
                </p>
              </div>

            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2">

              <div className="min-w-28 rounded-xl bg-brand/10 px-3 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand">
                  Pasos añadidos
                </p>
                <p className="mt-1 text-2xl font-bold text-brand">
                  {steps.length}
                </p>
              </div>

              <div className="min-w-32 rounded-xl bg-green-50 px-3 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-green-800">
                  Tiempo indicado
                </p>
                <p className="mt-1 text-xl font-bold text-green-800">
                  {stepsWithDuration.length === 0
                    ? "—"
                    : formatMinutes(indicatedMinutes)}
                </p>
                {steps.length > 0 && (
                  <p className="mt-0.5 text-[10px] text-green-800">
                    {hasPartialDuration
                      ? "estimación parcial"
                      : hasCompleteDuration
                        ? "todos los pasos"
                        : "sin tiempos indicados"}
                  </p>
                )}
              </div>

            </div>

          </div>


          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">

            <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={isReorderMode}
                onChange={(event) =>
                  setIsReorderMode(event.target.checked)
                }
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={"relative h-6 w-11 rounded-full transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand " + (isReorderMode ? "bg-brand" : "bg-border")}
              >
                <span className={"absolute left-1 top-1 size-4 rounded-full bg-white shadow transition " + (isReorderMode ? "translate-x-5" : "")} />
              </span>
              Reordenar pasos
            </label>

            {isReorderMode && (
              <p className="text-xs text-muted-foreground">
                Usa las flechas de cada paso para cambiar el orden.
              </p>
            )}

            <button
              type="button"
              onClick={() => {
                if (!hasUnconfirmedStep) {
                  setStepDraft({
                    ...emptyStep,
                  });
                  setEditingClientId(null);
                  setEditorError(null);
                }
                document
                  .getElementById("step-editor")
                  ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/5"
            >
              <Plus
                className="size-4"
                aria-hidden="true"
              />
              Añadir paso
            </button>

          </div>


          {/* TIMELINE */}

          <div className="mt-5">

            {steps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-page-muted/30 px-5 py-8 text-center">
                <ListOrdered
                  className="mx-auto size-8 text-brand"
                  aria-hidden="true"
                />
                <p className="mt-3 font-semibold">
                  Todavía no hay pasos de elaboración.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Añade el primero para empezar a construir la receta paso a paso.
                </p>
              </div>
            ) : (
              <ol className="space-y-3">
                {steps.map(
                  (step, index) => {
                    const isExpanded =
                      expandedStepIds.has(step.clientId);

                    const isDeletePending =
                      pendingDeleteClientId === step.clientId;

                    return (
                      <li
                        key={step.clientId}
                        className="relative pl-12"
                      >
                        {index < steps.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-[-0.9rem] left-[1.1rem] top-10 w-px bg-brand/40"
                          />
                        )}

                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-3 flex size-9 items-center justify-center rounded-full border border-brand bg-surface text-sm font-bold text-brand"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <article className="overflow-hidden rounded-2xl border border-border bg-page-muted/25">

                          <div className="flex items-center gap-2 px-3 py-3 sm:px-4">

                            {isReorderMode && (
                              <div className="flex shrink-0 items-center gap-1">
                                <GripVertical
                                  className="size-4 text-brand"
                                  aria-hidden="true"
                                />
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() =>
                                      moveStep(index, index - 1)
                                    }
                                    aria-label={"Mover el paso " + (index + 1) + " hacia arriba"}
                                    className="rounded p-0.5 text-muted-foreground transition hover:bg-surface hover:text-brand disabled:opacity-30"
                                  >
                                    <ArrowUp
                                      className="size-3.5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={index === steps.length - 1}
                                    onClick={() =>
                                      moveStep(index, index + 1)
                                    }
                                    aria-label={"Mover el paso " + (index + 1) + " hacia abajo"}
                                    className="rounded p-0.5 text-muted-foreground transition hover:bg-surface hover:text-brand disabled:opacity-30"
                                  >
                                    <ArrowDown
                                      className="size-3.5"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              aria-expanded={isExpanded}
                              onClick={() =>
                                toggleExpanded(step.clientId)
                              }
                              className="flex min-w-0 flex-1 items-center gap-3 text-left"
                            >
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-semibold">
                                  {step.title || "Paso " + (index + 1)}
                                </span>
                                {!isExpanded && (
                                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                    {step.instructions}
                                  </span>
                                )}
                              </span>

                              {step.durationMinutes !== "" && (
                                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium sm:inline-flex">
                                  <Clock3
                                    className="size-3.5 text-brand"
                                    aria-hidden="true"
                                  />
                                  {formatMinutes(
                                    Number(step.durationMinutes),
                                  )}
                                </span>
                              )}

                              {step.tip && (
                                <Lightbulb
                                  className="hidden size-4 shrink-0 text-brand sm:block"
                                  aria-label="Incluye un consejo"
                                />
                              )}

                              {isExpanded ? (
                                <ChevronUp
                                  className="size-4 shrink-0"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronDown
                                  className="size-4 shrink-0"
                                  aria-hidden="true"
                                />
                              )}
                            </button>

                          </div>


                          {isExpanded && (
                            <div className="border-t border-border bg-surface px-4 py-4 sm:px-5">

                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {step.instructions}
                              </p>

                              <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">

                                {step.durationMinutes !== "" && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-page-muted px-2.5 py-1">
                                    <Clock3
                                      className="size-3.5 text-brand"
                                      aria-hidden="true"
                                    />
                                    {formatMinutes(
                                      Number(step.durationMinutes),
                                    )}
                                  </span>
                                )}

                                {step.tip && (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-page-muted px-2.5 py-1">
                                    <Lightbulb
                                      className="size-3.5 text-brand"
                                      aria-hidden="true"
                                    />
                                    Consejo incluido
                                  </span>
                                )}

                              </div>

                              {step.tip && (
                                <div className="mt-3 rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
                                  <p className="flex items-start gap-2 text-sm leading-6">
                                    <Lightbulb
                                      className="mt-1 size-4 shrink-0 text-brand"
                                      aria-hidden="true"
                                    />
                                    <span>
                                      {step.tip}
                                    </span>
                                  </p>
                                </div>
                              )}

                              {isDeletePending ? (
                                <div
                                  role="alert"
                                  className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <p className="text-sm text-red-800">
                                    ¿Eliminar este paso? Esta acción no se puede deshacer.
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        confirmRemoveStep(step.clientId)
                                      }
                                      className="rounded-lg bg-red-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-800"
                                    >
                                      Sí, eliminar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPendingDeleteClientId(null)
                                      }
                                      className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-semibold transition hover:bg-page-muted"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editStep(step.clientId)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-page-muted"
                                  >
                                    <Pencil
                                      className="size-3.5"
                                      aria-hidden="true"
                                    />
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      duplicateStep(step.clientId)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-page-muted"
                                  >
                                    <Copy
                                      className="size-3.5"
                                      aria-hidden="true"
                                    />
                                    Duplicar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      requestRemoveStep(step.clientId)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-50"
                                  >
                                    <Trash2
                                      className="size-3.5"
                                      aria-hidden="true"
                                    />
                                    Eliminar
                                  </button>
                                </div>
                              )}

                            </div>
                          )}

                        </article>
                      </li>
                    );
                  },
                )}
              </ol>
            )}

          </div>


          {/* STEP EDITOR */}

          <div
            id="step-editor"
            className="mt-5 rounded-2xl border border-brand/25 bg-gradient-to-br from-brand/5 via-surface to-page-muted/40 p-4 sm:p-5"
          >
            <div className="flex items-center gap-2">
              <Plus
                className="size-4 text-brand"
                aria-hidden="true"
              />
              <h3
                id="step-editor-title"
                className="font-semibold"
              >
                {editingClientId === null
                  ? "Añadir paso de elaboración"
                  : "Editar paso de elaboración"}
              </h3>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Completa los detalles de esta fase. Después podrás añadir el siguiente paso.
            </p>

            <div className="mt-4 grid gap-4">

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="step-title"
                    className="text-sm font-medium"
                  >
                    Título del paso
                    <span className="ml-1 font-normal text-muted-foreground">
                      Opcional
                    </span>
                  </label>
                  <span
                    className="text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {stepDraft.title.length}/120
                  </span>
                </div>

                <input
                  id="step-title"
                  type="text"
                  maxLength={120}
                  value={stepDraft.title}
                  onChange={(event) =>
                    setStepDraft(
                      (current) => ({
                        ...current,
                        title: event.target.value,
                      }),
                    )
                  }
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="Ej. Preparar la mezcla"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Ej. Preparar la masa, hornear o emplatar.
                </p>
              </div>


              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="step-instructions"
                    className="text-sm font-medium"
                  >
                    Instrucciones
                    <span className="ml-1 text-brand">*</span>
                  </label>
                  <span
                    className="text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {stepDraft.instructions.length}/2500
                  </span>
                </div>

                <textarea
                  id="step-instructions"
                  rows={4}
                  minLength={10}
                  maxLength={2500}
                  required
                  value={stepDraft.instructions}
                  onChange={(event) =>
                    setStepDraft(
                      (current) => ({
                        ...current,
                        instructions: event.target.value,
                      }),
                    )
                  }
                  className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                  placeholder="Explica qué hacer, cómo hacerlo y qué resultado debe obtenerse."
                />

                <p className="mt-1.5 text-xs text-muted-foreground">
                  Describe una acción concreta y el resultado que se busca. Mínimo 10 caracteres.
                </p>
              </div>


              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label
                    htmlFor="step-duration"
                    className="mb-2 block text-sm font-medium"
                  >
                    Duración aproximada
                    <span className="ml-1 font-normal text-muted-foreground">
                      Opcional
                    </span>
                  </label>

                  <div className="flex max-w-xs items-center gap-3">
                    <input
                      id="step-duration"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={stepDraft.durationMinutes}
                      onChange={(event) =>
                        setStepDraft(
                          (current) => ({
                            ...current,
                            durationMinutes: event.target.value,
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

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Indica minutos enteros si conoces la duración.
                  </p>
                </div>


                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="step-tip"
                      className="text-sm font-medium"
                    >
                      Consejo del autor
                      <span className="ml-1 font-normal text-muted-foreground">
                        Opcional
                      </span>
                    </label>
                    <span
                      className="text-xs text-muted-foreground"
                      aria-live="polite"
                    >
                      {stepDraft.tip.length}/800
                    </span>
                  </div>

                  <textarea
                    id="step-tip"
                    rows={3}
                    maxLength={800}
                    value={stepDraft.tip}
                    onChange={(event) =>
                      setStepDraft(
                        (current) => ({
                          ...current,
                          tip: event.target.value,
                        }),
                      )
                    }
                    className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                    placeholder="Trucos, recomendaciones o errores que evitar."
                  />
                </div>

              </div>

            </div>


            {editorError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {editorError}
              </p>
            )}

            {hasUnconfirmedStep && (
              <p
                role="status"
                className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>
                  {editingClientId !== null
                    ? "Los cambios de este paso aún no se han confirmado."
                    : "Este paso todavía no forma parte de la receta. Pulsa «Añadir paso» para confirmarlo."}
                </span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveStep}
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover"
              >
                {editingClientId === null ? (
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />
                ) : (
                  <Check
                    className="size-4"
                    aria-hidden="true"
                  />
                )}
                {editingClientId === null
                  ? "Añadir paso"
                  : "Guardar cambios"}
              </button>

              {editingClientId !== null && (
                <button
                  type="button"
                  onClick={clearEditor}
                  className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
                >
                  Cancelar edición
                </button>
              )}

              {draftHasContent && editingClientId === null && (
                <button
                  type="button"
                  onClick={clearEditor}
                  className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
                >
                  Descartar paso sin confirmar
                </button>
              )}
            </div>

          </div>


          {validationError && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {validationError}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}


          <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs leading-5 text-green-900">
            <Info
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <p>
              <strong>Consejo:</strong> Una acción clara por paso facilita seguir la receta.
            </p>
          </div>

        </div>


        {/* FOOTER ACTIONS */}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-page-muted/20 px-5 py-4 sm:px-6">

          <Link
            href={previousStepHref}
            onClick={handlePreviousClick}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
          >
            ← Ingredientes
          </Link>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={isSubmitting || !isDirty}
              onClick={() =>
                void persistSteps(false)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                className="size-4"
                aria-hidden="true"
              />
              {isSubmitting
                ? "Guardando..."
                : "Guardar borrador"}
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                void persistSteps(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Guardando..."
                : "Guardar y continuar"}
              <ArrowDown
                className="size-4 -rotate-90"
                aria-hidden="true"
              />
            </button>
          </div>

        </div>

      </section>


      {/* CONTEXTUAL HELP */}

      <aside className="h-fit rounded-2xl border border-border bg-surface xl:sticky xl:top-6">

        <div className="border-b border-border px-5 py-5 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            <Lightbulb
              className="size-6"
              aria-hidden="true"
            />
          </div>
          <h2 className="mt-3 font-serif text-xl font-semibold">
            Ayuda para este paso
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Consejos para explicar la elaboración.
          </p>
        </div>

        <ol className="space-y-4 px-5 py-5">
          <li className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
              1
            </span>
            <div>
              <h3 className="text-sm font-semibold">
                Una acción por paso
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Divide la receta en fases fáciles de seguir.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-800">
              2
            </span>
            <div>
              <h3 className="text-sm font-semibold">
                Sé preciso
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Indica temperaturas, texturas y técnicas.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-sm font-bold text-amber-800">
              3
            </span>
            <div>
              <h3 className="text-sm font-semibold">
                Respeta el orden
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Organiza los pasos según se realizan.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-sm font-bold text-green-800">
              4
            </span>
            <div>
              <h3 className="text-sm font-semibold">
                Comparte tus trucos
              </h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Usa los consejos para transmitir tu experiencia.
              </p>
            </div>
          </li>
        </ol>

        <div className="mx-4 mb-4 rounded-xl bg-brand/5 px-4 py-4">
          <p className="flex items-start gap-2 text-sm font-semibold">
            <Lightbulb
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            Un pequeño ejemplo
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            En lugar de «freír las patatas», explica cómo conseguir el punto perfecto.
          </p>
        </div>

        <div className="mx-4 mb-4 rounded-xl border border-border bg-page-muted/30 px-4 py-3">
          <p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground">
            <Clock3
              className="mt-0.5 size-4 shrink-0 text-brand"
              aria-hidden="true"
            />
            <span>
              El tiempo indicado suma las duraciones introducidas. Las tareas simultáneas pueden hacer que el tiempo real sea menor.
            </span>
          </p>
        </div>

      </aside>

    </div>
  );
}
