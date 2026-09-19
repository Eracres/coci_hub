"use client";

import {
  Bot,
  FileImage,
  ImagePlus,
  Loader2,
  RotateCcw,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AiRecipeImportDraftActions,
} from "@/components/admin/recipes/ai-recipe-import-draft-actions";

import {
  AiRecipeImportReview,
} from "@/components/admin/recipes/ai-recipe-import-review";

import type {
  AiRecipeImport,
} from "@/schemas/ai-recipe-import-schema";

import type {
  AiRecipeImportApiResponse,
} from "@/types/ai-recipe-import-api";


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


type ValidationResult =
  | {
      success:
        true;

      error:
        null;
    }
  | {
      success:
        false;

      error:
        string;
    };


function validateImageFile(
  file:
    File,
): ValidationResult {
  if (
    !ALLOWED_FILE_TYPES.includes(
      file.type,
    )
  ) {
    return {
      success:
        false,

      error:
        "Formato no válido. Utiliza una imagen JPG, PNG o WebP.",
    };
  }


  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    return {
      success:
        false,

      error:
        "La imagen supera el límite máximo de 5 MB.",
    };
  }


  return {
    success:
      true,

    error:
      null,
  };
}


function formatFileSize(
  bytes:
    number,
) {
  const megabytes =
    bytes /
    1024 /
    1024;


  if (
    megabytes >=
    1
  ) {
    return `${megabytes.toFixed(
      2,
    )} MB`;
  }


  const kilobytes =
    bytes /
    1024;


  return `${Math.round(
    kilobytes,
  )} KB`;
}


export function AiRecipeImportUploader() {
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const previewUrlRef =
    useRef<string | null>(
      null,
    );


  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null,
    );


  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState<string | null>(
      null,
    );


  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    isDragging,
    setIsDragging,
  ] =
    useState(
      false,
    );


  const [
    isAnalyzing,
    setIsAnalyzing,
  ] =
    useState(
      false,
    );


  const [
    analysisResult,
    setAnalysisResult,
  ] =
    useState<AiRecipeImport | null>(
      null,
    );


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


  function applyFile(
    file:
      File | null,
  ) {
    if (
      !file
    ) {
      return;
    }


    const validation =
      validateImageFile(
        file,
      );


    if (
      !validation.success
    ) {
      setError(
        validation.error,
      );

      return;
    }


    if (
      previewUrlRef.current
    ) {
      URL.revokeObjectURL(
        previewUrlRef.current,
      );
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

    setError(
      null,
    );

    setAnalysisResult(
      null,
    );

    setSelectedFile(
      file,
    );
  }


  function handleInputChange(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ??
      null;


    applyFile(
      file,
    );
  }


  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect =
      "copy";

    setIsDragging(
      true,
    );
  }


  function handleDragLeave(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(
      false,
    );
  }


  function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(
      false,
    );


    const file =
      event.dataTransfer.files?.[0] ??
      null;


    applyFile(
      file,
    );
  }


  function removeFile() {
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

    setSelectedFile(
      null,
    );

    setError(
      null,
    );

    setIsAnalyzing(
      false,
    );

    setAnalysisResult(
      null,
    );


    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  }


  function openFileSelector() {
    inputRef.current?.click();
  }


  async function analyzeImage() {
    if (
      !selectedFile ||
      isAnalyzing
    ) {
      return;
    }


    setIsAnalyzing(
      true,
    );

    setError(
      null,
    );

    setAnalysisResult(
      null,
    );


    try {
      const formData =
        new FormData();


      formData.append(
        "image",
        selectedFile,
      );


      const response =
        await fetch(
          "/api/admin/recipes/import",
          {
            method:
              "POST",

            body:
              formData,
          },
        );


      const payload =
        (
          await response.json()
        ) as AiRecipeImportApiResponse;


      if (
        !response.ok ||
        !payload.success
      ) {
        setError(
          payload.success
            ? "No se pudo analizar la receta."
            : payload.error,
        );

        return;
      }


      setAnalysisResult(
        payload.recipe,
      );
    } catch (
      requestError
    ) {
      console.error(
        "AI RECIPE IMPORT REQUEST ERROR:",
        requestError,
      );


      setError(
        "No se pudo conectar con el servicio de análisis.",
      );
    } finally {
      setIsAnalyzing(
        false,
      );
    }
  }


  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand">
            <Bot
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>


          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Importar receta
              con IA
            </h2>


            <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">
              Sube una fotografía,
              captura de pantalla
              o imagen de una
              receta. CociHub
              analizará su contenido
              y preparará los datos
              para que puedas
              revisarlos antes de
              crear el borrador.
            </p>
          </div>
        </div>
      </section>


      {!selectedFile ? (
        <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
          <div
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={
              handleDrop
            }
            className={`rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
              isDragging
                ? "border-brand bg-secondary/70"
                : "border-border bg-secondary/30"
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-brand shadow-sm">
              <ImagePlus
                className="h-7 w-7"
                aria-hidden="true"
              />
            </div>


            <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
              Sube la imagen
              de la receta
            </h3>


            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Arrastra una imagen
              hasta esta zona o
              selecciónala desde
              tu dispositivo.
            </p>


            <button
              type="button"
              onClick={
                openFileSelector
              }
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse transition-colors hover:bg-brand-hover"
            >
              <Upload
                className="h-4 w-4"
                aria-hidden="true"
              />

              Seleccionar imagen
            </button>


            <p className="mt-4 text-xs text-muted-foreground">
              JPG · PNG · WebP
              · Máximo 5 MB
            </p>


            <input
              ref={
                inputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleInputChange
              }
              className="sr-only"
            />
          </div>


          {error ? (
            <div className="mt-4 flex gap-3 rounded-xl border border-border bg-secondary/50 p-4">
              <TriangleAlert
                className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                aria-hidden="true"
              />

              <p className="text-sm leading-6 text-muted-foreground">
                {
                  error
                }
              </p>
            </div>
          ) : null}
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
                  Imagen seleccionada
                </p>


                <h3 className="mt-1 font-serif text-2xl font-bold text-foreground">
                  Vista previa
                </h3>
              </div>


              <button
                type="button"
                onClick={
                  removeFile
                }
                disabled={
                  isAnalyzing
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Eliminar imagen
              </button>
            </div>


            {previewUrl ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    previewUrl
                  }
                  alt="Vista previa de la receta que se importará con IA"
                  className="max-h-[650px] w-full object-contain"
                />
              </div>
            ) : null}


            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-secondary/40 px-4 py-3 text-sm">
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <FileImage
                  className="h-4 w-4 text-brand"
                  aria-hidden="true"
                />

                {
                  selectedFile.name
                }
              </span>


              <span className="text-muted-foreground">
                {formatFileSize(
                  selectedFile.size,
                )}
              </span>


              <span className="text-muted-foreground">
                {
                  selectedFile.type
                }
              </span>
            </div>


            <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5">
              <div className="flex items-start gap-3">
                <Bot
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-semibold text-foreground">
                    Análisis inteligente
                  </p>


                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    CociHub analizará
                    la imagen e
                    intentará detectar
                    título, raciones,
                    ingredientes,
                    pasos y demás
                    información sin
                    publicar nada
                    automáticamente.
                  </p>
                </div>
              </div>


              <button
                type="button"
                onClick={
                  analyzeImage
                }
                disabled={
                  isAnalyzing
                }
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />

                    Analizando receta...
                  </>
                ) : analysisResult ? (
                  <>
                    <RotateCcw
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Analizar de nuevo
                  </>
                ) : (
                  <>
                    <Bot
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Analizar receta con IA
                  </>
                )}
              </button>
            </div>


            {error ? (
              <div className="mt-5 flex gap-3 rounded-xl border border-border bg-secondary/50 p-4">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <p className="text-sm leading-6 text-muted-foreground">
                  {
                    error
                  }
                </p>
              </div>
            ) : null}
          </section>


          {analysisResult ? (
            <>
              <AiRecipeImportReview
                recipe={
                  analysisResult
                }
                onChange={
                  setAnalysisResult
                }
              />


              <AiRecipeImportDraftActions
                recipe={
                  analysisResult
                }
              />
            </>
          ) : null}
        </>
      )}
    </div>
  );
}