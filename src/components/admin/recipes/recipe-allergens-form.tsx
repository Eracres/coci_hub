"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  ShieldCheck,
  ShieldQuestion,
  TriangleAlert,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeAllergensAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  getRecipeAllergenReviewStateAction,
  type AdminRecipeAllergenReviewRow,
} from "@/app/admin/recipes/[id]/edit/allergen-review-actions";

import type {
  RecipeAllergensFormData,
} from "@/schemas/recipe-allergens-schema";


type AllergenOption = {
  id:
    string;

  name:
    string;

  slug:
    string;
};


type RecipeAllergensFormProps = {
  recipeId:
    string;

  allergens:
    AllergenOption[];

  initialValues:
    RecipeAllergensFormData["allergens"];
};


type ManualPresence =
  | ""
  | "present"
  | "possible";


type ManualSelections =
  Record<
    string,
    ManualPresence
  >;


function getPresenceLabel(
  presence:
    | "present"
    | "possible"
    | null,
) {
  if (
    presence ===
    "present"
  ) {
    return "Contiene";
  }


  if (
    presence ===
    "possible"
  ) {
    return "Puede contener";
  }


  return "Sin indicación";
}


export function RecipeAllergensForm({
  recipeId,
  allergens,
  initialValues,
}: RecipeAllergensFormProps) {
  const router =
    useRouter();


  const previousStepHref =
    `/admin/recipes/${recipeId}/edit?step=additional`;


  const nextStepHref =
    `/admin/recipes/${recipeId}/edit?step=publication`;


  const [
    evidenceRows,
    setEvidenceRows,
  ] =
    useState<
      AdminRecipeAllergenReviewRow[]
    >(
      [],
    );


  const [
    manualSelections,
    setManualSelections,
  ] =
    useState<ManualSelections>(
      {},
    );


  const [
    baselineSelections,
    setBaselineSelections,
  ] =
    useState<ManualSelections>(
      {},
    );


  const [
    isLoadingEvidence,
    setIsLoadingEvidence,
  ] =
    useState(
      true,
    );


  const [
    evidenceLoadFailed,
    setEvidenceLoadFailed,
  ] =
    useState(
      false,
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  /* =====================================================
     LOAD REAL ALLERGEN EVIDENCE
  ===================================================== */

  const loadEvidence =
    useCallback(
      async () => {
        setIsLoadingEvidence(
          true,
        );


        setEvidenceLoadFailed(
          false,
        );


        const result =
          await getRecipeAllergenReviewStateAction(
            recipeId,
          );


        if (
          !result.success
        ) {
          setEvidenceRows(
            [],
          );


          setManualSelections(
            {},
          );


          setBaselineSelections(
            {},
          );


          setEvidenceLoadFailed(
            true,
          );


          setMessage(
            result.message,
          );


          setIsLoadingEvidence(
            false,
          );


          return;
        }


        const nextManualSelections:
          ManualSelections = {};


        result.rows.forEach(
          (
            row,
          ) => {
            if (
              row.manualPresence
            ) {
              nextManualSelections[
                row.allergenId
              ] =
                row.manualPresence;
            }
          },
        );


        setEvidenceRows(
          result.rows,
        );


        setManualSelections(
          nextManualSelections,
        );


        setBaselineSelections(
          nextManualSelections,
        );


        setIsLoadingEvidence(
          false,
        );
      },
      [
        recipeId,
      ],
    );


  useEffect(
    () => {
      void loadEvidence();
    },
    [
      loadEvidence,
    ],
  );


  /* =====================================================
     LOOKUPS
  ===================================================== */

  const evidenceByAllergenId =
    useMemo(
      () =>
        new Map(
          evidenceRows.map(
            (
              row,
            ) => [
              row.allergenId,
              row,
            ],
          ),
        ),
      [
        evidenceRows,
      ],
    );


  const detectedCount =
    evidenceRows.filter(
      (
        row,
      ) =>
        row.detectedPresent,
    ).length;


  const manualCount =
    Object.values(
      manualSelections,
    ).filter(
      (
        value,
      ) =>
        value ===
          "present" ||
        value ===
          "possible",
    ).length;


  const isDirty =
    allergens.some(
      (
        allergen,
      ) =>
        (
          manualSelections[
            allergen.id
          ] ??
          ""
        ) !==
        (
          baselineSelections[
            allergen.id
          ] ??
          ""
        ),
    );


  /* =====================================================
     MANUAL CHANGE
  ===================================================== */

  function handleManualPresenceChange(
    allergenId:
      string,

    value:
      ManualPresence,
  ) {
    setManualSelections(
      (
        current,
      ) => ({
        ...current,

        [
          allergenId
        ]:
          value,
      }),
    );


    setMessage(
      null,
    );
  }


  /* =====================================================
     SAVE + CONTINUE
  ===================================================== */

  async function handleContinue() {
    setMessage(
      null,
    );


    if (
      isLoadingEvidence
    ) {
      return;
    }


    if (
      evidenceLoadFailed
    ) {
      setMessage(
        "No podemos guardar alérgenos hasta recuperar correctamente la información automática.",
      );

      return;
    }


    /*
     * Si no existe ningún cambio manual,
     * NO llamamos al RPC.
     *
     * De esta forma un alérgeno detectado
     * automáticamente nunca se convierte
     * accidentalmente en evidencia manual.
     */
    if (
      !isDirty
    ) {
      router.push(
        nextStepHref,
      );

      return;
    }


    const payload:
      RecipeAllergensFormData = {
      allergens:
        allergens
          .map(
            (
              allergen,
            ) => ({
              allergenId:
                allergen.id,

              presence:
                manualSelections[
                  allergen.id
                ],
            }),
          )
          .filter(
            (
              allergen,
            ): allergen is {
              allergenId:
                string;

              presence:
                "present" |
                "possible";
            } =>
              allergen.presence ===
                "present" ||
              allergen.presence ===
                "possible",
          ),
    };


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeAllergensAction(
          recipeId,
          payload,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
          "No se pudieron guardar los alérgenos.",
        );


        return;
      }


      /*
       * PostgreSQL es nuestra fuente
       * definitiva de verdad.
       *
       * No reconstruimos aquí el estado
       * automático/manual porque abandonamos
       * inmediatamente este paso.
       */
      router.refresh();


      router.push(
        nextStepHref,
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-7">

      {/* =================================================
          HEADER
      ================================================= */}

      <div>

        <div className="flex flex-wrap items-center gap-3">

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Paso 9 de 10
          </p>


          <span className="rounded-full border border-border bg-page-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Opcional
          </span>

        </div>


        <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Alérgenos
        </h2>


        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Revisa los alérgenos detectados
          automáticamente a partir de los
          ingredientes y añade, cuando sea
          necesario, información manual.
        </p>

      </div>


      {/* =================================================
          SAFETY INFO
      ================================================= */}

      <div className="mt-7 rounded-2xl border border-brand/20 bg-brand/5 p-5">

        <div className="flex items-start gap-4">

          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand shadow-sm">

            <ShieldCheck
              className="size-5"
              aria-hidden="true"
            />

          </span>


          <div>

            <h3 className="font-semibold text-foreground">
              Detección automática + revisión manual
            </h3>


            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Los alérgenos reconocidos a
              partir de los ingredientes se
              conservan independientemente de
              las decisiones manuales.
            </p>


            <p className="mt-2 text-sm font-medium leading-6 text-foreground">
              Una detección automática de
              «Contiene» nunca puede rebajarse
              manualmente a «Puede contener».
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-border bg-page-muted/20 p-4">

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Detectados
          </p>


          <p className="mt-2 text-2xl font-semibold text-brand">

            {isLoadingEvidence
              ? "…"
              : detectedCount}

          </p>


          <p className="mt-1 text-xs text-muted-foreground">
            por ingredientes
          </p>

        </div>


        <div className="rounded-xl border border-border bg-page-muted/20 p-4">

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Manuales
          </p>


          <p className="mt-2 text-2xl font-semibold text-foreground">

            {isLoadingEvidence
              ? "…"
              : manualCount}

          </p>


          <p className="mt-1 text-xs text-muted-foreground">
            indicados por administrador
          </p>

        </div>


        <div className="rounded-xl border border-border bg-page-muted/20 p-4">

          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Estado efectivo
          </p>


          <p className="mt-2 text-2xl font-semibold text-foreground">
            {
              initialValues.length
            }
          </p>


          <p className="mt-1 text-xs text-muted-foreground">
            alérgenos registrados
          </p>

        </div>

      </div>


      {/* =================================================
          LOADING / ERROR
      ================================================= */}

      {isLoadingEvidence && (
        <div className="mt-6 rounded-xl border border-border bg-page-muted/30 px-4 py-4 text-sm text-muted-foreground">
          Recuperando la información
          automática y manual de alérgenos...
        </div>
      )}


      {evidenceLoadFailed && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

          <TriangleAlert
            className="mt-0.5 size-5 shrink-0"
            aria-hidden="true"
          />


          <p>
            No se ha podido recuperar la
            separación entre detección
            automática e información manual.
            El formulario queda bloqueado para
            evitar alterar datos por error.
          </p>

        </div>
      )}


      {/* =================================================
          ALLERGEN CATALOG
      ================================================= */}

      {!isLoadingEvidence &&
        !evidenceLoadFailed && (

        <div className="mt-7 space-y-3">

          {allergens.map(
            (
              allergen,
            ) => {
              const evidence =
                evidenceByAllergenId.get(
                  allergen.id,
                );


              const detectedPresent =
                evidence
                  ?.detectedPresent ??
                false;


              const manualPresence =
                manualSelections[
                  allergen.id
                ] ??
                "";


              const effectivePresence:
                | "present"
                | "possible"
                | null =
                  detectedPresent
                    ? "present"
                    : manualPresence ===
                        "present" ||
                      manualPresence ===
                        "possible"
                      ? manualPresence
                      : null;


              return (
                <article
                  key={
                    allergen.id
                  }
                  className="rounded-2xl border border-border bg-page-muted/20 p-4 sm:p-5"
                >

                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                    {/* =====================================
                        ALLERGEN STATUS
                    ===================================== */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-semibold text-foreground">
                          {
                            allergen.name
                          }
                        </h3>


                        {detectedPresent && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/5 px-2.5 py-1 text-xs font-semibold text-brand">

                            <Bot
                              className="size-3.5"
                              aria-hidden="true"
                            />

                            Detectado automáticamente

                          </span>
                        )}


                        {manualPresence && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground">

                            <ShieldQuestion
                              className="size-3.5"
                              aria-hidden="true"
                            />

                            Información manual

                          </span>
                        )}

                      </div>


                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">

                        <span className="text-muted-foreground">
                          Estado efectivo:
                        </span>


                        <span
                          className={
                            effectivePresence ===
                            "present"
                              ? "font-semibold text-red-700"
                              : effectivePresence ===
                                  "possible"
                                ? "font-semibold text-amber-700"
                                : "font-medium text-muted-foreground"
                          }
                        >
                          {
                            getPresenceLabel(
                              effectivePresence,
                            )
                          }
                        </span>

                      </div>


                      {detectedPresent && (
                        <p className="mt-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                          CociHub ha encontrado
                          evidencia de este
                          alérgeno en los
                          ingredientes de la
                          receta.
                        </p>
                      )}

                    </div>


                    {/* =====================================
                        MANUAL SELECT
                    ===================================== */}

                    <div className="w-full lg:w-72">

                      <label
                        htmlFor={`allergen-${allergen.id}`}
                        className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                      >
                        Indicación manual
                      </label>


                      <select
                        id={`allergen-${allergen.id}`}
                        value={
                          manualPresence
                        }
                        onChange={(
                          event,
                        ) =>
                          handleManualPresenceChange(
                            allergen.id,
                            event
                              .target
                              .value as ManualPresence,
                          )
                        }
                        className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                      >

                        <option value="">
                          Sin indicación manual
                        </option>


                        <option value="present">
                          Contiene
                        </option>


                        <option value="possible">
                          Puede contener / posibles trazas
                        </option>

                      </select>


                      {detectedPresent &&
                        manualPresence ===
                          "possible" && (

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Mientras exista la
                          detección automática,
                          el estado efectivo
                          seguirá siendo
                          «Contiene».
                        </p>

                      )}

                    </div>

                  </div>

                </article>
              );
            },
          )}

        </div>
      )}


      {/* =================================================
          DISCLAIMER
      ================================================= */}

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-page-muted/30 px-4 py-4">

        <TriangleAlert
          className="mt-0.5 size-5 shrink-0 text-brand"
          aria-hidden="true"
        />


        <p className="text-sm leading-6 text-muted-foreground">
          La información de alérgenos es
          orientativa. La seguridad final
          depende también de las marcas,
          etiquetado, sustituciones y posibles
          contaminaciones cruzadas.
        </p>

      </div>


      {/* =================================================
          MESSAGE
      ================================================= */}

      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl border border-border bg-page-muted/40 px-4 py-3 text-sm text-muted-foreground"
        >
          {
            message
          }
        </p>
      )}


      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">

        <button
          type="button"
          disabled={
            isSubmitting
          }
          onClick={() =>
            router.push(
              previousStepHref,
            )
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-50"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Anterior

        </button>


        <button
          type="button"
          disabled={
            isSubmitting ||
            isLoadingEvidence ||
            evidenceLoadFailed
          }
          onClick={
            handleContinue
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >

          {isSubmitting
            ? "Guardando..."
            : isDirty
              ? "Guardar y continuar"
              : "Continuar"}


          {!isSubmitting && (
            <ArrowRight
              className="size-4"
              aria-hidden="true"
            />
          )}

        </button>

      </div>

    </section>
  );
}