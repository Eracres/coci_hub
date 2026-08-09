"use client";

import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ImagePlus,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const acceptedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

type SelectedImage = {
  file: File;
  previewUrl: string;
};

export function ImageUploaderDemo() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedImage, setSelectedImage] =
    useState<SelectedImage | null>(null);

  const [altText, setAltText] = useState("");

  const [error, setError] = useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  useEffect(() => {
    return () => {
      if (selectedImage?.previewUrl) {
        URL.revokeObjectURL(
          selectedImage.previewUrl,
        );
      }
    };
  }, [selectedImage]);

  function validateFile(file: File) {
    if (!acceptedTypes.includes(file.type)) {
      return "Formato no válido. Utiliza JPG, PNG o WebP.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "La imagen no puede superar los 5 MB.";
    }

    return "";
  }

  function selectFile(file: File) {
    const validationError =
      validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(
        selectedImage.previewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage({
      file,
      previewUrl,
    });

    setError("");
  }

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    selectFile(file);

    event.target.value = "";
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    setIsDragging(false);

    const file =
      event.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    selectFile(file);
  }

  function removeImage() {
    if (selectedImage?.previewUrl) {
      URL.revokeObjectURL(
        selectedImage.previewUrl,
      );
    }

    setSelectedImage(null);
    setAltText("");
    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function openFileDialog() {
    inputRef.current?.click();
  }

  return (
    <section
      className="
        rounded-lg border border-border
        bg-surface p-6
        shadow-[var(--shadow-sm)]
      "
    >
      <div>
        <h3 className="font-serif text-xl font-bold">
          Imagen principal
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Esta imagen será la principal de la receta y
          aparecerá también en tarjetas y resultados.
        </p>
      </div>

      {!selectedImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            mt-6 flex min-h-64 flex-col
            items-center justify-center
            rounded-lg border-2 border-dashed
            p-8 text-center
            transition-colors
            ${
              isDragging
                ? "border-brand bg-surface-hover"
                : "border-border-strong bg-page"
            }
          `}
        >
          <span
            className="
              flex size-14 items-center
              justify-center rounded-full
              bg-page-muted text-brand
            "
          >
            <ImagePlus
              aria-hidden="true"
              className="size-6"
            />
          </span>

          <p className="mt-4 font-semibold">
            Arrastra una imagen aquí
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            o selecciona un archivo desde tu dispositivo
          </p>

          <Button
            type="button"
            variant="secondary"
            className="mt-5"
            onClick={openFileDialog}
          >
            <Upload
              aria-hidden="true"
              className="size-4"
            />

            Seleccionar imagen
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            JPG, PNG o WebP · Máximo 5 MB
          </p>
        </div>
      ) : (
        <div className="mt-6">
          <div
            className="
              overflow-hidden rounded-lg
              border border-border bg-page
            "
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.previewUrl}
              alt={
                altText ||
                "Previsualización de la imagen seleccionada"
              }
              className="
                aspect-[16/9] w-full
                object-cover
              "
            />
          </div>

          <div
            className="
              mt-4 flex flex-col gap-3
              sm:flex-row
            "
          >
            <Button
              type="button"
              variant="secondary"
              onClick={openFileDialog}
            >
              <RotateCcw
                aria-hidden="true"
                className="size-4"
              />

              Cambiar imagen
            </Button>

            <Button
              type="button"
              variant="danger"
              onClick={removeImage}
            >
              <Trash2
                aria-hidden="true"
                className="size-4"
              />

              Eliminar
            </Button>
          </div>

          <div className="mt-6">
            <label
              htmlFor="recipe-image-alt"
              className="
                mb-2 block text-sm
                font-semibold
              "
            >
              Texto alternativo
              <span
                aria-hidden="true"
                className="ml-1 text-error"
              >
                *
              </span>
            </label>

            <Input
              id="recipe-image-alt"
              value={altText}
              onChange={(event) =>
                setAltText(
                  event.target.value,
                )
              }
              placeholder="Ej. Falafel de remolacha servido con salsa de yogur"
              maxLength={180}
            />

            <p className="mt-2 text-sm text-muted-foreground">
              Describe brevemente lo que aparece en la
              imagen para mejorar la accesibilidad.
            </p>
          </div>

          <div
            className="
              mt-5 rounded-md
              bg-page-muted p-4
              text-sm
            "
          >
            <dl className="grid gap-2">
              <div
                className="
                  flex justify-between gap-4
                "
              >
                <dt className="text-muted-foreground">
                  Archivo
                </dt>

                <dd
                  className="
                    max-w-[60%] truncate
                    font-medium
                  "
                >
                  {selectedImage.file.name}
                </dd>
              </div>

              <div
                className="
                  flex justify-between gap-4
                "
              >
                <dt className="text-muted-foreground">
                  Tamaño
                </dt>

                <dd className="font-medium">
                  {(
                    selectedImage.file.size /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </dd>
              </div>

              <div
                className="
                  flex justify-between gap-4
                "
              >
                <dt className="text-muted-foreground">
                  Tipo
                </dt>

                <dd className="font-medium">
                  {selectedImage.file.type}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleInputChange}
      />

      <div className="mt-3">
        <FormError message={error} />
      </div>
    </section>
  );
}