"use client";

import {
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Tags,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  type FormEvent,
  useState,
  useTransition,
} from "react";

import {
  saveFoodCatalogItemAction,
} from "@/app/admin/ingredients/actions";

import type {
  AdminFoodAllergenOption,
  AdminFoodCatalogItem,
} from "@/services/ingredients/admin-food-catalog-service";


type FoodCatalogEditorProps = {
  foodItem:
    AdminFoodCatalogItem | null;

  allergens:
    AdminFoodAllergenOption[];
};


function createSlug(
  value:
    string,
) {
  return value
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}


export function FoodCatalogEditor({
  foodItem,
  allergens,
}: FoodCatalogEditorProps) {
  const router =
    useRouter();


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    name,
    setName,
  ] =
    useState(
      foodItem?.name ??
        "",
    );


  const [
    slug,
    setSlug,
  ] =
    useState(
      foodItem?.slug ??
        "",
    );


  const [
    slugTouched,
    setSlugTouched,
  ] =
    useState(
      foodItem !==
        null,
    );


  const [
    aliasesText,
    setAliasesText,
  ] =
    useState(
      (
        foodItem?.aliases ??
        []
      ).join(
        "\n",
      ),
    );


  const [
    selectedAllergenIds,
    setSelectedAllergenIds,
  ] =
    useState<
      string[]
    >(
      foodItem?.allergenIds ??
        [],
    );


  const [
    isActive,
    setIsActive,
  ] =
    useState(
      foodItem?.isActive ??
        true,
    );


  const [
    markReviewed,
    setMarkReviewed,
  ] =
    useState(
      foodItem
        ? foodItem.allergenReviewedAt !==
            null
        : true,
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      {
        type:
          "success" |
          "error";

        text:
          string;
      } |
      null
    >(
      null,
    );


  function handleNameChange(
    value:
      string,
  ) {
    setName(
      value,
    );


    if (
      !slugTouched
    ) {
      setSlug(
        createSlug(
          value,
        ),
      );
    }
  }


  function toggleAllergen(
    allergenId:
      string,
  ) {
    setSelectedAllergenIds(
      (
        current,
      ) =>
        current.includes(
          allergenId,
        )
          ? current.filter(
              (
                id,
              ) =>
                id !==
                allergenId,
            )
          : [
              ...current,
              allergenId,
            ],
    );
  }


  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();


    setMessage(
      null,
    );


    const aliases =
      aliasesText
        .split(
          "\n",
        )
        .map(
          (
            alias,
          ) =>
            alias.trim(),
        )
        .filter(
          Boolean,
        );


    startTransition(
      async () => {
        const result =
          await saveFoodCatalogItemAction(
            {
              foodItemId:
                foodItem?.id ??
                null,

              name,

              slug,

              aliases,

              allergenIds:
                selectedAllergenIds,

              isActive,

              markAllergensReviewed:
                markReviewed,
            },
          );


        if (
          !result.success
        ) {
          setMessage(
            {
              type:
                "error",

              text:
                result.message,
            },
          );

          return;
        }


        setMessage(
          {
            type:
              "success",

            text:
              result.message,
          },
        );


        router.replace(
          `/admin/ingredients?edit=${result.foodItemId}`,
        );


        router.refresh();
      },
    );
  }


  return (
    <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
          <Tags
            className="size-5"
            aria-hidden="true"
          />
        </span>


        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-hover">
            {
              foodItem
                ? "Editar catálogo"
                : "Nuevo ingrediente"
            }
          </p>

          <h2 className="mt-1 font-serif text-xl font-bold text-foreground">
            {
              foodItem?.name ??
              "Añadir alimento canónico"
            }
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gestiona el nombre que CociHub reconoce, sus alias exactos y los alérgenos deterministas asociados.
          </p>
        </div>
      </div>


      <form
        onSubmit={
          handleSubmit
        }
        className="mt-6 space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">
              Nombre canónico
            </span>

            <input
              type="text"
              value={
                name
              }
              maxLength={
                120
              }
              disabled={
                isPending
              }
              onChange={
                (
                  event,
                ) => {
                  handleNameChange(
                    event.target.value,
                  );
                }
              }
              className="min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition focus:border-brand"
              placeholder="Ej. Harina de trigo"
              required
            />
          </label>


          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">
              Slug
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={
                  slug
                }
                maxLength={
                  140
                }
                disabled={
                  isPending
                }
                onChange={
                  (
                    event,
                  ) => {
                    setSlugTouched(
                      true,
                    );

                    setSlug(
                      event.target.value,
                    );
                  }
                }
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition focus:border-brand"
                placeholder="harina-de-trigo"
                required
              />

              <button
                type="button"
                disabled={
                  isPending ||
                  !name.trim()
                }
                onClick={
                  () => {
                    setSlugTouched(
                      true,
                    );

                    setSlug(
                      createSlug(
                        name,
                      ),
                    );
                  }
                }
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3 text-muted-foreground transition hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                title="Regenerar slug"
              >
                <RotateCcw
                  className="size-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </label>
        </div>


        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Alias reconocidos
          </span>

          <textarea
            value={
              aliasesText
            }
            disabled={
              isPending
            }
            onChange={
              (
                event,
              ) => {
                setAliasesText(
                  event.target.value,
                );
              }
            }
            rows={
              6
            }
            className="w-full rounded-xl border border-border bg-page px-3 py-3 text-sm text-foreground outline-none transition focus:border-brand"
            placeholder={"harina trigo\nharina de trigo común\nharina de trigo comun"}
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Un alias por línea. Las coincidencias siguen siendo exactas después de la normalización segura de CociHub.
          </p>
        </label>


        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Alérgenos deterministas
          </legend>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Marca solo alérgenos que el alimento contiene de forma determinista. Los posibles rastros dependen del producto concreto y no pertenecen a este catálogo.
          </p>


          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {allergens.map(
              (
                allergen,
              ) => {
                const checked =
                  selectedAllergenIds.includes(
                    allergen.id,
                  );


                return (
                  <label
                    key={
                      allergen.id
                    }
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-page/40 px-3 py-3 text-sm transition hover:border-brand/30"
                  >
                    <input
                      type="checkbox"
                      checked={
                        checked
                      }
                      disabled={
                        isPending
                      }
                      onChange={
                        () => {
                          toggleAllergen(
                            allergen.id,
                          );
                        }
                      }
                      className="size-4"
                    />

                    <span className="min-w-0">
                      <span className="block font-semibold text-foreground">
                        {
                          allergen.name
                        }
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {
                          allergen.slug
                        }
                      </span>
                    </span>
                  </label>
                );
              },
            )}
          </div>
        </fieldset>


        <div className="space-y-3 rounded-xl border border-border bg-page-muted/40 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={
                isActive
              }
              disabled={
                isPending
              }
              onChange={
                (
                  event,
                ) => {
                  setIsActive(
                    event.target.checked,
                  );
                }
              }
              className="mt-1 size-4"
            />

            <span>
              <span className="block text-sm font-semibold text-foreground">
                Alimento activo
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Solo los alimentos activos participan en la resolución automática.
              </span>
            </span>
          </label>


          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={
                markReviewed
              }
              disabled={
                isPending
              }
              onChange={
                (
                  event,
                ) => {
                  setMarkReviewed(
                    event.target.checked,
                  );
                }
              }
              className="mt-1 size-4"
            />

            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck
                  className="size-4 text-brand"
                  aria-hidden="true"
                />

                Mapeo de alérgenos revisado
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                También puede marcarse cuando, tras revisarlo, el alimento no tiene ningún alérgeno determinista del catálogo.
              </span>
            </span>
          </label>
        </div>


        {message ? (
          <p
            role="status"
            className={
              message.type ===
              "success"
                ? "rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand"
                : "rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            }
          >
            {
              message.text
            }
          </p>
        ) : null}


        <button
          type="submit"
          disabled={
            isPending ||
            !name.trim() ||
            !slug.trim()
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2
              className="size-4 animate-spin"
              aria-hidden="true"
            />
          ) : (
            <Save
              className="size-4"
              aria-hidden="true"
            />
          )}

          {isPending
            ? "Guardando..."
            : foodItem
              ? "Guardar cambios"
              : "Añadir al catálogo"}
        </button>
      </form>
    </section>
  );
}
