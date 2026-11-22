"use client";

import {
  AlertCircle,
  ArrowRight,
  Link2,
  Loader2,
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
      className="space-y-7"
    >
      {/* ===================================================
          ERROR
      =================================================== */}

      {state.status ===
        "error" &&
        state.message ? (
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
      ) : null}


      {/* ===================================================
          TITLE
      =================================================== */}

      <div>
        <div className="mb-2 flex items-end justify-between gap-4">
          <label
            htmlFor="title"
            className="text-sm font-semibold"
          >
            Título de la receta
          </label>


          <span className="text-xs tabular-nums text-muted-foreground">
            {
              title.length
            }
            /120
          </span>
        </div>


        <input
          id="title"
          name="title"
          type="text"
          required
          autoFocus
          minLength={3}
          maxLength={120}
          autoComplete="off"
          value={
            title
          }
          placeholder="Por ejemplo, Pollo al limón"
          onChange={(
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
          }}
          className="w-full rounded-xl border border-border bg-page px-4 py-3.5 text-base outline-none transition placeholder:text-muted-foreground/65 focus:border-brand focus:ring-2 focus:ring-brand/15"
        />


        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          No necesitas tener la receta
          terminada. Solo ponle un nombre
          para comenzar.
        </p>
      </div>


      {/* ===================================================
          SLUG
      =================================================== */}

      <div>
        <div className="mb-2 flex items-end justify-between gap-4">
          <label
            htmlFor="slug"
            className="text-sm font-semibold"
          >
            Dirección de la receta
          </label>


          <div className="flex items-center gap-2">
            {slugEdited ? (
              <span className="text-[11px] font-semibold text-brand">
                Personalizada
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">
                Automática
              </span>
            )}


            <span className="text-xs tabular-nums text-muted-foreground">
              {
                slug.length
              }
              /140
            </span>
          </div>
        </div>


        <div className="flex overflow-hidden rounded-xl border border-border bg-page transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
          <span className="flex shrink-0 items-center gap-1.5 border-r border-border bg-page-muted px-3 text-xs text-muted-foreground">
            <Link2
              className="size-3.5"
              aria-hidden="true"
            />

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
            autoComplete="off"
            value={
              slug
            }
            onChange={(
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
            }}
            className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm outline-none"
          />
        </div>


        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          La generamos automáticamente
          a partir del título. Solo necesitas
          cambiarla si quieres una dirección
          diferente.
        </p>
      </div>


      {/* ===================================================
          CTA
      =================================================== */}

      <div className="border-t border-border pt-6">
        <button
          type="submit"
          disabled={
            isPending
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
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
              Crear borrador y continuar

              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />
            </>
          )}
        </button>


        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          La receta seguirá siendo privada
          hasta que decidas enviarla a revisión.
        </p>
      </div>
    </form>
  );
}