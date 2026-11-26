"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChartBar,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CookingPot,
  Info,
  Lightbulb,
  Pencil,
  Save,
  Timer,
} from "lucide-react";

import {
  communityRecipeTimesSchema,
} from "@/schemas/community-recipe-times-schema";

import type {
  RecipeStepsFormData,
} from "@/schemas/recipe-steps-schema";

import {
  updateMyRecipeTimesAction,
} from "./times-actions";

type TimesFormProps = {
  recipeId: string;

  initialValues: {
    preparationMinutes: number | null;
    elaborationMinutes: number | null;
  };

  recipeSteps: RecipeStepsFormData["steps"];

  previousStepHref: string;
  nextStepHref: string;
};

const quickTimes = [5, 10, 15, 20, 30, 45, 60];

const maxMinutes = 10080;

/* =========================================================
   HELPERS
========================================================= */

function formatMinutes(value: number) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return hours
    ? `${hours} h${minutes ? ` ${minutes} min` : ""}`
    : `${minutes} min`;
}

function parseDuration(value: string) {
  const text = value.trim();

  if (!/^\d+$/.test(text)) {
    return null;
  }

  const number = Number(text);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : null;
}

/* =========================================================
   TIMES FORM
========================================================= */

export function TimesForm({
  recipeId,
  initialValues,
  recipeSteps,
  previousStepHref,
  nextStepHref,
}: TimesFormProps) {
  const router = useRouter();

  const [hours, setHours] = useState(
    initialValues.preparationMinutes === null
      ? ""
      : String(
          Math.floor(
            initialValues.preparationMinutes / 60,
          ),
        ),
  );

  const [minutes, setMinutes] = useState(
    initialValues.preparationMinutes === null
      ? ""
      : String(
          initialValues.preparationMinutes % 60,
        ),
  );

  const [savedPreparation, setSavedPreparation] =
    useState(initialValues.preparationMinutes);

  const [expanded, setExpanded] = useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState<string | null>(null);

  const saving = useRef(false);

  const allowNavigation = useRef(false);

  /* =======================================================
     PREPARATION
  ======================================================= */

  const h =
    hours === "" ? 0 : parseDuration(hours);

  const m =
    minutes === "" ? 0 : parseDuration(minutes);

  const preparation =
    (hours === "" && minutes === "") ||
    h === null ||
    m === null ||
    m > 59 ||
    h > 168
      ? null
      : h * 60 + m;

  const validation =
    communityRecipeTimesSchema.safeParse({
      preparationMinutes:
        preparation === null
          ? ""
          : String(preparation),
    });

  const validPreparation =
    validation.success ? preparation : null;

  const isDirty =
    preparation !== savedPreparation ||
    (!validation.success &&
      (hours !== "" || minutes !== ""));

  /* =======================================================
     ELABORATION
  ======================================================= */

  const steps = recipeSteps.map((step, index) => ({
    title:
      step.title.trim() || `Paso ${index + 1}`,

    duration:
      parseDuration(step.durationMinutes),
  }));

  const knownSteps = steps.filter(
    (step) => step.duration !== null,
  );

  const partialMinutes = knownSteps.reduce(
    (sum, step) => sum + (step.duration ?? 0),
    0,
  );

  const allTimed =
    steps.length > 0 &&
    knownSteps.length === steps.length;

  const storedElaboration =
    initialValues.elaborationMinutes;

  const consistent =
    allTimed &&
    storedElaboration !== null &&
    storedElaboration === partialMinutes;

  const elaboration =
    consistent ? storedElaboration : null;

  /* =======================================================
     TOTAL TIME
  ======================================================= */

  const total =
    validPreparation !== null &&
    elaboration !== null
      ? validPreparation + elaboration
      : null;

  const prepPercent =
    total !== null && total > 0
      ? Math.round(
          ((validPreparation ?? 0) / total) * 100,
        )
      : 0;

  /* =======================================================
     UNSAVED CHANGES PROTECTION
  ======================================================= */

  useEffect(() => {
    if (!isDirty && !isSubmitting) {
      return;
    }

    function beforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (allowNavigation.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    function guardLink(event: MouseEvent) {
      if (
        allowNavigation.current ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;

      const link =
        target instanceof Element
          ? target.closest("a[href]")
          : null;

      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const url = new URL(
        link.href,
        window.location.href,
      );

      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.origin === window.location.origin
      ) {
        return;
      }

      if (
        saving.current ||
        !window.confirm(
          "Tienes cambios de tiempos sin guardar. ¿Quieres salir de este apartado?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener(
      "beforeunload",
      beforeUnload,
    );

    document.addEventListener(
      "click",
      guardLink,
      true,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        beforeUnload,
      );

      document.removeEventListener(
        "click",
        guardLink,
        true,
      );
    };
  }, [isDirty, isSubmitting]);

  /* =======================================================
     UPDATE PREPARATION
  ======================================================= */

  function updateTime(
    nextHours: string,
    nextMinutes: string,
  ) {
    setHours(nextHours);
    setMinutes(nextMinutes);

    setError(null);
    setMessage(null);
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function persist(advance: boolean) {
    if (saving.current) {
      return;
    }

    setError(null);
    setMessage(null);

    if (
      !validation.success ||
      validPreparation === null
    ) {
      setError(
        "Indica un tiempo de preparación entre 1 y 10080 minutos. Usa minutos de 0 a 59.",
      );

      return;
    }

    if (advance && !consistent) {
      setError(
        "Revisa y guarda las duraciones en Elaboración antes de continuar.",
      );

      return;
    }

    if (!isDirty) {
      if (advance) {
        router.push(nextStepHref);
      } else {
        setMessage(
          "No hay cambios pendientes que guardar.",
        );
      }

      return;
    }

    saving.current = true;
    setIsSubmitting(true);

    try {
      const result =
        await updateMyRecipeTimesAction(
          recipeId,
          validation.data,
        );

      if (!result.success) {
        setError(
          result.fieldErrors
            ?.preparationMinutes?.[0] ??
            result.message ??
            "No se pudo guardar el tiempo de preparación.",
        );

        return;
      }

      setSavedPreparation(validPreparation);

      if (advance) {
        allowNavigation.current = true;

        router.push(nextStepHref);
      } else {
        setMessage(
          "Borrador de tiempos guardado correctamente.",
        );

        router.refresh();
      }
    } catch {
      setError(
        "No se pudieron guardar los tiempos. Inténtalo de nuevo.",
      );
    } finally {
      saving.current = false;

      setIsSubmitting(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

      {/* MAIN CONTENT */}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

        <div className="space-y-5 p-5 sm:p-6">

          {/* HEADER */}

          <header className="flex items-start gap-4">

            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">

              <Timer
                className="size-7"
                aria-hidden="true"
              />

            </span>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                06 · Tiempos
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold">
                Tiempos de la receta
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Organiza cuánto tiempo necesitarás
                para preparar y elaborar tu receta.
              </p>

            </div>

          </header>

          {/* TIME SUMMARY */}

          <div
            className="grid gap-3 sm:grid-cols-3"
            aria-live="polite"
          >

            {/* PREPARATION */}

            <div className="min-w-0 rounded-2xl border border-border bg-page-muted/40 p-4">

              <Clock3
                className="size-5 text-brand"
                aria-hidden="true"
              />

              <p className="mt-2 text-xs font-semibold">
                Preparación
              </p>

              <p className="mt-1 break-words font-serif text-xl font-bold">

                {validPreparation === null
                  ? "Pendiente"
                  : formatMinutes(validPreparation)}

              </p>

              <p className="mt-2 text-xs text-muted-foreground">
                Manual
              </p>

            </div>

            {/* ELABORATION */}

            <div className="min-w-0 rounded-2xl border border-secondary/20 bg-secondary/10 p-4">

              <CookingPot
                className="size-5 text-secondary-hover"
                aria-hidden="true"
              />

              <p className="mt-2 text-xs font-semibold">
                Elaboración
              </p>

              <p className="mt-1 break-words font-serif text-xl font-bold text-secondary-hover">

                {elaboration === null
                  ? "Pendiente"
                  : formatMinutes(elaboration)}

              </p>

              <p className="mt-2 text-xs text-secondary-hover">
                Automático
              </p>

            </div>

            {/* TOTAL */}

            <div className="min-w-0 rounded-2xl bg-brand p-4 text-inverse">

              <Timer
                className="size-5"
                aria-hidden="true"
              />

              <p className="mt-2 text-xs font-semibold">
                Tiempo total
              </p>

              <p className="mt-1 break-words font-serif text-xl font-bold">

                {total === null
                  ? "Pendiente"
                  : formatMinutes(total)}

              </p>

              <p className="mt-2 text-xs">
                Estimado
              </p>

            </div>

          </div>

          {/* FORM */}

          <form
            id="recipe-times-form"
            onSubmit={(event) => {
              event.preventDefault();

              void persist(true);
            }}
            noValidate
            className="space-y-5"
          >

            {/* PREPARATION EDITOR */}

            <fieldset
              disabled={isSubmitting}
              className="min-w-0 rounded-2xl border border-border bg-page-muted/20 p-4 sm:p-5"
            >

              <div className="flex items-start gap-3">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <Pencil
                    className="size-5"
                    aria-hidden="true"
                  />

                </span>

                <div>

                  <h3 className="font-serif text-xl font-semibold">
                    Tiempo de preparación
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Tiempo para lavar, cortar, pesar y
                    preparar los ingredientes antes de
                    elaborar.
                  </p>

                </div>

              </div>

              <div className="mt-4 grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">

                {/* HOURS AND MINUTES */}

                <div className="grid grid-cols-2 gap-3">

                  <label className="min-w-0 text-sm font-medium">

                    Horas

                    <input
                      type="number"
                      min={0}
                      max={168}
                      step={1}
                      inputMode="numeric"
                      value={hours}
                      onChange={(event) =>
                        updateTime(
                          event.target.value,
                          minutes,
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                      placeholder="0"
                    />

                  </label>

                  <label className="min-w-0 text-sm font-medium">

                    Minutos

                    <input
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      inputMode="numeric"
                      value={minutes}
                      onChange={(event) =>
                        updateTime(
                          hours,
                          event.target.value,
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-border bg-surface px-3 py-3 outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
                      placeholder="15"
                    />

                  </label>

                </div>

                {/* QUICK TIMES */}

                <div>

                  <p className="text-sm font-medium">
                    Ajustes rápidos
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {quickTimes.map((value) => (

                      <button
                        key={value}
                        type="button"
                        aria-pressed={
                          validPreparation === value
                        }
                        onClick={() =>
                          updateTime(
                            String(
                              Math.floor(value / 60),
                            ),
                            String(value % 60),
                          )
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          validPreparation === value
                            ? "border-brand bg-brand text-inverse"
                            : "border-border bg-surface hover:border-brand hover:text-brand"
                        }`}
                      >

                        {formatMinutes(value)}

                      </button>

                    ))}

                  </div>

                </div>

              </div>

              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-muted-foreground">

                <Info
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden="true"
                />

                El modelo actual admite entre 1 y{" "}
                {maxMinutes.toLocaleString("es-ES")}{" "}
                minutos de preparación (7 días).

              </p>

              {preparation !== null &&
                !validation.success && (

                  <p className="mt-2 text-xs text-red-700">

                    {
                      validation.error.issues[0]
                        ?.message
                    }

                  </p>

                )}

              {preparation === null &&
                (hours !== "" || minutes !== "") && (

                  <p className="mt-2 text-xs text-red-700">
                    Introduce horas enteras y minutos
                    entre 0 y 59.
                  </p>

                )}

            </fieldset>

            {/* ELABORATION BREAKDOWN */}

            <section className="rounded-2xl border border-border p-4 sm:p-5">

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div className="flex min-w-0 items-start gap-3">

                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary-hover">

                    <CookingPot
                      className="size-5"
                      aria-hidden="true"
                    />

                  </span>

                  <div>

                    <h3 className="font-serif text-xl font-semibold">
                      Tiempo de elaboración
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Calculado a partir de los pasos
                      guardados.
                    </p>

                  </div>

                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    consistent
                      ? "bg-green-50 text-green-800"
                      : "bg-amber-50 text-amber-900"
                  }`}
                >

                  {knownSteps.length} de{" "}
                  {steps.length} pasos con duración

                </span>

              </div>

              {/* ACCORDION */}

              <div className="mt-4 overflow-hidden rounded-xl border border-border">

                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls="times-step-breakdown"
                  onClick={() =>
                    setExpanded(!expanded)
                  }
                  className="flex w-full items-center justify-between gap-3 bg-page-muted/50 px-4 py-3 text-left text-sm font-semibold"
                >

                  Desglose de la elaboración (
                  {steps.length} pasos)

                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${
                      expanded ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />

                </button>

                {expanded && (

                  <div id="times-step-breakdown">

                    {steps.length === 0 ? (

                      <p className="p-4 text-sm text-muted-foreground">
                        Todavía no hay pasos guardados.
                      </p>

                    ) : (

                      <ol className="divide-y divide-border">

                        {steps.map((step, index) => (

                          <li
                            key={index}
                            className="flex items-center gap-3 px-4 py-3"
                          >

                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-page-muted text-xs font-bold">

                              {String(index + 1)
                                .padStart(2, "0")}

                            </span>

                            <span className="min-w-0 flex-1 break-words text-sm font-medium">

                              {step.title}

                            </span>

                            <span
                              className={`shrink-0 text-right text-xs font-semibold sm:text-sm ${
                                step.duration === null
                                  ? "text-amber-800"
                                  : "text-secondary-hover"
                              }`}
                            >

                              {step.duration === null
                                ? "Sin duración"
                                : formatMinutes(
                                    step.duration,
                                  )}

                            </span>

                          </li>

                        ))}

                      </ol>

                    )}

                  </div>

                )}

              </div>

              {/* ELABORATION STATUS */}

              {consistent ? (

                <p className="mt-4 flex items-center gap-2 text-sm text-secondary-hover">

                  <CheckCircle2
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />

                  Todos los pasos tienen duración y
                  coinciden con el cálculo guardado.

                </p>

              ) : (

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">

                  <p className="flex items-start gap-2 font-semibold">

                    <AlertTriangle
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden="true"
                    />

                    {steps.length === 0
                      ? "Añade pasos de elaboración"
                      : !allTimed
                        ? "Hay pasos sin duración"
                        : "El cálculo guardado no coincide con los pasos"}

                  </p>

                  {knownSteps.length > 0 && (

                    <p className="mt-2 text-xs">

                      Suma de duraciones indicadas:{" "}
                      {formatMinutes(partialMinutes)}.

                    </p>

                  )}

                  <p className="mt-2 text-xs leading-5">
                    Revisa y guarda la elaboración
                    para obtener un total fiable.
                    No modificaremos automáticamente
                    los tiempos guardados.
                  </p>

                  <Link
                    href={previousStepHref}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold underline underline-offset-4"
                  >

                    <ArrowLeft
                      className="size-4"
                      aria-hidden="true"
                    />

                    Revisar elaboración

                  </Link>

                </div>

              )}

            </section>

          </form>

          {/* UNSAVED CHANGES */}

          {isDirty && (

            <p
              role="status"
              className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
            >

              <Info
                className="size-4 shrink-0"
                aria-hidden="true"
              />

              Tienes cambios sin guardar.

            </p>

          )}

          {/* ERRORS */}

          {error && (

            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >

              {error}

            </p>

          )}

          {/* SUCCESS MESSAGE */}

          {message && (

            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800"
            >

              {message}

            </p>

          )}

        </div>

        {/* FOOTER ACTIONS */}

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-page-muted/20 px-5 py-4 sm:px-6">

          <Link
            href={previousStepHref}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-page-muted"
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Elaboración

          </Link>

          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              disabled={isSubmitting || !isDirty}
              onClick={() =>
                void persist(false)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save
                className="size-4"
                aria-hidden="true"
              />

              Guardar borrador

            </button>

            <button
              type="submit"
              form="recipe-times-form"
              disabled={
                isSubmitting || !consistent
              }
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-inverse hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >

              {isSubmitting
                ? "Guardando..."
                : isDirty
                  ? "Guardar y continuar"
                  : "Continuar"}

              <ArrowRight
                className="size-4"
                aria-hidden="true"
              />

            </button>

          </div>

        </footer>

      </section>

      {/* RIGHT SIDEBAR */}

      <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">

        {/* COCIHUB TIPS */}

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

              <Lightbulb
                className="size-5"
                aria-hidden="true"
              />

            </span>

            <h2 className="font-serif text-xl font-semibold">
              Consejos de CociHub
            </h2>

          </div>

          <ul className="mt-5 space-y-4">

            {[
              "Incluye en preparación solo las tareas previas a la elaboración.",
              "La elaboración se calcula sumando las duraciones de los pasos.",
              "Incluye reposos, fermentaciones y maceraciones en los pasos.",
              "Evita contar dos veces una tarea. Los pasos simultáneos pueden reducir el tiempo real.",
            ].map((tip) => (

              <li
                key={tip}
                className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"
              >

                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-secondary-hover"
                  aria-hidden="true"
                />

                {tip}

              </li>

            ))}

          </ul>

        </section>

        {/* TIME DISTRIBUTION */}

        <section
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          aria-live="polite"
        >

          <div className="flex items-center gap-3">

            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

              <ChartBar
                className="size-5"
                aria-hidden="true"
              />

            </span>

            <h2 className="font-serif text-xl font-semibold">
              Distribución del tiempo
            </h2>

          </div>

          {total === null ? (

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Completa los tiempos para consultar
              su distribución.
            </p>

          ) : (

            <>

              <p className="mt-3 text-xs text-muted-foreground">
                Así se reparte el tiempo total
                estimado.
              </p>

              {/* DISTRIBUTION BAR */}

              <div
                className="mt-4 flex h-8 overflow-hidden rounded-full bg-page-muted"
                aria-label={`Preparación ${prepPercent} %, elaboración ${100 - prepPercent} %`}
                role="img"
              >

                <div
                  className="flex items-center justify-center bg-brand text-xs font-bold text-inverse transition-[width]"
                  style={{
                    width: `${prepPercent}%`,
                  }}
                >

                  {prepPercent >= 18
                    ? `${prepPercent}%`
                    : ""}

                </div>

                <div
                  className="flex items-center justify-center bg-secondary-hover text-xs font-bold text-inverse transition-[width]"
                  style={{
                    width: `${100 - prepPercent}%`,
                  }}
                >

                  {100 - prepPercent >= 18
                    ? `${100 - prepPercent}%`
                    : ""}

                </div>

              </div>

              {/* LEGEND */}

              <div className="mt-4 space-y-3 text-xs">

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <span className="flex items-center gap-2">

                    <span className="size-2.5 rounded-full bg-brand" />

                    Preparación

                  </span>

                  <strong>

                    {formatMinutes(
                      validPreparation ?? 0,
                    )}{" "}

                    ({prepPercent} %)

                  </strong>

                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">

                  <span className="flex items-center gap-2">

                    <span className="size-2.5 rounded-full bg-secondary-hover" />

                    Elaboración

                  </span>

                  <strong>

                    {formatMinutes(
                      elaboration ?? 0,
                    )}{" "}

                    ({100 - prepPercent} %)

                  </strong>

                </div>

              </div>

              {/* ESTIMATED TOTAL */}

              <div className="mt-4 rounded-xl bg-accent/10 p-3 text-sm">

                <p className="text-xs text-muted-foreground">
                  Tiempo total estimado
                </p>

                <p className="mt-1 font-serif text-lg font-bold">

                  {formatMinutes(total)}

                </p>

              </div>

            </>

          )}

        </section>

      </aside>

    </div>
  );
}