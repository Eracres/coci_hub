import {
  Circle,
  CircleCheck,
  CircleDot,
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
};


type RecipeEditorStepperProps = {
  steps:
    RecipeEditorStep[];
};


export function RecipeEditorStepper({
  steps,
}: RecipeEditorStepperProps) {
  return (
    <aside className="h-fit rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-6">

      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        Progreso
      </p>


      <nav
        className="mt-5 space-y-1"
        aria-label="Pasos de la receta"
      >

        {steps.map(
          (
            step,
          ) => (
            <Link
              key={
                step.key
              }
              href={
                step.href
              }
              aria-current={
                step.current
                  ? "step"
                  : undefined
              }
              className={
                step.current
                  ? "flex items-center gap-3 rounded-xl bg-page-muted px-3 py-2.5 text-sm font-semibold text-foreground"
                  : step.completed
                    ? "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition hover:bg-page-muted"
                    : "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-page-muted hover:text-foreground"
              }
            >

              {step.current ? (
                <CircleDot
                  className="size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
              ) : step.completed ? (
                <CircleCheck
                  className="size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="size-5 shrink-0"
                  aria-hidden="true"
                />
              )}


              <span>
                {
                  step.label
                }
              </span>

            </Link>
          ),
        )}

      </nav>

    </aside>
  );
}