"use client";

import {
  AlertCircle,
  ChefHat,
  Loader2,
  Plus,
} from "lucide-react";

import {
  useActionState,
  useState,
} from "react";

import {
  createRecipe,
  type NewRecipeState,
} from "./actions";


const initialState:
  NewRecipeState = {
  status:
    "idle",

  message:
    null,

  values: {
    title:
      "",

    slug:
      "",
  },
};


function createSlug(
  value:
    string,
) {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


export function NewRecipeForm() {
  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      createRecipe,
      initialState,
    );


  const [
    title,
    setTitle,
  ] =
    useState(
      state.values.title,
    );


  const [
    slug,
    setSlug,
  ] =
    useState(
      state.values.slug,
    );


  const [
    slugEdited,
    setSlugEdited,
  ] =
    useState(
      false,
    );


  return (
    <form
      action={
        formAction
      }
      className="space-y-6"
    >

      {state.status ===
        "error" &&
        state.message && (
          <div
            className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />

            <p>
              {
                state.message
              }
            </p>
          </div>
        )}


      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium"
        >
          Título de la receta
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          minLength={3}
          maxLength={120}
          value={
            title
          }
          placeholder="Por ejemplo, Pollo al limón"
          onChange={
            (
              event,
            ) => {
              const nextTitle =
                event
                  .target
                  .value;


              setTitle(
                nextTitle,
              );


              if (
                !slugEdited
              ) {
                setSlug(
                  createSlug(
                    nextTitle,
                  ),
                );
              }
            }
          }
          className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
        />

        <p className="mt-2 text-xs text-muted-foreground">
          No hace falta completar la receta
          ahora. Empezaremos creando un borrador.
        </p>
      </div>


      <div>
        <label
          htmlFor="slug"
          className="mb-2 block text-sm font-medium"
        >
          Dirección de la receta
        </label>

        <div className="flex overflow-hidden rounded-xl border border-border bg-page focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">

          <span className="flex items-center border-r border-border bg-page-muted px-3 text-xs text-muted-foreground">
            /recipes/
          </span>

          <input
            id="slug"
            name="slug"
            type="text"
            required
            minLength={3}
            maxLength={140}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            value={
              slug
            }
            onChange={
              (
                event,
              ) => {
                setSlugEdited(
                  true,
                );

                setSlug(
                  createSlug(
                    event
                      .target
                      .value,
                  ),
                );
              }
            }
            className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none"
          />

        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Se genera automáticamente a partir
          del título, pero puedes modificarla.
        </p>
      </div>


      <button
        type="submit"
        disabled={
          isPending
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2
              className="size-5 animate-spin"
              aria-hidden="true"
            />

            Creando borrador...
          </>
        ) : (
          <>
            <Plus
              className="size-5"
              aria-hidden="true"
            />

            Crear borrador
          </>
        )}
      </button>


      <div className="rounded-2xl border border-dashed border-border bg-page-muted p-5">

        <ChefHat
          className="size-5 text-brand"
          aria-hidden="true"
        />

        <p className="mt-3 text-sm font-semibold">
          Primero el borrador, después cocinamos
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Una vez creado podrás añadir
          descripción, raciones, tiempos,
          ingredientes, pasos, clasificación
          y el resto de información.
        </p>

      </div>

    </form>
  );
}