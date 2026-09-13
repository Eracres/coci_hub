export type PublicationRequirement = {
  key:
    string;

  label:
    string;

  valid:
    boolean;
};


export type PublicationReadiness = {
  canPublish:
    boolean;

  requirements:
    PublicationRequirement[];
};


type PublicationRecipeData = {
  title:
    string;

  slug:
    string;

  short_description:
    string | null;

  image_path:
    string | null;

  recipe_type_id:
    string | null;

  difficulty:
    string | null;

  base_servings:
    number | null;

  preparation_minutes:
    number | null;
};


type GetPublicationReadinessInput = {
  recipe:
    PublicationRecipeData;

  categoryCount:
    number;

  ingredientCount:
    number;

  stepCount:
    number;
};


export function getPublicationReadiness({
  recipe,
  categoryCount,
  ingredientCount,
  stepCount,
}: GetPublicationReadinessInput):
PublicationReadiness {
  const requirements:
    PublicationRequirement[] = [
      {
        key:
          "title",

        label:
          "Título definido",

        valid:
          recipe.title
            .trim()
            .length >
          0,
      },

      {
        key:
          "slug",

        label:
          "Slug definido",

        valid:
          recipe.slug
            .trim()
            .length >
          0,
      },

      {
        key:
          "short-description",

        label:
          "Descripción corta",

        valid:
          Boolean(
            recipe
              .short_description
              ?.trim(),
          ),
      },

      {
        key:
          "main-image",

        label:
          "Imagen principal",

        valid:
          Boolean(
            recipe
              .image_path
              ?.trim(),
          ),
      },

      {
        key:
          "recipe-type",

        label:
          "Tipo de receta",

        valid:
          Boolean(
            recipe
              .recipe_type_id,
          ),
      },

      {
        key:
          "difficulty",

        label:
          "Dificultad",

        valid:
          Boolean(
            recipe.difficulty,
          ),
      },

      {
        key:
          "base-servings",

        label:
          "Raciones base",

        valid:
          recipe.base_servings !==
            null &&
          recipe.base_servings >
            0,
      },

      {
        key:
          "preparation-time",

        label:
          "Tiempo de preparación",

        valid:
          recipe
            .preparation_minutes !==
            null &&
          recipe
            .preparation_minutes >
            0,
      },

      {
        key:
          "category",

        label:
          "Al menos una categoría",

        valid:
          categoryCount >
          0,
      },

      {
        key:
          "ingredient",

        label:
          "Al menos un ingrediente",

        valid:
          ingredientCount >
          0,
      },

      {
        key:
          "step",

        label:
          "Al menos un paso de elaboración",

        valid:
          stepCount >
          0,
      },
    ];


  return {
    requirements,

    canPublish:
      requirements.every(
        (requirement) =>
          requirement.valid,
      ),
  };
}