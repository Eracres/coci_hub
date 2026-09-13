"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeAllergensAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeAllergensSchema,
  type AllergenPresence,
  type RecipeAllergensFormData,
} from "@/schemas/recipe-allergens-schema";

import type {
  AllergenOption,
} from "@/services/recipes/recipe-service";


type RecipeAllergensFormProps = {
  recipeId:
    string;

  allergens:
    AllergenOption[];

  initialValues:
    RecipeAllergensFormData["allergens"];
};


type AllergenState = Record<
  string,
  AllergenPresence | null
>;


function createInitialState(
  allergens:
    AllergenOption[],

  initialValues:
    RecipeAllergensFormData["allergens"],
): AllergenState {
  const state:
    AllergenState = {};

  allergens.forEach(
    (allergen) => {
      state[
        allergen.id
      ] = null;
    },
  );


  initialValues.forEach(
    (allergen) => {
      state[
        allergen.allergenId
      ] =
        allergen.presence;
    },
  );


  return state;
}


export function RecipeAllergensForm({
  recipeId,
  allergens,
  initialValues,
}: RecipeAllergensFormProps) {
  const router =
    useRouter();


  const [
    values,
    setValues,
  ] =
    useState<AllergenState>(
      () =>
        createInitialState(
          allergens,
          initialValues,
        ),
    );


  const [
    isDirty,
    setIsDirty,
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


  function setPresence(
    allergenId: string,
    presence:
      AllergenPresence | null,
  ) {
    setValues(
      (
        current,
      ) => ({
        ...current,

        [allergenId]:
          presence,
      }),
    );


    setIsDirty(
      true,
    );


    setMessage(
      null,
    );
  }


  function clearAll() {
    const cleared:
      AllergenState = {};

    allergens.forEach(
      (allergen) => {
        cleared[
          allergen.id
        ] = null;
      },
    );


    setValues(
      cleared,
    );

    setIsDirty(
      true,
    );

    setMessage(
      null,
    );
  }


  function buildPayload():
  RecipeAllergensFormData {
    return {
      allergens:
        allergens.flatMap(
          (allergen) => {
            const presence =
              values[
                allergen.id
              ];

            if (
              !presence
            ) {
              return [];
            }

            return [
              {
                allergenId:
                  allergen.id,

                presence,
              },
            ];
          },
        ),
    };
  }


  async function handleSave() {
    setMessage(
      null,
    );


    const payload =
      buildPayload();


    const validation =
      recipeAllergensSchema.safeParse(
        payload,
      );


    if (
      !validation.success
    ) {
      setMessage(
        validation.error
          .issues[0]
          ?.message ??
          "Los datos de alérgenos no son válidos.",
      );

      return;
    }


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeAllergensAction(
          recipeId,
          validation.data,
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


      setIsDirty(
        false,
      );


      setMessage(
        result.message ??
          "Alérgenos guardados.",
      );


      router.refresh();
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  const presentCount =
    Object.values(
      values,
    ).filter(
      (value) =>
        value ===
        "present",
    ).length;


  const possibleCount =
    Object.values(
      values,
    ).filter(
      (value) =>
        value ===
        "possible",
    ).length;


  return (
    <section className="rounded-xl border p-6">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <h2 className="text-xl font-semibold">
            Alérgenos
          </h2>

          <p className="mt-1 text-sm">
            Indica los alérgenos presentes en la receta y aquellos que podrían aparecer como trazas.
          </p>
        </div>


        <button
          type="button"
          onClick={
            clearAll
          }
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Limpiar selección
        </button>

      </div>


      {/* =============================================
          NOTICE
      ============================================= */}

      <div className="mt-6 rounded-lg border p-4">

        <p className="font-medium">
          Aviso sobre alérgenos
        </p>

        <p className="mt-2 text-sm">
          Esta información es orientativa y depende de los ingredientes y marcas utilizados. En caso de alergia o intolerancia, siempre debe comprobarse el etiquetado de cada producto.
        </p>

      </div>


      {/* =============================================
          SUMMARY
      ============================================= */}

      <div className="mt-6 flex flex-wrap gap-4 text-sm">

        <p>
          Contiene:{" "}
          <strong>
            {presentCount}
          </strong>
        </p>

        <p>
          Puede contener:{" "}
          <strong>
            {possibleCount}
          </strong>
        </p>

      </div>


      {/* =============================================
          CATALOG
      ============================================= */}

      <div className="mt-6 space-y-3">

        {allergens.length ===
        0 ? (
          <div className="rounded-lg border p-4">
            <p className="text-sm">
              No hay alérgenos disponibles en el catálogo.
            </p>
          </div>
        ) : (
          allergens.map(
            (allergen) => {
              const current =
                values[
                  allergen.id
                ] ??
                null;


              return (
                <article
                  key={
                    allergen.id
                  }
                  className="rounded-lg border p-4"
                >

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">

                    <div>
                      <h3 className="font-medium">
                        {
                          allergen.name
                        }
                      </h3>

                      <p className="mt-1 text-xs">
                        {
                          allergen.slug
                        }
                      </p>
                    </div>


                    <div className="flex flex-wrap gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          setPresence(
                            allergen.id,
                            null,
                          )
                        }
                        className={
                          current ===
                          null
                            ? "rounded-lg bg-black px-4 py-2 text-sm text-white"
                            : "rounded-lg border px-4 py-2 text-sm"
                        }
                      >
                        No indicado
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          setPresence(
                            allergen.id,
                            "present",
                          )
                        }
                        className={
                          current ===
                          "present"
                            ? "rounded-lg bg-black px-4 py-2 text-sm text-white"
                            : "rounded-lg border px-4 py-2 text-sm"
                        }
                      >
                        Contiene
                      </button>


                      <button
                        type="button"
                        onClick={() =>
                          setPresence(
                            allergen.id,
                            "possible",
                          )
                        }
                        className={
                          current ===
                          "possible"
                            ? "rounded-lg bg-black px-4 py-2 text-sm text-white"
                            : "rounded-lg border px-4 py-2 text-sm"
                        }
                      >
                        Puede contener
                      </button>

                    </div>

                  </div>

                </article>
              );
            },
          )
        )}

      </div>


      {/* =============================================
          SAVE
      ============================================= */}

      <div className="mt-6 flex flex-wrap items-center gap-4">

        <button
          type="button"
          disabled={
            isSubmitting ||
            !isDirty
          }
          onClick={
            handleSave
          }
          className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : "Guardar alérgenos"}
        </button>


        {message && (
          <p
            role="status"
            className="text-sm"
          >
            {message}
          </p>
        )}

      </div>

    </section>
  );
}