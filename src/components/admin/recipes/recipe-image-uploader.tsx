"use client";

import { useState } from "react";

import {
  deleteRecipeImage,
  getRecipeImageUrl,
  uploadRecipeImage,
} from "@/services/storage/recipe-images";

import {
  updateRecipeImageAction,
} from "@/app/admin/recipes/[id]/edit/actions";

type RecipeImageUploaderProps = {
  recipeId: string;
  initialImagePath: string | null;
};

export function RecipeImageUploader({
  recipeId,
  initialImagePath,
}: RecipeImageUploaderProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [imagePath, setImagePath] =
    useState<string | null>(
      initialImagePath,
    );

  const [message, setMessage] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const imageUrl =
    imagePath
      ? getRecipeImageUrl(imagePath)
      : null;

  async function handleUpload() {
    if (!file) {
      setMessage(
        "Selecciona una imagen.",
      );
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const previousPath =
      imagePath;

    try {
      const newPath =
        await uploadRecipeImage(
          recipeId,
          file,
        );

      await updateRecipeImageAction(
        recipeId,
        newPath,
      );

      /*
       * Si cambiamos de extensión:
       * main.jpg → main.webp
       *
       * eliminamos el archivo anterior.
       */
      if (
        previousPath &&
        previousPath !== newPath
      ) {
        try {
          await deleteRecipeImage(
            previousPath,
          );
        } catch {
          /*
           * La receta ya apunta correctamente
           * a la imagen nueva.
           *
           * Si falla la limpieza del archivo
           * antiguo no rompemos la receta.
           */
        }
      }

      setImagePath(newPath);
      setFile(null);

      setMessage(
        "Imagen guardada correctamente.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la imagen.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!imagePath) {
      return;
    }

    const pathToDelete =
      imagePath;

    setIsLoading(true);
    setMessage(null);

    try {
      /*
       * Primero quitamos la referencia
       * de PostgreSQL.
       */
      await updateRecipeImageAction(
        recipeId,
        null,
      );

      /*
       * Después eliminamos el archivo.
       *
       * Si Storage fallase, quedaría un
       * archivo huérfano, pero nunca una
       * receta apuntando a un archivo
       * inexistente.
       */
      await deleteRecipeImage(
        pathToDelete,
      );

      setImagePath(null);
      setFile(null);

      setMessage(
        "Imagen eliminada correctamente.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="space-y-6 rounded-xl border p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Imagen principal
        </h2>

        <p className="mt-1 text-sm">
          JPEG, PNG o WebP. Máximo 5 MB.
        </p>
      </div>

      {imageUrl && (
        <div className="space-y-3">
          {/* Preview temporal. Más adelante usaremos next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Imagen principal de la receta"
            className="max-h-80 rounded-xl border object-cover"
          />

          <code className="block text-xs">
            {imagePath}
          </code>
        </div>
      )}

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={isLoading}
        onChange={(event) => {
          setFile(
            event.target.files?.[0] ??
              null,
          );
        }}
      />

      {file && (
        <div className="text-sm">
          <p>{file.name}</p>

          <p>
            {(
              file.size /
              1024 /
              1024
            ).toFixed(2)}{" "}
            MB
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={
            !file ||
            isLoading
          }
          onClick={handleUpload}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isLoading
            ? "Procesando..."
            : imagePath
              ? "Cambiar imagen"
              : "Subir imagen"}
        </button>

        {imagePath && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDelete}
            className="rounded-lg border px-4 py-2"
          >
            Eliminar imagen
          </button>
        )}
      </div>

      {message && (
        <p
          role="status"
          className="text-sm"
        >
          {message}
        </p>
      )}
    </section>
  );
}