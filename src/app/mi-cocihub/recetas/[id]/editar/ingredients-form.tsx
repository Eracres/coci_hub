"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ShoppingBasket,
  Check,
  ChevronDown,
  CircleCheck,
  Copy,
  Info,
  Layers3,
  Lightbulb,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  TriangleAlert,
  Utensils,
  X,
} from "lucide-react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  recipeIngredientSchema,
  recipeIngredientsSchema,
  type RecipeIngredientFormData,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";

import {
  updateMyRecipeIngredientsAction,
} from "./ingredients-actions";


/* =========================================================
   TYPES
========================================================= */

type IngredientsFormProps = {
  recipeId: string;
  initialGroups: RecipeIngredientsFormData["groups"];
  previousStepHref: string;
  nextStepHref: string;
};

type EditableIngredient = RecipeIngredientFormData & {
  clientId: string;
};

type EditableGroup = {
  clientId: string;
  name: string;
  ingredients: EditableIngredient[];
};

type IngredientEditorState = {
  groupId: string;
  ingredientId: string | null;
  values: RecipeIngredientFormData;
};

type SaveMode = "draft" | "continue";

type Feedback = {
  type: "success" | "error";
  text: string;
};


/* =========================================================
   CONSTANTS
========================================================= */

const emptyIngredient: RecipeIngredientFormData = {
  name: "",
  quantity: "",
  unit: "",
  notes: "",
  scalable: true,
};

const UNIT_SUGGESTIONS = [
  "g",
  "kg",
  "ml",
  "l",
  "unidad",
  "unidades",
  "cucharada",
  "cucharadas",
  "cucharadita",
  "cucharaditas",
  "taza",
  "tazas",
  "diente",
  "dientes",
  "pizca",
  "pizcas",
  "ramita",
  "ramitas",
  "vaso",
  "vasos",
  "al gusto",
];

const INPUT_CLASS =
  "w-full min-w-0 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15";

const SECONDARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:cursor-not-allowed disabled:opacity-40";

const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50";


/* =========================================================
   HELPERS
========================================================= */

function createEditableGroups(
  initialGroups: RecipeIngredientsFormData["groups"],
): EditableGroup[] {
  return initialGroups.map((group, groupIndex) => ({
    clientId: `group-${groupIndex}`,
    name: group.name,

    ingredients: group.ingredients.map(
      (ingredient, ingredientIndex) => ({
        clientId:
          `ingredient-${groupIndex}-${ingredientIndex}`,

        ...ingredient,
      }),
    ),
  }));
}


function getIngredientValues(
  ingredient: EditableIngredient,
): RecipeIngredientFormData {
  return {
    name: ingredient.name,
    quantity: ingredient.quantity,
    unit: ingredient.unit,
    notes: ingredient.notes,
    scalable: ingredient.scalable,
  };
}


function buildPayload(
  groups: EditableGroup[],
): RecipeIngredientsFormData {
  return {
    groups: groups.map((group) => ({
      name: group.name,

      ingredients:
        group.ingredients.map(getIngredientValues),
    })),
  };
}


function moveItem<T>(
  items: T[],
  from: number,
  to: number,
): T[] {
  if (
    from < 0 ||
    from >= items.length ||
    to < 0 ||
    to >= items.length
  ) {
    return items;
  }

  const copy = [...items];
  const [item] = copy.splice(from, 1);

  copy.splice(to, 0, item);

  return copy;
}


function formatQuantity(
  ingredient: RecipeIngredientFormData,
) {
  return [
    ingredient.quantity,
    ingredient.unit,
  ]
    .filter(Boolean)
    .join(" ");
}


function hasIngredientDraft(
  editor: IngredientEditorState | null,
) {
  if (!editor) {
    return false;
  }

  return (
    editor.ingredientId !== null ||
    editor.values.name !== "" ||
    editor.values.quantity !== "" ||
    editor.values.unit !== "" ||
    editor.values.notes !== "" ||
    editor.values.scalable !==
      emptyIngredient.scalable
  );
}


/* =========================================================
   ICON BUTTON
========================================================= */

function IconButton({
  label,
  children,
  onClick,
  disabled = false,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition focus-visible:outline-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-30 ${
        danger
          ? "text-red-700 hover:border-red-300 hover:bg-red-50"
          : "text-muted-foreground hover:border-secondary/40 hover:bg-page-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}


/* =========================================================
   INGREDIENTS FORM
========================================================= */

export function IngredientsForm({
  recipeId,
  initialGroups,
  previousStepHref,
  nextStepHref,
}: IngredientsFormProps) {
  const router = useRouter();

  const idCounter = useRef(0);
  const savingRef = useRef(false);

  const [groups, setGroups] = useState<EditableGroup[]>(
    () => createEditableGroups(initialGroups),
  );

  const [openGroupId, setOpenGroupId] =
    useState<string | null>(
      initialGroups.length > 0 ? "group-0" : null,
    );

  const [editor, setEditor] =
    useState<IngredientEditorState | null>(null);

  const [editorError, setEditorError] =
    useState<string | null>(null);

  const [feedback, setFeedback] =
    useState<Feedback | null>(null);

  const [pendingSaveMode, setPendingSaveMode] =
    useState<SaveMode | null>(null);

  const [reorderMode, setReorderMode] =
    useState(false);

  const [isDirty, setIsDirty] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);


  const ingredientCount = groups.reduce(
    (total, group) =>
      total + group.ingredients.length,
    0,
  );

  const hasPendingIngredient =
    hasIngredientDraft(editor);

  const hasUnsavedChanges =
    isDirty || hasPendingIngredient;

  const editorGroup = editor
    ? groups.find(
        (group) => group.clientId === editor.groupId,
      )
    : undefined;


  /* =======================================================
     UNSAVED CHANGES PROTECTION
  ======================================================= */

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }

    function handleBeforeUnload(
      event: BeforeUnloadEvent,
    ) {
      event.preventDefault();
      event.returnValue = "";
    }

    function handleNavigationClick(
      event: MouseEvent,
    ) {
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

      const anchor =
        event.target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (
        anchor.hasAttribute("download") ||
        (anchor.target &&
          anchor.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(
        anchor.href,
        window.location.href,
      );

      const current = new URL(
        window.location.href,
      );

      if (
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.origin === current.origin
      ) {
        return;
      }

      if (
        !window.confirm(
          "Tienes cambios de ingredientes sin guardar. ¿Quieres salir de este apartado sin guardarlos?",
        )
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload,
    );

    document.addEventListener(
      "click",
      handleNavigationClick,
      true,
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload,
      );

      document.removeEventListener(
        "click",
        handleNavigationClick,
        true,
      );
    };
  }, [hasUnsavedChanges]);


  /* =======================================================
     GENERAL HELPERS
  ======================================================= */

  function createClientId(prefix: string) {
    idCounter.current += 1;

    return `new-${prefix}-${idCounter.current}`;
  }


  function markDirty() {
    setIsDirty(true);
    setFeedback(null);
  }


  function clearEditor() {
    setEditor(null);
    setEditorError(null);
    setPendingSaveMode(null);
  }


  function returnToEditor() {
    if (editor) {
      setOpenGroupId(editor.groupId);
    }

    setPendingSaveMode(null);
  }


  function canOpenAnotherEditor() {
    if (!hasPendingIngredient || !editor) {
      return true;
    }

    setOpenGroupId(editor.groupId);

    setEditorError(
      "Termina de añadir o cancela el ingrediente que tienes pendiente antes de editar otro.",
    );

    return false;
  }


  /* =======================================================
     GROUP MANAGEMENT
  ======================================================= */

  function addGroup() {
    const groupId = createClientId("group");

    const newGroup: EditableGroup = {
      clientId: groupId,

      name:
        groups.length === 0
          ? "Ingredientes principales"
          : `Grupo ${groups.length + 1}`,

      ingredients: [],
    };

    setGroups((current) => [
      ...current,
      newGroup,
    ]);

    setOpenGroupId(groupId);

    markDirty();
  }


  function changeGroupName(
    groupId: string,
    name: string,
  ) {
    setGroups((current) =>
      current.map((group) =>
        group.clientId === groupId
          ? { ...group, name }
          : group,
      ),
    );

    markDirty();
  }


  function toggleGroup(groupId: string) {
    setOpenGroupId((current) =>
      current === groupId ? null : groupId,
    );
  }


  function removeGroup(groupId: string) {
    const group = groups.find(
      (item) => item.clientId === groupId,
    );

    if (!group) {
      return;
    }

    const includesPendingEditor =
      editor?.groupId === groupId &&
      hasPendingIngredient;

    const requiresConfirmation =
      group.ingredients.length > 0 ||
      includesPendingEditor;

    if (
      requiresConfirmation &&
      !window.confirm(
        `¿Eliminar el grupo "${group.name}" y todos sus ingredientes, incluidos los cambios pendientes de este grupo?`,
      )
    ) {
      return;
    }

    const remainingGroups = groups.filter(
      (item) => item.clientId !== groupId,
    );

    setGroups(remainingGroups);

    if (editor?.groupId === groupId) {
      clearEditor();
    }

    if (openGroupId === groupId) {
      setOpenGroupId(
        remainingGroups[0]?.clientId ?? null,
      );
    }

    markDirty();
  }


  function moveGroup(
    groupId: string,
    direction: number,
  ) {
    const index = groups.findIndex(
      (group) => group.clientId === groupId,
    );

    const destination = index + direction;

    if (
      index < 0 ||
      destination < 0 ||
      destination >= groups.length
    ) {
      return;
    }

    setGroups((current) =>
      moveItem(current, index, destination),
    );

    markDirty();
  }


  /* =======================================================
     INGREDIENT EDITOR
  ======================================================= */

  function openNewIngredient(groupId: string) {
    if (
      editor?.groupId === groupId &&
      editor.ingredientId === null
    ) {
      setOpenGroupId(groupId);
      return;
    }

    if (!canOpenAnotherEditor()) {
      return;
    }

    setEditor({
      groupId,
      ingredientId: null,
      values: { ...emptyIngredient },
    });

    setOpenGroupId(groupId);
    setEditorError(null);
    setFeedback(null);
    setPendingSaveMode(null);
  }


  function editIngredient(
    groupId: string,
    ingredient: EditableIngredient,
  ) {
    if (
      editor?.groupId === groupId &&
      editor.ingredientId === ingredient.clientId
    ) {
      setOpenGroupId(groupId);
      return;
    }

    if (!canOpenAnotherEditor()) {
      return;
    }

    setEditor({
      groupId,
      ingredientId: ingredient.clientId,
      values: getIngredientValues(ingredient),
    });

    setOpenGroupId(groupId);
    setEditorError(null);
    setFeedback(null);
    setPendingSaveMode(null);
  }


  function duplicateIngredient(
    groupId: string,
    ingredient: EditableIngredient,
  ) {
    if (!canOpenAnotherEditor()) {
      return;
    }

    setEditor({
      groupId,
      ingredientId: null,
      values: getIngredientValues(ingredient),
    });

    setOpenGroupId(groupId);
    setEditorError(null);
    setFeedback(null);
    setPendingSaveMode(null);
  }


  function updateIngredientDraft<
    K extends keyof RecipeIngredientFormData,
  >(
    field: K,
    value: RecipeIngredientFormData[K],
  ) {
    setEditor((current) =>
      current
        ? {
            ...current,
            values: {
              ...current.values,
              [field]: value,
            },
          }
        : null,
    );

    setEditorError(null);
    setFeedback(null);
  }


  function cancelIngredientEditor() {
    if (
      hasPendingIngredient &&
      !window.confirm(
        "¿Descartar los cambios de este ingrediente?",
      )
    ) {
      return;
    }

    clearEditor();
  }


  /* =======================================================
     APPLY INGREDIENT DRAFT
  ======================================================= */

  function applyEditor(
    currentGroups: EditableGroup[],
  ): EditableGroup[] | null {
    if (!editor) {
      return currentGroups;
    }

    const validation =
      recipeIngredientSchema.safeParse(
        editor.values,
      );

    if (!validation.success) {
      setEditorError(
        validation.error.issues[0]?.message ??
          "El ingrediente no es válido.",
      );

      setOpenGroupId(editor.groupId);
      setPendingSaveMode(null);

      return null;
    }

    const targetGroup = currentGroups.find(
      (group) =>
        group.clientId === editor.groupId,
    );

    if (!targetGroup) {
      setFeedback({
        type: "error",
        text: "No se encontró el grupo del ingrediente.",
      });

      setPendingSaveMode(null);

      return null;
    }

    if (
      editor.ingredientId !== null &&
      !targetGroup.ingredients.some(
        (ingredient) =>
          ingredient.clientId === editor.ingredientId,
      )
    ) {
      setEditorError(
        "El ingrediente que estabas editando ya no existe.",
      );

      setOpenGroupId(editor.groupId);
      setPendingSaveMode(null);

      return null;
    }

    const ingredientId =
      editor.ingredientId ??
      createClientId("ingredient");

    const updatedIngredient: EditableIngredient = {
      clientId: ingredientId,
      ...validation.data,
    };

    return currentGroups.map((group) => {
      if (group.clientId !== editor.groupId) {
        return group;
      }

      if (editor.ingredientId === null) {
        return {
          ...group,
          ingredients: [
            ...group.ingredients,
            updatedIngredient,
          ],
        };
      }

      return {
        ...group,
        ingredients: group.ingredients.map(
          (ingredient) =>
            ingredient.clientId ===
            editor.ingredientId
              ? updatedIngredient
              : ingredient,
        ),
      };
    });
  }


  function saveIngredient() {
    if (!editor) {
      return;
    }

    const updatedGroups = applyEditor(groups);

    if (!updatedGroups) {
      return;
    }

    setGroups(updatedGroups);
    markDirty();
    setEditorError(null);
    setPendingSaveMode(null);

    if (editor.ingredientId === null) {
      /*
       * Mantener abierto el formulario permite
       * introducir varios ingredientes seguidos.
       */

      setEditor({
        groupId: editor.groupId,
        ingredientId: null,
        values: { ...emptyIngredient },
      });
    } else {
      setEditor(null);
    }
  }


  /* =======================================================
     INGREDIENT MANAGEMENT
  ======================================================= */

  function removeIngredient(
    groupId: string,
    ingredientId: string,
  ) {
    const group = groups.find(
      (item) => item.clientId === groupId,
    );

    const ingredient = group?.ingredients.find(
      (item) => item.clientId === ingredientId,
    );

    if (!ingredient) {
      return;
    }

    if (
      !window.confirm(
        `¿Eliminar "${ingredient.name}" de la receta?`,
      )
    ) {
      return;
    }

    setGroups((current) =>
      current.map((item) =>
        item.clientId === groupId
          ? {
              ...item,

              ingredients: item.ingredients.filter(
                (currentIngredient) =>
                  currentIngredient.clientId !==
                  ingredientId,
              ),
            }
          : item,
      ),
    );

    if (
      editor?.groupId === groupId &&
      editor.ingredientId === ingredientId
    ) {
      clearEditor();
    }

    markDirty();
  }


  function moveIngredient(
    groupId: string,
    ingredientId: string,
    direction: number,
  ) {
    const group = groups.find(
      (item) => item.clientId === groupId,
    );

    if (!group) {
      return;
    }

    const index = group.ingredients.findIndex(
      (ingredient) =>
        ingredient.clientId === ingredientId,
    );

    const destination = index + direction;

    if (
      index < 0 ||
      destination < 0 ||
      destination >= group.ingredients.length
    ) {
      return;
    }

    setGroups((current) =>
      current.map((item) =>
        item.clientId === groupId
          ? {
              ...item,
              ingredients: moveItem(
                item.ingredients,
                index,
                destination,
              ),
            }
          : item,
      ),
    );

    markDirty();
  }


  /* =======================================================
     SAVE RECIPE INGREDIENTS
  ======================================================= */

  async function persistIngredients(
    groupsToSave: EditableGroup[],
    mode: SaveMode,
    forceSave = false,
  ) {
    if (savingRef.current) {
      return;
    }

    setFeedback(null);
    setPendingSaveMode(null);

    const payload = buildPayload(groupsToSave);

    const validation =
      recipeIngredientsSchema.safeParse(payload);

    if (!validation.success) {
      setFeedback({
        type: "error",

        text:
          validation.error.issues[0]?.message ??
          "Hay datos de ingredientes que no son válidos.",
      });

      return;
    }

    const totalIngredients =
      validation.data.groups.reduce(
        (total, group) =>
          total + group.ingredients.length,
        0,
      );

    if (totalIngredients < 1) {
      setFeedback({
        type: "error",
        text: "Añade al menos un ingrediente para guardar este apartado.",
      });

      return;
    }

    if (!isDirty && !forceSave) {
      if (mode === "continue") {
        router.push(nextStepHref);
      }

      return;
    }

    savingRef.current = true;
    setIsSubmitting(true);

    try {
      const result =
        await updateMyRecipeIngredientsAction(
          recipeId,
          validation.data,
        );

      if (!result.success) {
        setFeedback({
          type: "error",

          text:
            result.message ??
            "No se pudieron guardar los ingredientes.",
        });

        return;
      }

      setIsDirty(false);

      if (mode === "continue") {
        router.push(nextStepHref);
        return;
      }

      setFeedback({
        type: "success",

        text:
          result.message ??
          "Ingredientes guardados correctamente.",
      });

      router.refresh();
    } catch (error) {
      console.error(
        "SAVE INGREDIENTS ERROR:",
        error,
      );

      setFeedback({
        type: "error",
        text: "No se pudieron guardar los ingredientes. Tus cambios siguen en el editor.",
      });
    } finally {
      savingRef.current = false;
      setIsSubmitting(false);
    }
  }


  function requestSave(mode: SaveMode) {
    if (hasPendingIngredient && editor) {
      setPendingSaveMode(mode);
      setFeedback(null);
      return;
    }

    void persistIngredients(groups, mode);
  }


  function addPendingAndSave() {
    if (!pendingSaveMode || !editor) {
      return;
    }

    const mode = pendingSaveMode;
    const updatedGroups = applyEditor(groups);

    if (!updatedGroups) {
      return;
    }

    setGroups(updatedGroups);
    setIsDirty(true);
    clearEditor();

    void persistIngredients(
      updatedGroups,
      mode,
      true,
    );
  }


  function discardPendingAndSave() {
    if (!pendingSaveMode) {
      return;
    }

    if (
      !window.confirm(
        "¿Descartar el ingrediente o los cambios pendientes?",
      )
    ) {
      return;
    }

    const mode = pendingSaveMode;

    clearEditor();

    void persistIngredients(groups, mode);
  }


  function goToPreviousStep() {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Tienes cambios sin guardar. ¿Volver a Clasificación sin guardarlos?",
      )
    ) {
      return;
    }

    router.push(previousStepHref);
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="grid min-w-0 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <section className="min-w-0 overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm">

        {/* HEADER */}

        <header className="border-b border-border px-5 py-6 sm:px-7">
          <div className="flex items-start gap-4">

            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Utensils
                className="size-5"
                aria-hidden="true"
              />
            </span>

            <div className="min-w-0 flex-1">

              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                04 · Ingredientes
              </p>

              <h2 className="mt-1 font-serif text-3xl font-bold">
                Construye tu lista de ingredientes
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Organiza los alimentos y las cantidades
                necesarias para preparar tu receta.
              </p>

            </div>
          </div>


          {/* COUNTERS */}

          <div className="mt-6 grid grid-cols-2 gap-3">

            <div className="flex items-center gap-3 rounded-2xl border border-brand/10 bg-brand/[0.06] p-4">

              <Layers3
                className="size-6 shrink-0 text-brand"
                aria-hidden="true"
              />

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Grupos
                </p>

                <p className="font-serif text-2xl font-bold text-brand">
                  {groups.length}
                </p>
              </div>

            </div>


            <div className="flex items-center gap-3 rounded-2xl border border-secondary/15 bg-secondary/[0.08] p-4">

              <ShoppingBasket
                className="size-6 shrink-0 text-secondary-hover"
                aria-hidden="true"
              />

              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Ingredientes
                </p>

                <p className="font-serif text-2xl font-bold text-secondary-hover">
                  {ingredientCount}
                </p>
              </div>

            </div>

          </div>
        </header>


        <fieldset
          disabled={isSubmitting}
          className="min-w-0 border-0 p-0"
        >

          <div className="space-y-5 px-5 py-6 sm:px-7">

            {/* ===========================================
                PENDING INGREDIENT WARNING
            =========================================== */}

            {pendingSaveMode && editor ? (
              <section
                role="alert"
                className="rounded-2xl border border-warning/30 bg-accent/[0.08] p-4"
              >
                <div className="flex items-start gap-3">

                  <TriangleAlert
                    className="mt-0.5 size-6 shrink-0 text-warning"
                    aria-hidden="true"
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="text-sm font-bold">
                      {editor.ingredientId
                        ? "Tienes una edición pendiente"
                        : "Tienes un ingrediente pendiente"}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Confirma qué quieres hacer antes
                      de guardar la receta.
                    </p>

                  </div>
                </div>


                <div className="mt-4 rounded-xl border border-border bg-surface p-3">

                  <p className="text-xs text-muted-foreground">
                    {editorGroup?.name ??
                      "Grupo de ingredientes"}
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {editor.values.name ||
                      "Ingrediente sin nombre"}

                    {formatQuantity(editor.values)
                      ? ` — ${formatQuantity(editor.values)}`
                      : ""}
                  </p>

                </div>


                <div className="mt-4 flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={addPendingAndSave}
                    className={PRIMARY_BUTTON}
                  >
                    <Check
                      className="size-4"
                      aria-hidden="true"
                    />

                    {pendingSaveMode === "continue"
                      ? "Confirmar y continuar"
                      : "Confirmar y guardar"}
                  </button>

                  <button
                    type="button"
                    onClick={returnToEditor}
                    className={SECONDARY_BUTTON}
                  >
                    Volver al editor
                  </button>

                </div>


                <button
                  type="button"
                  onClick={discardPendingAndSave}
                  className="mt-3 text-xs font-medium text-muted-foreground underline underline-offset-2 hover:text-brand"
                >
                  Descartar los cambios pendientes
                </button>

              </section>
            ) : null}


            {/* PENDING DRAFT IN A CLOSED GROUP */}

            {!pendingSaveMode &&
              hasPendingIngredient &&
              editor &&
              openGroupId !== editor.groupId && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/25 bg-accent/[0.08] p-3">

                  <p className="flex items-center gap-2 text-xs font-medium">
                    <TriangleAlert
                      className="size-4 shrink-0 text-warning"
                      aria-hidden="true"
                    />

                    Tienes un ingrediente pendiente en otro grupo.
                  </p>

                  <button
                    type="button"
                    onClick={returnToEditor}
                    className="text-xs font-bold text-brand"
                  >
                    Volver al ingrediente
                  </button>

                </div>
              )}


            {/* ===========================================
                GROUP TOOLBAR
            =========================================== */}

            <div className="flex flex-wrap items-center justify-between gap-3">

              <h3 className="font-serif text-xl font-bold">
                Grupos de ingredientes
              </h3>

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  aria-pressed={reorderMode}
                  onClick={() =>
                    setReorderMode(
                      (current) => !current,
                    )
                  }
                  className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    reorderMode
                      ? "border-secondary/35 bg-secondary/10 text-secondary-hover"
                      : "border-border bg-surface text-muted-foreground hover:bg-page-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`relative h-5 w-9 rounded-full transition ${
                      reorderMode
                        ? "bg-secondary"
                        : "bg-border"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${
                        reorderMode
                          ? "left-[18px]"
                          : "left-0.5"
                      }`}
                    />
                  </span>

                  Reordenar
                </button>


                <button
                  type="button"
                  onClick={addGroup}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-surface px-3 py-2 text-sm font-semibold text-brand transition hover:bg-brand/5"
                >
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />

                  Añadir grupo
                </button>

              </div>
            </div>


            {reorderMode && (
              <div className="rounded-xl bg-secondary/[0.07] px-4 py-3 text-xs leading-5 text-secondary-hover">
                Utiliza las flechas para cambiar el orden
                de los grupos y los ingredientes.
              </div>
            )}


            {/* ===========================================
                EMPTY STATE
            =========================================== */}

            {groups.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-page-muted/30 p-8 text-center">

                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">

                  <Utensils
                    className="size-7"
                    aria-hidden="true"
                  />

                </span>

                <h3 className="mt-4 font-serif text-xl font-bold">
                  Empieza por los ingredientes
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Crea tu primer grupo para añadir los
                  alimentos necesarios para tu receta.
                </p>

                <button
                  type="button"
                  onClick={addGroup}
                  className={`${PRIMARY_BUTTON} mt-5`}
                >
                  <Plus
                    className="size-4"
                    aria-hidden="true"
                  />

                  Crear primer grupo
                </button>

              </div>
            )}


            {/* ===========================================
                INGREDIENT GROUPS
            =========================================== */}

            <div className="space-y-3">

              {groups.map((group, groupIndex) => {
                const isOpen =
                  openGroupId === group.clientId;

                const isEditorOpen =
                  editor?.groupId === group.clientId;

                return (
                  <article
                    key={group.clientId}
                    className={`min-w-0 overflow-hidden rounded-2xl border transition ${
                      isOpen
                        ? "border-secondary/35"
                        : "border-border"
                    }`}
                  >

                    {/* GROUP HEADER */}

                    <div
                      className={`flex items-center gap-2 px-3 py-3 sm:px-4 ${
                        isOpen
                          ? "bg-secondary/10"
                          : "bg-page-muted/30"
                      }`}
                    >

                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`content-${group.clientId}`}
                        onClick={() =>
                          toggleGroup(group.clientId)
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >

                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary-hover">

                          <Layers3
                            className="size-5"
                            aria-hidden="true"
                          />

                        </span>

                        <span className="min-w-0 flex-1">

                          <span className="block break-words font-serif text-lg font-bold">
                            {group.name ||
                              "Grupo sin nombre"}
                          </span>

                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {group.ingredients.length}{" "}
                            {group.ingredients.length === 1
                              ? "ingrediente"
                              : "ingredientes"}

                            {isEditorOpen &&
                              hasPendingIngredient
                              ? " · Pendiente de confirmar"
                              : ""}
                          </span>

                        </span>

                        <ChevronDown
                          className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                            isOpen
                              ? "rotate-180"
                              : ""
                          }`}
                          aria-hidden="true"
                        />

                      </button>


                      {reorderMode && (
                        <div className="flex shrink-0 gap-1">

                          <IconButton
                            label="Mover grupo hacia arriba"
                            disabled={groupIndex === 0}
                            onClick={() =>
                              moveGroup(
                                group.clientId,
                                -1,
                              )
                            }
                          >
                            <ArrowUp className="size-4" />
                          </IconButton>

                          <IconButton
                            label="Mover grupo hacia abajo"
                            disabled={
                              groupIndex ===
                              groups.length - 1
                            }
                            onClick={() =>
                              moveGroup(
                                group.clientId,
                                1,
                              )
                            }
                          >
                            <ArrowDown className="size-4" />
                          </IconButton>

                        </div>
                      )}

                    </div>


                    {/* GROUP CONTENT */}

                    <div
                      id={`content-${group.clientId}`}
                      hidden={!isOpen}
                    >

                      {isOpen && (
                        <div className="space-y-4 border-t border-border p-3 sm:p-4">

                          {/* GROUP NAME */}

                          <div className="flex items-end gap-2">

                            <div className="min-w-0 flex-1">

                              <label
                                htmlFor={`name-${group.clientId}`}
                                className="mb-2 block text-xs font-semibold text-muted-foreground"
                              >
                                Nombre del grupo
                              </label>

                              <input
                                id={`name-${group.clientId}`}
                                type="text"
                                maxLength={100}
                                value={group.name}
                                onChange={(event) =>
                                  changeGroupName(
                                    group.clientId,
                                    event.target.value,
                                  )
                                }
                                placeholder="Ej. Para la salsa"
                                className={INPUT_CLASS}
                              />

                            </div>


                            <IconButton
                              danger
                              label="Eliminar grupo"
                              onClick={() =>
                                removeGroup(
                                  group.clientId,
                                )
                              }
                            >
                              <Trash2 className="size-4" />
                            </IconButton>

                          </div>


                          {/* INGREDIENT LIST */}

                          {group.ingredients.length ===
                          0 ? (

                            <div className="rounded-xl border border-dashed border-border bg-page-muted/20 px-4 py-5 text-center">

                              <p className="text-sm text-muted-foreground">
                                Este grupo todavía no
                                tiene ingredientes.
                              </p>

                            </div>

                          ) : (

                            <ul className="divide-y divide-border">

                              {group.ingredients.map(
                                (ingredient, index) => {
                                  const isEditing =
                                    editor?.groupId ===
                                      group.clientId &&
                                    editor.ingredientId ===
                                      ingredient.clientId;

                                  const quantity =
                                    formatQuantity(
                                      ingredient,
                                    );

                                  return (
                                    <li
                                      key={
                                        ingredient.clientId
                                      }
                                      className={`flex flex-wrap items-center gap-3 px-2 py-3 transition ${
                                        isEditing
                                          ? "rounded-xl bg-brand/[0.05]"
                                          : ""
                                      }`}
                                    >

                                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-page-muted text-xs font-bold text-muted-foreground">
                                        {index + 1}
                                      </span>


                                      <div className="min-w-[120px] flex-1">

                                        <p className="break-words text-sm font-semibold">
                                          {ingredient.name}
                                        </p>

                                        {ingredient.notes && (
                                          <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                                            {
                                              ingredient.notes
                                            }
                                          </p>
                                        )}

                                      </div>


                                      <div className="shrink-0">

                                        <p className="text-sm font-bold text-brand">
                                          {quantity ||
                                            "Sin cantidad"}
                                        </p>

                                        <span
                                          className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${
                                            ingredient.scalable
                                              ? "bg-secondary/10 text-secondary-hover"
                                              : "bg-page-muted text-muted-foreground"
                                          }`}
                                        >
                                          {ingredient.scalable ? (
                                            <>
                                              <RefreshCw
                                                className="size-3"
                                                aria-hidden="true"
                                              />

                                              Escalable
                                            </>
                                          ) : (
                                            "Cantidad fija"
                                          )}
                                        </span>

                                      </div>


                                      {/* ROW ACTIONS */}

                                      <div className="ml-auto flex shrink-0 items-center gap-1">

                                        {reorderMode ? (
                                          <>

                                            <IconButton
                                              label="Subir ingrediente"
                                              disabled={
                                                index === 0
                                              }
                                              onClick={() =>
                                                moveIngredient(
                                                  group.clientId,
                                                  ingredient.clientId,
                                                  -1,
                                                )
                                              }
                                            >
                                              <ArrowUp className="size-4" />
                                            </IconButton>

                                            <IconButton
                                              label="Bajar ingrediente"
                                              disabled={
                                                index ===
                                                group.ingredients.length -
                                                  1
                                              }
                                              onClick={() =>
                                                moveIngredient(
                                                  group.clientId,
                                                  ingredient.clientId,
                                                  1,
                                                )
                                              }
                                            >
                                              <ArrowDown className="size-4" />
                                            </IconButton>

                                          </>
                                        ) : (
                                          <>

                                            <IconButton
                                              label="Editar ingrediente"
                                              onClick={() =>
                                                editIngredient(
                                                  group.clientId,
                                                  ingredient,
                                                )
                                              }
                                            >
                                              <Pencil className="size-4" />
                                            </IconButton>

                                            <IconButton
                                              label="Duplicar ingrediente"
                                              onClick={() =>
                                                duplicateIngredient(
                                                  group.clientId,
                                                  ingredient,
                                                )
                                              }
                                            >
                                              <Copy className="size-4" />
                                            </IconButton>

                                            <IconButton
                                              danger
                                              label="Eliminar ingrediente"
                                              onClick={() =>
                                                removeIngredient(
                                                  group.clientId,
                                                  ingredient.clientId,
                                                )
                                              }
                                            >
                                              <Trash2 className="size-4" />
                                            </IconButton>

                                          </>
                                        )}

                                      </div>

                                    </li>
                                  );
                                },
                              )}

                            </ul>
                          )}


                          {/* =============================
                              INGREDIENT EDITOR
                          ============================= */}

                          {isEditorOpen && editor ? (

                            <form
                              onSubmit={(event) => {
                                event.preventDefault();
                                saveIngredient();
                              }}
                              className="rounded-2xl border border-brand/20 bg-page-muted/30 p-4 sm:p-5"
                            >

                              <div className="flex items-start justify-between gap-3">

                                <div className="flex items-start gap-3">

                                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">

                                    {editor.ingredientId ? (
                                      <Pencil className="size-4" />
                                    ) : (
                                      <Plus className="size-4" />
                                    )}

                                  </span>

                                  <div>

                                    <h4 className="font-serif text-xl font-bold">
                                      {editor.ingredientId
                                        ? "Editar ingrediente"
                                        : "Añadir ingrediente"}
                                    </h4>

                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                      Completa los datos del
                                      ingrediente.
                                    </p>

                                  </div>

                                </div>


                                <IconButton
                                  label="Cerrar editor de ingrediente"
                                  onClick={
                                    cancelIngredientEditor
                                  }
                                >
                                  <X className="size-4" />
                                </IconButton>

                              </div>


                              <div className="mt-5 space-y-4">

                                {/* NAME */}

                                <div>

                                  <label
                                    htmlFor={`ingredient-name-${group.clientId}`}
                                    className="mb-2 block text-sm font-semibold"
                                  >
                                    Nombre del ingrediente

                                    <span className="ml-1 text-brand">
                                      *
                                    </span>
                                  </label>

                                  <input
                                    id={`ingredient-name-${group.clientId}`}
                                    type="text"
                                    maxLength={120}
                                    value={
                                      editor.values.name
                                    }
                                    onChange={(event) =>
                                      updateIngredientDraft(
                                        "name",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Ej. Garbanzos"
                                    className={INPUT_CLASS}
                                  />

                                </div>


                                {/* QUANTITY AND UNIT */}

                                <div className="grid gap-4 sm:grid-cols-2">

                                  <div>

                                    <label
                                      htmlFor={`ingredient-quantity-${group.clientId}`}
                                      className="mb-2 block text-sm font-semibold"
                                    >
                                      Cantidad
                                    </label>

                                    <input
                                      id={`ingredient-quantity-${group.clientId}`}
                                      type="text"
                                      inputMode="decimal"
                                      value={
                                        editor.values.quantity
                                      }
                                      onChange={(event) =>
                                        updateIngredientDraft(
                                          "quantity",
                                          event.target.value,
                                        )
                                      }
                                      placeholder="Ej. 250"
                                      className={INPUT_CLASS}
                                    />

                                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                      Ej. 250, 0,5 o 1,5.
                                      Puede quedar vacía.
                                    </p>

                                  </div>


                                  <div>

                                    <label
                                      htmlFor={`ingredient-unit-${group.clientId}`}
                                      className="mb-2 block text-sm font-semibold"
                                    >
                                      Unidad
                                    </label>

                                    <input
                                      id={`ingredient-unit-${group.clientId}`}
                                      type="text"
                                      maxLength={40}
                                      list={`units-${group.clientId}`}
                                      value={
                                        editor.values.unit
                                      }
                                      onChange={(event) =>
                                        updateIngredientDraft(
                                          "unit",
                                          event.target.value,
                                        )
                                      }
                                      placeholder="g, ml, cucharadas..."
                                      className={INPUT_CLASS}
                                    />

                                    <datalist
                                      id={`units-${group.clientId}`}
                                    >
                                      {UNIT_SUGGESTIONS.map(
                                        (unit) => (
                                          <option
                                            key={unit}
                                            value={unit}
                                          />
                                        ),
                                      )}
                                    </datalist>

                                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                                      Elige una sugerencia
                                      o escribe tu propia unidad.
                                    </p>

                                  </div>

                                </div>


                                {/* NOTES */}

                                <div>

                                  <div className="mb-2 flex items-center justify-between gap-2">

                                    <label
                                      htmlFor={`ingredient-notes-${group.clientId}`}
                                      className="text-sm font-semibold"
                                    >
                                      Notas
                                    </label>

                                    <span className="text-xs text-muted-foreground">
                                      Opcional
                                    </span>

                                  </div>

                                  <input
                                    id={`ingredient-notes-${group.clientId}`}
                                    type="text"
                                    maxLength={250}
                                    value={
                                      editor.values.notes
                                    }
                                    onChange={(event) =>
                                      updateIngredientDraft(
                                        "notes",
                                        event.target.value,
                                      )
                                    }
                                    placeholder="Ej. Remojados la noche anterior"
                                    className={INPUT_CLASS}
                                  />

                                </div>


                                {/* SCALABLE */}

                                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/[0.07] p-4">

                                  <input
                                    type="checkbox"
                                    checked={
                                      editor.values.scalable
                                    }
                                    onChange={(event) =>
                                      updateIngredientDraft(
                                        "scalable",
                                        event.target.checked,
                                      )
                                    }
                                    className="mt-0.5 size-4 shrink-0 accent-brand"
                                  />

                                  <span className="min-w-0 flex-1">

                                    <span className="flex items-center gap-2 text-sm font-semibold text-secondary-hover">

                                      <RefreshCw
                                        className="size-4 shrink-0"
                                        aria-hidden="true"
                                      />

                                      Adaptar cantidad a las raciones

                                    </span>

                                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                      CociHub ajustará la cantidad
                                      cuando cambien las raciones.
                                      Desactívalo si debe mantenerse fija.
                                    </span>

                                  </span>

                                </label>

                              </div>


                              {editorError && (
                                <p
                                  role="alert"
                                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                                >
                                  {editorError}
                                </p>
                              )}


                              <div className="mt-5 flex flex-wrap gap-2">

                                <button
                                  type="submit"
                                  className={PRIMARY_BUTTON}
                                >
                                  {editor.ingredientId ? (
                                    <Check className="size-4" />
                                  ) : (
                                    <Plus className="size-4" />
                                  )}

                                  {editor.ingredientId
                                    ? "Guardar cambios"
                                    : "Añadir ingrediente"}
                                </button>

                                <button
                                  type="button"
                                  onClick={
                                    cancelIngredientEditor
                                  }
                                  className={SECONDARY_BUTTON}
                                >
                                  Cancelar
                                </button>

                              </div>

                            </form>

                          ) : (

                            <button
                              type="button"
                              onClick={() =>
                                openNewIngredient(
                                  group.clientId,
                                )
                              }
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand/[0.035] px-4 py-3 text-sm font-semibold text-brand transition hover:bg-brand/10"
                            >
                              <Plus
                                className="size-4"
                                aria-hidden="true"
                              />

                              Añadir ingrediente a este grupo
                            </button>

                          )}

                        </div>
                      )}

                    </div>

                  </article>
                );
              })}

            </div>


            {/* ADD ANOTHER GROUP */}

            {groups.length > 0 && (
              <button
                type="button"
                onClick={addGroup}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand/35 bg-brand/[0.025] px-5 py-4 text-sm font-semibold text-brand transition hover:bg-brand/[0.07]"
              >

                <Layers3
                  className="size-5"
                  aria-hidden="true"
                />

                Añadir grupo de ingredientes

              </button>
            )}


            {/* GROUP ADVICE */}

            <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/[0.07] p-4">

              <Info
                className="mt-0.5 size-5 shrink-0 text-secondary-hover"
                aria-hidden="true"
              />

              <p className="text-xs leading-5 text-muted-foreground">

                <span className="font-bold text-secondary-hover">
                  Consejo:
                </span>{" "}

                No es obligatorio crear varios grupos.
                Utilízalos para separar masas, rellenos,
                salsas o acompañamientos.

              </p>

            </div>


            {/* FEEDBACK */}

            {feedback && (
              <div
                role={
                  feedback.type === "error"
                    ? "alert"
                    : "status"
                }
                className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  feedback.type === "success"
                    ? "border-secondary/25 bg-secondary/[0.08] text-secondary-hover"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >

                {feedback.type === "success" ? (
                  <CircleCheck className="size-5 shrink-0" />
                ) : (
                  <TriangleAlert className="size-5 shrink-0" />
                )}

                {feedback.text}

              </div>
            )}

          </div>


          {/* =============================================
              FOOTER
          ============================================= */}

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-page-muted/20 px-5 py-5 sm:px-7">

            <button
              type="button"
              onClick={goToPreviousStep}
              className={SECONDARY_BUTTON}
            >

              <ArrowLeft
                className="size-4"
                aria-hidden="true"
              />

              Clasificación

            </button>


            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                disabled={
                  isSubmitting ||
                  !hasUnsavedChanges
                }
                onClick={() => requestSave("draft")}
                className={SECONDARY_BUTTON}
              >

                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}

                Guardar borrador

              </button>


              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  requestSave("continue")
                }
                className={PRIMARY_BUTTON}
              >

                {isSubmitting ? (
                  <>

                    <Loader2 className="size-4 animate-spin" />

                    Guardando...

                  </>
                ) : (
                  <>

                    {hasUnsavedChanges
                      ? "Guardar y continuar"
                      : "Continuar"}

                    <ArrowRight
                      className="size-4"
                      aria-hidden="true"
                    />

                  </>
                )}

              </button>

            </div>

          </footer>

        </fieldset>

      </section>


      {/* =================================================
          HELP SIDEBAR
      ================================================= */}

      <aside className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-sm xl:sticky xl:top-6">

        <div className="border-b border-border px-6 py-6 text-center">

          <Image
            src="/brand/cocihub-mark-outline.png"
            alt=""
            width={72}
            height={72}
            className="mx-auto size-[72px] object-contain"
            aria-hidden="true"
          />

          <h3 className="mt-4 font-serif text-2xl font-bold">
            Ayuda para este paso
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Consejos para gestionar los ingredientes
            de tu receta.
          </p>

        </div>


        <div className="space-y-5 p-6">

          {[
            {
              title: "Organiza en grupos",

              text:
                "Separa los ingredientes por funciones, como masa, relleno, salsa o acompañamiento.",

              color:
                "bg-brand/10 text-brand",
            },

            {
              title: "Indica cantidades y unidades",

              text:
                "Escribe cuánto necesitas de cada ingrediente y selecciona o introduce la unidad adecuada.",

              color:
                "bg-secondary/15 text-secondary-hover",
            },

            {
              title: "Sobre las fracciones",

              text:
                "Escribe 0,5 para media unidad, 0,25 para un cuarto o 1,5 para una unidad y media.",

              color:
                "bg-accent/15 text-warning",
            },

            {
              title: "Notas del ingrediente",

              text:
                "Añade detalles útiles como «cortado en dados», «a temperatura ambiente» o «bien escurrido».",

              color:
                "bg-secondary/15 text-secondary-hover",
            },

            {
              title: "Cantidades escalables",

              text:
                "Mantén esta opción activa para adaptar las cantidades a las raciones. Desactívala en ingredientes cuya cantidad deba permanecer fija.",

              color:
                "bg-accent/15 text-warning",
            },
          ].map((item, index) => (

            <div
              key={item.title}
              className="flex items-start gap-3"
            >

              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${item.color}`}
              >
                {index + 1}
              </span>

              <div>

                <p className="text-sm font-bold">
                  {item.title}
                </p>

                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {item.text}
                </p>

              </div>

            </div>

          ))}


          {/* UNIT EXAMPLES */}

          <div className="border-t border-border pt-5">

            <div className="rounded-2xl bg-page-muted/60 p-4">

              <div className="flex items-start gap-2">

                <Lightbulb
                  className="size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <p className="text-xs font-bold">
                  Ejemplos de unidades habituales
                </p>

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                {[
                  "g",
                  "kg",
                  "ml",
                  "l",
                  "cucharada",
                  "cucharadita",
                  "unidad",
                  "al gusto",
                ].map((unit) => (

                  <span
                    key={unit}
                    className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium"
                  >
                    {unit}
                  </span>

                ))}

              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                También puedes escribir tus propias
                unidades si no aparecen entre las sugerencias.
              </p>

            </div>

          </div>

        </div>

      </aside>

    </div>
  );
}