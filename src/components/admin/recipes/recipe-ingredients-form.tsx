"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  updateRecipeIngredientsAction,
} from "@/app/admin/recipes/[id]/edit/actions";

import {
  recipeIngredientSchema,
  recipeIngredientsSchema,
  type RecipeIngredientFormData,
  type RecipeIngredientsFormData,
} from "@/schemas/recipe-ingredients-schema";


type RecipeIngredientsFormProps = {
  recipeId: string;

  initialGroups:
    RecipeIngredientsFormData["groups"];
};


type EditableIngredient =
  RecipeIngredientFormData & {
    clientId: string;
  };


type EditableGroup = {
  clientId: string;

  name: string;

  ingredients:
    EditableIngredient[];
};


type IngredientGroupEditorProps = {
  group:
    EditableGroup;

  groupIndex:
    number;

  groupCount:
    number;

  onChangeName:
    (
      groupIndex: number,
      name: string,
    ) => void;

  onRemoveGroup:
    (
      groupIndex: number,
    ) => void;

  onMoveGroup:
    (
      from: number,
      to: number,
    ) => void;

  onAddIngredient:
    (
      groupIndex: number,
      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onUpdateIngredient:
    (
      groupIndex: number,
      ingredientIndex: number,
      ingredient:
        RecipeIngredientFormData,
    ) => void;

  onRemoveIngredient:
    (
      groupIndex: number,
      ingredientIndex: number,
    ) => void;

  onMoveIngredient:
    (
      groupIndex: number,
      from: number,
      to: number,
    ) => void;
};


const emptyIngredient:
RecipeIngredientFormData = {
  name: "",
  quantity: "",
  unit: "",
  notes: "",
  scalable: true,
};


function createClientId(
  prefix: string,
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


function createEditableGroups(
  groups:
    RecipeIngredientsFormData["groups"],
): EditableGroup[] {
  return groups.map(
    (group) => ({
      clientId:
        createClientId(
          "group",
        ),

      name:
        group.name,

      ingredients:
        group.ingredients.map(
          (ingredient) => ({
            clientId:
              createClientId(
                "ingredient",
              ),

            ...ingredient,
          }),
        ),
    }),
  );
}


function IngredientGroupEditor({
  group,
  groupIndex,
  groupCount,
  onChangeName,
  onRemoveGroup,
  onMoveGroup,
  onAddIngredient,
  onUpdateIngredient,
  onRemoveIngredient,
  onMoveIngredient,
}: IngredientGroupEditorProps) {
  const [
    ingredientDraft,
    setIngredientDraft,
  ] =
    useState<RecipeIngredientFormData>({
      ...emptyIngredient,
    });


  const [
    editingIndex,
    setEditingIndex,
  ] =
    useState<number | null>(
      null,
    );


  const [
    editorError,
    setEditorError,
  ] =
    useState<string | null>(
      null,
    );


  function clearIngredientEditor() {
    setIngredientDraft({
      ...emptyIngredient,
    });

    setEditingIndex(
      null,
    );

    setEditorError(
      null,
    );
  }


  function saveIngredient() {
    const validation =
      recipeIngredientSchema.safeParse(
        ingredientDraft,
      );


    if (
      !validation.success
    ) {
      setEditorError(
        validation.error
          .issues[0]
          ?.message ??
          "El ingrediente no es válido.",
      );

      return;
    }


    if (
      editingIndex ===
      null
    ) {
      onAddIngredient(
        groupIndex,
        validation.data,
      );
    } else {
      onUpdateIngredient(
        groupIndex,
        editingIndex,
        validation.data,
      );
    }


    clearIngredientEditor();
  }


  function editIngredient(
    ingredientIndex: number,
  ) {
    const ingredient =
      group.ingredients[
        ingredientIndex
      ];


    if (
      !ingredient
    ) {
      return;
    }


    setIngredientDraft({
      name:
        ingredient.name,

      quantity:
        ingredient.quantity,

      unit:
        ingredient.unit,

      notes:
        ingredient.notes,

      scalable:
        ingredient.scalable,
    });


    setEditingIndex(
      ingredientIndex,
    );

    setEditorError(
      null,
    );
  }


  function duplicateIngredient(
    ingredientIndex: number,
  ) {
    const ingredient =
      group.ingredients[
        ingredientIndex
      ];


    if (
      !ingredient
    ) {
      return;
    }


    /*
     * Cargamos una copia en el editor.
     *
     * No se añade hasta que el usuario
     * pulse "Añadir ingrediente".
     */
    setIngredientDraft({
      name:
        ingredient.name,

      quantity:
        ingredient.quantity,

      unit:
        ingredient.unit,

      notes:
        ingredient.notes,

      scalable:
        ingredient.scalable,
    });


    setEditingIndex(
      null,
    );

    setEditorError(
      null,
    );
  }


  return (
    <article className="rounded-xl border p-5">

      {/* =============================================
          GROUP HEADER
      ============================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div className="flex-1">
          <label
            htmlFor={`group-${group.clientId}-name`}
            className="mb-2 block font-medium"
          >
            Nombre del grupo
          </label>

          <input
            id={`group-${group.clientId}-name`}
            type="text"
            maxLength={100}
            value={
              group.name
            }
            onChange={(
              event,
            ) =>
              onChangeName(
                groupIndex,
                event.target.value,
              )
            }
            className="w-full rounded-lg border px-4 py-3"
            placeholder="Ej. Ingredientes principales"
          />
        </div>


        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            disabled={
              groupIndex ===
              0
            }
            onClick={() =>
              onMoveGroup(
                groupIndex,
                groupIndex - 1,
              )
            }
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            aria-label="Mover grupo hacia arriba"
          >
            ↑
          </button>


          <button
            type="button"
            disabled={
              groupIndex ===
              groupCount - 1
            }
            onClick={() =>
              onMoveGroup(
                groupIndex,
                groupIndex + 1,
              )
            }
            className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
            aria-label="Mover grupo hacia abajo"
          >
            ↓
          </button>


          <button
            type="button"
            onClick={() =>
              onRemoveGroup(
                groupIndex,
              )
            }
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Eliminar grupo
          </button>

        </div>
      </div>


      {/* =============================================
          INGREDIENT LIST
      ============================================= */}

      <div className="mt-6 space-y-3">

        {group.ingredients.length ===
        0 ? (
          <p className="text-sm">
            Este grupo todavía no tiene ingredientes.
          </p>
        ) : (
          group.ingredients.map(
            (
              ingredient,
              ingredientIndex,
            ) => (
              <div
                key={
                  ingredient.clientId
                }
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">

                  <div>
                    <p className="font-medium">

                      {ingredient.quantity &&
                        `${ingredient.quantity} `}

                      {ingredient.unit &&
                        `${ingredient.unit} `}

                      {ingredient.name}

                    </p>


                    {ingredient.notes && (
                      <p className="mt-1 text-sm">
                        {
                          ingredient.notes
                        }
                      </p>
                    )}


                    <p className="mt-1 text-xs">
                      {ingredient.scalable
                        ? "Se adapta a los comensales"
                        : "No se recalcula"}
                    </p>
                  </div>


                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      disabled={
                        ingredientIndex ===
                        0
                      }
                      onClick={() =>
                        onMoveIngredient(
                          groupIndex,
                          ingredientIndex,
                          ingredientIndex -
                            1,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                      aria-label="Mover ingrediente hacia arriba"
                    >
                      ↑
                    </button>


                    <button
                      type="button"
                      disabled={
                        ingredientIndex ===
                        group.ingredients.length -
                          1
                      }
                      onClick={() =>
                        onMoveIngredient(
                          groupIndex,
                          ingredientIndex,
                          ingredientIndex +
                            1,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40"
                      aria-label="Mover ingrediente hacia abajo"
                    >
                      ↓
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        editIngredient(
                          ingredientIndex,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Editar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        duplicateIngredient(
                          ingredientIndex,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Duplicar
                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        onRemoveIngredient(
                          groupIndex,
                          ingredientIndex,
                        )
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      Eliminar
                    </button>

                  </div>
                </div>
              </div>
            ),
          )
        )}

      </div>


      {/* =============================================
          SINGLE INGREDIENT EDITOR
      ============================================= */}

      <div className="mt-6 rounded-lg border p-4">

        <h4 className="font-semibold">
          {editingIndex ===
          null
            ? "Añadir ingrediente"
            : "Editar ingrediente"}
        </h4>


        <div className="mt-4 grid gap-4 md:grid-cols-2">

          {/* QUANTITY */}

          <div>
            <label
              htmlFor={`ingredient-${group.clientId}-quantity`}
              className="mb-2 block text-sm font-medium"
            >
              Cantidad
            </label>

            <input
              id={`ingredient-${group.clientId}-quantity`}
              type="text"
              inputMode="decimal"
              value={
                ingredientDraft.quantity
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    quantity:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Ej. 250"
            />
          </div>


          {/* UNIT */}

          <div>
            <label
              htmlFor={`ingredient-${group.clientId}-unit`}
              className="mb-2 block text-sm font-medium"
            >
              Unidad
            </label>

            <input
              id={`ingredient-${group.clientId}-unit`}
              type="text"
              maxLength={40}
              value={
                ingredientDraft.unit
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    unit:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="g, ml, cucharadas..."
            />
          </div>


          {/* NAME */}

          <div className="md:col-span-2">
            <label
              htmlFor={`ingredient-${group.clientId}-name`}
              className="mb-2 block text-sm font-medium"
            >
              Ingrediente
            </label>

            <input
              id={`ingredient-${group.clientId}-name`}
              type="text"
              maxLength={120}
              value={
                ingredientDraft.name
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    name:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Ej. Patatas"
            />
          </div>


          {/* NOTES */}

          <div className="md:col-span-2">
            <label
              htmlFor={`ingredient-${group.clientId}-notes`}
              className="mb-2 block text-sm font-medium"
            >
              Notas
            </label>

            <input
              id={`ingredient-${group.clientId}-notes`}
              type="text"
              maxLength={250}
              value={
                ingredientDraft.notes
              }
              onChange={(
                event,
              ) =>
                setIngredientDraft(
                  (
                    current,
                  ) => ({
                    ...current,

                    notes:
                      event
                        .target
                        .value,
                  }),
                )
              }
              className="w-full rounded-lg border px-4 py-3"
              placeholder="Ej. cortadas finas, al gusto..."
            />
          </div>

        </div>


        {/* SCALABLE */}

        <label className="mt-4 flex items-center gap-3">

          <input
            type="checkbox"
            checked={
              ingredientDraft.scalable
            }
            onChange={(
              event,
            ) =>
              setIngredientDraft(
                (
                  current,
                ) => ({
                  ...current,

                  scalable:
                    event
                      .target
                      .checked,
                }),
              )
            }
          />

          <span>
            Adaptar cantidad al número de comensales
          </span>

        </label>


        {editorError && (
          <p
            role="alert"
            className="mt-4 text-sm"
          >
            {editorError}
          </p>
        )}


        <div className="mt-5 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              saveIngredient
            }
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            {editingIndex ===
            null
              ? "Añadir ingrediente"
              : "Guardar cambios"}
          </button>


          {editingIndex !==
            null && (
            <button
              type="button"
              onClick={
                clearIngredientEditor
              }
              className="rounded-lg border px-4 py-2"
            >
              Cancelar edición
            </button>
          )}

        </div>

      </div>

    </article>
  );
}


export function RecipeIngredientsForm({
  recipeId,
  initialGroups,
}: RecipeIngredientsFormProps) {
  const router =
    useRouter();


  const [
    groups,
    setGroups,
  ] =
    useState<EditableGroup[]>(
      () =>
        createEditableGroups(
          initialGroups,
        ),
    );


  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );


  const [
    validationError,
    setValidationError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(
      false,
    );


  const [
    isDirty,
    setIsDirty,
  ] =
    useState(
      false,
    );


  function markDirty() {
    setIsDirty(
      true,
    );

    setMessage(
      null,
    );
  }


  function addGroup() {
    setGroups(
      (
        current,
      ) => [
        ...current,

        {
          clientId:
            createClientId(
              "group",
            ),

          name:
            current.length ===
            0
              ? "Ingredientes principales"
              : `Grupo ${current.length + 1}`,

          ingredients:
            [],
        },
      ],
    );

    markDirty();
  }


  function changeGroupName(
    groupIndex: number,
    name: string,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) =>
            index ===
            groupIndex
              ? {
                  ...group,
                  name,
                }
              : group,
        ),
    );

    markDirty();
  }


  function removeGroup(
    groupIndex: number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.filter(
          (
            _group,
            index,
          ) =>
            index !==
            groupIndex,
        ),
    );

    markDirty();
  }


  function moveGroup(
    from: number,
    to: number,
  ) {
    if (
      to < 0 ||
      to >=
        groups.length
    ) {
      return;
    }


    setGroups(
      (
        current,
      ) => {
        const copy = [
          ...current,
        ];

        const [
          moved,
        ] =
          copy.splice(
            from,
            1,
          );


        if (
          !moved
        ) {
          return current;
        }


        copy.splice(
          to,
          0,
          moved,
        );


        return copy;
      },
    );


    markDirty();
  }


  function addIngredient(
    groupIndex: number,
    ingredient:
      RecipeIngredientFormData,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) =>
            index ===
            groupIndex
              ? {
                  ...group,

                  ingredients: [
                    ...group.ingredients,

                    {
                      clientId:
                        createClientId(
                          "ingredient",
                        ),

                      ...ingredient,
                    },
                  ],
                }
              : group,
        ),
    );


    markDirty();
  }


  function updateIngredient(
    groupIndex: number,
    ingredientIndex: number,
    ingredient:
      RecipeIngredientFormData,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            return {
              ...group,

              ingredients:
                group.ingredients.map(
                  (
                    currentIngredient,
                    currentIndex,
                  ) =>
                    currentIndex ===
                    ingredientIndex
                      ? {
                          clientId:
                            currentIngredient.clientId,

                          ...ingredient,
                        }
                      : currentIngredient,
                ),
            };
          },
        ),
    );


    markDirty();
  }


  function removeIngredient(
    groupIndex: number,
    ingredientIndex: number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            return {
              ...group,

              ingredients:
                group.ingredients.filter(
                  (
                    _ingredient,
                    currentIndex,
                  ) =>
                    currentIndex !==
                    ingredientIndex,
                ),
            };
          },
        ),
    );


    markDirty();
  }


  function moveIngredient(
    groupIndex: number,
    from: number,
    to: number,
  ) {
    setGroups(
      (
        current,
      ) =>
        current.map(
          (
            group,
            index,
          ) => {
            if (
              index !==
              groupIndex
            ) {
              return group;
            }


            if (
              to < 0 ||
              to >=
                group.ingredients.length
            ) {
              return group;
            }


            const ingredients = [
              ...group.ingredients,
            ];


            const [
              moved,
            ] =
              ingredients.splice(
                from,
                1,
              );


            if (
              !moved
            ) {
              return group;
            }


            ingredients.splice(
              to,
              0,
              moved,
            );


            return {
              ...group,

              ingredients,
            };
          },
        ),
    );


    markDirty();
  }


  function buildPayload():
  RecipeIngredientsFormData {
    return {
      groups:
        groups.map(
          (group) => ({
            name:
              group.name,

            ingredients:
              group.ingredients.map(
                (
                  ingredient,
                ) => ({
                  name:
                    ingredient.name,

                  quantity:
                    ingredient.quantity,

                  unit:
                    ingredient.unit,

                  notes:
                    ingredient.notes,

                  scalable:
                    ingredient.scalable,
                }),
              ),
          }),
        ),
    };
  }


  async function handleSave() {
    setMessage(
      null,
    );

    setValidationError(
      null,
    );


    const payload =
      buildPayload();


    const validation =
      recipeIngredientsSchema.safeParse(
        payload,
      );


    if (
      !validation.success
    ) {
      setValidationError(
        validation.error
          .issues[0]
          ?.message ??
          "Hay datos de ingredientes que no son válidos.",
      );

      return;
    }


    setIsSubmitting(
      true,
    );


    try {
      const result =
        await updateRecipeIngredientsAction(
          recipeId,
          validation.data,
        );


      if (
        !result.success
      ) {
        setMessage(
          result.message ??
            "No se pudieron guardar los ingredientes.",
        );

        return;
      }


      setIsDirty(
        false,
      );


      setMessage(
        result.message ??
          "Ingredientes guardados correctamente.",
      );


      router.refresh();
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }


  return (
    <section className="rounded-xl border p-6">

      {/* =============================================
          HEADER
      ============================================= */}

      <div className="flex flex-wrap items-start justify-between gap-4">

        <div>
          <h2 className="text-xl font-semibold">
            Ingredientes
          </h2>

          <p className="mt-1 text-sm">
            Organiza los ingredientes por grupos y define qué cantidades deben adaptarse al número de comensales.
          </p>
        </div>


        <button
          type="button"
          onClick={
            addGroup
          }
          className="rounded-lg border px-4 py-2"
        >
          Añadir grupo
        </button>

      </div>


      {/* =============================================
          GROUPS
      ============================================= */}

      <div className="mt-6 space-y-6">

        {groups.length ===
        0 ? (
          <div className="rounded-lg border p-5">

            <p className="text-sm">
              Todavía no hay grupos de ingredientes.
            </p>


            <button
              type="button"
              onClick={
                addGroup
              }
              className="mt-4 rounded-lg border px-4 py-2"
            >
              Crear primer grupo
            </button>

          </div>
        ) : (
          groups.map(
            (
              group,
              groupIndex,
            ) => (
              <IngredientGroupEditor
                key={
                  group.clientId
                }

                group={
                  group
                }

                groupIndex={
                  groupIndex
                }

                groupCount={
                  groups.length
                }

                onChangeName={
                  changeGroupName
                }

                onRemoveGroup={
                  removeGroup
                }

                onMoveGroup={
                  moveGroup
                }

                onAddIngredient={
                  addIngredient
                }

                onUpdateIngredient={
                  updateIngredient
                }

                onRemoveIngredient={
                  removeIngredient
                }

                onMoveIngredient={
                  moveIngredient
                }
              />
            ),
          )
        )}

      </div>


      {/* =============================================
          VALIDATION
      ============================================= */}

      {validationError && (
        <p
          role="alert"
          className="mt-6 text-sm"
        >
          {validationError}
        </p>
      )}


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
            : "Guardar ingredientes"}
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