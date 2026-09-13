"use client";

import {
  useRef,
  useState,
} from "react";

import {
  deleteRecipeImage,
  getRecipeImageUrl,
  uploadRecipeImage,
} from "@/services/storage/recipe-images";

import {
  updateRecipeImageAction,
} from "@/app/admin/recipes/[id]/edit/actions";


type RecipeImageUploaderProps = {
  recipeId:
    string;

  initialImagePath:
    string | null;
};


export function RecipeImageUploader({
  recipeId,
  initialImagePath,
}: RecipeImageUploaderProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null,
    );


  const [
    imagePath,
    setImagePath,
  ] =
    useState<
      string | null
    >(
      initialImagePath,
    );


  /*
   * Cache busting.
   *
   * Cambiamos este número cada vez
   * que subimos una fotografía.
   */
  const [
    imageVersion,
    setImageVersion,
  ] =
    useState(
      () =>
        Date.now(),
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
    isLoading,
    setIsLoading,
  ] =
    useState(
      false,
    );


  const imageUrl =
    imagePath
      ? getRecipeImageUrl(
          imagePath,
          imageVersion,
        )
      : null;


  function clearFileInput() {
    setFile(
      null,
    );


    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }


  /* =======================================================
     UPLOAD / REPLACE
  ======================================================= */

  async function handleUpload() {
    if (!file) {
      setMessage(
        "Selecciona una imagen.",
      );

      return;
    }


    setIsLoading(
      true,
    );

    setMessage(
      null,
    );


    const previousPath =
      imagePath;


    let newPath:
      string | null =
      null;


    try {
      /*
       * 1. Subimos el nuevo archivo.
       *
       * Si mantiene extensión, upsert
       * sustituirá el objeto existente.
       */
      newPath =
        await uploadRecipeImage(
          recipeId,
          file,
        );


      /*
       * 2. Actualizamos PostgreSQL.
       */
      await updateRecipeImageAction(
        recipeId,
        newPath,
      );


      /*
       * 3. Actualizamos inmediatamente
       *    la interfaz.
       */
      setImagePath(
        newPath,
      );


      /*
       * Forzamos una URL diferente para
       * impedir que navegador/CDN utilicen
       * la imagen anterior desde caché.
       */
      setImageVersion(
        Date.now(),
      );


      clearFileInput();


      /*
       * 4. Si la extensión cambió:
       *
       * main.jpg
       *    ↓
       * main.webp
       *
       * PostgreSQL ya apunta a la nueva,
       * por lo que podemos limpiar la vieja.
       */
      if (
        previousPath &&
        previousPath !==
          newPath
      ) {
        try {
          await deleteRecipeImage(
            previousPath,
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "OLD RECIPE IMAGE CLEANUP ERROR:",
            cleanupError,
          );


          setMessage(
            "La imagen nueva se guardó correctamente, aunque no se pudo limpiar el archivo anterior de Storage.",
          );

          return;
        }
      }


      setMessage(
        previousPath
          ? "Imagen cambiada correctamente."
          : "Imagen guardada correctamente.",
      );
    } catch (
      error
    ) {
      /*
       * Si hemos creado un archivo nuevo
       * con otra extensión pero PostgreSQL
       * no pudo actualizarse, intentamos
       * limpiar ese objeto huérfano.
       */
      if (
        newPath &&
        newPath !==
          previousPath
      ) {
        try {
          await deleteRecipeImage(
            newPath,
          );
        } catch (
          cleanupError
        ) {
          console.error(
            "FAILED UPLOAD CLEANUP ERROR:",
            cleanupError,
          );
        }
      }


      setMessage(
        error instanceof
          Error
          ? error.message
          : "No se pudo guardar la imagen.",
      );
    } finally {
      setIsLoading(
        false,
      );
    }
  }


  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete() {
    if (!imagePath) {
      return;
    }


    const pathToDelete =
      imagePath;


    setIsLoading(
      true,
    );

    setMessage(
      null,
    );


    try {
      /*
       * 1. Quitamos primero la referencia
       *    de PostgreSQL.
       *
       * Así nunca dejamos una receta
       * apuntando intencionadamente hacia
       * una imagen que ya no existe.
       */
      await updateRecipeImageAction(
        recipeId,
        null,
      );


      /*
       * PostgreSQL ya tiene image_path = NULL.
       *
       * Actualizamos la interfaz AHORA,
       * aunque después Storage fallase.
       */
      setImagePath(
        null,
      );


      clearFileInput();


      /*
       * 2. Limpiamos Storage.
       */
      try {
        await deleteRecipeImage(
          pathToDelete,
        );
      } catch (
        storageError
      ) {
        console.error(
          "DELETE RECIPE IMAGE STORAGE ERROR:",
          storageError,
        );


        /*
         * La receta ya está correctamente
         * desligada de la fotografía.
         *
         * Puede quedar un objeto huérfano,
         * pero funcionalmente la receta
         * ya no tiene imagen.
         */
        setMessage(
          "La imagen se retiró de la receta, pero no se pudo limpiar el archivo de Storage.",
        );

        return;
      }


      setMessage(
        "Imagen eliminada correctamente.",
      );
    } catch (
      error
    ) {
      setMessage(
        error instanceof
          Error
          ? error.message
          : "No se pudo eliminar la imagen.",
      );
    } finally {
      setIsLoading(
        false,
      );
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
            src={
              imageUrl
            }
            alt="Imagen principal de la receta"
            className="max-h-80 rounded-xl border object-cover"
          />


          <code className="block text-xs">
            {
              imagePath
            }
          </code>

        </div>
      )}


      <input
        ref={
          fileInputRef
        }
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={
          isLoading
        }
        onChange={(
          event,
        ) => {
          setFile(
            event
              .target
              .files?.[0] ??
              null,
          );


          setMessage(
            null,
          );
        }}
      />


      {file && (
        <div className="text-sm">

          <p>
            {
              file.name
            }
          </p>

          <p>
            {(
              file.size /
              1024 /
              1024
            ).toFixed(
              2,
            )}{" "}
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
          onClick={
            handleUpload
          }
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
            disabled={
              isLoading
            }
            onClick={
              handleDelete
            }
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
          {
            message
          }
        </p>
      )}

    </section>
  );
}