import {
  ArrowRight,
  Check,
} from "lucide-react";

import Link from "next/link";


export type RecipeEditorStep = {
  key:
    string;

  label:
    string;

  href:
    string;

  completed:
    boolean;

  current:
    boolean;

  optional?:
    boolean;

  final?:
    boolean;
};


type RecipeEditorStepperProps = {
  steps:
    RecipeEditorStep[];
};


export function RecipeEditorStepper({
  steps,
}: RecipeEditorStepperProps) {
  return (
    <aside className="h-fit overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm lg:sticky lg:top-6">
      <div className="border-b border-border px-5 py-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary-hover">
          Progreso de la receta
        </p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Completa los apartados para
          enviar tu receta.
        </p>
      </div>


      <nav
        className="p-3"
        aria-label="Pasos de la receta"
      >
        {steps.map(
          (
            step,
            index,
          ) => {
            const number =
              String(
                index + 1,
              ).padStart(
                2,
                "0",
              );


            return (
              <div
                key={
                  step.key
                }
                className={
                  step.final
                    ? "mt-3 border-t border-border pt-3"
                    : undefined
                }
              >
                <Link
                  href={
                    step.href
                  }
                  aria-current={
                    step.current
                      ? "step"
                      : undefined
                  }
                  className={`group flex min-h-[58px] items-center gap-3 rounded-2xl px-3 py-2.5 transition ${
                    step.current
                      ? "border border-brand/20 bg-brand/[0.055] shadow-sm"
                      : "border border-transparent hover:bg-page-muted/70"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                      step.current
                        ? "bg-brand text-inverse shadow-sm"
                        : step.completed
                          ? "bg-secondary/15 text-secondary-hover"
                          : "bg-page-muted text-muted-foreground"
                    }`}
                  >
                    {
                      number
                    }
                  </span>


                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm ${
                        step.current
                          ? "font-bold text-foreground"
                          : "font-semibold text-foreground"
                      }`}
                    >
                      {
                        step.label
                      }
                    </span>


                    {step.current ? (
                      <span className="mt-0.5 block text-[11px] font-medium text-brand">
                        Estás aquí
                      </span>
                    ) : null}
                  </span>


                  {step.optional ? (
                    <span className="rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-warning">
                      Opcional
                    </span>

                  ) : step.completed ? (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary-hover text-inverse">
                      <Check
                        className="size-4"
                        aria-hidden="true"
                      />
                    </span>

                  ) : step.final ? (
                    <ArrowRight
                      className="size-5 shrink-0 text-brand transition group-hover:translate-x-1"
                      aria-hidden="true"
                    />

                  ) : (
                    <span
                      className="size-2.5 shrink-0 rounded-full border-2 border-border-strong"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              </div>
            );
          },
        )}
      </nav>
    </aside>
  );
}