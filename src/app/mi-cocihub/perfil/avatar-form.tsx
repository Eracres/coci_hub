"use client";

import {
  Camera,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  deleteMyAvatarAction,
  saveMyAvatarAction,
} from "./profile-actions";


const MAX_SOURCE_FILE_SIZE =
  5 *
  1024 *
  1024;


/*
 * Queremos que el FormData completo quede holgadamente
 * por debajo del límite de 1 MB de las Server Actions.
 */
const TARGET_AVATAR_SIZE =
  750 *
  1024;


const AVATAR_DIMENSION =
  512;


const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


type AvatarFormProps = {
  displayName:
    string;

  initialAvatarUrl:
    string | null;

  fallbackAvatarUrl:
    string | null;

  initialHasCustomAvatar:
    boolean;
};


function getInitials(
  value:
    string,
) {
  const parts =
    value
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );


  if (
    parts.length ===
    0
  ) {
    return "U";
  }


  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }


  return (
    (
      parts[0]?.[0] ??
      ""
    ) +
    (
      parts[
        parts.length -
        1
      ]?.[0] ??
      ""
    )
  ).toUpperCase();
}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImage(
  file:
    File,
): Promise<
  HTMLImageElement
> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const image =
        new Image();


      const objectUrl =
        URL.createObjectURL(
          file,
        );


      image.onload =
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );

          resolve(
            image,
          );
        };


      image.onerror =
        () => {
          URL.revokeObjectURL(
            objectUrl,
          );

          reject(
            new Error(
              "No se pudo leer la imagen.",
            ),
          );
        };


      image.src =
        objectUrl;
    },
  );
}


/* =========================================================
   CANVAS -> BLOB
========================================================= */

function canvasToBlob(
  canvas:
    HTMLCanvasElement,

  quality:
    number,
): Promise<
  Blob
> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      canvas.toBlob(
        (
          blob,
        ) => {
          if (
            !blob
          ) {
            reject(
              new Error(
                "No se pudo procesar la imagen.",
              ),
            );

            return;
          }


          resolve(
            blob,
          );
        },

        "image/webp",

        quality,
      );
    },
  );
}


/* =========================================================
   OPTIMIZE AVATAR
========================================================= */

async function optimizeAvatar(
  sourceFile:
    File,
): Promise<
  File
> {
  const image =
    await loadImage(
      sourceFile,
    );


  const canvas =
    document.createElement(
      "canvas",
    );


  canvas.width =
    AVATAR_DIMENSION;

  canvas.height =
    AVATAR_DIMENSION;


  const context =
    canvas.getContext(
      "2d",
    );


  if (
    !context
  ) {
    throw new Error(
      "Tu navegador no permite procesar la imagen.",
    );
  }


  /*
   * Recorte cuadrado centrado.
   *
   * El avatar siempre se presenta circular, así que
   * almacenamos una imagen cuadrada optimizada.
   */

  const sourceSize =
    Math.min(
      image.naturalWidth,
      image.naturalHeight,
    );


  const sourceX =
    (
      image.naturalWidth -
      sourceSize
    ) /
    2;


  const sourceY =
    (
      image.naturalHeight -
      sourceSize
    ) /
    2;


  context.drawImage(
    image,

    sourceX,
    sourceY,
    sourceSize,
    sourceSize,

    0,
    0,
    AVATAR_DIMENSION,
    AVATAR_DIMENSION,
  );


  /*
   * Empezamos con buena calidad y la reducimos solo
   * si fuera necesario.
   */

  const qualities = [
    0.9,
    0.82,
    0.74,
    0.66,
    0.58,
    0.5,
  ];


  let blob:
    Blob | null =
      null;


  for (
    const quality
    of qualities
  ) {
    const candidate =
      await canvasToBlob(
        canvas,
        quality,
      );


    blob =
      candidate;


    if (
      candidate.size <=
      TARGET_AVATAR_SIZE
    ) {
      break;
    }
  }


  if (
    !blob
  ) {
    throw new Error(
      "No se pudo optimizar la imagen.",
    );
  }


  if (
    blob.size >
    TARGET_AVATAR_SIZE
  ) {
    throw new Error(
      "No se pudo reducir suficientemente la imagen. Prueba con otra fotografía.",
    );
  }


  return new File(
    [
      blob,
    ],

    "avatar.webp",

    {
      type:
        "image/webp",

      lastModified:
        Date.now(),
    },
  );
}


export function AvatarForm({
  displayName,
  initialAvatarUrl,
  fallbackAvatarUrl,
  initialHasCustomAvatar,
}: AvatarFormProps) {
  const router =
    useRouter();


  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const objectUrlRef =
    useRef<string | null>(
      null,
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
    currentAvatarUrl,
    setCurrentAvatarUrl,
  ] =
    useState<
      string | null
    >(
      initialAvatarUrl,
    );


  const [
    hasCustomAvatar,
    setHasCustomAvatar,
  ] =
    useState(
      initialHasCustomAvatar,
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
    isPreparing,
    setIsPreparing,
  ] =
    useState(
      false,
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


  const displayedAvatar =
    previewUrl ??
    currentAvatarUrl;


  useEffect(
    () => {
      return () => {
        if (
          objectUrlRef.current
        ) {
          URL.revokeObjectURL(
            objectUrlRef.current,
          );
        }
      };
    },
    [],
  );


  function clearPreview() {
    if (
      objectUrlRef.current
    ) {
      URL.revokeObjectURL(
        objectUrlRef.current,
      );


      objectUrlRef.current =
        null;
    }


    setPreviewUrl(
      null,
    );
  }


  async function handleFile(
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
      !ALLOWED_TYPES.includes(
        file.type,
      )
    ) {
      setSelectedFile(
        null,
      );


      setMessage(
        "Formato no válido. Utiliza JPG, PNG o WebP.",
      );

      return;
    }


    if (
      file.size >
      MAX_SOURCE_FILE_SIZE
    ) {
      setSelectedFile(
        null,
      );


      setMessage(
        "La imagen supera el límite máximo de 5 MB.",
      );

      return;
    }


    setIsPreparing(
      true,
    );


    try {
      const optimizedFile =
        await optimizeAvatar(
          file,
        );


      const url =
        URL.createObjectURL(
          optimizedFile,
        );


      objectUrlRef.current =
        url;


      setPreviewUrl(
        url,
      );


      setSelectedFile(
        optimizedFile,
      );


      setMessage(
        "Imagen preparada. Revisa la vista previa y guarda el nuevo avatar.",
      );

    } catch (
      error
    ) {
      console.error(
        "AVATAR OPTIMIZATION ERROR:",
        error,
      );


      setSelectedFile(
        null,
      );


      setMessage(
        error instanceof
          Error
          ? error.message
          : "No se pudo preparar la imagen.",
      );

    } finally {
      setIsPreparing(
        false,
      );
    }
  }


  async function handleSave() {
    if (
      !selectedFile
    ) {
      setMessage(
        "Selecciona una imagen.",
      );

      return;
    }


    setMessage(
      null,
    );


    setIsSaving(
      true,
    );


    try {
      const formData =
        new FormData();


      formData.set(
        "avatar",
        selectedFile,
      );


      const result =
        await saveMyAvatarAction(
          formData,
        );


      setMessage(
        result.message ??
        (
          result.success
            ? "Avatar actualizado."
            : "No se pudo actualizar el avatar."
        ),
      );


      if (
        !result.success
      ) {
        return;
      }


      if (
        result.avatarUrl
      ) {
        setCurrentAvatarUrl(
          result.avatarUrl,
        );
      }


      setHasCustomAvatar(
        true,
      );


      clearPreview();


      setSelectedFile(
        null,
      );


      if (
        inputRef.current
      ) {
        inputRef.current.value =
          "";
      }


      router.refresh();

    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function handleDelete() {
    setMessage(
      null,
    );


    setIsDeleting(
      true,
    );


    try {
      const result =
        await deleteMyAvatarAction();


      setMessage(
        result.message ??
        (
          result.success
            ? "Avatar eliminado."
            : "No se pudo eliminar el avatar."
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


      setHasCustomAvatar(
        false,
      );


      setCurrentAvatarUrl(
        fallbackAvatarUrl,
      );


      if (
        inputRef.current
      ) {
        inputRef.current.value =
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

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

        {/* =================================================
            AVATAR
        ================================================= */}

        <div className="shrink-0">

          <div className="relative flex size-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-brand/10 shadow-sm ring-1 ring-border">

            {displayedAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={
                  displayedAvatar
                }
                alt={`Avatar de ${displayName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-brand">
                {
                  getInitials(
                    displayName,
                  )
                }
              </span>
            )}


            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-9 items-center justify-center bg-black/45 text-white">

              <Camera
                className="size-4"
                aria-hidden="true"
              />

            </div>

          </div>

        </div>


        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="min-w-0 flex-1">

          <h2 className="font-serif text-xl font-semibold">
            Imagen de perfil
          </h2>


          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">

            {hasCustomAvatar
              ? "Estás utilizando un avatar personalizado de CociHub."
              : fallbackAvatarUrl
                ? "Ahora estás utilizando la imagen de tu cuenta de Google. Puedes sustituirla por una propia."
                : "Añade una imagen para personalizar tu perfil."}

          </p>


          <p className="mt-1 text-xs text-muted-foreground">
            JPG, PNG o WebP · Máximo 5 MB · CociHub la optimizará automáticamente
          </p>


          <input
            ref={
              inputRef
            }
            id="profileAvatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={
              isPreparing ||
              isSaving ||
              isDeleting
            }
            className="sr-only"
            onChange={(
              event,
            ) => {
              void handleFile(
                event
                  .target
                  .files?.[0] ??
                null,
              );
            }}
          />


          <div className="mt-5 flex flex-wrap gap-3">

            <label
              htmlFor="profileAvatar"
              className={`inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition ${
                isPreparing ||
                isSaving ||
                isDeleting
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:bg-page-muted"
              }`}
            >

              {isPreparing ? (
                <Loader2
                  className="size-4 animate-spin text-brand"
                  aria-hidden="true"
                />
              ) : (
                <ImagePlus
                  className="size-4 text-brand"
                  aria-hidden="true"
                />
              )}


              {isPreparing
                ? "Preparando..."
                : hasCustomAvatar
                  ? "Cambiar imagen"
                  : "Elegir imagen"}

            </label>


            {selectedFile && (
              <button
                type="button"
                disabled={
                  isPreparing ||
                  isSaving ||
                  isDeleting
                }
                onClick={
                  handleSave
                }
                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >

                {isSaving && (
                  <Loader2
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}


                {isSaving
                  ? "Guardando..."
                  : "Guardar nuevo avatar"}

              </button>
            )}


            {hasCustomAvatar && (
              <button
                type="button"
                disabled={
                  isPreparing ||
                  isSaving ||
                  isDeleting
                }
                onClick={
                  handleDelete
                }
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                  : "Quitar avatar personalizado"}

              </button>
            )}

          </div>


          {selectedFile && (
            <p className="mt-3 text-xs text-muted-foreground">

              Avatar optimizado:{" "}

              <span className="font-medium text-foreground">
                {
                  Math.ceil(
                    selectedFile.size /
                    1024,
                  )
                } KB
              </span>

            </p>
          )}


          {message && (
            <p
              role="status"
              className="mt-4 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm"
            >
              {
                message
              }
            </p>
          )}

        </div>

      </div>

    </section>
  );
}
