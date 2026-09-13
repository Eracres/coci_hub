"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  deleteRecipeAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import type {
  RecipeStatus,
} from "@/schemas/recipe-publication-schema";


type RecipeDeleteFormProps = {
  recipeId:
    string;

  recipeTitle:
    string;

  status:
    RecipeStatus;
};


export function RecipeDeleteForm({
  recipeId,
  recipeTitle,
  status,
}: RecipeDeleteFormProps) {
  const router =
    useRouter();


  const [
    confirmation,
    setConfirmation,
  ] =
    useState(
      "",
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(
      false,
    );


  const isPublished =
    status ===
    "published";


  const titleMatches =
    confirmation ===
    recipeTitle;


  const canDelete =
    !isPublished &&
    titleMatches &&
    !isDeleting;


  async function handleDelete() {
    if (
      !canDelete
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Esta acción eliminará definitivamente "${recipeTitle}" y sus datos relacionados. ¿Quieres continuar?`,
      );


    if (
      !confirmed
    ) {
      return;
    }


    setIsDeleting(
      true,
    );

    setMessage(
      null,
    );


    try {
      const result =
        await deleteRecipeAction(
          recipeId,
          confirmation,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
            "No se pudo eliminar la receta.",
        );

        return;
      }


      /*
       * La receta ya no existe.
       * Salimos de /edit antes de refrescar.
       */
      router.push(
        "/admin/recipes",
      );

      router.refresh();
    } finally {
      setIsDeleting(
        false,
      );
    }
  }


  return (
    <section className="rounded-xl border p-6">

      <div>
        <p className="text-sm font-medium">
          Zona peligrosa
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Eliminar receta
        </h2>

        <p className="mt-2 text-sm">
          Esta acción es permanente. Se eliminarán la receta y sus relaciones asociadas.
        </p>
      </div>


      {isPublished ? (
        <div className="mt-6 rounded-lg border p-4">

          <p className="font-medium">
            No puedes eliminar una receta publicada.
          </p>

          <p className="mt-2 text-sm">
            Despublícala o archívala primero desde el bloque de Publicación.
          </p>

        </div>
      ) : (
        <>
          <div className="mt-6 rounded-lg border p-4">

            <p className="text-sm">
              Para confirmar, escribe exactamente:
            </p>

            <p className="mt-2 font-semibold">
              {recipeTitle}
            </p>


            <label
              htmlFor="delete-recipe-confirmation"
              className="mt-5 block text-sm font-medium"
            >
              Título de la receta
            </label>

            <input
              id="delete-recipe-confirmation"
              type="text"
              value={
                confirmation
              }
              onChange={(
                event,
              ) => {
                setConfirmation(
                  event.target.value,
                );

                setMessage(
                  null,
                );
              }}
              autoComplete="off"
              className="mt-2 w-full rounded-lg border px-4 py-3"
              placeholder={
                recipeTitle
              }
            />

          </div>


          <div className="mt-6">

            <button
              type="button"
              disabled={
                !canDelete
              }
              onClick={
                handleDelete
              }
              className="rounded-lg border px-5 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isDeleting
                ? "Eliminando..."
                : "Eliminar receta definitivamente"}
            </button>

          </div>
        </>
      )}


      {message && (
        <p
          role="status"
          className="mt-4 text-sm"
        >
          {message}
        </p>
      )}

    </section>
  );
}