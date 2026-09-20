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
  useState,
} from "react";


type RecipeShareActionsProps = {
  title:
    string;
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


  async function shareNative() {
    if (
      typeof navigator.share !==
      "function"
    ) {
      await copyRecipeLink();

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


  return (
    <div className="mt-7 border-t border-border pt-6">
      <div className="flex items-center gap-2">
        <Share2
          className="size-4 text-brand"
          aria-hidden="true"
        />

        <p className="text-sm font-semibold text-foreground">
          Compartir esta receta
        </p>
      </div>


      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          onClick={
            shareNative
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-brand-hover"
        >
          <Share2
            className="size-4"
            aria-hidden="true"
          />

          Compartir
        </button>


        <button
          type="button"
          onClick={
            shareOnWhatsApp
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition duration-200 hover:border-secondary hover:bg-page-muted"
        >
          <MessageCircle
            className="size-4 text-secondary-hover"
            aria-hidden="true"
          />

          WhatsApp
        </button>


        <button
          type="button"
          onClick={
            shareOnTelegram
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition duration-200 hover:border-secondary hover:bg-page-muted"
        >
          <Send
            className="size-4 text-secondary-hover"
            aria-hidden="true"
          />

          Telegram
        </button>


        <button
          type="button"
          onClick={
            shareByEmail
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition duration-200 hover:border-secondary hover:bg-page-muted"
        >
          <Mail
            className="size-4 text-secondary-hover"
            aria-hidden="true"
          />

          Correo
        </button>


        <button
          type="button"
          onClick={
            copyRecipeLink
          }
          className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition duration-200 hover:border-brand/30 hover:bg-brand/5 sm:col-span-1"
        >
          {copyStatus ===
          "copied" ? (
            <Check
              className="size-4 text-success"
              aria-hidden="true"
            />
          ) : copyStatus ===
            "error" ? (
            <TriangleAlert
              className="size-4 text-error"
              aria-hidden="true"
            />
          ) : (
            <Copy
              className="size-4 text-brand"
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