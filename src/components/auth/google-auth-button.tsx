"use client";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";


type GoogleAuthButtonProps = {
  label?:
    string;
};


function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5 shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.805 10.023h-9.18v3.955h5.282c-.228 1.272-.912 2.349-1.946 3.07v2.55h3.151c1.845-1.698 2.909-4.2 2.909-7.2 0-.8-.072-1.57-.216-2.375Z"
      />

      <path
        fill="#34A853"
        d="M12.625 21.5c2.625 0 4.825-.87 6.434-2.355l-3.151-2.55c-.87.582-1.983.93-3.283.93-2.529 0-4.669-1.707-5.435-4.005H3.934v2.637A9.72 9.72 0 0 0 12.625 21.5Z"
      />

      <path
        fill="#FBBC05"
        d="M7.19 13.52a5.83 5.83 0 0 1-.305-1.845c0-.642.111-1.267.305-1.845V7.193H3.934A9.827 9.827 0 0 0 2.875 11.675c0 1.582.378 3.082 1.059 4.482L7.19 13.52Z"
      />

      <path
        fill="#EA4335"
        d="M12.625 5.825c1.43 0 2.708.492 3.717 1.455l2.784-2.784C17.445 2.93 15.245 2 12.625 2a9.72 9.72 0 0 0-8.691 5.193L7.19 9.83c.766-2.298 2.906-4.005 5.435-4.005Z"
      />
    </svg>
  );
}


export function GoogleAuthButton({
  label =
    "Continuar con Google",
}: GoogleAuthButtonProps) {
  const [
    isPending,
    setIsPending,
  ] =
    useState(
      false,
    );


  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<
      string | null
    >(
      null,
    );


  async function handleGoogleLogin() {
    setIsPending(
      true,
    );

    setErrorMessage(
      null,
    );


    const supabase =
      createClient();


    const redirectTo =
      `${window.location.origin}/auth/callback`;


    const {
      error,
    } =
      await supabase
        .auth
        .signInWithOAuth({
          provider:
            "google",

          options: {
            redirectTo,
          },
        });


    if (error) {
      setErrorMessage(
        "No hemos podido iniciar el acceso con Google. Inténtalo de nuevo.",
      );

      setIsPending(
        false,
      );
    }
  }


  return (
    <div>
      <button
        type="button"
        disabled={
          isPending
        }
        onClick={
          handleGoogleLogin
        }
        className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-foreground shadow-xs transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2
              className="size-5 animate-spin"
              aria-hidden="true"
            />

            Conectando con Google...
          </>
        ) : (
          <>
            <GoogleIcon />

            {label}
          </>
        )}
      </button>


      {errorMessage && (
        <div
          className="mt-3 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />

          <p>
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}