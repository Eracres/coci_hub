"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
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
  register,
  type RegisterState,
} from "./actions";


const initialState:
  RegisterState = {
  status:
    "idle",

  message:
    null,

  values: {
    displayName:
      "",

    username:
      "",

    email:
      "",
  },

  attempt:
    0,
};


export function RegisterForm() {
  const [
    state,
    formAction,
    isPending,
  ] =
    useActionState(
      register,
      initialState,
    );


  const [
    displayName,
    setDisplayName,
  ] =
    useState(
      "",
    );


  const [
    username,
    setUsername,
  ] =
    useState(
      "",
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
    confirmPassword,
    setConfirmPassword,
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


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(
      false,
    );


  useEffect(
    () => {
      if (
        state.attempt ===
        0
      ) {
        return;
      }


      setPassword(
        "",
      );

      setConfirmPassword(
        "",
      );


      if (
        state.status ===
        "error"
      ) {
        setDisplayName(
          state.values
            .displayName,
        );

        setUsername(
          state.values
            .username,
        );

        setEmail(
          state.values
            .email,
        );
      }
    },
    [
      state.attempt,
      state.status,
      state.values,
    ],
  );


  if (
    state.status ===
    "success"
  ) {
    return (
      <div className="px-6 py-8 sm:px-8">

        <div className="flex gap-3 rounded-2xl border border-border bg-page-muted p-4 text-sm">
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-brand"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              ¡Cuenta creada!
            </p>

            <p className="mt-1 leading-6 text-muted-foreground">
              {state.message}
            </p>
          </div>
        </div>


        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Ya has confirmado
            tu cuenta?{" "}

            <Link
              href="/login"
              className="font-semibold text-brand transition hover:text-brand-hover"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>

      </div>
    );
  }


  return (
    <div className="px-6 py-8 sm:px-8">

      <GoogleAuthButton
        label="Registrarme con Google"
      />


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

          <p className="mt-2 text-xs text-muted-foreground">
            Opcional. Es el
            nombre que podremos
            mostrar junto a tus
            recetas.
          </p>
        </div>


        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium"
          >
            Nombre de usuario
          </label>

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
            placeholder="cocina_en_casa"
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
            className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Entre 3 y 30
            caracteres. Letras,
            números y guion bajo.
            Se guardará en
            minúsculas.
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
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
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

          <p className="mt-2 text-xs text-muted-foreground">
            Utiliza al menos
            8 caracteres.
          </p>
        </div>


        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium"
          >
            Repite la contraseña
          </label>

          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
              value={
                confirmPassword
              }
              onChange={
                (
                  event,
                ) => {
                  setConfirmPassword(
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
                  setShowConfirmPassword(
                    (
                      current,
                    ) =>
                      !current,
                  );
                }
              }
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted-foreground transition hover:text-foreground"
              aria-label={
                showConfirmPassword
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {showConfirmPassword ? (
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

              Creando cuenta...
            </>
          ) : (
            <>
              <UserPlus
                className="size-5"
                aria-hidden="true"
              />

              Crear mi cuenta
            </>
          )}
        </button>


        <p className="text-center text-xs leading-5 text-muted-foreground">
          Al crear tu cuenta
          aceptas las normas de
          CociHub y nuestra{" "}

          <Link
            href="/privacy"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            política de privacidad
          </Link>

          .
        </p>
      </form>


      <div className="mt-8 border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}

          <Link
            href="/login"
            className="font-semibold text-brand transition hover:text-brand-hover"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>

    </div>
  );
}