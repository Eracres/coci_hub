"use client";

import {
  Accessibility,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CheckCircle2,
  CloudUpload,
  FileImage,
  ImagePlus,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  Save,
  Scan,
  Trash2,
  X,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  communityRecipeImageSchema,
} from "@/schemas/community-recipe-image-schema";

import {
  deleteMyRecipeImageAction,
  saveMyRecipeImageAction,
} from "./image-actions";

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_ALT_LENGTH = 180;

/* =========================================================
   TYPES
========================================================= */

type ImageFormProps = {
  recipeId: string;

  initialImagePath: string | null;
  initialImageUrl: string | null;
  initialImageAlt: string | null;

  previousStepHref: string;
  nextStepHref: string;
};

type ImageDimensions = {
  width: number;
  height: number;
};

type ImageMetadata = ImageDimensions & {
  name: string;
  size: number;
  format: string;
};

type PreviewMode = "catalog" | "recipe";

type Feedback = {
  type: "success" | "error" | "info";
  text: string;
};

/* =========================================================
   HELPERS
========================================================= */

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatImageType(type: string) {
  switch (type) {
    case "image/jpeg":
      return "JPG";

    case "image/png":
      return "PNG";

    case "image/webp":
      return "WebP";

    default:
      return "Desconocido";
  }
}

function readImageDimensions(
  url: string,
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      reject(
        new Error(
          "No se pudo leer la fotografía.",
        ),
      );
    };

    image.src = url;
  });
}

function getImageQuality(
  dimensions: ImageDimensions | null,
) {
  if (!dimensions) {
    return null;
  }

  const { width, height } = dimensions;

  if (width >= 1600 && height >= 900) {
    return {
      title: "Resolución recomendada",

      description:
        "La fotografía tiene unas dimensiones adecuadas para mostrar tu receta.",

      className:
        "border-green-200 bg-green-50 text-green-800",

      recommended: true,
    };
  }

  if (width >= 800 && height >= 600) {
    return {
      title: "Resolución aceptable",

      description:
        "Puedes utilizar esta imagen, aunque una resolución superior ofrecerá más detalle.",

      className:
        "border-amber-200 bg-amber-50 text-amber-900",

      recommended: false,
    };
  }

  return {
    title: "Resolución reducida",

    description:
      "La fotografía podría perder nitidez al mostrarse en pantallas grandes.",

    className:
      "border-amber-200 bg-amber-50 text-amber-900",

    recommended: false,
  };
}

/* =========================================================
   IMAGE FORM
========================================================= */

export function ImageForm({
  recipeId,
  initialImagePath,
  initialImageUrl,
  initialImageAlt,
  previousStepHref,
  nextStepHref,
}: ImageFormProps) {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const selectedUrlRef =
    useRef<string | null>(null);

  const savedLocalUrlRef =
    useRef<string | null>(null);

  const selectionVersion = useRef(0);

  const operationLock = useRef(false);

  const allowNavigation = useRef(false);

  const dragCounter = useRef(0);

  /* =======================================================
     SAVED IMAGE
  ======================================================= */

  const [hasSavedImage, setHasSavedImage] =
    useState(Boolean(initialImagePath));

  const [currentImageUrl, setCurrentImageUrl] =
    useState<string | null>(initialImageUrl);

  const [savedAlt, setSavedAlt] = useState(
    initialImageAlt ?? "",
  );

  const [savedMetadata, setSavedMetadata] =
    useState<ImageMetadata | null>(null);

  const [
    savedDimensions,
    setSavedDimensions,
  ] = useState<ImageDimensions | null>(null);

  /* =======================================================
     SELECTED IMAGE
  ======================================================= */

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [selectedMetadata, setSelectedMetadata] =
    useState<ImageMetadata | null>(null);

  const [imageAlt, setImageAlt] = useState(
    initialImageAlt ?? "",
  );

  /* =======================================================
     INTERFACE STATE
  ======================================================= */

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isReading, setIsReading] =
    useState(false);

  const [isDragging, setIsDragging] =
    useState(false);

  const [confirmDelete, setConfirmDelete] =
    useState(false);

  const [previewMode, setPreviewMode] =
    useState<PreviewMode>("catalog");

  /* =======================================================
     DERIVED VALUES
  ======================================================= */

  const displayedImageUrl =
    previewUrl ?? currentImageUrl;

  const displayedMetadata =
    selectedFile
      ? selectedMetadata
      : savedMetadata;

  const displayedDimensions =
    selectedFile
      ? selectedMetadata
      : savedDimensions;

  const imageQuality =
    getImageQuality(displayedDimensions);

  const isBusy =
    isSaving || isDeleting || isReading;

  const isDirty =
    selectedFile !== null ||
    imageAlt.trim() !== savedAlt.trim();

  const hasImage =
    selectedFile !== null ||
    hasSavedImage;

  const altValidation =
    communityRecipeImageSchema.safeParse({
      imageAlt,
    });

  const isComplete =
    hasImage && altValidation.success;

  /* =======================================================
     RESOURCE CLEANUP
  ======================================================= */

  useEffect(() => {
    return () => {
      selectionVersion.current += 1;

      if (selectedUrlRef.current) {
        URL.revokeObjectURL(
          selectedUrlRef.current,
        );
      }

      if (savedLocalUrlRef.current) {
        URL.revokeObjectURL(
          savedLocalUrlRef.current,
        );
      }
    };
  }, []);

  /* =======================================================
     LOAD SAVED IMAGE DIMENSIONS
  ======================================================= */

  useEffect(() => {
    if (!currentImageUrl) {
      return;
    }

    let cancelled = false;

    readImageDimensions(currentImageUrl)
      .then((dimensions) => {
        if (!cancelled) {
          setSavedDimensions(dimensions);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSavedDimensions(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentImageUrl]);

  /* =======================================================
     UNSAVED CHANGES PROTECTION
  ======================================================= */

  useEffect(() => {
    if (!isDirty && !isBusy) {
      return;
    }

    function beforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (allowNavigation.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function guardLink(event: MouseEvent) {
      if (
        allowNavigation.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      const link =
        target instanceof Element
          ? target.closest("a[href]")
          : null;

      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(
        link.href,
        window.location.href,
      );

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.origin === window.location.origin
      ) {
        return;
      }

      if (
        operationLock.current ||
        isReading ||
        !window.confirm(
          "Tienes cambios de imagen sin guardar. ¿Quieres salir de este apartado?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener(
      "beforeunload",
      beforeUnload,
    );

    document.addEventListener(
      "click",
      guardLink,
      true,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        beforeUnload,
      );

      document.removeEventListener(
        "click",
        guardLink,
        true,
      );
    };
  }, [isDirty, isBusy, isReading]);

  /* =======================================================
     CLEAR SELECTED IMAGE
  ======================================================= */

  function clearSelection() {
    selectionVersion.current += 1;

    if (selectedUrlRef.current) {
      URL.revokeObjectURL(
        selectedUrlRef.current,
      );

      selectedUrlRef.current = null;
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedMetadata(null);
    setIsReading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function discardSelection() {
    clearSelection();

    setConfirmDelete(false);

    setFeedback({
      type: "info",

      text: hasSavedImage
        ? "Selección descartada. Se conserva la fotografía guardada."
        : "Selección descartada.",
    });
  }

  /* =======================================================
     SELECT FILE
  ======================================================= */

  async function handleFile(
    file: File | null,
  ) {
    if (!file || operationLock.current) {
      return;
    }

    setFeedback(null);
    setConfirmDelete(false);

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFeedback({
        type: "error",

        text:
          "Formato no válido. Utiliza una imagen JPG, PNG o WebP.",
      });

      return;
    }

    if (
      file.size === 0 ||
      file.size > MAX_FILE_SIZE
    ) {
      setFeedback({
        type: "error",

        text:
          "La imagen debe contener datos y no superar los 5 MB.",
      });

      return;
    }

    const version =
      ++selectionVersion.current;

    setIsReading(true);

    const objectUrl =
      URL.createObjectURL(file);

    try {
      const dimensions =
        await readImageDimensions(objectUrl);

      if (
        version !== selectionVersion.current
      ) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      if (
        dimensions.width <= 0 ||
        dimensions.height <= 0
      ) {
        throw new Error(
          "Dimensiones no válidas.",
        );
      }

      if (selectedUrlRef.current) {
        URL.revokeObjectURL(
          selectedUrlRef.current,
        );
      }

      selectedUrlRef.current = objectUrl;

      setSelectedFile(file);
      setPreviewUrl(objectUrl);

      setSelectedMetadata({
        name: file.name,

        size: file.size,

        format: formatImageType(file.type),

        width: dimensions.width,

        height: dimensions.height,
      });

    } catch {
      URL.revokeObjectURL(objectUrl);

      if (
        version === selectionVersion.current
      ) {
        setFeedback({
          type: "error",

          text:
            "No se pudo abrir la fotografía. Comprueba que el archivo no esté dañado.",
        });
      }
    } finally {
      if (
        version === selectionVersion.current
      ) {
        setIsReading(false);
      }
    }
  }

  /* =======================================================
     DRAG AND DROP
  ======================================================= */

  function handleDragEnter(
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    dragCounter.current += 1;

    setIsDragging(true);
  }

  function handleDragOver(
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      isBusy ? "none" : "copy";
  }

  function handleDragLeave(
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault();

    dragCounter.current = Math.max(
      0,
      dragCounter.current - 1,
    );

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(
    event: DragEvent<HTMLElement>,
  ) {
    event.preventDefault();

    dragCounter.current = 0;

    setIsDragging(false);

    if (isBusy) {
      return;
    }

    const files =
      event.dataTransfer.files;

    if (files.length !== 1) {
      setFeedback({
        type: "error",

        text:
          "Selecciona una única fotografía principal.",
      });

      return;
    }

    void handleFile(files[0] ?? null);
  }

  /* =======================================================
     SAVE IMAGE
  ======================================================= */

  async function persistImage(
    advance: boolean,
  ) {
    if (
      operationLock.current ||
      isReading
    ) {
      return;
    }

    setFeedback(null);
    setConfirmDelete(false);

    if (!hasImage) {
      setFeedback({
        type: "error",

        text:
          "Selecciona una imagen antes de continuar.",
      });

      return;
    }

    if (!altValidation.success) {
      setFeedback({
        type: "error",

        text:
          altValidation.error.issues[0]?.message ??
          "El texto alternativo no es válido.",
      });

      return;
    }

    if (!isDirty) {
      if (advance) {
        router.push(nextStepHref);
      } else {
        setFeedback({
          type: "info",

          text:
            "No hay cambios pendientes que guardar.",
        });
      }

      return;
    }

    operationLock.current = true;

    setIsSaving(true);

    try {
      const formData = new FormData();

      formData.set(
        "imageAlt",
        altValidation.data.imageAlt,
      );

      if (selectedFile) {
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

      if (!result.success) {
        setFeedback({
          type: "error",

          text:
            result.fieldErrors?.imageAlt?.[0] ??
            result.message ??
            "No se pudo guardar la imagen.",
        });

        return;
      }

      /* ===================================================
         PROMOTE PREVIEW TO SAVED IMAGE
      =================================================== */

      if (
        selectedFile &&
        selectedUrlRef.current
      ) {
        if (savedLocalUrlRef.current) {
          URL.revokeObjectURL(
            savedLocalUrlRef.current,
          );
        }

        savedLocalUrlRef.current =
          selectedUrlRef.current;

        setCurrentImageUrl(
          selectedUrlRef.current,
        );

        selectedUrlRef.current = null;

        setSavedMetadata(
          selectedMetadata,
        );

        setSavedDimensions(
          selectedMetadata,
        );

        setSelectedFile(null);
        setSelectedMetadata(null);
        setPreviewUrl(null);
      }

      setHasSavedImage(true);

      setSavedAlt(
        altValidation.data.imageAlt,
      );

      setImageAlt(
        altValidation.data.imageAlt,
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (advance) {
        allowNavigation.current = true;

        router.push(nextStepHref);
      } else {
        setFeedback({
          type: "success",

          text:
            result.message ??
            "Borrador de imagen guardado correctamente.",
        });

        router.refresh();
      }

    } catch {
      setFeedback({
        type: "error",

        text:
          "No se pudo guardar la fotografía. Comprueba tu conexión y el tamaño del archivo.",
      });

    } finally {
      operationLock.current = false;

      setIsSaving(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void persistImage(true);
  }

  /* =======================================================
     DELETE SAVED IMAGE
  ======================================================= */

  async function handleDelete() {
    if (
      !hasSavedImage ||
      operationLock.current ||
      isReading
    ) {
      return;
    }

    operationLock.current = true;

    setFeedback(null);
    setIsDeleting(true);

    try {
      const result =
        await deleteMyRecipeImageAction(
          recipeId,
        );

      if (!result.success) {
        setFeedback({
          type: "error",

          text:
            result.message ??
            "No se pudo eliminar la imagen.",
        });

        return;
      }

      clearSelection();

      if (savedLocalUrlRef.current) {
        URL.revokeObjectURL(
          savedLocalUrlRef.current,
        );

        savedLocalUrlRef.current = null;
      }

      setHasSavedImage(false);
      setCurrentImageUrl(null);
      setSavedMetadata(null);
      setSavedDimensions(null);

      setSavedAlt("");
      setImageAlt("");

      setConfirmDelete(false);

      setFeedback({
        type: "success",

        text:
          result.message ??
          "Imagen eliminada correctamente.",
      });

      router.refresh();

    } catch {
      setFeedback({
        type: "error",

        text:
          "No se pudo eliminar la imagen. Inténtalo de nuevo.",
      });

    } finally {
      operationLock.current = false;

      setIsDeleting(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

        <div className="space-y-5 p-5 sm:p-6">

          {/* HEADER */}

          <header className="flex items-start gap-4">

            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">

              <ImagePlus
                className="size-7"
                aria-hidden="true"
              />

            </span>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                07 · Imagen
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Dale vida a tu receta
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Una buena fotografía puede contar
                la historia de tu plato. Elige una
                imagen que represente el resultado
                final de tu receta.
              </p>

            </div>

          </header>

          {/* STATUS SUMMARY */}

          <div
            className="grid gap-3 sm:grid-cols-2"
            aria-live="polite"
          >

            <div className="rounded-xl border border-border bg-page-muted/30 p-4">

              <p className="flex items-center gap-2 text-xs font-semibold">

                <Camera
                  className="size-4 text-brand"
                  aria-hidden="true"
                />

                Fotografía principal

              </p>

              <p className="mt-2 font-serif text-lg font-bold">

                {selectedFile
                  ? "Seleccionada"
                  : hasSavedImage
                    ? "Guardada"
                    : "Pendiente"}

              </p>

              <p className="mt-1 text-xs text-muted-foreground">

                {selectedFile
                  ? "Pendiente de guardar"
                  : hasSavedImage
                    ? "Disponible en tu receta"
                    : "Añade una fotografía"}

              </p>

            </div>

            <div
              className={`rounded-xl border p-4 ${
                altValidation.success
                  ? "border-secondary/20 bg-secondary/10"
                  : "border-border bg-page-muted/30"
              }`}
            >

              <p className="flex items-center gap-2 text-xs font-semibold">

                <Accessibility
                  className="size-4 text-secondary-hover"
                  aria-hidden="true"
                />

                Accesibilidad

              </p>

              <p className="mt-2 font-serif text-lg font-bold">

                {altValidation.success
                  ? "Texto completado"
                  : "Pendiente"}

              </p>

              <p className="mt-1 text-xs text-muted-foreground">

                {imageAlt.length} de{" "}
                {MAX_ALT_LENGTH} caracteres

              </p>

            </div>

          </div>

          {/* FORM */}

          <form
            id="recipe-image-form"
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              ref={fileInputRef}
              id="recipeImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={isBusy}
              className="sr-only"
              tabIndex={-1}
              onChange={(event) => {
                const file =
                  event.target.files?.[0] ??
                  null;

                event.target.value = "";

                void handleFile(file);
              }}
            />

            {/* =================================================
                IMAGE UPLOAD
            ================================================= */}

            <section
              className="rounded-2xl border border-border p-4 sm:p-5"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div className="flex items-center gap-3">

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                    <Camera
                      className="size-5"
                      aria-hidden="true"
                    />

                  </span>

                  <div>

                    <h3 className="font-serif text-xl font-semibold">
                      Fotografía principal
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Imagen representativa de tu receta.
                    </p>

                  </div>

                </div>

                {hasImage && (

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      selectedFile
                        ? "bg-amber-50 text-amber-900"
                        : "bg-green-50 text-green-800"
                    }`}
                  >

                    {selectedFile
                      ? "Sin guardar"
                      : "Guardada"}

                  </span>

                )}

              </div>

              {/* EMPTY STATE */}

              {!displayedImageUrl ? (

                <div
                  className={`mt-4 flex min-h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors ${
                    isDragging
                      ? "border-brand bg-brand/10"
                      : "border-border bg-page-muted/30 hover:border-brand/50"
                  }`}
                >

                  <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">

                    {isReading ? (

                      <Loader2
                        className="size-8 animate-spin"
                        aria-hidden="true"
                      />

                    ) : (

                      <CloudUpload
                        className="size-8"
                        aria-hidden="true"
                      />

                    )}

                  </span>

                  <h4 className="mt-4 font-serif text-xl font-semibold">

                    {isReading
                      ? "Leyendo fotografía..."
                      : isDragging
                        ? "Suelta aquí la fotografía"
                        : "Arrastra aquí tu fotografía"}

                  </h4>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                    O selecciona una imagen desde
                    tu dispositivo.
                  </p>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:opacity-50"
                  >

                    <ImagePlus
                      className="size-4"
                      aria-hidden="true"
                    />

                    Seleccionar imagen

                  </button>

                  <p className="mt-4 text-xs text-muted-foreground">
                    JPG, PNG o WebP · Máximo 5 MB
                  </p>

                </div>

              ) : (

                /* IMAGE PREVIEW */

                <div className="mt-4 space-y-4">

                  <div
                    className={`relative overflow-hidden rounded-2xl border-2 bg-page-muted transition-colors ${
                      isDragging
                        ? "border-brand"
                        : "border-transparent"
                    }`}
                  >

                    {/* eslint-disable-next-line @next/next/no-img-element */}

                    <img
                      src={displayedImageUrl}
                      alt={
                        imageAlt.trim() ||
                        "Vista previa de la receta"
                      }
                      className="aspect-video w-full object-cover"
                    />

                    {isDragging && (

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand/85 p-4 text-center text-white">

                        <CloudUpload
                          className="size-9"
                          aria-hidden="true"
                        />

                        <p className="font-semibold">
                          Suelta la nueva fotografía
                        </p>

                      </div>

                    )}

                    {isReading && (

                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">

                        <Loader2
                          className="size-8 animate-spin text-white"
                          aria-hidden="true"
                        />

                      </div>

                    )}

                  </div>

                  {/* IMAGE ACTIONS */}

                  <div className="flex flex-wrap items-center justify-between gap-2">

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/5 disabled:opacity-50"
                    >

                      <RefreshCw
                        className="size-4"
                        aria-hidden="true"
                      />

                      Cambiar imagen

                    </button>

                    {selectedFile ? (

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={discardSelection}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:opacity-50"
                      >

                        <X
                          className="size-4"
                          aria-hidden="true"
                        />

                        Descartar selección

                      </button>

                    ) : hasSavedImage ? (

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() =>
                          setConfirmDelete(true)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                      >

                        <Trash2
                          className="size-4"
                          aria-hidden="true"
                        />

                        Eliminar imagen

                      </button>

                    ) : null}

                  </div>

                  <p className="text-xs text-muted-foreground">
                    Puedes arrastrar otra fotografía
                    sobre la imagen para sustituirla.
                  </p>

                </div>

              )}

              {/* DELETE CONFIRMATION */}

              {confirmDelete && (

                <div
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800"
                >

                  <p className="flex items-center gap-2 text-sm font-semibold">

                    <AlertTriangle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />

                    ¿Eliminar la fotografía principal?

                  </p>

                  <p className="mt-2 text-xs leading-5">
                    La imagen guardada se retirará
                    de tu receta. Tendrás que añadir
                    otra antes de enviarla a revisión.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        void handleDelete()
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                    >

                      {isDeleting && (

                        <Loader2
                          className="size-4 animate-spin"
                          aria-hidden="true"
                        />

                      )}

                      {isDeleting
                        ? "Eliminando..."
                        : "Sí, eliminar imagen"}

                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() =>
                        setConfirmDelete(false)
                      }
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-page-muted"
                    >

                      Cancelar

                    </button>

                  </div>

                </div>

              )}

              {/* IMAGE METADATA */}

              {displayedImageUrl && (

                <div className="mt-5 rounded-xl border border-border bg-page-muted/30 p-4">

                  <div className="flex items-start gap-3">

                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary-hover">

                      <FileImage
                        className="size-5"
                        aria-hidden="true"
                      />

                    </span>

                    <div className="min-w-0 flex-1">

                      <p className="break-all text-sm font-semibold">

                        {displayedMetadata?.name ??
                          "Fotografía guardada"}

                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">

                        {selectedFile
                          ? "Archivo seleccionado"
                          : "Imagen de la receta"}

                      </p>

                    </div>

                    <CheckCircle2
                      className="size-5 shrink-0 text-secondary-hover"
                      aria-hidden="true"
                    />

                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                    <div className="rounded-lg bg-surface p-3">

                      <dt className="text-xs text-muted-foreground">
                        Formato
                      </dt>

                      <dd className="mt-1 text-sm font-semibold">

                        {displayedMetadata?.format ??
                          "—"}

                      </dd>

                    </div>

                    <div className="rounded-lg bg-surface p-3">

                      <dt className="text-xs text-muted-foreground">
                        Tamaño
                      </dt>

                      <dd className="mt-1 text-sm font-semibold">

                        {displayedMetadata
                          ? formatFileSize(
                              displayedMetadata.size,
                            )
                          : "—"}

                      </dd>

                    </div>

                    <div className="col-span-2 rounded-lg bg-surface p-3 sm:col-span-1">

                      <dt className="text-xs text-muted-foreground">
                        Resolución
                      </dt>

                      <dd className="mt-1 text-sm font-semibold">

                        {displayedDimensions
                          ? `${displayedDimensions.width} × ${displayedDimensions.height}`
                          : "—"}

                      </dd>

                    </div>

                  </dl>

                  {!displayedMetadata && (

                    <p className="mt-3 text-xs leading-5 text-muted-foreground">
                      El nombre, tamaño y formato
                      original solo están disponibles
                      al seleccionar un archivo nuevo.
                    </p>

                  )}

                </div>

              )}

              {/* QUALITY INDICATOR */}

              {imageQuality && (

                <div
                  className={`mt-4 rounded-xl border p-4 ${imageQuality.className}`}
                >

                  <div className="flex items-start gap-3">

                    {imageQuality.recommended ? (

                      <CheckCircle2
                        className="mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />

                    ) : (

                      <Scan
                        className="mt-0.5 size-5 shrink-0"
                        aria-hidden="true"
                      />

                    )}

                    <div>

                      <p className="text-sm font-semibold">
                        {imageQuality.title}
                      </p>

                      <p className="mt-1 text-xs leading-5">
                        {imageQuality.description}
                      </p>

                    </div>

                  </div>

                </div>

              )}

            </section>

            {/* =================================================
                ALTERNATIVE TEXT
            ================================================= */}

            <section className="rounded-2xl border border-border p-4 sm:p-5">

              <div className="flex items-start gap-3">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <Accessibility
                    className="size-5"
                    aria-hidden="true"
                  />

                </span>

                <div>

                  <h3 className="font-serif text-xl font-semibold">
                    Texto alternativo
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Describe la fotografía para
                    quienes no pueden verla.
                  </p>

                </div>

              </div>

              <div className="mt-4">

                <div className="mb-2 flex items-center justify-between gap-3">

                  <label
                    htmlFor="imageAlt"
                    className="text-sm font-medium"
                  >

                    Descripción de la imagen

                    <span className="ml-1 text-brand">
                      *
                    </span>

                  </label>

                  <span
                    className="text-xs text-muted-foreground"
                    aria-live="polite"
                  >

                    {imageAlt.length}/
                    {MAX_ALT_LENGTH}

                  </span>

                </div>

                <textarea
                  id="imageAlt"
                  rows={3}
                  maxLength={MAX_ALT_LENGTH}
                  value={imageAlt}
                  disabled={isBusy}
                  onChange={(event) => {
                    setImageAlt(
                      event.target.value,
                    );

                    setFeedback(null);
                  }}
                  className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60"
                  placeholder="Ej. Pollo dorado servido en una cazuela de barro, acompañado de papas arrugadas."
                />

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Entre 3 y 180 caracteres.
                  Describe lo que aparece realmente
                  en la fotografía.
                </p>

                {altValidation.success && (

                  <p className="mt-2 flex items-center gap-2 text-xs font-medium text-secondary-hover">

                    <CheckCircle2
                      className="size-4"
                      aria-hidden="true"
                    />

                    Texto alternativo válido

                  </p>

                )}

              </div>

              <div className="mt-4 rounded-xl border border-brand/15 bg-brand/5 p-4">

                <p className="flex items-center gap-2 text-sm font-semibold">

                  <Lightbulb
                    className="size-4 text-brand"
                    aria-hidden="true"
                  />

                  ¿Necesitas inspiración?

                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  En lugar de escribir únicamente
                  «Tarta de chocolate», prueba con
                  «Porción de tarta de chocolate
                  con cobertura cremosa y frutos
                  rojos».
                </p>

              </div>

            </section>

          </form>

          {/* =================================================
              UNSAVED CHANGES
          ================================================= */}

          {isDirty && (

            <p
              role="status"
              className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"
            >

              <Info
                className="size-4 shrink-0"
                aria-hidden="true"
              />

              Tienes cambios sin guardar.
              Guarda tu borrador antes de salir
              de este apartado.

            </p>

          )}

          {/* FEEDBACK */}

          {feedback && (

            <div
              role={
                feedback.type === "error"
                  ? "alert"
                  : "status"
              }
              className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                feedback.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-border bg-page-muted/40 text-muted-foreground"
              }`}
            >

              {feedback.type === "error" ? (

                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />

              ) : feedback.type === "success" ? (

                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />

              ) : (

                <Info
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />

              )}

              <p>{feedback.text}</p>

            </div>

          )}

        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-page-muted/20 px-5 py-4 sm:px-6">

          <Link
            href={previousStepHref}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Tiempos

          </Link>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              disabled={
                isBusy ||
                !isDirty ||
                !isComplete
              }
              onClick={() =>
                void persistImage(false)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save
                className="size-4"
                aria-hidden="true"
              />

              Guardar borrador

            </button>

            <button
              type="submit"
              form="recipe-image-form"
              disabled={
                isBusy ||
                !isComplete
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
                : isDirty
                  ? "Guardar y continuar"
                  : "Continuar"}

              {!isSaving && (

                <ArrowRight
                  className="size-4"
                  aria-hidden="true"
                />

              )}

            </button>

          </div>

        </footer>

      </section>

      {/* ===================================================
          RIGHT SIDEBAR
      =================================================== */}

      <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">

        {/* PHOTOGRAPHY TIPS */}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border px-5 py-5 text-center">

            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">

              <Camera
                className="size-6"
                aria-hidden="true"
              />

            </span>

            <h2 className="mt-3 font-serif text-xl font-semibold">
              Consejos de CociHub
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Haz que tu receta entre por los ojos.
            </p>

          </div>

          <ol className="space-y-4 p-5">

            {[
              {
                title: "Luz natural",

                description:
                  "Aprovecha la luz de una ventana y evita sombras demasiado intensas.",
              },
              {
                title: "El resultado final",

                description:
                  "Muestra el plato terminado y listo para disfrutar.",
              },
              {
                title: "Cuida el encuadre",

                description:
                  "Deja espacio alrededor del plato para evitar recortes incómodos.",
              },
              {
                title: "Menos es más",

                description:
                  "Utiliza fondos sencillos y deja que la comida sea la protagonista.",
              },
            ].map((tip, index) => (

              <li
                key={tip.title}
                className="flex items-start gap-3"
              >

                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    index % 2 === 0
                      ? "bg-brand/10 text-brand"
                      : "bg-secondary/10 text-secondary-hover"
                  }`}
                >

                  {index + 1}

                </span>

                <div>

                  <h3 className="text-sm font-semibold">
                    {tip.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {tip.description}
                  </p>

                </div>

              </li>

            ))}

          </ol>

          <div className="mx-4 mb-4 rounded-xl bg-brand/5 p-4">

            <p className="flex items-center gap-2 text-sm font-semibold">

              <Lightbulb
                className="size-4 text-brand"
                aria-hidden="true"
              />

              Nuestro consejo

            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Recomendamos fotografías horizontales
              de al menos 1600 × 900 píxeles.
              No es un requisito obligatorio.
            </p>

          </div>

        </section>

        {/* PUBLIC PREVIEWS */}

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">

          <div className="flex items-center gap-2">

            <Scan
              className="size-5 shrink-0 text-brand"
              aria-hidden="true"
            />

            <h2 className="font-serif text-xl font-semibold">
              Así verán tu receta
            </h2>

          </div>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Comprueba el encuadre de tu fotografía
            en diferentes formatos.
          </p>

          {displayedImageUrl ? (

            <>

              {/* PREVIEW SELECTOR */}

              <div
                className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-page-muted p-1"
                aria-label="Formato de previsualización"
              >

                <button
                  type="button"
                  aria-pressed={
                    previewMode === "catalog"
                  }
                  onClick={() =>
                    setPreviewMode("catalog")
                  }
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    previewMode === "catalog"
                      ? "bg-surface text-brand shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >

                  Catálogo

                </button>

                <button
                  type="button"
                  aria-pressed={
                    previewMode === "recipe"
                  }
                  onClick={() =>
                    setPreviewMode("recipe")
                  }
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    previewMode === "recipe"
                      ? "bg-surface text-brand shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >

                  Ficha

                </button>

              </div>

              {/* PREVIEW CARD */}

              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface shadow-sm">

                {/* eslint-disable-next-line @next/next/no-img-element */}

                <img
                  src={displayedImageUrl}
                  alt={
                    imageAlt.trim() ||
                    "Previsualización de la receta"
                  }
                  className={
                    previewMode === "catalog"
                      ? "aspect-[4/3] w-full object-cover"
                      : "aspect-video w-full object-cover"
                  }
                />

                <div className="space-y-2 p-3">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand">
                    Recetas CociHub
                  </p>

                  <p className="font-serif text-lg font-semibold">
                    Tu receta
                  </p>

                  {previewMode === "catalog" ? (

                    <>

                      <div
                        aria-hidden="true"
                        className="space-y-2"
                      >

                        <div className="h-2 w-full rounded-full bg-page-muted" />

                        <div className="h-2 w-2/3 rounded-full bg-page-muted" />

                      </div>

                      <div className="mt-3 border-t border-border pt-3">

                        <span className="text-xs font-semibold text-brand">
                          Ver receta →
                        </span>

                      </div>

                    </>

                  ) : (

                    <p className="text-xs leading-5 text-muted-foreground">
                      Ejemplo de presentación
                      de la cabecera pública.
                    </p>

                  )}

                </div>

              </div>

              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">

                {previewMode === "catalog"
                  ? "Vista orientativa · Formato 4:3"
                  : "Vista orientativa · Formato 16:9"}

              </p>

            </>

          ) : (

            <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-page-muted/30 p-4 text-center">

              <ImagePlus
                className="size-8 text-brand/60"
                aria-hidden="true"
              />

              <p className="mt-3 text-sm font-medium">
                Vista previa pendiente
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Añade una fotografía para
                comprobar su presentación.
              </p>

            </div>

          )}

        </section>

        {/* ACCESSIBILITY HELP */}

        <section className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">

          <p className="flex items-center gap-2 text-sm font-semibold text-secondary-hover">

            <Accessibility
              className="size-5 shrink-0"
              aria-hidden="true"
            />

            Una cocina para todos

          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            El texto alternativo ayuda a que
            las personas que utilizan lectores
            de pantalla puedan comprender
            tus fotografías.
          </p>

        </section>

      </aside>

    </div>
  );
}