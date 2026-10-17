"use client";

import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeImageAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  deleteRecipeImage,
  getRecipeImageUrl,
  uploadRecipeImage,
} from "@/services/storage/recipe-images";


type RecipeImageUploaderProps = {
  recipeId:
    string;

  initialImagePath:
    string | null;
};


const MAX_IMAGE_SIZE =
  5 *
  1024 *
  1024;


const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


function validateImageFile(
  file: File,
): string | null {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type,
    )
  ) {
    return "El archivo debe ser una imagen JPEG, PNG o WebP.";
  }


  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    return "La imagen no puede superar los 5 MB.";
  }


  return null;
}


export function RecipeImageUploader({
  recipeId,
  initialImagePath,
}: RecipeImageUploaderProps) {
  const router =
    useRouter();


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
    useState<string | null>(
      initialImagePath,
    );


  /*
   * Cache busting.
   *
   * Cada vez que cambiamos la imagen
   * modificamos este valor para evitar
   * que navegador o CDN reutilicen
   * una versión anterior.
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
    selectedPreviewUrl,
    setSelectedPreviewUrl,
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


  /*
   * Si el usuario acaba de seleccionar
   * un archivo mostramos esa imagen.
   *
   * En caso contrario mostramos la
   * fotografía que ya está guardada.
   */
  const previewUrl =
    selectedPreviewUrl ??
    imageUrl;


  const isPendingPreview =
    Boolean(
      selectedPreviewUrl,
    );


  /* =======================================================
     LOCAL PREVIEW
  ======================================================= */

  useEffect(
    () => {
      if (
        !file
      ) {
        setSelectedPreviewUrl(
          null,
        );

        return;
      }


      const objectUrl =
        URL.createObjectURL(
          file,
        );


      setSelectedPreviewUrl(
        objectUrl,
      );


      return () => {
        URL.revokeObjectURL(
          objectUrl,
        );
      };
    },
    [
      file,
    ],
  );


  /* =======================================================
     FILE INPUT
  ======================================================= */

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


  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target
        .files?.[0] ??
      null;


    setMessage(
      null,
    );


    if (
      !selectedFile
    ) {
      setFile(
        null,
      );

      return;
    }


    const validationMessage =
      validateImageFile(
        selectedFile,
      );


    if (
      validationMessage
    ) {
      setFile(
        null,
      );


      event.target.value =
        "";


      setMessage(
        validationMessage,
      );

      return;
    }


    setFile(
      selectedFile,
    );
  }


  /* =======================================================
     UPLOAD / REPLACE
  ======================================================= */

  async function handleUpload() {
    if (
      !file
    ) {
      setMessage(
        "Selecciona una imagen antes de guardarla.",
      );

      return;
    }


    const validationMessage =
      validateImageFile(
        file,
      );


    if (
      validationMessage
    ) {
      setMessage(
        validationMessage,
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
       * 1. Storage
       */
      newPath =
        await uploadRecipeImage(
          recipeId,
          file,
        );


      /*
       * 2. PostgreSQL
       */
      await updateRecipeImageAction(
        recipeId,
        newPath,
      );


      /*
       * 3. Estado local
       */
      setImagePath(
        newPath,
      );


      setImageVersion(
        Date.now(),
      );


      clearFileInput();


      /*
       * Refrescamos los Server Components
       * para sincronizar también el estado
       * del stepper.
       */
      router.refresh();


      /*
       * 4. Si la extensión ha cambiado,
       * limpiamos el objeto anterior.
       *
       * Ejemplo:
       *
       * main.jpg
       *   ↓
       * main.webp
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
       * Si se creó un objeto nuevo pero
       * PostgreSQL no pudo actualizarse,
       * intentamos eliminar el archivo
       * huérfano.
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
    if (
      !imagePath
    ) {
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
       * Primero quitamos la referencia
       * desde PostgreSQL.
       */
      await updateRecipeImageAction(
        recipeId,
        null,
      );


      /*
       * La receta ya no apunta a la imagen.
       */
      setImagePath(
        null,
      );


      clearFileInput();


      router.refresh();


      /*
       * Después limpiamos Storage.
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


  /* =======================================================
     NAVIGATION
  ======================================================= */

  function handlePrevious() {
    router.push(
      "?step=times",
    );
  }


  function handleContinue() {
    if (
      !imagePath
    ) {
      setMessage(
        "Debes guardar una imagen principal antes de continuar.",
      );

      return;
    }


    router.push(
      "?step=additional",
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          Paso 7 de 10
        </p>


        <h2 className="mt-2 font-serif text-2xl font-semibold">
          Imagen principal
        </h2>


        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Añade la fotografía que representará
          esta receta en CociHub. Será la imagen
          que aparecerá en listados, búsquedas y
          en la propia receta.
        </p>

      </div>


      {/* ===================================================
          PREVIEW
      =================================================== */}

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-page-muted/30">

        {previewUrl ? (
          <div className="relative">

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                previewUrl
              }
              alt="Vista previa de la imagen principal de la receta"
              className="aspect-[16/10] w-full object-cover"
            />


            {isPendingPreview && (
              <div className="absolute left-4 top-4 rounded-full bg-surface/95 px-3 py-1.5 text-xs font-semibold shadow-sm">
                Nueva imagen sin guardar
              </div>
            )}

          </div>
        ) : (
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 px-6 text-center">

            <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface">
              <ImageIcon
                className="size-7 text-brand"
                aria-hidden="true"
              />
            </div>


            <div>

              <p className="font-semibold">
                Todavía no hay ninguna imagen
              </p>


              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona una fotografía para
                utilizarla como portada de la receta.
              </p>

            </div>

          </div>
        )}

      </div>


      {/* ===================================================
          FILE SELECTOR
      =================================================== */}

      <div className="mt-6 rounded-2xl border border-dashed border-border bg-page-muted/30 p-5">

        <input
          ref={
            fileInputRef
          }
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={
            isLoading
          }
          onChange={
            handleFileChange
          }
          className="sr-only"
        />


        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-3">

            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface">
              <Upload
                className="size-5 text-brand"
                aria-hidden="true"
              />
            </div>


            <div>

              <p className="text-sm font-semibold">
                Selecciona una fotografía
              </p>


              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                JPEG, PNG o WebP · Máximo 5 MB
              </p>

            </div>

          </div>


          <button
            type="button"
            disabled={
              isLoading
            }
            onClick={() =>
              fileInputRef
                .current
                ?.click()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageIcon
              className="size-4"
              aria-hidden="true"
            />

            {imagePath
              ? "Elegir otra imagen"
              : "Seleccionar imagen"}
          </button>

        </div>


        {file && (
          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">

            <div className="min-w-0">

              <p className="truncate text-sm font-medium">
                {
                  file.name
                }
              </p>


              <p className="mt-1 text-xs text-muted-foreground">
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


            <button
              type="button"
              disabled={
                isLoading
              }
              onClick={
                clearFileInput
              }
              className="shrink-0 text-sm font-medium text-muted-foreground transition hover:text-foreground disabled:opacity-50"
            >
              Quitar
            </button>

          </div>
        )}

      </div>


      {/* ===================================================
          IMAGE ACTIONS
      =================================================== */}

      <div className="mt-6 flex flex-wrap gap-3">

        <button
          type="button"
          disabled={
            !file ||
            isLoading
          }
          onClick={
            handleUpload
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw
                className="size-4 animate-spin"
                aria-hidden="true"
              />

              Procesando...
            </>
          ) : (
            <>
              <Upload
                className="size-4"
                aria-hidden="true"
              />

              {imagePath
                ? "Guardar nueva imagen"
                : "Subir imagen"}
            </>
          )}
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
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2
              className="size-4"
              aria-hidden="true"
            />

            Eliminar imagen
          </button>
        )}

      </div>


      {/* ===================================================
          MESSAGE
      =================================================== */}

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="mt-5 rounded-xl border border-border bg-page-muted/30 px-4 py-3 text-sm"
        >
          {
            message
          }
        </div>
      )}


      {/* ===================================================
          REQUIREMENT
      =================================================== */}

      {!imagePath && (
        <p className="mt-4 text-sm text-muted-foreground">
          La imagen principal es necesaria
          para completar este paso.
        </p>
      )}


      {/* ===================================================
          NAVIGATION
      =================================================== */}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          disabled={
            isLoading
          }
          onClick={
            handlePrevious
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Anterior
        </button>


        <button
          type="button"
          disabled={
            !imagePath ||
            isLoading
          }
          onClick={
            handleContinue
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar

          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </button>

      </div>

    </section>
  );
}