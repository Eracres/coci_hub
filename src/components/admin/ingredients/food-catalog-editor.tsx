"use client";

import {
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Tags,
} from "lucide-react";

import { useRouter } from "next/navigation";

import {
  type FormEvent,
  useEffect,
  useRef,
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


/* =========================================================
   TYPES AND CONSTANTS
========================================================= */

type FoodCatalogEditorProps = {
  foodItem: AdminFoodCatalogItem | null;
  allergens: AdminFoodAllergenOption[];
  catalogHref: string;
};


type EditorMessage = {
  type: "success" | "error";
  text: string;
};


const EDITOR_ID = "food-catalog-editor";

const EDITOR_HASH = `#${EDITOR_ID}`;

const SUCCESS_MESSAGE_PREFIX =
  "cocihub:food-catalog:success:";

const UNSAVED_CHANGES_MESSAGE =
  "Tienes cambios sin guardar. ¿Quieres descartarlos y continuar?";


/* =========================================================
   HELPERS
========================================================= */

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function parseLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}


function scrollToEditor() {
  const editor = document.getElementById(EDITOR_ID);

  if (!editor) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

  editor.scrollIntoView({
    behavior: prefersReducedMotion ? "instant" : "smooth",
    block: "start",
  });

  editor.focus({
    preventScroll: true,
  });
}


/* =========================================================
   FOOD CATALOG EDITOR
========================================================= */

export function FoodCatalogEditor({
  foodItem,
  allergens,
  catalogHref,
}: FoodCatalogEditorProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const saveLock = useRef(false);

  const [name, setName] = useState(
    foodItem?.name ?? "",
  );

  const [slug, setSlug] = useState(
    foodItem?.slug ?? "",
  );

  const [slugTouched, setSlugTouched] = useState(
    foodItem !== null,
  );

  const [aliasesText, setAliasesText] = useState(
    (foodItem?.aliases ?? []).join("\n"),
  );

  const [keywordsText, setKeywordsText] = useState(
    (foodItem?.keywords ?? []).join("\n"),
  );

  const [selectedAllergenIds, setSelectedAllergenIds] =
    useState<string[]>(foodItem?.allergenIds ?? []);

  const [isActive, setIsActive] = useState(
    foodItem?.isActive ?? true,
  );

  const [markReviewed, setMarkReviewed] = useState(
    foodItem
      ? foodItem.allergenReviewedAt !== null
      : true,
  );

  const [message, setMessage] =
    useState<EditorMessage | null>(null);


  /* =======================================================
     UNSAVED CHANGES
  ======================================================= */

  const currentSnapshot = JSON.stringify({
    name,
    slug,
    aliasesText,
    keywordsText,
    allergenIds: [...selectedAllergenIds].sort(),
    isActive,
    markReviewed,
  });

  const [savedSnapshot, setSavedSnapshot] = useState(
    currentSnapshot,
  );

  const isDirty = currentSnapshot !== savedSnapshot;


  useEffect(() => {
    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      if (!isDirty && !isPending && !saveLock.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }


    function handleNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(
        anchor.href,
        window.location.href,
      );

      const current = new URL(window.location.href);

      const samePage =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search;

      // Clicking the current editor link must still scroll
      // to the editor without resetting the current draft.

      if (
        samePage &&
        destination.hash === EDITOR_HASH &&
        current.hash === EDITOR_HASH
      ) {
        event.preventDefault();
        event.stopPropagation();

        scrollToEditor();

        return;
      }

      // Hash-only navigation does not discard the form.

      if (samePage && destination.hash) {
        return;
      }

      if (isPending || saveLock.current) {
        event.preventDefault();
        event.stopPropagation();

        window.alert(
          "Espera a que termine el guardado del ingrediente.",
        );

        return;
      }

      if (
        isDirty &&
        !window.confirm(UNSAVED_CHANGES_MESSAGE)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }


    document.addEventListener(
      "click",
      handleNavigation,
      true,
    );

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    return () => {
      document.removeEventListener(
        "click",
        handleNavigation,
        true,
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );
    };
  }, [isDirty, isPending]);


  /* =======================================================
     EDITOR FOCUS AND SUCCESS MESSAGE
  ======================================================= */

  const foodItemId = foodItem?.id ?? null;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (window.location.hash === EDITOR_HASH) {
        scrollToEditor();
      }

      if (!foodItemId) {
        return;
      }

      try {
        const key =
          `${SUCCESS_MESSAGE_PREFIX}${foodItemId}`;

        const storedMessage =
          window.sessionStorage.getItem(key);

        if (storedMessage) {
          window.sessionStorage.removeItem(key);

          setMessage({
            type: "success",
            text: storedMessage,
          });
        }
      } catch {
        // Storage may be unavailable in some browsers.
        // Saving the ingredient must still work.
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [foodItemId]);


  /* =======================================================
     FORM HANDLERS
  ======================================================= */

  function handleNameChange(value: string) {
    setName(value);

    if (!slugTouched) {
      setSlug(createSlug(value));
    }
  }


  function toggleAllergen(allergenId: string) {
    setSelectedAllergenIds((current) =>
      current.includes(allergenId)
        ? current.filter((id) => id !== allergenId)
        : [...current, allergenId],
    );
  }


  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saveLock.current || isPending) {
      return;
    }

    saveLock.current = true;

    setMessage(null);

    const aliases = parseLines(aliasesText);

    const keywords = parseLines(keywordsText);

    const submittedSnapshot = currentSnapshot;

    startTransition(async () => {
      try {
        const result = await saveFoodCatalogItemAction({
          foodItemId,
          name,
          slug,
          aliases,
          keywords,
          allergenIds: selectedAllergenIds,
          isActive,
          markAllergensReviewed: markReviewed,
        });

        if (!result.success) {
          setMessage({
            type: "error",
            text: result.message,
          });

          return;
        }

        setSavedSnapshot(submittedSnapshot);

        setMessage({
          type: "success",
          text: result.message,
        });

        // Existing ingredient: preserve the current URL,
        // filters, editor and success message.

        if (foodItemId === result.foodItemId) {
          router.refresh();

          return;
        }

        // New ingredient: preserve the success message
        // across the change from creation to edit mode.

        try {
          window.sessionStorage.setItem(
            `${SUCCESS_MESSAGE_PREFIX}${result.foodItemId}`,
            result.message,
          );
        } catch {
          // Navigation remains available without storage.
        }

        const destination = new URL(
          catalogHref,
          window.location.origin,
        );

        destination.searchParams.set(
          "edit",
          result.foodItemId,
        );

        destination.hash = EDITOR_HASH;

        router.replace(
          `${destination.pathname}${destination.search}${destination.hash}`,
        );
      } catch (error) {
        console.error(
          "FOOD CATALOG EDITOR SAVE ERROR:",
          error,
        );

        setMessage({
          type: "error",
          text:
            "No se pudo confirmar el guardado. Comprueba el catálogo antes de volver a intentarlo.",
        });
      } finally {
        saveLock.current = false;
      }
    });
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      id={EDITOR_ID}
      tabIndex={-1}
      aria-labelledby="food-catalog-editor-title"
      className="scroll-mt-8 rounded-2xl border border-border bg-surface p-6 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary/20 text-secondary-hover">
          <Tags
            className="size-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-hover">
            {foodItem
              ? "Editar catálogo"
              : "Nuevo ingrediente"}
          </p>

          <h2
            id="food-catalog-editor-title"
            className="mt-1 font-serif text-xl font-bold text-foreground"
          >
            {foodItem?.name ?? "Añadir alimento canónico"}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gestiona el nombre que CociHub reconoce,
            sus alias exactos, sus keywords seguras y
            los alérgenos deterministas asociados.
          </p>
        </div>
      </div>


      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6"
      >

        {/* NAME AND SLUG */}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-foreground">
              Nombre canónico
            </span>

            <input
              type="text"
              value={name}
              maxLength={120}
              disabled={isPending}
              onChange={(event) => {
                handleNameChange(event.target.value);
              }}
              className="min-h-11 w-full rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition focus:border-brand"
              placeholder="Ej. Mascarpone"
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
                value={slug}
                maxLength={140}
                disabled={isPending}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-page px-3 text-sm text-foreground outline-none transition focus:border-brand"
                placeholder="mascarpone"
                required
              />

              <button
                type="button"
                disabled={isPending || !name.trim()}
                onClick={() => {
                  setSlugTouched(true);
                  setSlug(createSlug(name));
                }}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-3 text-muted-foreground transition hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                title="Regenerar slug"
                aria-label="Regenerar slug"
              >
                <RotateCcw
                  className="size-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </label>
        </div>


        {/* ALIASES */}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Alias reconocidos
          </span>

          <textarea
            value={aliasesText}
            disabled={isPending}
            onChange={(event) => {
              setAliasesText(event.target.value);
            }}
            rows={5}
            className="w-full rounded-xl border border-border bg-page px-3 py-3 text-sm text-foreground outline-none transition focus:border-brand"
            placeholder={
              "queso mascarpone italiano\nmascarpone italiano"
            }
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Un alias por línea. Los alias solo coinciden cuando
            el ingrediente completo coincide exactamente
            tras la normalización.
          </p>
        </label>


        {/* KEYWORDS */}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">
            Keywords seguras
          </span>

          <textarea
            value={keywordsText}
            disabled={isPending}
            onChange={(event) => {
              setKeywordsText(event.target.value);
            }}
            rows={5}
            className="w-full rounded-xl border border-border bg-page px-3 py-3 text-sm text-foreground outline-none transition focus:border-brand"
            placeholder="mascarpone"
          />

          <p className="text-xs leading-5 text-muted-foreground">
            Una keyword o frase por línea. Úsalas solo cuando sean
            términos inequívocos que puedan reconocerse dentro de
            un ingrediente más largo. Evita palabras genéricas como
            queso, leche, crema, harina, pan o nata.
          </p>
        </label>


        {/* ALLERGENS */}

        <fieldset>
          <legend className="text-sm font-semibold text-foreground">
            Alérgenos deterministas
          </legend>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Marca solo alérgenos que el alimento contiene de forma
            determinista. Los posibles rastros dependen del producto
            concreto y no pertenecen a este catálogo.
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {allergens.map((allergen) => {
              const checked =
                selectedAllergenIds.includes(allergen.id);

              return (
                <label
                  key={allergen.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-page/40 px-3 py-3 text-sm transition hover:border-brand/30"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={isPending}
                    onChange={() => {
                      toggleAllergen(allergen.id);
                    }}
                    className="size-4"
                  />

                  <span className="min-w-0">
                    <span className="block font-semibold text-foreground">
                      {allergen.name}
                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {allergen.slug}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>


        {/* CATALOG STATUS */}

        <div className="space-y-3 rounded-xl border border-border bg-page-muted/40 p-4">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={isActive}
              disabled={isPending}
              onChange={(event) => {
                setIsActive(event.target.checked);
              }}
              className="mt-1 size-4"
            />

            <span>
              <span className="block text-sm font-semibold text-foreground">
                Alimento activo
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Solo los alimentos activos participan
                en la resolución automática.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={markReviewed}
              disabled={isPending}
              onChange={(event) => {
                setMarkReviewed(event.target.checked);
              }}
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
                También puede marcarse cuando, tras revisarlo,
                el alimento no tiene ningún alérgeno determinista
                del catálogo.
              </span>
            </span>
          </label>
        </div>


        {/* OPERATION RESULT */}

        {message ? (
          <p
            role="status"
            className={
              message.type === "success"
                ? "rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand"
                : "rounded-xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            }
          >
            {message.text}
          </p>
        ) : null}


        {/* SAVE BUTTON */}

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