"use client";

import {
  Loader2,
  Save,
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
    <section className="rounded-2xl border border-border bg-surface p-6">

      <h2 className="font-serif text-xl font-semibold">
        Datos del perfil
      </h2>


      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Esta información identifica tu cuenta dentro de CociHub.
      </p>


      <form
        onSubmit={
          handleSubmit
        }
        className="mt-6 space-y-5"
      >

        <div>

          <label
            htmlFor="displayName"
            className="block text-sm font-semibold"
          >
            Nombre visible
          </label>


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
            className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
          />

        </div>


        <div>

          <label
            htmlFor="username"
            className="block text-sm font-semibold"
          >
            Nombre de usuario
          </label>


          <div className="mt-2 flex items-center rounded-xl border border-border bg-surface focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15">

            <span className="pl-4 text-muted-foreground">
              @
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
              className="w-full bg-transparent px-2 py-3 outline-none"
            />

          </div>


          <p className="mt-2 text-xs text-muted-foreground">
            Letras minúsculas, números y guion bajo.
          </p>

        </div>


        {email && (
          <div>

            <label className="block text-sm font-semibold">
              Correo electrónico
            </label>


            <div className="mt-2 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {
                email
              }
            </div>

          </div>
        )}


        {message && (
          <p
            role="status"
            className="rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm"
          >
            {
              message
            }
          </p>
        )}


        <div className="flex justify-end">

          <button
            type="submit"
            disabled={
              isSaving
            }
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:opacity-50"
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