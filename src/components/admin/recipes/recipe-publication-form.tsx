"use client";

import {
  ArrowRight,
  Check,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeStatusAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import type {
  PublicationReadiness,
} from "@/lib/recipes/get-publication-readiness";

import type {
  RecipeStatus,
} from "@/schemas/recipe-publication-schema";


type RecipePublicationFormProps = {
  recipeId:
    string;

  status:
    RecipeStatus;

  readiness:
    PublicationReadiness;
};


const requirementTargets:
Record<string, string> = {
  title:
    "title",

  slug:
    "slug",

  "short-description":
    "shortDescription",

  "main-image":
    "publication-main-image",

  "recipe-type":
    "recipeTypeId",

  difficulty:
    "difficulty",

  "base-servings":
    "baseServings",

  "preparation-time":
    "preparationMinutes",

  category:
    "publication-category",

  ingredient:
    "publication-ingredient",

  step:
    "publication-step",
};


function getStatusLabel(
  status:
    RecipeStatus,
) {
  if (
    status ===
    "published"
  ) {
    return "Publicada";
  }


  if (
    status ===
    "archived"
  ) {
    return "Archivada";
  }


  return "Borrador";
}


export function RecipePublicationForm({
  recipeId,
  status,
  readiness,
}: RecipePublicationFormProps) {
  const router =
    useRouter();


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  /*
   * Si el usuario corrige un requisito,
   * guarda el formulario y el servidor
   * actualiza readiness, quitamos el hash
   * anterior para que un campo ya válido
   * no siga apareciendo resaltado en rojo.
   */
  useEffect(() => {
    const currentTarget =
      window.location.hash.replace(
        "#",
        "",
      );


    if (
      !currentTarget
    ) {
      return;
    }


    const targetRequirement =
      readiness.requirements.find(
        (
          requirement,
        ) =>
          requirementTargets[
            requirement.key
          ] ===
          currentTarget,
      );


    if (
      !targetRequirement?.valid
    ) {
      return;
    }


    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, [
    readiness,
  ]);


  async function changeStatus(
    nextStatus:
      RecipeStatus,
  ) {
    setMessage(
      null,
    );

    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeStatusAction(
          recipeId,
          nextStatus,
        );


      setMessage(
        result.message ??
          null,
      );


      if (
        result.success
      ) {
        router.refresh();
      }
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  const missingCount =
    readiness.requirements.filter(
      (
        requirement,
      ) =>
        !requirement.valid,
    ).length;


  return (
    <section className="rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Publicación
        </h2>

        <p className="mt-1 text-sm">
          Revisa que la receta esté
          completa antes de hacerla
          pública.
        </p>
      </div>


      {/* =============================================
          CURRENT STATUS
      ============================================= */}

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">
          Estado actual
        </p>

        <p className="mt-1 text-xl font-semibold">
          {getStatusLabel(
            status,
          )}
        </p>
      </div>


      {/* =============================================
          CHECKLIST
      ============================================= */}

      <div className="mt-6">
        <h3 className="font-semibold">
          Requisitos para publicar
        </h3>


        <p className="mt-1 text-sm text-muted-foreground">
          Los requisitos pendientes
          pueden pulsarse para ir
          directamente al campo que
          debes completar.
        </p>


        <div className="mt-4 space-y-2">
          {readiness.requirements.map(
            (
              requirement,
            ) => {
              const targetId =
                requirementTargets[
                  requirement.key
                ];


              if (
                requirement.valid
              ) {
                return (
                  <div
                    key={
                      requirement.key
                    }
                    className="flex items-center gap-3 rounded-xl border border-success bg-success/5 px-4 py-3"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                    >
                      <Check
                        className="size-4"
                        strokeWidth={
                          3
                        }
                      />
                    </span>


                    <span className="font-medium text-foreground">
                      {
                        requirement.label
                      }
                    </span>
                  </div>
                );
              }


              return (
                <a
                  key={
                    requirement.key
                  }
                  href={
                    targetId
                      ? `#${targetId}`
                      : "#"
                  }
                  className="group flex items-center gap-3 rounded-xl border border-error bg-error/5 px-4 py-3 transition hover:bg-error/10"
                  aria-label={`Corregir: ${requirement.label}`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-error/10 text-error"
                  >
                    <X
                      className="size-4"
                      strokeWidth={
                        3
                      }
                    />
                  </span>


                  <span className="min-w-0 flex-1 font-medium text-foreground">
                    {
                      requirement.label
                    }
                  </span>


                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-error">
                    Corregir

                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </a>
              );
            },
          )}
        </div>
      </div>


      {/* =============================================
          READINESS MESSAGE
      ============================================= */}

      <div
        className={
          readiness.canPublish
            ? "mt-6 rounded-xl border border-success bg-success/5 p-4"
            : "mt-6 rounded-xl border border-error bg-error/5 p-4"
        }
      >
        {readiness.canPublish ? (
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
              <Check
                className="size-4"
                strokeWidth={
                  3
                }
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-success">
                La receta está lista
                para publicarse.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Todos los requisitos
                obligatorios están
                completos.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
              <X
                className="size-4"
                strokeWidth={
                  3
                }
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-semibold text-error">
                La receta todavía no
                puede publicarse.
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Faltan{" "}
                {missingCount}{" "}
                requisito
                {missingCount ===
                1
                  ? ""
                  : "s"}
                .
              </p>
            </div>
          </div>
        )}
      </div>


      {/* =============================================
          ACTIONS
      ============================================= */}

      <div className="mt-6 flex flex-wrap gap-3">
        {status ===
          "draft" && (
          <>
            <button
              type="button"
              disabled={
                isSubmitting ||
                !readiness.canPublish
              }
              onClick={() =>
                changeStatus(
                  "published",
                )
              }
              className="rounded-lg bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSubmitting
                ? "Procesando..."
                : "Publicar receta"}
            </button>


            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() =>
                changeStatus(
                  "archived",
                )
              }
              className="rounded-lg border px-5 py-3"
            >
              Archivar
            </button>
          </>
        )}


        {status ===
          "published" && (
          <>
            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() =>
                changeStatus(
                  "draft",
                )
              }
              className="rounded-lg border px-5 py-3"
            >
              Despublicar
            </button>


            <button
              type="button"
              disabled={
                isSubmitting
              }
              onClick={() =>
                changeStatus(
                  "archived",
                )
              }
              className="rounded-lg border px-5 py-3"
            >
              Archivar
            </button>
          </>
        )}


        {status ===
          "archived" && (
          <button
            type="button"
            disabled={
              isSubmitting
            }
            onClick={() =>
              changeStatus(
                "draft",
              )
            }
            className="rounded-lg border px-5 py-3"
          >
            Restaurar como borrador
          </button>
        )}
      </div>


      {message && (
        <p
          role="status"
          className="mt-4 text-sm"
        >
          {message}
        </p>
      )}


      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm">
          Los campos de información
          adicional y alérgenos son
          opcionales y no bloquean la
          publicación.
        </p>
      </div>
    </section>
  );
}