"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type IngredientDraft = {
  quantity: string;
  unit: string;
  name: string;
  notes: string;
  scalable: boolean;
};

type Ingredient = IngredientDraft & {
  id: string;
};

type IngredientGroup = {
  id: string;
  name: string;
  ingredients: Ingredient[];
};

const emptyDraft: IngredientDraft = {
  quantity: "",
  unit: "",
  name: "",
  notes: "",
  scalable: true,
};

const unitOptions = [
  { value: "", label: "Sin unidad" },
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "unit", label: "unidad" },
  { value: "tsp", label: "cucharadita" },
  { value: "tbsp", label: "cucharada" },
  { value: "cup", label: "taza" },
  { value: "pinch", label: "pizca" },
  { value: "to-taste", label: "al gusto" },
] as const;

const initialGroups: IngredientGroup[] = [
  {
    id: "group-falafel",
    name: "Para el falafel",
    ingredients: [
      {
        id: "ingredient-chickpeas",
        quantity: "400",
        unit: "g",
        name: "Garbanzos cocidos",
        notes: "Escurridos y lavados",
        scalable: true,
      },
      {
        id: "ingredient-beetroot",
        quantity: "200",
        unit: "g",
        name: "Remolacha cocida",
        notes: "Cortada en trozos",
        scalable: true,
      },
      {
        id: "ingredient-sesame",
        quantity: "2",
        unit: "tbsp",
        name: "Semillas de sésamo",
        notes: "",
        scalable: true,
      },
    ],
  },
];

function createId() {
  return crypto.randomUUID();
}

function createEmptyGroup(position: number): IngredientGroup {
  return {
    id: createId(),
    name:
      position === 1
        ? "Ingredientes principales"
        : `Grupo de ingredientes ${position}`,
    ingredients: [],
  };
}

function formatIngredient(ingredient: Ingredient) {
  const unitLabel =
    unitOptions.find((unit) => unit.value === ingredient.unit)?.label ?? "";

  return [
    ingredient.quantity,
    unitLabel,
    ingredient.name,
  ]
    .filter(Boolean)
    .join(" ");
}

export function IngredientListDemo() {
  const [groups, setGroups] =
    useState<IngredientGroup[]>(initialGroups);

  const [drafts, setDrafts] = useState<
    Record<string, IngredientDraft>
  >({
    "group-falafel": emptyDraft,
  });

  const [editingIds, setEditingIds] = useState<
    Record<string, string | null>
  >({
    "group-falafel": null,
  });

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  function getDraft(groupId: string) {
    return drafts[groupId] ?? emptyDraft;
  }

  function updateDraft<K extends keyof IngredientDraft>(
    groupId: string,
    field: K,
    value: IngredientDraft[K],
  ) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [groupId]: {
        ...getDraft(groupId),
        [field]: value,
      },
    }));

    if (field === "name" && typeof value === "string" && value.trim()) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [groupId]: "",
      }));
    }
  }

  function resetForm(groupId: string) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [groupId]: { ...emptyDraft },
    }));

    setEditingIds((currentEditingIds) => ({
      ...currentEditingIds,
      [groupId]: null,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [groupId]: "",
    }));
  }

  function updateGroupName(groupId: string, name: string) {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? { ...group, name }
          : group,
      ),
    );
  }

  function addGroup() {
    const newGroup = createEmptyGroup(groups.length + 1);

    setGroups((currentGroups) => [
      ...currentGroups,
      newGroup,
    ]);

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [newGroup.id]: { ...emptyDraft },
    }));

    setEditingIds((currentEditingIds) => ({
      ...currentEditingIds,
      [newGroup.id]: null,
    }));
  }

  function removeGroup(groupId: string) {
    if (groups.length === 1) {
      return;
    }

    setGroups((currentGroups) =>
      currentGroups.filter(
        (group) => group.id !== groupId,
      ),
    );

    setDrafts((currentDrafts) => {
      const updatedDrafts = { ...currentDrafts };
      delete updatedDrafts[groupId];
      return updatedDrafts;
    });

    setEditingIds((currentEditingIds) => {
      const updatedEditingIds = {
        ...currentEditingIds,
      };
      delete updatedEditingIds[groupId];
      return updatedEditingIds;
    });
  }

  function submitIngredient(groupId: string) {
    const draft = getDraft(groupId);
    const editingId = editingIds[groupId];

    if (!draft.name.trim()) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [groupId]:
          "Escribe el nombre del ingrediente.",
      }));

      return;
    }

    if (
      draft.quantity &&
      Number(draft.quantity) < 0
    ) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        [groupId]:
          "La cantidad no puede ser negativa.",
      }));

      return;
    }

    const normalizedIngredient = {
      quantity: draft.quantity.trim(),
      unit: draft.unit,
      name: draft.name.trim(),
      notes: draft.notes.trim(),
      scalable: draft.scalable,
    };

    setGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        if (editingId) {
          return {
            ...group,
            ingredients: group.ingredients.map(
              (ingredient) =>
                ingredient.id === editingId
                  ? {
                      ...ingredient,
                      ...normalizedIngredient,
                    }
                  : ingredient,
            ),
          };
        }

        return {
          ...group,
          ingredients: [
            ...group.ingredients,
            {
              id: createId(),
              ...normalizedIngredient,
            },
          ],
        };
      }),
    );

    resetForm(groupId);
  }

  function editIngredient(
    groupId: string,
    ingredient: Ingredient,
  ) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [groupId]: {
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
        notes: ingredient.notes,
        scalable: ingredient.scalable,
      },
    }));

    setEditingIds((currentEditingIds) => ({
      ...currentEditingIds,
      [groupId]: ingredient.id,
    }));

    setErrors((currentErrors) => ({
      ...currentErrors,
      [groupId]: "",
    }));

    requestAnimationFrame(() => {
      document
        .getElementById(`ingredient-name-${groupId}`)
        ?.focus();
    });
  }

  function duplicateIngredient(
    groupId: string,
    ingredient: Ingredient,
  ) {
    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [groupId]: {
        quantity: ingredient.quantity,
        unit: ingredient.unit,
        name: ingredient.name,
        notes: ingredient.notes,
        scalable: ingredient.scalable,
      },
    }));

    setEditingIds((currentEditingIds) => ({
      ...currentEditingIds,
      [groupId]: null,
    }));

    requestAnimationFrame(() => {
      document
        .getElementById(`ingredient-name-${groupId}`)
        ?.focus();
    });
  }

  function removeIngredient(
    groupId: string,
    ingredientId: string,
  ) {
    setGroups((currentGroups) =>
      currentGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              ingredients: group.ingredients.filter(
                (ingredient) =>
                  ingredient.id !== ingredientId,
              ),
            }
          : group,
      ),
    );

    if (editingIds[groupId] === ingredientId) {
      resetForm(groupId);
    }
  }

  function moveIngredient(
    groupId: string,
    ingredientIndex: number,
    direction: "up" | "down",
  ) {
    setGroups((currentGroups) =>
      currentGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        const destinationIndex =
          direction === "up"
            ? ingredientIndex - 1
            : ingredientIndex + 1;

        if (
          destinationIndex < 0 ||
          destinationIndex >= group.ingredients.length
        ) {
          return group;
        }

        const reorderedIngredients = [
          ...group.ingredients,
        ];

        const [movedIngredient] =
          reorderedIngredients.splice(
            ingredientIndex,
            1,
          );

        reorderedIngredients.splice(
          destinationIndex,
          0,
          movedIngredient,
        );

        return {
          ...group,
          ingredients: reorderedIngredients,
        };
      }),
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group, groupIndex) => {
        const draft = getDraft(group.id);
        const editingId = editingIds[group.id];
        const isEditing = Boolean(editingId);

        return (
          <section
            key={group.id}
            className="
              overflow-hidden rounded-lg border border-border
              bg-surface shadow-[var(--shadow-sm)]
            "
          >
            <header
              className="
                flex flex-col gap-4 border-b border-border
                bg-page-muted p-4
                sm:flex-row sm:items-end
                sm:justify-between
              "
            >
              <div className="flex-1">
                <label
                  htmlFor={`group-name-${group.id}`}
                  className="text-sm font-semibold"
                >
                  Nombre del grupo {groupIndex + 1}
                </label>

                <Input
                  id={`group-name-${group.id}`}
                  value={group.name}
                  onChange={(event) =>
                    updateGroupName(
                      group.id,
                      event.target.value,
                    )
                  }
                  placeholder="Ej. Para la salsa"
                  className="mt-2"
                />
              </div>

              <Button
                variant="tertiary"
                size="sm"
                disabled={groups.length === 1}
                onClick={() => removeGroup(group.id)}
              >
                <Trash2
                  aria-hidden="true"
                  className="size-4"
                />
                Eliminar grupo
              </Button>
            </header>

            <div className="grid gap-8 p-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  submitIngredient(group.id);
                }}
                className="
                  rounded-lg border border-border
                  bg-page p-5
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-xl font-bold">
                      {isEditing
                        ? "Editar ingrediente"
                        : "Nuevo ingrediente"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {isEditing
                        ? "Modifica los datos y guarda los cambios."
                        : "Completa los datos y añádelo a la lista."}
                    </p>
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => resetForm(group.id)}
                      aria-label="Cancelar edición"
                      className="
                        inline-flex size-10 shrink-0
                        items-center justify-center
                        rounded-md border border-border
                        bg-surface hover:bg-page-muted
                      "
                    >
                      <X
                        aria-hidden="true"
                        className="size-4"
                      />
                    </button>
                  )}
                </div>

                <div className="mt-5 grid gap-5">
                  <div>
                    <label
                      htmlFor={`ingredient-quantity-${group.id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Cantidad
                    </label>

                    <Input
                      id={`ingredient-quantity-${group.id}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="any"
                      value={draft.quantity}
                      onChange={(event) =>
                        updateDraft(
                          group.id,
                          "quantity",
                          event.target.value,
                        )
                      }
                      placeholder="Ej. 400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`ingredient-unit-${group.id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Unidad
                    </label>

                    <Select
                      id={`ingredient-unit-${group.id}`}
                      value={draft.unit}
                      onChange={(event) =>
                        updateDraft(
                          group.id,
                          "unit",
                          event.target.value,
                        )
                      }
                    >
                      {unitOptions.map((unit) => (
                        <option
                          key={unit.value}
                          value={unit.value}
                        >
                          {unit.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor={`ingredient-name-${group.id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Ingrediente
                      <span
                        aria-hidden="true"
                        className="ml-1 text-error"
                      >
                        *
                      </span>
                    </label>

                    <Input
                      id={`ingredient-name-${group.id}`}
                      value={draft.name}
                      onChange={(event) =>
                        updateDraft(
                          group.id,
                          "name",
                          event.target.value,
                        )
                      }
                      placeholder="Ej. Garbanzos cocidos"
                      hasError={Boolean(errors[group.id])}
                      aria-describedby={
                        errors[group.id]
                          ? `ingredient-error-${group.id}`
                          : undefined
                      }
                    />

                    <div className="mt-2">
                      <FormError
                        id={`ingredient-error-${group.id}`}
                        message={errors[group.id]}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`ingredient-notes-${group.id}`}
                      className="mb-2 block text-sm font-semibold"
                    >
                      Notas
                    </label>

                    <Input
                      id={`ingredient-notes-${group.id}`}
                      value={draft.notes}
                      onChange={(event) =>
                        updateDraft(
                          group.id,
                          "notes",
                          event.target.value,
                        )
                      }
                      placeholder="Ej. Escurridos y lavados"
                    />
                  </div>

                  <Switch
                    id={`ingredient-scalable-${group.id}`}
                    name={`ingredient-scalable-${group.id}`}
                    label="Adaptar al número de comensales"
                    description={
                      draft.scalable
                        ? "La cantidad se recalculará cuando cambien las raciones."
                        : "La cantidad permanecerá igual para cualquier número de comensales."
                    }
                    checked={draft.scalable}
                    onChange={(event) =>
                      updateDraft(
                        group.id,
                        "scalable",
                        event.target.checked,
                      )
                    }
                  />
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button type="submit">
                    {isEditing ? (
                      <Pencil
                        aria-hidden="true"
                        className="size-4"
                      />
                    ) : (
                      <Plus
                        aria-hidden="true"
                        className="size-4"
                      />
                    )}

                    {isEditing
                      ? "Guardar cambios"
                      : "Agregar ingrediente"}
                  </Button>

                  {isEditing && (
                    <Button
                      type="button"
                      variant="tertiary"
                      onClick={() => resetForm(group.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>

              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-xl font-bold">
                      Ingredientes añadidos
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {group.ingredients.length}{" "}
                      {group.ingredients.length === 1
                        ? "ingrediente"
                        : "ingredientes"}
                    </p>
                  </div>
                </div>

                {group.ingredients.length === 0 ? (
                  <div
                    className="
                      mt-5 rounded-lg border border-dashed
                      border-border-strong bg-page p-8
                      text-center
                    "
                  >
                    <p className="font-semibold">
                      Todavía no hay ingredientes
                    </p>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Utiliza el formulario para añadir el primero.
                    </p>
                  </div>
                ) : (
                  <ol className="mt-5 space-y-3">
                    {group.ingredients.map(
                      (ingredient, ingredientIndex) => (
                        <li
                          key={ingredient.id}
                          className={`
                            rounded-lg border bg-surface p-4
                            ${
                              editingId === ingredient.id
                                ? "border-brand ring-[3px] ring-brand/10"
                                : "border-border"
                            }
                          `}
                        >
                          <div className="flex gap-4">
                            <span
                              className="
                                flex size-8 shrink-0
                                items-center justify-center
                                rounded-full bg-page-muted
                                text-sm font-bold
                              "
                            >
                              {ingredientIndex + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-foreground">
                                {formatIngredient(ingredient)}
                              </p>

                              {ingredient.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                  {ingredient.notes}
                                </p>
                              )}

                              <span
                                className={`
                                  mt-3 inline-flex rounded-full px-2.5 py-1
                                  text-xs font-semibold
                                  ${
                                    ingredient.scalable
                                      ? "bg-secondary/10 text-secondary-hover"
                                      : "bg-page-muted text-muted-foreground"
                                  }
                                `}
                              >
                                {ingredient.scalable
                                  ? "Se adapta a los comensales"
                                  : "No se recalcula"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                editIngredient(
                                  group.id,
                                  ingredient,
                                )
                              }
                            >
                              <Pencil
                                aria-hidden="true"
                                className="size-4"
                              />
                              Editar
                            </Button>

                            <button
                              type="button"
                              onClick={() =>
                                duplicateIngredient(
                                  group.id,
                                  ingredient,
                                )
                              }
                              aria-label={`Duplicar ${ingredient.name}`}
                              className="
                                inline-flex size-10
                                items-center justify-center
                                rounded-md border border-border
                                bg-surface hover:bg-page-muted
                              "
                            >
                              <Copy
                                aria-hidden="true"
                                className="size-4"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveIngredient(
                                  group.id,
                                  ingredientIndex,
                                  "up",
                                )
                              }
                              disabled={ingredientIndex === 0}
                              aria-label={`Subir ${ingredient.name}`}
                              className="
                                inline-flex size-10
                                items-center justify-center
                                rounded-md border border-border
                                bg-surface hover:bg-page-muted
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >
                              <ArrowUp
                                aria-hidden="true"
                                className="size-4"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                moveIngredient(
                                  group.id,
                                  ingredientIndex,
                                  "down",
                                )
                              }
                              disabled={
                                ingredientIndex ===
                                group.ingredients.length - 1
                              }
                              aria-label={`Bajar ${ingredient.name}`}
                              className="
                                inline-flex size-10
                                items-center justify-center
                                rounded-md border border-border
                                bg-surface hover:bg-page-muted
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                              "
                            >
                              <ArrowDown
                                aria-hidden="true"
                                className="size-4"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                removeIngredient(
                                  group.id,
                                  ingredient.id,
                                )
                              }
                              aria-label={`Eliminar ${ingredient.name}`}
                              className="
                                inline-flex size-10
                                items-center justify-center
                                rounded-md border border-error/40
                                bg-surface text-error
                                hover:bg-error/10
                              "
                            >
                              <Trash2
                                aria-hidden="true"
                                className="size-4"
                              />
                            </button>
                          </div>
                        </li>
                      ),
                    )}
                  </ol>
                )}
              </div>
            </div>
          </section>
        );
      })}

      <Button variant="tertiary" onClick={addGroup}>
        <Plus aria-hidden="true" className="size-4" />
        Añadir grupo de ingredientes
      </Button>
    </div>
  );
}