"use client";

import { useState } from "react";

import {
  deleteRecipeImage,
  getRecipeImageUrl,
  uploadRecipeImage,
} from "@/services/storage/recipe-images";

export function StorageTestForm() {
  const [file, setFile] =
    useState<File | null>(null);

  const [imagePath, setImagePath] =
    useState<string | null>(null);

  const [imageUrl, setImageUrl] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  async function handleUpload() {
    if (!file) {
      setMessage(
        "Selecciona primero una imagen.",
      );

      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);

      /*
       * UUID temporal exclusivamente para esta
       * prueba de Storage.
       */
      const testRecipeId =
        crypto.randomUUID();

      const path =
        await uploadRecipeImage(
          testRecipeId,
          file,
        );

      const publicUrl =
        getRecipeImageUrl(path);

      setImagePath(path);
      setImageUrl(publicUrl);

      setMessage(
        "Imagen subida correctamente.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ha ocurrido un error inesperado.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!imagePath) {
      return;
    }

    try {
      setIsLoading(true);
      setMessage(null);

      await deleteRecipeImage(
        imagePath,
      );

      setImagePath(null);
      setImageUrl(null);
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
    <div className="space-y-6">
      <div>
        <label
          htmlFor="storage-image"
          className="mb-2 block font-medium"
        >
          Imagen
        </label>

        <input
          id="storage-image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            setFile(
              event.target.files?.[0] ??
                null,
            );
          }}
        />
      </div>

      {file && (
        <div className="text-sm">
          <p>
            <strong>
              Archivo:
            </strong>{" "}
            {file.name}
          </p>

          <p>
            <strong>
              Tipo:
            </strong>{" "}
            {file.type}
          </p>

          <p>
            <strong>
              Tamaño:
            </strong>{" "}
            {(
              file.size /
              1024 /
              1024
            ).toFixed(2)}{" "}
            MB
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={
          !file ||
          isLoading
        }
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isLoading
          ? "Procesando..."
          : "Subir imagen"}
      </button>

      {message && (
        <p className="text-sm">
          {message}
        </p>
      )}

      {imagePath && (
        <div>
          <p className="text-sm">
            <strong>
              Storage path:
            </strong>
          </p>

          <code className="text-sm">
            {imagePath}
          </code>
        </div>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <img
            src={imageUrl}
            alt="Prueba Supabase Storage"
            className="max-w-md rounded-xl border"
          />

          <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className="rounded-lg border px-4 py-2"
          >
            Eliminar imagen
          </button>
        </div>
      )}
    </div>
  );
}