"use client";

import {
  useRef,
  useState,
} from "react";

import {
  createCategoryAction,
} from "@/app/admin/categories/actions";


export function CategoryCreateForm() {
  const formRef =
    useRef<HTMLFormElement>(
      null,
    );

  const [message, setMessage] =
    useState<string | null>(
      null,
    );

  const [nameError, setNameError] =
    useState<string | null>(
      null,
    );

  const [
    descriptionError,
    setDescriptionError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);


  async function handleSubmit(
    formData: FormData,
  ) {
    setIsSubmitting(true);

    setMessage(null);
    setNameError(null);
    setDescriptionError(null);

    const result =
      await createCategoryAction(
        formData,
      );

    if (!result.success) {
      setNameError(
        result.fieldErrors
          ?.name?.[0] ??
          null,
      );

      setDescriptionError(
        result.fieldErrors
          ?.description?.[0] ??
          null,
      );

      setMessage(
        result.message ??
          null,
      );

      setIsSubmitting(false);

      return;
    }

    formRef.current?.reset();

    setMessage(
      result.message ??
        "Categoría creada.",
    );

    setIsSubmitting(false);
  }


  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-6 rounded-xl border p-6"
    >
      <div>
        <h2 className="text-xl font-semibold">
          Nueva categoría
        </h2>

        <p className="mt-1 text-sm">
          Crea una categoría que después podrá asignarse a las recetas.
        </p>
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-2 block font-medium"
        >
          Nombre
        </label>

        <input
          id="name"
          name="name"
          type="text"
          maxLength={80}
          required
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Ej. Arroces"
        />

        {nameError && (
          <p
            role="alert"
            className="mt-2 text-sm"
          >
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium"
        >
          Descripción
        </label>

        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border px-4 py-3"
          placeholder="Descripción opcional de la categoría."
        />

        {descriptionError && (
          <p
            role="alert"
            className="mt-2 text-sm"
          >
            {descriptionError}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Creando..."
            : "Crear categoría"}
        </button>

        {message && (
          <p
            role="status"
            className="text-sm"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}