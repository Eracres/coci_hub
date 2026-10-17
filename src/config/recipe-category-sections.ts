export type RecipeCategorySubgroup = {
  title:
    string;

  description?:
    string;

  categoryNames:
    string[];
};


export type RecipeCategorySection = {
  title:
    string;

  description:
    string;

  subgroups:
    RecipeCategorySubgroup[];
};


/*
 * =========================================================
 * TEMPORARILY HIDDEN CATEGORIES
 * =========================================================
 *
 * These categories remain available in PostgreSQL but are
 * intentionally not rendered in the community recipe
 * classification editor.
 *
 * "Cocina venezolana" is temporarily hidden after presenting
 * anomalous visual grouping behaviour despite its persisted
 * database value being valid.
 *
 * It can be restored later simply by removing it from this
 * list and adding it back to its visual subgroup.
 * =========================================================
 */

export const HIDDEN_RECIPE_CATEGORY_NAMES:
  string[] = [
    "Cocina venezolana",
  ];


export const RECIPE_CATEGORY_SECTIONS:
  RecipeCategorySection[] = [
    {
      title:
        "Ingrediente principal",

      description:
        "Clasifica la receta según los alimentos que tienen mayor protagonismo.",

      subgroups: [
        {
          title:
            "Carnes y aves",

          categoryNames: [
            "Carnes",
            "Aves",
            "Cerdo",
          ],
        },

        {
          title:
            "Pescados y mariscos",

          categoryNames: [
            "Pescados",
            "Mariscos",
          ],
        },

        {
          title:
            "Cereales y derivados",

          categoryNames: [
            "Arroces",
            "Pasta",
          ],
        },

        {
          title:
            "Verduras, hortalizas y tubérculos",

          categoryNames: [
            "Verduras y hortalizas",
            "Legumbres",
            "Setas y hongos",
            "Patatas",
          ],
        },

        {
          title:
            "Frutas y frutos secos",

          categoryNames: [
            "Frutas",
            "Frutos secos",
          ],
        },

        {
          title:
            "Huevos y lácteos",

          categoryNames: [
            "Huevos",
            "Quesos y lácteos",
          ],
        },
      ],
    },

    {
      title:
        "Tipo de preparación o formato",

      description:
        "Agrupa las recetas según su elaboración, presentación o formato final.",

      subgroups: [
        {
          title:
            "Preparaciones saladas",

          categoryNames: [
            "Ensaladas",
            "Sopas y cremas",
            "Guisos y estofados",
            "Platos de cuchara",
            "Salsas",
            "Croquetas y frituras",
          ],
        },

        {
          title:
            "Panes, masas y elaboraciones similares",

          categoryNames: [
            "Panes y masas",
            "Pizzas",
            "Bocadillos y sándwiches",
            "Empanadas",
          ],
        },

        {
          title:
            "Dulces y postres",

          categoryNames: [
            "Tartas y pasteles",
            "Galletas y dulces",
            "Helados y postres fríos",
          ],
        },

        {
          title:
            "Conservas y bebidas",

          categoryNames: [
            "Conservas y encurtidos",
            "Bebidas",
          ],
        },
      ],
    },

    {
      title:
        "Cocina y origen gastronómico",

      description:
        "Relaciona la receta con una tradición culinaria o procedencia gastronómica.",

      subgroups: [
        {
          title:
            "Europa",

          categoryNames: [
            "Cocina española",
            "Cocina francesa",
            "Cocina italiana",
          ],
        },

        {
          title:
            "Latinoamérica",

          categoryNames: [
            "Cocina mexicana",
            "Cocina colombiana",
            "Cocina ecuatoriana",
            "Cocina peruana",
          ],
        },

        {
          title:
            "Asia",

          categoryNames: [
            "Cocina china",
            "Cocina japonesa",
            "Cocina india",
          ],
        },
      ],
    },

    {
      title:
        "Estilo de cocina",

      description:
        "Clasificaciones generales que describen el carácter o enfoque de la receta.",

      subgroups: [
        {
          title:
            "Estilo general",

          categoryNames: [
            "Cocina tradicional",
          ],
        },
      ],
    },
  ];


export function normalizeRecipeCategoryName(
  value:
    string,
) {
  return value
    .replace(
      /[\u200B-\u200D\u2060\uFEFF]/g,
      "",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .toLocaleLowerCase(
      "es",
    )
    .normalize(
      "NFD",
    )
    .replace(
      /[\u0300-\u036f]/g,
      "",
    );
}


export function getRecipeCategoriesByNames<
  T extends {
    name:
      string;
  },
>(
  categories:
    T[],

  names:
    string[],
) {
  const normalizedNames =
    new Set(
      names.map(
        (
          name,
        ) =>
          normalizeRecipeCategoryName(
            name,
          ),
      ),
    );


  return categories.filter(
    (
      category,
    ) =>
      normalizedNames.has(
        normalizeRecipeCategoryName(
          category.name,
        ),
      ),
  );
}


export function getConfiguredRecipeCategoryNames() {
  return new Set(
    RECIPE_CATEGORY_SECTIONS.flatMap(
      (
        section,
      ) =>
        section.subgroups.flatMap(
          (
            subgroup,
          ) =>
            subgroup.categoryNames.map(
              (
                categoryName,
              ) =>
                normalizeRecipeCategoryName(
                  categoryName,
                ),
            ),
        ),
    ),
  );
}


export function getHiddenRecipeCategoryNames() {
  return new Set(
    HIDDEN_RECIPE_CATEGORY_NAMES.map(
      (
        categoryName,
      ) =>
        normalizeRecipeCategoryName(
          categoryName,
        ),
    ),
  );
}