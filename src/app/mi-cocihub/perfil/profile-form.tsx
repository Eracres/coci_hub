"use client";

import {
  AlertCircle,
  AtSign,
  CheckCircle2,
  Loader2,
  Save,
} from "lucide-react";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  updateProfile,
  type ProfileState,
} from "./actions";


type ProfileFormProps = {
  initialDisplayName:
    string;

  initialUsername:
    string;

  email:
    string;
};


export function ProfileForm({
  initialDisplayName,
  initialUsername,
  email,
}: ProfileFormProps) {

  const initialState:
    ProfileState = {
    status:
      "idle",

    message:
      null,

    values: {
      displayName:
        initialDisplayName,

      username:
        initialUsername,
    },

    attempt:
      0,
  };


  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      updateProfile,
      initialState,
    );


  const [
    displayName,
    setDisplayName,
  ] =
    useState(
      initialDisplayName,
    );


  const [
    username,
    setUsername,
  ] =
    useState(
      initialUsername,
    );


  useEffect(
    () => {
      if (
        state.attempt ===
        0
      ) {
        return;
      }


      setDisplayName(
        state.values
          .displayName,
      );


      setUsername(
        state.values
          .username,
      );
    },
    [
      state.attempt,
      state.values,
    ],
  );


  return (
    <form
      action={
        formAction
      }
      className="space-y-6"
    >

      {state.status ===
        "success" &&
        state.message && (
          <div
            className="flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            role="status"
          >
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />

            <p>
              {state.message}
            </p>
          </div>
        )}


      {state.status ===
        "error" &&
        state.message && (
          <div
            className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle
              className="mt-0.5 size-5 shrink-0"
              aria-hidden="true"
            />

            <p>
              {state.message}
            </p>
          </div>
        )}


      <div>
        <label
          htmlFor="displayName"
          className="mb-2 block text-sm font-medium"
        >
          Nombre visible
        </label>

        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          maxLength={120}
          placeholder="Tu nombre o apodo"
          value={
            displayName
          }
          onChange={
            (
              event,
            ) => {
              setDisplayName(
                event
                  .target
                  .value,
              );
            }
          }
          className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
        />

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Es el nombre que podremos
          mostrar junto a tus recetas.
          Puedes cambiarlo cuando quieras.
        </p>
      </div>


      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium"
        >
          Nombre de usuario
        </label>

        <div className="relative">
          <AtSign
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            minLength={3}
            maxLength={30}
            pattern="[A-Za-z0-9_]{3,30}"
            value={
              username
            }
            onChange={
              (
                event,
              ) => {
                setUsername(
                  event
                    .target
                    .value,
                );
              }
            }
            className="w-full rounded-xl border border-border bg-page py-3 pl-10 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Entre 3 y 30 caracteres.
          Letras, números y guion bajo.
          Se guardará siempre en minúsculas.
        </p>
      </div>


      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium"
        >
          Correo electrónico
        </label>

        <input
          id="email"
          type="email"
          value={
            email
          }
          readOnly
          disabled
          className="w-full cursor-not-allowed rounded-xl border border-border bg-page-muted px-4 py-3 text-sm text-muted-foreground"
        />

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          El cambio de correo se gestionará
          desde la configuración de cuenta
          para poder verificar la nueva dirección.
        </p>
      </div>


      <div className="pt-2">

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

              Guardando cambios...
            </>
          ) : (
            <>
              <Save
                className="size-5"
                aria-hidden="true"
              />

              Guardar cambios
            </>
          )}
        </button>

      </div>

    </form>
  );
}
