"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Eye,
  HeartHandshake,
  ImageIcon,
  Info,
  Lightbulb,
  ListChecks,
  Loader2,
  LockKeyhole,
  Pencil,
  Send,
  ShieldCheck,
  Timer,
  Users,
  UtensilsCrossed,
} from "lucide-react";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  submitMyRecipeForReviewAction,
} from "./review-actions";

/* =========================================================
   CONSTANTS
========================================================= */

const RECIPES_REVIEW_URL =
  "/mi-cocihub/recetas?status=pending_review";

const REVIEW_TIPS = [
  {
    title: "Comprueba las cantidades",

    description:
      "Asegúrate de que los ingredientes corresponden a las raciones indicadas.",
  },
  {
    title: "Revisa la elaboración",

    description:
      "Confirma que todos los pasos son claros y están correctamente ordenados.",
  },
  {
    title: "Verifica los tiempos",

    description:
      "Recuerda incluir los reposos y las esperas necesarias durante la elaboración.",
  },
  {
    title: "Cuida la presentación",

    description:
      "Utiliza una fotografía representativa del resultado final de tu receta.",
  },
];

const MODERATION_STEPS = [
  {
    title: "Envías tu receta",

    description:
      "Tu creación pasa al estado En revisión y queda temporalmente bloqueada para su edición.",

    icon: Send,
  },
  {
    title: "El equipo de CociHub la revisa",

    description:
      "Comprobamos que la información sea clara, completa y adecuada para la comunidad.",

    icon: ClipboardCheck,
  },
  {
    title: "Publicación o solicitud de cambios",

    description:
      "La receta podrá aprobarse y publicarse, o devolverse para que realices las correcciones necesarias.",

    icon: ChefHat,
  },
];

/* =========================================================
   TYPES
========================================================= */

type ChecklistItem = {
  key: string;

  label: string;

  complete: boolean;

  href: string;
};

type ReviewFormProps = {
  recipeId: string;

  title: string;

  shortDescription: string | null;

  imageUrl: string | null;

  imageAlt: string | null;

  baseServings: number | null;

  difficulty: string | null;

  ingredientCount: number;

  stepCount: number;

  times: {
    preparationMinutes: number | null;

    elaborationMinutes: number | null;

    totalMinutes: number;
  };

  checklist: ChecklistItem[];

  canSubmit: boolean;

  previousStepHref: string;
};

/* =========================================================
   HELPERS
========================================================= */

function getDifficultyLabel(
  difficulty: string | null,
) {
  switch (difficulty) {
    case "easy":
      return "Fácil";

    case "medium":
      return "Media";

    case "hard":
      return "Difícil";

    default:
      return "Sin definir";
  }
}

function isValidDuration(
  value: number | null,
  minimum = 0,
): value is number {
  return (
    value !== null &&
    Number.isSafeInteger(value) &&
    value >= minimum
  );
}

function formatDuration(
  minutes: number | null,
) {
  if (!isValidDuration(minutes)) {
    return "Pendiente";
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${remainingMinutes} min`;
}

/* =========================================================
   REVIEW FORM
========================================================= */

export function ReviewForm({
  recipeId,
  title,
  shortDescription,
  imageUrl,
  imageAlt,
  baseServings,
  difficulty,
  ingredientCount,
  stepCount,
  times,
  checklist,
  canSubmit,
  previousStepHref,
}: ReviewFormProps) {
  const router = useRouter();

  const submissionLock = useRef(false);

  const successHeadingRef =
    useRef<HTMLHeadingElement>(null);

  /* =======================================================
     INTERFACE STATE
  ======================================================= */

  const [confirmed, setConfirmed] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSubmitted, setIsSubmitted] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<string | null>(null);

  /* =======================================================
     CHECKLIST AND PROGRESS
  ======================================================= */

  const requiredTotal =
    checklist.length;

  const completedRequired =
    checklist.filter(
      (item) => item.complete,
    ).length;

  const pendingItems =
    checklist.filter(
      (item) => !item.complete,
    );

  const pendingCount =
    pendingItems.length;

  const progressPercentage =
    requiredTotal > 0
      ? Math.round(
          (completedRequired /
            requiredTotal) *
            100,
        )
      : 0;

  const isReady =
    canSubmit &&
    requiredTotal > 0 &&
    pendingCount === 0;

  const recipeTitle =
    title.trim() || "Receta sin título";

  /* =======================================================
     TIMES VALIDATION
  ======================================================= */

  const timesChecklist =
    checklist.find(
      (item) => item.key === "times",
    );

  const timesComplete =
    timesChecklist?.complete === true;

  const preparationMinutes =
    isValidDuration(
      times.preparationMinutes,
      1,
    )
      ? times.preparationMinutes
      : null;

  /*
   * The preparation time is manually
   * configured by the author.
   *
   * The elaboration time comes from
   * the duration of the saved steps.
   *
   * An incomplete or inconsistent
   * elaboration must not be shown
   * as zero minutes.
   */

  const elaborationMinutes =
    timesComplete &&
    isValidDuration(
      times.elaborationMinutes,
    )
      ? times.elaborationMinutes
      : null;

  const totalMinutes =
    timesComplete &&
    preparationMinutes !== null &&
    elaborationMinutes !== null
      ? preparationMinutes +
        elaborationMinutes
      : null;

  /* =======================================================
     RECIPE SUMMARY
  ======================================================= */

  const summaryItems = [
    {
      icon: Users,

      label: "Raciones",

      value:
        baseServings !== null &&
        baseServings > 0
          ? `${baseServings} ${
              baseServings === 1
                ? "ración"
                : "raciones"
            }`
          : "Pendiente",
    },
    {
      icon: ChefHat,

      label: "Dificultad",

      value:
        getDifficultyLabel(difficulty),
    },
    {
      icon: UtensilsCrossed,

      label: "Ingredientes",

      value: `${ingredientCount} ${
        ingredientCount === 1
          ? "ingrediente"
          : "ingredientes"
      }`,
    },
    {
      icon: ListChecks,

      label: "Elaboración",

      value: `${stepCount} ${
        stepCount === 1
          ? "paso"
          : "pasos"
      }`,
    },
  ];

  /* =======================================================
     SUBMISSION PROTECTION
  ======================================================= */

  useEffect(() => {
    if (!isSubmitting) {
      return;
    }

    function beforeUnload(
      event: BeforeUnloadEvent,
    ) {
      event.preventDefault();
      event.returnValue = "";
    }

    function guardNavigation(
      event: MouseEvent,
    ) {
      const target = event.target;

      const link =
        target instanceof Element
          ? target.closest("a[href]")
          : null;

      if (
        !(link instanceof HTMLAnchorElement)
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
    }

    window.addEventListener(
      "beforeunload",
      beforeUnload,
    );

    document.addEventListener(
      "click",
      guardNavigation,
      true,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        beforeUnload,
      );

      document.removeEventListener(
        "click",
        guardNavigation,
        true,
      );
    };
  }, [isSubmitting]);

  /* =======================================================
     SUCCESS SCREEN FOCUS
  ======================================================= */

  useEffect(() => {
    if (isSubmitted) {
      successHeadingRef.current?.focus();
    }
  }, [isSubmitted]);

  /* =======================================================
     SUBMIT RECIPE
  ======================================================= */

  async function handleSubmit() {
    if (
      !isReady ||
      !confirmed ||
      submissionLock.current ||
      isSubmitted
    ) {
      return;
    }

    submissionLock.current = true;

    setMessage(null);
    setIsSubmitting(true);

    let submissionSucceeded = false;

    try {
      const result =
        await submitMyRecipeForReviewAction(
          recipeId,
        );

      if (!result.success) {
        setMessage(
          result.message ??
            "No se pudo enviar la receta a revisión.",
        );

        setConfirmed(false);

        return;
      }

      submissionSucceeded = true;

      setSuccessMessage(
        result.message ??
          "La receta se ha enviado correctamente a revisión.",
      );

      setIsSubmitted(true);
      setConfirmed(false);

    } catch {
      setMessage(
        "No se pudo confirmar el envío de la receta. Comprueba su estado en Mis recetas antes de volver a intentarlo.",
      );

      setConfirmed(false);

    } finally {
      setIsSubmitting(false);

      if (!submissionSucceeded) {
        submissionLock.current = false;
      }
    }
  }

  /* =======================================================
     RETURN TO RECIPES
  ======================================================= */

  function handleReturnToRecipes() {
    router.push(RECIPES_REVIEW_URL);
    router.refresh();
  }

  /* =======================================================
     SUCCESS SCREEN
  ======================================================= */

  if (isSubmitted) {
    return (
      <section
        className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
        aria-labelledby="recipe-submission-success"
      >

        <div className="mx-auto max-w-2xl space-y-6 p-6 text-center sm:p-10">

          {/* SUCCESS ICON */}

          <div className="relative mx-auto flex size-24 items-center justify-center">

            <span className="absolute inset-0 rounded-full bg-secondary/10" />

            <span className="relative flex size-20 items-center justify-center rounded-full bg-secondary/15 text-secondary-hover">

              <CheckCircle2
                className="size-12"
                aria-hidden="true"
              />

            </span>

          </div>

          {/* SUCCESS MESSAGE */}

          <div role="status">

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary-hover">
              Envío completado
            </p>

            <h2
              id="recipe-submission-success"
              ref={successHeadingRef}
              tabIndex={-1}
              className="mt-3 font-serif text-3xl font-bold outline-none sm:text-4xl"
            >
              ¡Receta enviada correctamente!
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">

              {successMessage}

            </p>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Gracias por compartir tu pasión
              por la cocina con nuestra comunidad.
            </p>

          </div>

          {/* SUBMITTED RECIPE */}

          <div className="overflow-hidden rounded-2xl border border-border bg-page-muted/20">

            {imageUrl && (

              /* eslint-disable-next-line @next/next/no-img-element */

              <img
                src={imageUrl}
                alt={imageAlt || recipeTitle}
                className="aspect-video w-full object-cover"
              />

            )}

            <div className="space-y-3 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                Tu creación
              </p>

              <h3 className="font-serif text-2xl font-semibold">

                {recipeTitle}

              </h3>

              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900">

                <Clock3
                  className="size-4"
                  aria-hidden="true"
                />

                Pendiente de revisión

              </span>

            </div>

          </div>

          {/* NEXT STEPS */}

          <div className="rounded-xl border border-border bg-page-muted/30 p-4 text-left">

            <div className="flex items-start gap-3">

              <Info
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />

              <div>

                <p className="font-semibold">
                  ¿Qué sucede ahora?
                </p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  El equipo de CociHub revisará tu
                  receta. Puedes consultar su estado
                  desde el apartado Mis recetas.
                  Si necesita correcciones, podrás
                  editarla cuando te sea devuelta.
                </p>

              </div>

            </div>

          </div>

          {/* RETURN BUTTON */}

          <button
            type="button"
            onClick={handleReturnToRecipes}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover sm:w-auto"
          >

            Ir a Mis recetas

            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />

          </button>

          <p className="text-xs text-muted-foreground">
            Tu receta todavía no está publicada.
          </p>

        </div>

      </section>
    );
  }

  /* =======================================================
     MAIN REVIEW SCREEN
  ======================================================= */

  return (
    <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

        <div className="space-y-6 p-5 sm:p-6">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="flex items-start gap-4">

            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">

              <ClipboardCheck
                className="size-7"
                aria-hidden="true"
              />

            </span>

            <div className="min-w-0">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                09 · Revisar y enviar
              </p>

              <h2 className="mt-1 font-serif text-2xl font-semibold">
                ¡El último paso de tu receta!
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Revisa tu creación antes de
                compartirla con la comunidad
                de CociHub.
              </p>

            </div>

          </header>

          {/* =================================================
              PREPARATION PROGRESS
          ================================================= */}

          <section className="rounded-2xl border border-border p-4 sm:p-5">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Preparación para el envío
                </p>

                <h3 className="mt-2 font-serif text-xl font-semibold sm:text-2xl">

                  {completedRequired} de{" "}
                  {requiredTotal} requisitos

                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                  Apartados obligatorios completados
                </p>

              </div>

              <div
                className={`flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl ${
                  isReady
                    ? "bg-secondary/10 text-secondary-hover"
                    : "bg-brand/10 text-brand"
                }`}
              >

                <span className="font-serif text-2xl font-bold">

                  {progressPercentage}%

                </span>

                <span className="text-[10px] font-medium">
                  Completado
                </span>

              </div>

            </div>

            {/* PROGRESS BAR */}

            <div
              role="progressbar"
              aria-label="Requisitos de la receta completados"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={
                progressPercentage
              }
              className="mt-5 h-3 overflow-hidden rounded-full bg-page-muted"
            >

              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              />

            </div>

            {/* READY OR PENDING */}

            <div
              className={`mt-4 flex items-start gap-3 rounded-xl border p-3 ${
                isReady
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-amber-200 bg-amber-50 text-amber-900"
              }`}
            >

              {isReady ? (

                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

              ) : (

                <CircleAlert
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

              )}

              <div>

                <p className="text-sm font-semibold">

                  {isReady
                    ? "Tu receta está lista para enviar"
                    : pendingCount === 1
                      ? "Queda un apartado por completar"
                      : pendingCount > 1
                        ? `Quedan ${pendingCount} apartados por completar`
                        : "La receta requiere una revisión adicional"}

                </p>

                <p className="mt-1 text-xs leading-5">

                  {isReady
                    ? "Has completado todos los requisitos obligatorios. Realiza una última comprobación antes de continuar."
                    : "Revisa los requisitos pendientes antes de enviar tu creación al equipo de CociHub."}

                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              RECIPE PREVIEW
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-border">

            <div className="flex items-center justify-between gap-3 border-b border-border p-4 sm:p-5">

              <div className="flex items-center gap-3">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <Eye
                    className="size-5"
                    aria-hidden="true"
                  />

                </span>

                <div>

                  <h3 className="font-serif text-xl font-semibold">
                    Así queda tu receta
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Resumen de tu creación.
                  </p>

                </div>

              </div>

            </div>

            {/* MAIN IMAGE */}

            {imageUrl ? (

              <div className="relative overflow-hidden bg-page-muted">

                {/* eslint-disable-next-line @next/next/no-img-element */}

                <img
                  src={imageUrl}
                  alt={
                    imageAlt?.trim() ||
                    recipeTitle
                  }
                  className="aspect-video w-full object-cover"
                />

                <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/65 px-3 py-1.5 text-xs font-medium text-white">

                  <Eye
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Vista previa

                </span>

              </div>

            ) : (

              <div className="flex min-h-52 flex-col items-center justify-center gap-3 bg-page-muted/40 p-5 text-center">

                <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">

                  <ImageIcon
                    className="size-8"
                    aria-hidden="true"
                  />

                </span>

                <p className="font-semibold">
                  Fotografía pendiente
                </p>

                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                  Añade una imagen que represente
                  el resultado final de tu receta.
                </p>

                {checklist.find(
                  (item) => item.key === "image",
                ) && (

                  <Link
                    href={
                      checklist.find(
                        (item) =>
                          item.key === "image",
                      )!.href
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-brand px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/5"
                  >

                    <Pencil
                      className="size-3.5"
                      aria-hidden="true"
                    />

                    Añadir fotografía

                  </Link>

                )}

              </div>

            )}

            {/* RECIPE INFORMATION */}

            <div className="space-y-4 p-4 sm:p-6">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
                  Tu creación · CociHub
                </p>

                <h3 className="mt-2 break-words font-serif text-2xl font-bold sm:text-3xl">

                  {recipeTitle}

                </h3>

                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">

                  {shortDescription?.trim() ||
                    "Todavía no has añadido una descripción breve de tu receta."}

                </p>

              </div>

              {/* SUMMARY ITEMS */}

              <div className="grid grid-cols-2 gap-3">

                {summaryItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="min-w-0 rounded-xl border border-border bg-page-muted/25 p-3 sm:p-4"
                    >

                      <div className="flex items-center gap-2">

                        <Icon
                          className="size-4 shrink-0 text-brand"
                          aria-hidden="true"
                        />

                        <p className="text-xs text-muted-foreground">

                          {item.label}

                        </p>

                      </div>

                      <p className="mt-2 break-words text-sm font-semibold">

                        {item.value}

                      </p>

                    </div>
                  );
                })}

              </div>

              <p className="text-xs leading-5 text-muted-foreground">
                Esta vista resume los datos principales
                de tu receta. La presentación pública
                definitiva puede variar.
              </p>

            </div>

          </section>

          {/* =================================================
              RECIPE TIMES
          ================================================= */}

          <section className="rounded-2xl border border-border p-4 sm:p-5">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <Clock3
                    className="size-5"
                    aria-hidden="true"
                  />

                </span>

                <div>

                  <h3 className="font-serif text-xl font-semibold">
                    Tiempos de tu receta
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Duración estimada del proceso.
                  </p>

                </div>

              </div>

              {timesChecklist && (

                <Link
                  href={timesChecklist.href}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >

                  <Pencil
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Editar

                </Link>

              )}

            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              {/* PREPARATION */}

              <div className="rounded-xl border border-border bg-page-muted/30 p-4">

                <Timer
                  className="size-5 text-brand"
                  aria-hidden="true"
                />

                <p className="mt-3 text-xs text-muted-foreground">
                  Preparación
                </p>

                <p className="mt-1 font-serif text-xl font-bold">

                  {formatDuration(
                    preparationMinutes,
                  )}

                </p>

              </div>

              {/* ELABORATION */}

              <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">

                <ChefHat
                  className="size-5 text-secondary-hover"
                  aria-hidden="true"
                />

                <p className="mt-3 text-xs text-muted-foreground">
                  Elaboración
                </p>

                <p className="mt-1 font-serif text-xl font-bold text-secondary-hover">

                  {formatDuration(
                    elaborationMinutes,
                  )}

                </p>

              </div>

              {/* TOTAL */}

              <div className="rounded-xl bg-brand p-4 text-inverse">

                <Clock3
                  className="size-5"
                  aria-hidden="true"
                />

                <p className="mt-3 text-xs opacity-90">
                  Tiempo total
                </p>

                <p className="mt-1 font-serif text-xl font-bold">

                  {formatDuration(
                    totalMinutes,
                  )}

                </p>

              </div>

            </div>

            {!timesComplete ? (

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">

                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0"
                  aria-hidden="true"
                />

                <p>
                  Los tiempos todavía no están
                  completos o requieren una revisión.
                  El total se mostrará cuando los
                  datos sean válidos y coherentes.
                </p>

              </div>

            ) : (

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground">

                <Info
                  className="size-4 shrink-0 text-brand"
                  aria-hidden="true"
                />

                El tiempo total es la suma de la
                preparación y la duración de los
                pasos de elaboración.

              </p>

            )}

          </section>

          {/* =================================================
              REQUIRED CHECKLIST
          ================================================= */}

          <section className="rounded-2xl border border-border p-4 sm:p-5">

            <div className="flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                  <ListChecks
                    className="size-5"
                    aria-hidden="true"
                  />

                </span>

                <div>

                  <h3 className="font-serif text-xl font-semibold">
                    Comprobación final
                  </h3>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Revisa cada apartado de tu receta.
                  </p>

                </div>

              </div>

              <span className="shrink-0 rounded-full bg-page-muted px-3 py-1.5 text-xs font-semibold">

                {completedRequired}/
                {requiredTotal}

              </span>

            </div>

            {/* CHECKLIST ITEMS */}

            <div className="mt-5 space-y-2">

              {checklist.map((item) => (

                <Link
                  key={item.key}
                  href={item.href}
                  className={`group flex items-center justify-between gap-3 rounded-xl border p-3 transition sm:p-4 ${
                    item.complete
                      ? "border-secondary/15 bg-secondary/5 hover:border-secondary/40 hover:bg-secondary/10"
                      : "border-amber-200 bg-amber-50/70 hover:border-amber-400 hover:bg-amber-50"
                  }`}
                >

                  <div className="flex min-w-0 items-center gap-3">

                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                        item.complete
                          ? "bg-secondary/10 text-secondary-hover"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >

                      {item.complete ? (

                        <CheckCircle2
                          className="size-5"
                          aria-hidden="true"
                        />

                      ) : (

                        <CircleAlert
                          className="size-5"
                          aria-hidden="true"
                        />

                      )}

                    </span>

                    <div className="min-w-0">

                      <p className="break-words text-sm font-semibold">

                        {item.label}

                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          item.complete
                            ? "text-secondary-hover"
                            : "text-amber-800"
                        }`}
                      >

                        {item.complete
                          ? "Completado"
                          : "Requiere atención"}

                      </p>

                    </div>

                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand group-hover:underline">

                    <Pencil
                      className="size-3.5"
                      aria-hidden="true"
                    />

                    Editar

                  </span>

                </Link>

              ))}

            </div>

            {/* OPTIONAL SECTION */}

            <div className="mt-4 border-t border-border pt-4">

              <Link
                href={previousStepHref}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-page-muted/20 p-3 transition hover:bg-page-muted/50 sm:p-4"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-page-muted text-muted-foreground">

                    <Info
                      className="size-5"
                      aria-hidden="true"
                    />

                  </span>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      Información adicional
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Apartado opcional
                    </p>

                  </div>

                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand group-hover:underline">

                  <Pencil
                    className="size-3.5"
                    aria-hidden="true"
                  />

                  Editar

                </span>

              </Link>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                La información adicional enriquece
                tu receta, pero no es necesaria para
                enviarla a revisión.
              </p>

            </div>

          </section>

          {/* =================================================
              MODERATION PROCESS
          ================================================= */}

          <section className="rounded-2xl border border-border p-4 sm:p-5">

            <div className="flex items-start gap-3">

              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                <ShieldCheck
                  className="size-5"
                  aria-hidden="true"
                />

              </span>

              <div>

                <h3 className="font-serif text-xl font-semibold">
                  ¿Qué sucederá después?
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Conoce el proceso de publicación
                  de las recetas comunitarias.
                </p>

              </div>

            </div>

            {/* TIMELINE */}

            <ol className="mt-5">

              {MODERATION_STEPS.map(
                (item, index) => {
                  const Icon = item.icon;

                  const isLast =
                    index ===
                    MODERATION_STEPS.length - 1;

                  return (
                    <li
                      key={item.title}
                      className="relative flex gap-4"
                    >

                      {!isLast && (

                        <div
                          aria-hidden="true"
                          className="absolute bottom-0 left-5 top-10 w-px bg-border"
                        />

                      )}

                      <span
                        className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ${
                          index === 0
                            ? "bg-brand/10 text-brand"
                            : "bg-secondary/10 text-secondary-hover"
                        }`}
                      >

                        <Icon
                          className="size-5"
                          aria-hidden="true"
                        />

                      </span>

                      <div
                        className={`min-w-0 flex-1 ${
                          isLast
                            ? "pb-1"
                            : "pb-6"
                        }`}
                      >

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">

                          Fase {index + 1}

                        </p>

                        <h4 className="mt-1 text-sm font-semibold">

                          {item.title}

                        </h4>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">

                          {item.description}

                        </p>

                      </div>

                    </li>
                  );
                },
              )}

            </ol>

            {/* IMPORTANT INFORMATION */}

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-brand/15 bg-brand/5 p-4">

              <LockKeyhole
                className="mt-0.5 size-5 shrink-0 text-brand"
                aria-hidden="true"
              />

              <div>

                <p className="text-sm font-semibold">
                  Bloqueo temporal de edición
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Mientras la receta esté pendiente
                  de revisión, no podrás modificarla.
                  Si el equipo solicita cambios,
                  volverá a estar disponible para
                  su edición.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              SUBMISSION CONFIRMATION
          ================================================= */}

          <section className="rounded-2xl border border-border p-4 sm:p-5">

            <div className="flex items-start gap-3">

              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                <Send
                  className="size-5"
                  aria-hidden="true"
                />

              </span>

              <div>

                <h3 className="font-serif text-xl font-semibold">
                  ¿Todo preparado?
                </h3>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Confirma que has revisado tu receta
                  antes de enviarla a moderación.
                </p>

              </div>

            </div>

            {/* CONFIRMATION CHECKBOX */}

            <label
              className={`mt-5 flex items-start gap-3 rounded-xl border p-4 transition ${
                !isReady || isSubmitting
                  ? "cursor-not-allowed border-border bg-page-muted/30 opacity-70"
                  : confirmed
                    ? "cursor-pointer border-secondary/30 bg-secondary/10"
                    : "cursor-pointer border-border hover:bg-page-muted/30"
              }`}
            >

              <input
                type="checkbox"
                checked={confirmed}
                disabled={
                  !isReady ||
                  isSubmitting
                }
                onChange={(event) => {
                  setConfirmed(
                    event.target.checked,
                  );

                  setMessage(null);
                }}
                className="mt-1 size-4 shrink-0 accent-[var(--brand)]"
              />

              <span className="text-sm leading-6">
                He revisado mi receta y entiendo
                que no podré editarla mientras
                esté pendiente de moderación.
              </span>

            </label>

            {/* PENDING REQUIREMENTS */}

            {!isReady && (

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">

                <div className="flex items-start gap-3">

                  <AlertTriangle
                    className="mt-0.5 size-5 shrink-0"
                    aria-hidden="true"
                  />

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      Revisa los requisitos pendientes
                    </p>

                    <p className="mt-1 text-xs leading-5">
                      Debes completar todos los
                      apartados obligatorios antes
                      de enviar la receta.
                    </p>

                    {pendingItems.length > 0 && (

                      <ul className="mt-3 space-y-2">

                        {pendingItems.map(
                          (item) => (

                            <li key={item.key}>

                              <Link
                                href={item.href}
                                className="inline-flex items-center gap-2 text-xs font-semibold underline-offset-4 hover:underline"
                              >

                                <ArrowRight
                                  className="size-3.5 shrink-0"
                                  aria-hidden="true"
                                />

                                {item.label}

                              </Link>

                            </li>

                          ),
                        )}

                      </ul>

                    )}

                  </div>

                </div>

              </div>

            )}

            {/* SERVER ERRORS */}

            {message && (

              <div
                role="alert"
                className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >

                <CircleAlert
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

                <p>{message}</p>

              </div>

            )}

            {/* SUBMISSION IN PROGRESS */}

            {isSubmitting && (

              <div
                role="status"
                className="mt-4 flex items-start gap-3 rounded-xl border border-brand/20 bg-brand/5 p-4"
              >

                <Loader2
                  className="mt-0.5 size-5 shrink-0 animate-spin text-brand"
                  aria-hidden="true"
                />

                <div>

                  <p className="text-sm font-semibold">
                    Enviando tu receta...
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    No cierres ni recargues esta
                    página mientras se completa
                    el envío.
                  </p>

                </div>

              </div>

            )}

          </section>

        </div>

        {/* =================================================
            FOOTER ACTIONS
        ================================================= */}

        <footer className="flex flex-col-reverse gap-3 border-t border-border bg-page-muted/20 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

          <Link
            href={previousStepHref}
            aria-disabled={isSubmitting}
            tabIndex={
              isSubmitting ? -1 : undefined
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold transition ${
              isSubmitting
                ? "pointer-events-none opacity-50"
                : "hover:bg-page-muted"
            }`}
          >

            <ArrowLeft
              className="size-4"
              aria-hidden="true"
            />

            Información adicional

          </Link>

          <button
            type="button"
            disabled={
              !isReady ||
              !confirmed ||
              isSubmitting
            }
            onClick={() =>
              void handleSubmit()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >

            {isSubmitting ? (

              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />

            ) : (

              <Send
                className="size-4"
                aria-hidden="true"
              />

            )}

            {isSubmitting
              ? "Enviando..."
              : "Enviar receta a revisión"}

          </button>

        </footer>

      </section>

      {/* ===================================================
          RIGHT SIDEBAR
      =================================================== */}

      <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">

        {/* =================================================
            COCIHUB TIPS
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border px-5 py-5 text-center">

            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">

              <Lightbulb
                className="size-6"
                aria-hidden="true"
              />

            </span>

            <h2 className="mt-3 font-serif text-xl font-semibold">
              Consejos de CociHub
            </h2>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Antes de compartir tu creación.
            </p>

          </div>

          <ol className="space-y-4 p-5">

            {REVIEW_TIPS.map(
              (tip, index) => (

                <li
                  key={tip.title}
                  className="flex items-start gap-3"
                >

                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index % 2 === 0
                        ? "bg-brand/10 text-brand"
                        : "bg-secondary/10 text-secondary-hover"
                    }`}
                  >

                    {index + 1}

                  </span>

                  <div>

                    <h3 className="text-sm font-semibold">

                      {tip.title}

                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">

                      {tip.description}

                    </p>

                  </div>

                </li>

              ),
            )}

          </ol>

          <div className="mx-4 mb-4 rounded-xl bg-brand/5 p-4">

            <p className="flex items-center gap-2 text-sm font-semibold">

              <ChefHat
                className="size-4 text-brand"
                aria-hidden="true"
              />

              Nuestro consejo

            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Imagina que otra persona prepara
              tu receta por primera vez.
              ¿Encontrará toda la información
              que necesita?
            </p>

          </div>

        </section>

        {/* =================================================
            SUBMISSION STATUS
        ================================================= */}

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">

          <div className="flex items-center gap-2">

            <ClipboardCheck
              className="size-5 text-brand"
              aria-hidden="true"
            />

            <h2 className="font-serif text-xl font-semibold">
              Estado del envío
            </h2>

          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between gap-2">

              <p className="text-xs text-muted-foreground">
                Requisitos completados
              </p>

              <p className="text-sm font-semibold">

                {completedRequired}/
                {requiredTotal}

              </p>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-page-muted">

              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-500 motion-reduce:transition-none"
                style={{
                  width:
                    `${progressPercentage}%`,
                }}
              />

            </div>

            <div className="flex items-center justify-between gap-2">

              <p className="text-xs text-muted-foreground">
                Requisitos pendientes
              </p>

              <p
                className={`text-sm font-semibold ${
                  pendingCount === 0
                    ? "text-secondary-hover"
                    : "text-amber-700"
                }`}
              >

                {pendingCount}

              </p>

            </div>

            <div className="border-t border-border pt-3">

              <div className="flex items-center justify-between gap-3">

                <p className="text-xs text-muted-foreground">
                  Confirmación del autor
                </p>

                {confirmed && isReady ? (

                  <CheckCircle2
                    className="size-5 text-secondary-hover"
                    aria-label="Confirmada"
                  />

                ) : (

                  <span className="text-xs font-medium text-muted-foreground">
                    Pendiente
                  </span>

                )}

              </div>

            </div>

          </div>

          <div
            className={`mt-4 rounded-xl border p-3 ${
              isReady
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >

            <p className="flex items-center gap-2 text-xs font-semibold">

              {isReady ? (

                <CheckCircle2
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

              ) : (

                <CircleAlert
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />

              )}

              {isReady
                ? "Receta preparada"
                : "Receta pendiente de completar"}

            </p>

          </div>

        </section>

        {/* =================================================
            COMMUNITY MESSAGE
        ================================================= */}

        <section className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5">

          <span className="flex size-11 items-center justify-center rounded-full bg-secondary/10 text-secondary-hover">

            <HeartHandshake
              className="size-6"
              aria-hidden="true"
            />

          </span>

          <h2 className="mt-3 font-serif text-xl font-semibold text-secondary-hover">
            Cocinamos en comunidad
          </h2>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Cada receta que compartes ayuda
            a otras personas a descubrir nuevos
            sabores, técnicas y experiencias.
          </p>

          <p className="mt-3 text-sm font-semibold text-secondary-hover">
            ¡Gracias por formar parte de CociHub!
          </p>

        </section>

        {/* =================================================
            PUBLICATION INFORMATION
        ================================================= */}

        <section className="rounded-2xl border border-border bg-page-muted/30 p-4">

          <div className="flex items-start gap-3">

            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-brand"
              aria-hidden="true"
            />

            <div>

              <p className="text-sm font-semibold">
                Publicación responsable
              </p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Las recetas comunitarias se revisan
                antes de publicarse. El envío no
                implica su publicación automática.
              </p>

            </div>

          </div>

        </section>

      </aside>

    </div>
  );
}