"use client";

import {
  Check,
  Copy,
  Mail,
  MessageCircle,
  Send,
  Share2,
  TriangleAlert,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


type RecipeShareActionsProps = {
  title: string;
};


type CopyStatus =
  | "idle"
  | "copied"
  | "error";


export function RecipeShareActions({
  title,
}: RecipeShareActionsProps) {
  const [
    copyStatus,
    setCopyStatus,
  ] =
    useState<CopyStatus>(
      "idle",
    );


  const [
    canUseNativeShare,
    setCanUseNativeShare,
  ] =
    useState(
      false,
    );


  useEffect(
    () => {
      setCanUseNativeShare(
        typeof navigator !==
          "undefined" &&
          typeof navigator.share ===
            "function",
      );
    },
    [],
  );


  function getCurrentUrl() {
    return window.location.href;
  }


  function getShareText() {
    return `Mira esta receta de CociHub: ${title}`;
  }


  function shareOnWhatsApp() {
    const url =
      getCurrentUrl();


    const text =
      `${getShareText()}\n${url}`;


    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(
        text,
      )}`;


    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }


  function shareOnTelegram() {
    const url =
      getCurrentUrl();


    const telegramUrl =
      `https://t.me/share/url?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(
        getShareText(),
      )}`;


    window.open(
      telegramUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }


  function shareByEmail() {
    const url =
      getCurrentUrl();


    const subject =
      `Receta: ${title}`;


    const body =
      `${getShareText()}\n\n${url}`;


    window.location.href =
      `mailto:?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(
        body,
      )}`;
  }


  async function shareNative() {
    if (
      !navigator.share
    ) {
      return;
    }


    try {
      await navigator.share(
        {
          title:
            `${title} | CociHub`,

          text:
            getShareText(),

          url:
            getCurrentUrl(),
        },
      );
    } catch (
      error
    ) {
      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {
        return;
      }


      console.error(
        "NATIVE SHARE ERROR:",
        error,
      );
    }
  }


  async function copyRecipeLink() {
    try {
      await navigator.clipboard.writeText(
        getCurrentUrl(),
      );


      setCopyStatus(
        "copied",
      );


      window.setTimeout(
        () => {
          setCopyStatus(
            "idle",
          );
        },
        2000,
      );
    } catch (
      error
    ) {
      console.error(
        "COPY RECIPE LINK ERROR:",
        error,
      );


      setCopyStatus(
        "error",
      );


      window.setTimeout(
        () => {
          setCopyStatus(
            "idle",
          );
        },
        2500,
      );
    }
  }


  return (
    <div className="mt-7">
      <p className="text-sm font-semibold text-foreground">
        Compartir receta
      </p>


      <div className="mt-3 flex flex-wrap gap-3">
        {canUseNativeShare ? (
          <button
            type="button"
            onClick={
              shareNative
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition-colors hover:bg-brand-hover"
          >
            <Share2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Más opciones
          </button>
        ) : null}


        <button
          type="button"
          onClick={
            shareOnWhatsApp
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <MessageCircle
            className="h-4 w-4 text-brand"
            aria-hidden="true"
          />

          WhatsApp
        </button>


        <button
          type="button"
          onClick={
            shareOnTelegram
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Send
            className="h-4 w-4 text-brand"
            aria-hidden="true"
          />

          Telegram
        </button>


        <button
          type="button"
          onClick={
            shareByEmail
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          <Mail
            className="h-4 w-4 text-brand"
            aria-hidden="true"
          />

          Correo
        </button>


        <button
          type="button"
          onClick={
            copyRecipeLink
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
        >
          {copyStatus ===
          "copied" ? (
            <Check
              className="h-4 w-4 text-brand"
              aria-hidden="true"
            />
          ) : copyStatus ===
            "error" ? (
            <TriangleAlert
              className="h-4 w-4 text-brand"
              aria-hidden="true"
            />
          ) : (
            <Copy
              className="h-4 w-4 text-brand"
              aria-hidden="true"
            />
          )}


          {copyStatus ===
          "copied"
            ? "Enlace copiado"
            : copyStatus ===
                "error"
              ? "No se pudo copiar"
              : "Copiar enlace"}
        </button>
      </div>


      <p
        aria-live="polite"
        className="sr-only"
      >
        {copyStatus ===
        "copied"
          ? "El enlace de la receta se ha copiado al portapapeles."
          : copyStatus ===
              "error"
            ? "No se pudo copiar el enlace de la receta."
            : ""}
      </p>
    </div>
  );
}