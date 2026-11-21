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
    <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-border bg-brand/[0.025] px-6 py-5 sm:px-7">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Camera
              className="size-5"
              aria-hidden="true"
            />
          </span>


          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
              Tu imagen
            </p>


            <h2 className="mt-1 font-serif text-2xl font-bold">
              Fotografía de perfil
            </h2>


            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Personaliza la imagen
              con la que aparecerás
              dentro de CociHub.
            </p>
          </div>
        </div>
      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="flex h-full flex-col p-6 sm:p-7">
        {/* ===============================================
            AVATAR PREVIEW
        =============================================== */}

        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="relative flex size-36 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-brand/10 shadow-md ring-1 ring-border sm:size-40">
              {displayedAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={
                    displayedAvatar
                  }
                  alt={`Avatar de ${displayName}`}
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-serif text-4xl font-bold text-brand">
                  {
                    getInitials(
                      displayName,
                    )
                  }
                </span>
              )}


              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-11 items-center justify-center bg-black/45 text-white">
                <Camera
                  className="size-4"
                  aria-hidden="true"
                />
              </div>
            </div>


            {previewUrl ? (
              <span className="absolute -right-2 top-2 rounded-full border-2 border-surface bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm">
                Vista previa
              </span>
            ) : null}
          </div>


          <p className="mt-5 font-serif text-lg font-bold">
            {
              displayName
            }
          </p>


          <span
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              previewUrl
                ? "bg-accent/15 text-warning"
                : hasCustomAvatar
                  ? "bg-brand/10 text-brand"
                  : fallbackAvatarUrl
                    ? "bg-secondary/15 text-secondary-hover"
                    : "bg-page-muted text-muted-foreground"
            }`}
          >
            {previewUrl
              ? "Nueva imagen preparada"
              : hasCustomAvatar
                ? "Avatar personalizado"
                : fallbackAvatarUrl
                  ? "Imagen de tu cuenta"
                  : "Sin imagen personalizada"}
          </span>
        </div>


        {/* ===============================================
            DESCRIPTION
        =============================================== */}

        <div className="mt-6 rounded-2xl border border-border bg-page-muted/35 px-4 py-4">
          <p className="text-sm leading-6 text-muted-foreground">
            {hasCustomAvatar
              ? "Estás utilizando un avatar personalizado de CociHub."
              : fallbackAvatarUrl
                ? "Ahora estás utilizando la imagen de tu cuenta de Google. Puedes sustituirla por una fotografía propia."
                : "Añade una fotografía para personalizar tu perfil."}
          </p>


          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            JPG, PNG o WebP · Máximo
            5 MB · CociHub recortará y
            optimizará la imagen
            automáticamente.
          </p>
        </div>


        {/* ===============================================
            FILE INPUT
        =============================================== */}

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


        {/* ===============================================
            ACTIONS
        =============================================== */}

        <div className="mt-5 flex flex-col gap-3">
          <label
            htmlFor="profileAvatar"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand/20 bg-brand/[0.035] px-4 py-3 text-sm font-semibold text-brand transition ${
              isPreparing ||
              isSaving ||
              isDeleting
                ? "cursor-not-allowed opacity-50"
                : "cursor-pointer hover:border-brand/40 hover:bg-brand/[0.07]"
            }`}
          >
            {isPreparing ? (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ImagePlus
                className="size-4"
                aria-hidden="true"
              />
            )}


            {isPreparing
              ? "Preparando imagen..."
              : hasCustomAvatar
                ? "Cambiar fotografía"
                : "Elegir fotografía"}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Camera
                  className="size-4"
                  aria-hidden="true"
                />
              )}


              {isSaving
                ? "Guardando..."
                : "Guardar nueva fotografía"}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-surface px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                : fallbackAvatarUrl
                  ? "Restaurar imagen de la cuenta"
                  : "Quitar fotografía personalizada"}
            </button>
          )}
        </div>


        {/* ===============================================
            OPTIMIZED FILE INFO
        =============================================== */}

        {selectedFile && (
          <div className="mt-4 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Imagen optimizada y
              preparada para guardar
            </p>


            <p className="mt-1 font-serif text-base font-bold text-foreground">
              {
                Math.ceil(
                  selectedFile.size /
                  1024,
                )
              } KB
            </p>
          </div>
        )}


        {/* ===============================================
            STATUS MESSAGE
        =============================================== */}

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-brand/15 bg-brand/[0.045] px-4 py-3 text-sm leading-6"
          >
            {
              message
            }
          </p>
        )}
      </div>
    </section>
  );
}