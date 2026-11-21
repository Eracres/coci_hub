"use client";

import {
  AtSign,
  Loader2,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateMyProfileAction,
} from "./profile-actions";


type ProfileFormProps = {
  initialDisplayName:
    string;

  initialUsername:
    string;

  email:
    string | null;
};


export function ProfileForm({
  initialDisplayName,
  initialUsername,
  email,
}: ProfileFormProps) {
  const router =
    useRouter();


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


  const [
    message,
    setMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );


  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setMessage(
      null,
    );


    const formData =
      new FormData();


    formData.set(
      "displayName",
      displayName,
    );


    formData.set(
      "username",
      username,
    );


    setIsSaving(
      true,
    );


    try {
      const result =
        await updateMyProfileAction(
          formData,
        );


      setMessage(
        result.message ??
        (
          result.success
            ? "Perfil actualizado."
            : "No se pudo actualizar el perfil."
        ),
      );


      if (
        result.success
      ) {
        router.refresh();
      }

    } finally {
      setIsSaving(
        false,
      );
    }
  }


  return (
    <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
      {/* =================================================
          HEADER
      ================================================= */}

      <header className="border-b border-border bg-secondary/[0.035] px-6 py-5 sm:px-7">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/15 text-secondary-hover">
            <UserRound
              className="size-5"
              aria-hidden="true"
            />
          </span>


          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-hover">
              Información pública
            </p>


            <h2 className="mt-1 font-serif text-2xl font-bold">
              Datos del perfil
            </h2>


            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Esta información identifica
              tu cuenta y será visible
              dentro de CociHub.
            </p>
          </div>
        </div>
      </header>


      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6 p-6 sm:p-7"
      >
        {/* ===============================================
            DISPLAY NAME
        =============================================== */}

        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-semibold"
          >
            Nombre visible
          </label>


          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Es el nombre que verá la
            comunidad en tus recetas
            y en tu perfil.
          </p>


          <div className="mt-2.5 flex items-center rounded-xl border border-border bg-page transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <span className="flex h-full items-center pl-4 text-muted-foreground">
              <UserRound
                className="size-4"
                aria-hidden="true"
              />
            </span>


            <input
              id="displayName"
              type="text"
              value={
                displayName
              }
              maxLength={
                120
              }
              required
              disabled={
                isSaving
              }
              onChange={(
                event,
              ) =>
                setDisplayName(
                  event
                    .target
                    .value,
                )
              }
              className="w-full bg-transparent px-3 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>


        {/* ===============================================
            USERNAME
        =============================================== */}

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-semibold"
          >
            Nombre de usuario
          </label>


          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Tu identificador único dentro
            de CociHub.
          </p>


          <div className="mt-2.5 flex items-center rounded-xl border border-border bg-page transition focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">
            <span className="flex h-full items-center pl-4 text-brand">
              <AtSign
                className="size-4"
                aria-hidden="true"
              />
            </span>


            <input
              id="username"
              type="text"
              value={
                username
              }
              minLength={
                3
              }
              maxLength={
                30
              }
              required
              disabled={
                isSaving
              }
              onChange={(
                event,
              ) =>
                setUsername(
                  event
                    .target
                    .value
                    .toLowerCase(),
                )
              }
              className="w-full bg-transparent px-3 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>


          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <AtSign
              className="size-3.5"
              aria-hidden="true"
            />

            Letras minúsculas,
            números y guion bajo.
          </p>
        </div>


        {/* ===============================================
            EMAIL
        =============================================== */}

        {email && (
          <div>
            <label className="block text-sm font-semibold">
              Correo electrónico
            </label>


            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              El correo pertenece a tu
              cuenta de acceso y no se
              modifica desde este formulario.
            </p>


            <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-border bg-page-muted/55 px-4 py-3.5">
              <Mail
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />


              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {
                  email
                }
              </span>


              <LockKeyhole
                className="size-4 shrink-0 text-muted-foreground/70"
                aria-hidden="true"
              />
            </div>
          </div>
        )}


        {/* ===============================================
            STATUS MESSAGE
        =============================================== */}

        {message && (
          <p
            role="status"
            className="rounded-xl border border-brand/15 bg-brand/[0.045] px-4 py-3 text-sm leading-6 text-foreground"
          >
            {
              message
            }
          </p>
        )}


        {/* ===============================================
            SAVE
        =============================================== */}

        <div className="flex justify-end border-t border-border pt-5">
          <button
            type="submit"
            disabled={
              isSaving
            }
            className="inline-flex min-w-[175px] items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save
                className="size-4"
                aria-hidden="true"
              />
            )}


            {isSaving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}