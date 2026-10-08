import {
  CheckCircle2,
  Circle,
} from "lucide-react";

import Link from "next/link";


export type AdminRecipeEditorStep = {
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
};


type AdminRecipeEditorStepperProps = {
  steps:
    AdminRecipeEditorStep[];
};


export function AdminRecipeEditorStepper({
  steps,
}: AdminRecipeEditorStepperProps) {
  const completedCount =
    steps.filter(
      (
        step,
      ) =>
        step.completed,
    ).length;


  return (
    <aside className="h-fit rounded-2xl border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-6">

      <div className="flex items-center justify-between gap-3">

        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Editor
        </p>


        <span className="text-xs font-medium text-muted-foreground">
          {completedCount}/{steps.length}
        </span>

      </div>


      <nav className="mt-4 space-y-1.5">

        {steps.map(
          (
            step,
            index,
          ) => {

            const Icon =
              step.completed
                ? CheckCircle2
                : Circle;


            return (
              <Link
                key={
                  step.key
                }
                href={
                  step.href
                }
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  step.current
                    ? "bg-page-muted font-semibold text-foreground"
                    : "text-muted-foreground hover:bg-page-muted/60 hover:text-foreground"
                }`}
              >

                <span
                  className={`flex size-7 shrink-0 items-center justify-center rounded-full ${
                    step.current
                      ? "bg-brand text-inverse"
                      : step.completed
                        ? "text-brand"
                        : "text-muted-foreground"
                  }`}
                >

                  {step.current ? (
                    <span className="text-xs font-bold">
                      {index + 1}
                    </span>
                  ) : (
                    <Icon
                      className="size-4"
                      aria-hidden="true"
                    />
                  )}

                </span>


                <span className="min-w-0 flex-1">

                  <span className="block truncate">
                    {
                      step.label
                    }
                  </span>


                  {step.optional && (
                    <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">
                      Opcional
                    </span>
                  )}

                </span>

              </Link>
            );
          },
        )}

      </nav>

    </aside>
  );
}
