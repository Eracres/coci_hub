"use client";

import {
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


function getStatusLabel(
  status: RecipeStatus,
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
      (requirement) =>
        !requirement.valid,
    ).length;


  return (
    <section className="rounded-xl border p-6">

      <div>
        <h2 className="text-xl font-semibold">
          Publicación
        </h2>

        <p className="mt-1 text-sm">
          Revisa que la receta esté completa antes de hacerla pública.
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


        <div className="mt-4 space-y-2">

          {readiness.requirements.map(
            (
              requirement,
            ) => (
              <div
                key={
                  requirement.key
                }
                className="flex items-center gap-3 rounded-lg border px-4 py-3"
              >

                <span
                  aria-hidden="true"
                  className="font-semibold"
                >
                  {requirement.valid
                    ? "✓"
                    : "✕"}
                </span>


                <span>
                  {
                    requirement.label
                  }
                </span>

              </div>
            ),
          )}

        </div>

      </div>


      {/* =============================================
          READINESS MESSAGE
      ============================================= */}

      <div className="mt-6 rounded-lg border p-4">

        {readiness.canPublish ? (
          <>
            <p className="font-semibold">
              La receta está lista para publicarse.
            </p>

            <p className="mt-1 text-sm">
              Todos los requisitos obligatorios están completos.
            </p>
          </>
        ) : (
          <>
            <p className="font-semibold">
              La receta todavía no puede publicarse.
            </p>

            <p className="mt-1 text-sm">
              Faltan{" "}
              {missingCount}{" "}
              requisito
              {missingCount ===
              1
                ? ""
                : "s"}.
            </p>
          </>
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
          Los campos de información adicional y alérgenos son opcionales y no bloquean la publicación.
        </p>

      </div>

    </section>
  );
}