"use client";

import {
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  deleteMyRecipeImageAction,
  saveMyRecipeImageAction,
} from "./image-actions";


const MAX_FILE_SIZE =
  5 *
  1024 *
  1024;


const ALLOWED_FILE_TYPES =
  [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];


type ImageFormProps = {
  recipeId:
    string;

  initialImagePath:
    string | null;

  initialImageUrl:
    string | null;

  initialImageAlt:
    string | null;

  previousStepHref:
    string;

  nextStepHref:
    string;
};


export function ImageForm({
  recipeId,
  initialImagePath,
  initialImageUrl,
  initialImageAlt,
  previousStepHref,
  nextStepHref,
}: ImageFormProps) {
  const router =
    useRouter();


  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const previewUrlRef =
    useRef<string | null>(
      null,
    );


  const [
    currentImagePath,
    setCurrentImagePath,
  ] =
    useState<
      string | null
    >(
      initialImagePath,
    );


  const [
    currentImageUrl,
    setCurrentImageUrl,
  ] =
    useState<
      string | null
    >(
      initialImageUrl,
    );


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<
      File | null
    >(
      null,
    );


  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    imageAlt,
    setImageAlt,
  ] =
    useState(
      initialImageAlt ??
      "",
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
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );


  const [
    isDeleting,
    setIsDeleting,
  ] =
    useState(
      false,
    );


  const displayedImageUrl =
    previewUrl ??
    currentImageUrl;


  useEffect(
    () => {
      return () => {
        if (
          previewUrlRef.current
        ) {
          URL.revokeObjectURL(
            previewUrlRef.current,
          );
        }
      };
    },
    [],
  );


  function clearPreview() {
    if (
      previewUrlRef.current
    ) {
      URL.revokeObjectURL(
        previewUrlRef.current,
      );


      previewUrlRef.current =
        null;
    }


    setPreviewUrl(
      null,
    );
  }


  function handleFile(
    file:
      File | null,
  ) {
    setMessage(
      null,
    );


    clearPreview();


    if (
      !file
    ) {
      setSelectedFile(
        null,
      );

      return;
    }


    if (
      !ALLOWED_FILE_TYPES.includes(
        file.type,
      )
    ) {
      setSelectedFile(
        null,
      );


      setMessage(
        "Formato no válido. Utiliza una imagen JPG, PNG o WebP.",
      );

      return;
    }


    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setSelectedFile(
        null,
      );


      setMessage(
        "La imagen supera el límite máximo de 5 MB.",
      );

      return;
    }


    const objectUrl =
      URL.createObjectURL(
        file,
      );


    previewUrlRef.current =
      objectUrl;


    setPreviewUrl(
      objectUrl,
    );


    setSelectedFile(
      file,
    );
  }


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setMessage(
      null,
    );


    if (
      !selectedFile &&
      !currentImagePath
    ) {
      setMessage(
        "Selecciona una imagen antes de continuar.",
      );

      return;
    }


    const normalizedAlt =
      imageAlt.trim();


    if (
      normalizedAlt.length <
        3 ||
      normalizedAlt.length >
        180
    ) {
      setMessage(
        "El texto alternativo debe contener entre 3 y 180 caracteres.",
      );

      return;
    }


    setIsSaving(
      true,
    );


    try {
      const formData =
        new FormData();


      formData.set(
        "imageAlt",
        normalizedAlt,
      );


      if (
        selectedFile
      ) {
        formData.set(
          "file",
          selectedFile,
        );
      }


      const result =
        await saveMyRecipeImageAction(
          recipeId,
          formData,
        );


      if (
        !result.success
      ) {
        const fieldMessage =
          result
            .fieldErrors
            ?.imageAlt
            ?.[0];


        setMessage(
          fieldMessage ??
          result.message ??
          "No se pudo guardar la imagen.",
        );

        return;
      }


      router.push(
        nextStepHref,
      );


      router.refresh();

    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function handleDelete() {
    if (
      !currentImagePath
    ) {
      return;
    }


    setMessage(
      null,
    );


    setIsDeleting(
      true,
    );


    try {
      const result =
        await deleteMyRecipeImageAction(
          recipeId,
        );


      setMessage(
        result.message ??
        (
          result.success
            ? "Imagen eliminada correctamente."
            : "No se pudo eliminar la imagen."
        ),
      );


      if (
        !result.success
      ) {
        return;
      }


      clearPreview();


      setSelectedFile(
        null,
      );


      setCurrentImagePath(
        null,
      );


      setCurrentImageUrl(
        null,
      );


      setImageAlt(
        "",
      );


      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }


      router.refresh();

    } finally {
      setIsDeleting(
        false,
      );
    }
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6">

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
        Paso 7 de 8
      </p>


      <div className="mt-2 flex items-center gap-2">

        <ImagePlus
          className="size-5 text-brand"
          aria-hidden="true"
        />


        <h2 className="font-serif text-2xl font-semibold">
          Imagen
        </h2>

      </div>


      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Añade una fotografía principal que represente
        bien el resultado final de la receta.
      </p>


      <form
        onSubmit={
          handleSubmit
        }
        className="mt-8 space-y-6"
      >

        {/* =================================================
            PREVIEW
        ================================================= */}

        {displayedImageUrl ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-page-muted">

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                displayedImageUrl
              }
              alt={
                imageAlt.trim() ||
                "Vista previa de la receta"
              }
              className="aspect-[16/9] w-full object-cover"
            />

          </div>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-2xl border border-dashed border-border bg-page-muted/50">

            <div className="text-center">

              <ImagePlus
                className="mx-auto size-10 text-brand"
                aria-hidden="true"
              />


              <p className="mt-3 font-semibold">
                Todavía no hay imagen
              </p>


              <p className="mt-1 text-sm text-muted-foreground">
                Selecciona una fotografía para previsualizarla.
              </p>

            </div>

          </div>
        )}


        {/* =================================================
            FILE
        ================================================= */}

        <div>

          <input
            ref={
              fileInputRef
            }
            id="recipeImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={
              isSaving ||
              isDeleting
            }
            className="sr-only"
            onChange={(
              event,
            ) => {
              handleFile(
                event
                  .target
                  .files?.[0] ??
                null,
              );
            }}
          />


          <label
            htmlFor="recipeImage"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-4 text-sm font-semibold transition hover:bg-page-muted"
          >
            <Upload
              className="size-4 text-brand"
              aria-hidden="true"
            />


            {currentImagePath
              ? "Cambiar imagen"
              : "Seleccionar imagen"}
          </label>


          <p className="mt-2 text-center text-xs text-muted-foreground">
            JPG, PNG o WebP · Máximo 5 MB
          </p>


          {selectedFile && (
            <div className="mt-3 rounded-xl border border-border bg-page-muted/40 px-4 py-3">

              <p className="truncate text-sm font-medium">
                {
                  selectedFile.name
                }
              </p>


              <p className="mt-1 text-xs text-muted-foreground">
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(
                  2,
                )}{" "}
                MB
              </p>

            </div>
          )}

        </div>


        {/* =================================================
            ALT
        ================================================= */}

        <div>

          <label
            htmlFor="imageAlt"
            className="block text-sm font-semibold"
          >
            Texto alternativo
          </label>


          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Describe brevemente lo que aparece en la fotografía.
            Este texto ayuda a las personas que utilizan lectores
            de pantalla y también mejora la información semántica
            de la receta.
          </p>


          <input
            id="imageAlt"
            type="text"
            value={
              imageAlt
            }
            maxLength={
              180
            }
            disabled={
              isSaving ||
              isDeleting
            }
            onChange={(
              event,
            ) => {
              setImageAlt(
                event
                  .target
                  .value,
              );


              setMessage(
                null,
              );
            }}
            className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            placeholder="Ej. Pollo con almendras servido en un plato blanco"
          />


          <div className="mt-2 flex justify-end">

            <span className="text-xs text-muted-foreground">
              {
                imageAlt.length
              }
              /180
            </span>

          </div>

        </div>


        {/* =================================================
            DELETE
        ================================================= */}

        {currentImagePath && (
          <div className="flex justify-end">

            <button
              type="button"
              disabled={
                isSaving ||
                isDeleting
              }
              onClick={
                handleDelete
              }
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Trash2
                  className="size-4"
                  aria-hidden="true"
                />
              )}


              {isDeleting
                ? "Eliminando..."
                : "Eliminar imagen"}
            </button>

          </div>
        )}


        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <p
            role="status"
            className="rounded-xl border border-border bg-page-muted px-4 py-3 text-sm"
          >
            {
              message
            }
          </p>
        )}


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">

          <Link
            href={
              previousStepHref
            }
            className="rounded-xl border border-border bg-surface px-5 py-3 text-sm font-semibold transition hover:bg-page-muted"
          >
            ← Anterior
          </Link>


          <button
            type="submit"
            disabled={
              isSaving ||
              isDeleting
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving && (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            )}


            {isSaving
              ? "Guardando..."
              : "Guardar y continuar →"}
          </button>

        </div>

      </form>

    </section>
  );
}
