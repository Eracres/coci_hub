"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { FormError } from "@/components/ui/form-error";
import { FormField } from "@/components/ui/form-field";
import { RadioGroup } from "@/components/ui/radio-group";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type Category = {
  id: string;
  name: string;
};

type Tag = {
  id: string;
  name: string;
};

const categories: Category[] = [
  { id: "legumes", name: "Legumbres" },
  { id: "vegetables", name: "Verduras" },
  { id: "meat", name: "Carne" },
  { id: "fish", name: "Pescado" },
  { id: "rice", name: "Arroz" },
  { id: "pasta", name: "Pasta" },
  { id: "desserts", name: "Postres" },
  { id: "breakfast", name: "Desayunos" },
];

const tags: Tag[] = [
  { id: "vegetarian", name: "Vegetariana" },
  { id: "quick", name: "Receta rápida" },
  { id: "economic", name: "Económica" },
  { id: "share", name: "Para compartir" },
  { id: "healthy", name: "Saludable" },
  { id: "international", name: "Internacional" },
];

export function RecipeClassificationDemo() {
  const [recipeType, setRecipeType] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "vegetarian",
  ]);
  const [featured, setFeatured] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  function toggleCategory(categoryId: string) {
    setSelectedCategories((currentCategories) => {
      const exists = currentCategories.includes(categoryId);

      const updatedCategories = exists
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId];

      if (updatedCategories.length > 0) {
        setCategoryError("");
      }

      return updatedCategories;
    });
  }

  function toggleTag(tagId: string) {
    setSelectedTags((currentTags) =>
      currentTags.includes(tagId)
        ? currentTags.filter((id) => id !== tagId)
        : [...currentTags, tagId],
    );
  }

  function validateCategories() {
    if (selectedCategories.length === 0) {
      setCategoryError(
        "Selecciona al menos una categoría para la receta.",
      );

      return;
    }

    setCategoryError("");
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
      <div>
        <h3 className="font-serif text-xl font-bold">
          Clasificación de la receta
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Organiza la receta mediante tipo principal, categorías,
          etiquetas y dificultad.
        </p>
      </div>

      <div className="mt-8 grid gap-8">
        {/* Tipo principal */}

        <FormField
          htmlFor="classification-type"
          label="Tipo principal"
          description="Cada receta debe tener un único tipo principal."
          required
        >
          <Select
            id="classification-type"
            value={recipeType}
            onChange={(event) =>
              setRecipeType(event.target.value)
            }
          >
            <option value="" disabled>
              Selecciona un tipo
            </option>

            <option value="breakfast">
              Desayuno
            </option>

            <option value="appetizer">
              Aperitivo
            </option>

            <option value="starter">
              Entrante
            </option>

            <option value="first-course">
              Primer plato
            </option>

            <option value="second-course">
              Segundo plato
            </option>

            <option value="main-course">
              Plato único
            </option>

            <option value="side-dish">
              Guarnición
            </option>

            <option value="salad">
              Ensalada
            </option>

            <option value="soup">
              Sopas y cremas
            </option>

            <option value="sauce">
              Salsa
            </option>

            <option value="bread">
              Panes y masas
            </option>

            <option value="dessert">
              Postre
            </option>

            <option value="drink">
              Bebida
            </option>

            <option value="snack">
              Snack
            </option>

            <option value="preserve">
              Conserva
            </option>

            <option value="pastry">
              Repostería
            </option>
          </Select>
        </FormField>

        {/* Categorías */}

        <div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Categorías
              <span
                aria-hidden="true"
                className="ml-1 text-error"
              >
                *
              </span>
              <span className="sr-only">
                {" "}
                obligatorio
              </span>
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Selecciona una o varias categorías relacionadas con
              la receta.
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Checkbox
                key={category.id}
                id={`category-${category.id}`}
                name={`category-${category.id}`}
                label={category.name}
                checked={selectedCategories.includes(category.id)}
                onChange={() =>
                  toggleCategory(category.id)
                }
              />
            ))}
          </div>

          <div className="mt-3">
            <FormError
              id="classification-category-error"
              message={categoryError}
            />
          </div>

          <button
            type="button"
            onClick={validateCategories}
            className="mt-2 text-sm font-semibold text-brand hover:underline"
          >
            Validar selección
          </button>
        </div>

        {/* Etiquetas */}

        <div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Etiquetas
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Añade características adicionales para facilitar
              búsquedas y filtros.
            </p>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <Checkbox
                key={tag.id}
                id={`tag-${tag.id}`}
                name={`tag-${tag.id}`}
                label={tag.name}
                checked={selectedTags.includes(tag.id)}
                onChange={() =>
                  toggleTag(tag.id)
                }
              />
            ))}
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {selectedTags.length}{" "}
            {selectedTags.length === 1
              ? "etiqueta seleccionada"
              : "etiquetas seleccionadas"}
          </p>
        </div>

        {/* Dificultad */}

        <RadioGroup
          name="recipe-classification-difficulty"
          legend="Dificultad"
          defaultValue="easy"
          required
          options={[
            {
              value: "easy",
              label: "Fácil",
              description:
                "No requiere técnicas avanzadas.",
            },
            {
              value: "medium",
              label: "Media",
              description:
                "Requiere algo de experiencia o varios procesos.",
            },
            {
              value: "hard",
              label: "Difícil",
              description:
                "Incluye técnicas o procesos más complejos.",
            },
          ]}
        />

        {/* Destacada */}

        <Switch
          id="classification-featured"
          name="classification-featured"
          label="Receta destacada"
          description={
            featured
              ? "La receta podrá aparecer en bloques destacados de la portada."
              : "La receta se publicará con visibilidad normal."
          }
          checked={featured}
          onChange={(event) =>
            setFeatured(event.target.checked)
          }
        />
      </div>

      {/* Resumen */}

      <div className="mt-8 rounded-lg border border-border bg-page p-5">
        <h4 className="font-serif text-lg font-bold">
          Resumen de clasificación
        </h4>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">
              Tipo principal
            </dt>

            <dd className="mt-1 font-semibold">
              {recipeType || "Sin seleccionar"}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              Categorías
            </dt>

            <dd className="mt-1 font-semibold">
              {selectedCategories.length}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              Etiquetas
            </dt>

            <dd className="mt-1 font-semibold">
              {selectedTags.length}
            </dd>
          </div>

          <div>
            <dt className="text-sm text-muted-foreground">
              Destacada
            </dt>

            <dd className="mt-1 font-semibold">
              {featured ? "Sí" : "No"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}