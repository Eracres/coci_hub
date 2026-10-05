"use client";

import {
  AlertCircle,
  AtSign,
  Loader2,
} from "lucide-react";

import {
  useActionState,
} from "react";

import {
  completeProfile,
  type CompleteProfileState,
} from "./actions";


const initialState:
  CompleteProfileState = {
  status:
    "idle",

  message:
    null,

  username:
    "",
};


export function CompleteProfileForm() {
  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      completeProfile,
      initialState,
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
              {state.message}
            </p>
          </div>
        )}


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
            key={
              state.username
            }
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
            defaultValue={
              state.username
            }
            placeholder="tu_usuario"
            className="w-full rounded-xl border border-border bg-page py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          Entre 3 y 30 caracteres.
          Puedes utilizar letras,
          números y guion bajo.
          Se guardará en minúsculas.
        </p>
      </div>


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

            Completando perfil...
          </>
        ) : (
          <>
            <AtSign
              className="size-5"
              aria-hidden="true"
            />

            Elegir mi usuario
          </>
        )}
      </button>
    </form>
  );
}
