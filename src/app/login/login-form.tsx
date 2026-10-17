"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
} from "lucide-react";

import Link from "next/link";

import {
  useActionState,
  useEffect,
  useState,
} from "react";

import {
  GoogleAuthButton,
} from "@/components/auth/google-auth-button";

import {
  login,
  type LoginState,
} from "./actions";


const initialState:
  LoginState = {
  status:
    "idle",

  message:
    null,

  email:
    "",
};


export function LoginForm() {
  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      login,
      initialState,
    );


  const [
    email,
    setEmail,
  ] =
    useState(
      "",
    );


  const [
    password,
    setPassword,
  ] =
    useState(
      "",
    );


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(
      false,
    );


  useEffect(
    () => {
      if (
        state.status !==
        "error"
      ) {
        return;
      }


      setEmail(
        state.email,
      );

      setPassword(
        "",
      );
    },
    [
      state,
    ],
  );


  return (
    <div className="px-6 py-8 sm:px-8">

      <GoogleAuthButton />


      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />

        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          o
        </span>

        <div className="h-px flex-1 bg-border" />
      </div>


      {state.status ===
        "error" &&
        state.message && (
          <div
            className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
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


      <form
        action={
          formAction
        }
        className="space-y-5"
      >

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
          >
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="tu@email.com"
            value={
              email
            }
            onChange={
              (
                event,
              ) => {
                setEmail(
                  event
                    .target
                    .value,
                );
              }
            }
            className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>


        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
          >
            Contraseña
          </label>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              autoComplete="current-password"
              required
              value={
                password
              }
              onChange={
                (
                  event,
                ) => {
                  setPassword(
                    event
                      .target
                      .value,
                  );
                }
              }
              className="w-full rounded-xl border border-border bg-page px-4 py-3 pr-12 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
            />

            <button
              type="button"
              onClick={
                () => {
                  setShowPassword(
                    (
                      current,
                    ) =>
                      !current,
                  );
                }
              }
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground"
              aria-label={
                showPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff
                  className="size-5"
                  aria-hidden="true"
                />
              ) : (
                <Eye
                  className="size-5"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
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

              Iniciando sesión...
            </>
          ) : (
            <>
              <LogIn
                className="size-5"
                aria-hidden="true"
              />

              Iniciar sesión
            </>
          )}
        </button>
      </form>


      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Todavía no tienes
          una cuenta?{" "}

          <Link
            href="/register"
            className="font-semibold text-brand transition hover:text-brand-hover"
          >
            Crear una cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
