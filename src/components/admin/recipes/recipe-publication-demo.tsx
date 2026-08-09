"use client";

import { useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  FilePenLine,
  Globe2,
  RotateCcw,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type RecipeStatus =
  | "draft"
  | "published"
  | "archived";

type PublicationRequirement = {
  id: string;
  label: string;
  completed: boolean;
};

const initialRequirements: PublicationRequirement[] = [
  {
    id: "title",
    label: "Título de la receta",
    completed: true,
  },
  {
    id: "description",
    label: "Descripción corta",
    completed: true,
  },
  {
    id: "image",
    label: "Imagen principal",
    completed: true,
  },
  {
    id: "servings",
    label: "Raciones base",
    completed: true,
  },
  {
    id: "classification",
    label: "Tipo y categoría",
    completed: true,
  },
  {
    id: "ingredients",
    label: "Al menos un ingrediente",
    completed: true,
  },
  {
    id: "steps",
    label: "Al menos un paso de elaboración",
    completed: false,
  },
];

function getStatusLabel(
  status: RecipeStatus,
) {
  switch (status) {
    case "published":
      return "Publicada";

    case "archived":
      return "Archivada";

    default:
      return "Borrador";
  }
}

function getStatusClasses(
  status: RecipeStatus,
) {
  switch (status) {
    case "published":
      return "bg-success/10 text-success border-success/20";

    case "archived":
      return "bg-page-muted text-muted-foreground border-border";

    default:
      return "bg-warning/10 text-warning border-warning/20";
  }
}

export function RecipePublicationDemo() {
  const [status, setStatus] =
    useState<RecipeStatus>("draft");

  const [requirements, setRequirements] =
    useState<PublicationRequirement[]>(
      initialRequirements,
    );

  const [feedback, setFeedback] =
    useState("");

  const completedRequirements =
    requirements.filter(
      (requirement) =>
        requirement.completed,
    ).length;

  const totalRequirements =
    requirements.length;

  const canPublish =
    completedRequirements ===
    totalRequirements;

  function toggleRequirement(
    requirementId: string,
  ) {
    setRequirements(
      (currentRequirements) =>
        currentRequirements.map(
          (requirement) =>
            requirement.id ===
            requirementId
              ? {
                  ...requirement,
                  completed:
                    !requirement.completed,
                }
              : requirement,
        ),
    );

    setFeedback("");
  }

  function saveDraft() {
    setStatus("draft");

    setFeedback(
      "Borrador guardado correctamente.",
    );
  }

  function previewRecipe() {
    setFeedback(
      "La previsualización se abriría en una ruta privada.",
    );
  }

  function publishRecipe() {
    if (!canPublish) {
      setFeedback(
        "No se puede publicar todavía. Revisa los requisitos pendientes.",
      );

      return;
    }

    setStatus("published");

    setFeedback(
      "Receta publicada correctamente.",
    );
  }

  function unpublishRecipe() {
    setStatus("draft");

    setFeedback(
      "La receta ha vuelto al estado de borrador.",
    );
  }

  function archiveRecipe() {
    setStatus("archived");

    setFeedback(
      "La receta ha sido archivada.",
    );
  }

  function restoreRecipe() {
    setStatus("draft");

    setFeedback(
      "La receta se ha restaurado como borrador.",
    );
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      {/* Cabecera */}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold">
            Publicación
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Revisa el estado de la receta,
            comprueba los requisitos y decide
            cuándo debe estar disponible
            públicamente.
          </p>
        </div>

        <span
          className={`
            inline-flex w-fit items-center
            rounded-full border px-3 py-1.5
            text-sm font-semibold
            ${getStatusClasses(status)}
          `}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      {/* Estado actual */}

      <div className="mt-8 rounded-lg border border-border bg-page p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-page-muted text-brand">
            {status === "published" ? (
              <Globe2
                aria-hidden="true"
                className="size-5"
              />
            ) : status ===
              "archived" ? (
              <Archive
                aria-hidden="true"
                className="size-5"
              />
            ) : (
              <FilePenLine
                aria-hidden="true"
                className="size-5"
              />
            )}
          </span>

          <div>
            <p className="font-semibold">
              Estado actual:{" "}
              {getStatusLabel(status)}
            </p>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {status === "published" &&
                "La receta está disponible en la web pública."}

              {status === "draft" &&
                "La receta todavía no es visible para los visitantes."}

              {status === "archived" &&
                "La receta se conserva en administración, pero no está disponible públicamente."}
            </p>
          </div>
        </div>
      </div>

      {/* Requisitos */}

      <div className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h4 className="font-serif text-lg font-bold">
              Requisitos de publicación
            </h4>

            <p className="mt-1 text-sm text-muted-foreground">
              La receta deberá cumplir todos
              estos requisitos antes de
              publicarse.
            </p>
          </div>

          <p className="text-sm font-semibold">
            {completedRequirements} /{" "}
            {totalRequirements} completados
          </p>
        </div>

        {/* Barra */}

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-page-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-success transition-[width] duration-300"
            style={{
              width: `${
                (completedRequirements /
                  totalRequirements) *
                100
              }%`,
            }}
          />
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {requirements.map(
            (requirement) => (
              <li key={requirement.id}>
                <button
                  type="button"
                  onClick={() =>
                    toggleRequirement(
                      requirement.id,
                    )
                  }
                  className={`
                    flex min-h-14 w-full
                    items-center gap-3
                    rounded-lg border p-3
                    text-left transition-colors
                    ${
                      requirement.completed
                        ? "border-success/20 bg-success/5"
                        : "border-warning/30 bg-warning/5"
                    }
                  `}
                >
                  <span
                    className={`
                      flex size-8 shrink-0
                      items-center justify-center
                      rounded-full
                      ${
                        requirement.completed
                          ? "bg-success text-inverse"
                          : "bg-warning/10 text-warning"
                      }
                    `}
                  >
                    {requirement.completed ? (
                      <Check
                        aria-hidden="true"
                        className="size-4"
                      />
                    ) : (
                      <CircleAlert
                        aria-hidden="true"
                        className="size-4"
                      />
                    )}
                  </span>

                  <span className="text-sm font-medium">
                    {requirement.label}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>

        <p className="mt-3 text-xs text-muted-foreground">
          En esta demostración puedes pulsar
          los requisitos para simular campos
          completos o pendientes.
        </p>
      </div>

      {/* Resultado de validación */}

      <div
        className={`
          mt-8 flex gap-3 rounded-lg border
          p-4
          ${
            canPublish
              ? "border-success/30 bg-success/5"
              : "border-warning/30 bg-warning/5"
          }
        `}
      >
        {canPublish ? (
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-success"
          />
        ) : (
          <CircleAlert
            aria-hidden="true"
            className="mt-0.5 size-5 shrink-0 text-warning"
          />
        )}

        <div>
          <p className="text-sm font-semibold">
            {canPublish
              ? "La receta está preparada para publicarse"
              : "La receta todavía tiene información pendiente"}
          </p>

          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {canPublish
              ? "Todos los campos obligatorios cumplen los requisitos de publicación."
              : "Puedes seguir guardándola como borrador hasta completar la información necesaria."}
          </p>
        </div>
      </div>

      {/* Acciones */}

      <div className="mt-8 border-t border-border pt-6">
        <h4 className="text-sm font-semibold">
          Acciones
        </h4>

        <div className="mt-4 flex flex-wrap gap-3">
          {status === "draft" && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={saveDraft}
              >
                <Save
                  aria-hidden="true"
                  className="size-4"
                />

                Guardar borrador
              </Button>

              <Button
                type="button"
                variant="tertiary"
                onClick={previewRecipe}
              >
                <Eye
                  aria-hidden="true"
                  className="size-4"
                />

                Previsualizar
              </Button>

              <Button
                type="button"
                onClick={publishRecipe}
                disabled={!canPublish}
              >
                <Globe2
                  aria-hidden="true"
                  className="size-4"
                />

                Publicar
              </Button>
            </>
          )}

          {status === "published" && (
            <>
              <Button
                type="button"
                variant="tertiary"
                onClick={previewRecipe}
              >
                <Eye
                  aria-hidden="true"
                  className="size-4"
                />

                Ver receta
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={unpublishRecipe}
              >
                <FilePenLine
                  aria-hidden="true"
                  className="size-4"
                />

                Despublicar
              </Button>

              <Button
                type="button"
                variant="tertiary"
                onClick={archiveRecipe}
              >
                <Archive
                  aria-hidden="true"
                  className="size-4"
                />

                Archivar
              </Button>
            </>
          )}

          {status === "archived" && (
            <Button
              type="button"
              variant="secondary"
              onClick={restoreRecipe}
            >
              <RotateCcw
                aria-hidden="true"
                className="size-4"
              />

              Restaurar como borrador
            </Button>
          )}
        </div>
      </div>

      {/* Feedback temporal */}

      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="mt-6 rounded-lg border border-info/30 bg-info/5 p-4"
        >
          <p className="text-sm font-medium">
            {feedback}
          </p>
        </div>
      )}
    </section>
  );
}