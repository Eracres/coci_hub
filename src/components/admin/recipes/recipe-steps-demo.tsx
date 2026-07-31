"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Copy,
  Lightbulb,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type RecipeStepDraft = {
  title: string;
  instructions: string;
  duration: string;
  tip: string;
};

type RecipeStep = RecipeStepDraft & {
  id: string;
};

const emptyDraft: RecipeStepDraft = {
  title: "",
  instructions: "",
  duration: "",
  tip: "",
};

const initialSteps: RecipeStep[] = [
  {
    id: "step-mix",
    title: "Preparar la mezcla",
    instructions:
      "Introduce los garbanzos, la remolacha, el ajo y las especias en un procesador de alimentos. Tritura hasta obtener una mezcla uniforme, pero sin convertirla en puré.",
    duration: "10",
    tip: "Tritura con pulsaciones cortas para conservar algo de textura.",
  },
  {
    id: "step-shape",
    title: "Formar los falafel",
    instructions:
      "Deja reposar la mezcla unos minutos y forma pequeñas bolas o discos con las manos ligeramente humedecidas.",
    duration: "15",
    tip: "",
  },
];

function createId() {
  return crypto.randomUUID();
}

export function RecipeStepsDemo() {
  const [steps, setSteps] = useState<RecipeStep[]>(initialSteps);
  const [draft, setDraft] = useState<RecipeStepDraft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isEditing = Boolean(editingId);

  function updateDraft(
    field: keyof RecipeStepDraft,
    value: string,
  ) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));

    if (field === "instructions" && value.trim().length >= 10) {
      setError("");
    }
  }

  function resetForm() {
    setDraft({ ...emptyDraft });
    setEditingId(null);
    setError("");
  }

  function submitStep() {
    if (draft.instructions.trim().length < 10) {
      setError(
        "Escribe unas instrucciones de al menos 10 caracteres.",
      );

      return;
    }

    if (draft.duration && Number(draft.duration) < 0) {
      setError("La duración no puede ser negativa.");
      return;
    }

    const normalizedStep: RecipeStepDraft = {
      title: draft.title.trim(),
      instructions: draft.instructions.trim(),
      duration: draft.duration.trim(),
      tip: draft.tip.trim(),
    };

    if (editingId) {
      setSteps((currentSteps) =>
        currentSteps.map((step) =>
          step.id === editingId
            ? {
                ...step,
                ...normalizedStep,
              }
            : step,
        ),
      );
    } else {
      setSteps((currentSteps) => [
        ...currentSteps,
        {
          id: createId(),
          ...normalizedStep,
        },
      ]);
    }

    resetForm();

    requestAnimationFrame(() => {
      document
        .getElementById("step-instructions")
        ?.focus();
    });
  }

  function editStep(step: RecipeStep) {
    setDraft({
      title: step.title,
      instructions: step.instructions,
      duration: step.duration,
      tip: step.tip,
    });

    setEditingId(step.id);
    setError("");

    requestAnimationFrame(() => {
      document
        .getElementById("step-title")
        ?.focus();
    });
  }

  function duplicateStep(step: RecipeStep) {
    setDraft({
      title: step.title,
      instructions: step.instructions,
      duration: step.duration,
      tip: step.tip,
    });

    setEditingId(null);
    setError("");

    requestAnimationFrame(() => {
      document
        .getElementById("step-title")
        ?.focus();
    });
  }

  function removeStep(stepId: string) {
    setSteps((currentSteps) =>
      currentSteps.filter((step) => step.id !== stepId),
    );

    if (editingId === stepId) {
      resetForm();
    }
  }

  function moveStep(
    stepIndex: number,
    direction: "up" | "down",
  ) {
    setSteps((currentSteps) => {
      const destinationIndex =
        direction === "up"
          ? stepIndex - 1
          : stepIndex + 1;

      if (
        destinationIndex < 0 ||
        destinationIndex >= currentSteps.length
      ) {
        return currentSteps;
      }

      const reorderedSteps = [...currentSteps];

      const [movedStep] = reorderedSteps.splice(stepIndex, 1);

      reorderedSteps.splice(
        destinationIndex,
        0,
        movedStep,
      );

      return reorderedSteps;
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(300px,420px)_1fr]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitStep();
        }}
        className="
          self-start rounded-lg border border-border
          bg-page p-5 shadow-[var(--shadow-sm)]
          lg:sticky lg:top-6
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold">
              {isEditing
                ? "Editar paso"
                : "Nuevo paso"}
            </h3>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {isEditing
                ? "Modifica los datos y guarda los cambios."
                : "Describe una acción concreta de la elaboración."}
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              aria-label="Cancelar edición del paso"
              className="
                inline-flex size-10 shrink-0
                items-center justify-center rounded-md
                border border-border bg-surface
                transition-colors hover:bg-page-muted
              "
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-5">
          <div>
            <label
              htmlFor="step-title"
              className="mb-2 block text-sm font-semibold"
            >
              Título del paso
            </label>

            <Input
              id="step-title"
              value={draft.title}
              onChange={(event) =>
                updateDraft("title", event.target.value)
              }
              placeholder="Ej. Preparar la mezcla"
              maxLength={100}
            />

            <p className="mt-2 text-sm text-muted-foreground">
              Es opcional, pero ayuda a organizar la receta.
            </p>
          </div>

          <div>
            <label
              htmlFor="step-instructions"
              className="mb-2 block text-sm font-semibold"
            >
              Instrucciones
              <span
                aria-hidden="true"
                className="ml-1 text-error"
              >
                *
              </span>
            </label>

            <Textarea
              id="step-instructions"
              value={draft.instructions}
              onChange={(event) =>
                updateDraft(
                  "instructions",
                  event.target.value,
                )
              }
              placeholder="Explica claramente qué debe hacerse..."
              className="min-h-40"
              hasError={Boolean(error)}
              aria-describedby={
                error ? "step-instructions-error" : undefined
              }
              maxLength={2000}
            />

            <div className="mt-2">
              <FormError
                id="step-instructions-error"
                message={error}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="step-duration"
              className="mb-2 block text-sm font-semibold"
            >
              Duración estimada
            </label>

            <div className="relative">
              <Input
                id="step-duration"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                value={draft.duration}
                onChange={(event) =>
                  updateDraft(
                    "duration",
                    event.target.value,
                  )
                }
                placeholder="Ej. 10"
                className="pr-24"
              />

              <span
                className="
                  pointer-events-none absolute right-4 top-1/2
                  -translate-y-1/2 text-sm
                  text-muted-foreground
                "
              >
                minutos
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="step-tip"
              className="mb-2 block text-sm font-semibold"
            >
              Consejo
            </label>

            <Textarea
              id="step-tip"
              value={draft.tip}
              onChange={(event) =>
                updateDraft("tip", event.target.value)
              }
              placeholder="Ej. No tritures demasiado la mezcla."
              className="min-h-28"
              maxLength={500}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="submit">
            {isEditing ? (
              <Pencil
                aria-hidden="true"
                className="size-4"
              />
            ) : (
              <Plus
                aria-hidden="true"
                className="size-4"
              />
            )}

            {isEditing
              ? "Guardar cambios"
              : "Agregar paso"}
          </Button>

          {isEditing && (
            <Button
              type="button"
              variant="tertiary"
              onClick={resetForm}
            >
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div>
        <div>
          <h3 className="font-serif text-xl font-bold">
            Pasos añadidos
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {steps.length}{" "}
            {steps.length === 1 ? "paso" : "pasos"} en la elaboración
          </p>
        </div>

        {steps.length === 0 ? (
          <div
            className="
              mt-5 rounded-lg border border-dashed
              border-border-strong bg-page p-8 text-center
            "
          >
            <p className="font-semibold">
              Todavía no hay pasos
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Utiliza el formulario para añadir el primero.
            </p>
          </div>
        ) : (
          <ol className="mt-5 space-y-4">
            {steps.map((step, stepIndex) => (
              <li
                key={step.id}
                className={`
                  rounded-lg border bg-surface p-5
                  shadow-[var(--shadow-xs)]
                  ${
                    editingId === step.id
                      ? "border-brand ring-[3px] ring-brand/10"
                      : "border-border"
                  }
                `}
              >
                <div className="flex gap-4">
                  <span
                    className="
                      flex size-10 shrink-0 items-center
                      justify-center rounded-full bg-brand
                      font-serif text-lg font-bold text-inverse
                    "
                  >
                    {stepIndex + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    {step.title && (
                      <h4 className="font-serif text-lg font-bold">
                        {step.title}
                      </h4>
                    )}

                    <p
                      className={`
                        whitespace-pre-line leading-relaxed
                        text-foreground
                        ${step.title ? "mt-2" : ""}
                      `}
                    >
                      {step.instructions}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-3">
                      {step.duration && (
                        <span
                          className="
                            inline-flex items-center gap-2
                            rounded-full bg-page-muted
                            px-3 py-1.5 text-sm font-medium
                            text-muted-foreground
                          "
                        >
                          <Clock3
                            aria-hidden="true"
                            className="size-4"
                          />
                          {step.duration} min
                        </span>
                      )}
                    </div>

                    {step.tip && (
                      <div
                        className="
                          mt-4 flex gap-3 rounded-md
                          border border-accent/40
                          bg-accent/10 p-4
                        "
                      >
                        <Lightbulb
                          aria-hidden="true"
                          className="mt-0.5 size-5 shrink-0 text-warning"
                        />

                        <div>
                          <p className="text-sm font-semibold">
                            Consejo
                          </p>

                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {step.tip}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => editStep(step)}
                  >
                    <Pencil
                      aria-hidden="true"
                      className="size-4"
                    />
                    Editar
                  </Button>

                  <button
                    type="button"
                    onClick={() => duplicateStep(step)}
                    aria-label={`Duplicar paso ${stepIndex + 1}`}
                    className="
                      inline-flex size-10 items-center
                      justify-center rounded-md border
                      border-border bg-surface
                      transition-colors hover:bg-page-muted
                    "
                  >
                    <Copy
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveStep(stepIndex, "up")
                    }
                    disabled={stepIndex === 0}
                    aria-label={`Subir paso ${stepIndex + 1}`}
                    className="
                      inline-flex size-10 items-center
                      justify-center rounded-md border
                      border-border bg-surface
                      transition-colors hover:bg-page-muted
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ArrowUp
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      moveStep(stepIndex, "down")
                    }
                    disabled={stepIndex === steps.length - 1}
                    aria-label={`Bajar paso ${stepIndex + 1}`}
                    className="
                      inline-flex size-10 items-center
                      justify-center rounded-md border
                      border-border bg-surface
                      transition-colors hover:bg-page-muted
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ArrowDown
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    aria-label={`Eliminar paso ${stepIndex + 1}`}
                    className="
                      inline-flex size-10 items-center
                      justify-center rounded-md border
                      border-error/40 bg-surface text-error
                      transition-colors hover:bg-error/10
                    "
                  >
                    <Trash2
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}