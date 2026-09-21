import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  absoluteUrl,
  siteConfig,
} from "@/config/site";

import {
  getPublishedRecipeBySlug,
} from "@/services/recipes/public-recipe-service";

import type {
  PublicRecipeDetail,
} from "@/types/public-recipe";


type RecipeLayoutProps = {
  children:
    ReactNode;

  params:
    Promise<{
      slug:
        string;
    }>;
};


function minutesToIsoDuration(
  minutes:
    number | null,
) {
  if (
    !minutes ||
    minutes <=
      0
  ) {
    return undefined;
  }


  const hours =
    Math.floor(
      minutes /
        60,
    );


  const remainingMinutes =
    minutes %
    60;


  if (
    hours >
      0 &&
    remainingMinutes >
      0
  ) {
    return `PT${hours}H${remainingMinutes}M`;
  }


  if (
    hours >
    0
  ) {
    return `PT${hours}H`;
  }


  return `PT${remainingMinutes}M`;
}


function formatIngredientQuantity(
  quantity:
    number | null,
) {
  if (
    quantity ===
    null
  ) {
    return "";
  }


  return new Intl.NumberFormat(
    "es-ES",
    {
      maximumFractionDigits:
        2,
    },
  ).format(
    quantity,
  );
}


function getStructuredIngredient(
  quantity:
    number | null,

  unit:
    string | null,

  name:
    string,

  notes:
    string | null,
) {
  const quantityText =
    formatIngredientQuantity(
      quantity,
    );


  const parts = [
    quantityText,
    unit ?? "",
    name,
  ].filter(
    Boolean,
  );


  const baseIngredient =
    parts.join(
      " ",
    );


  if (
    !notes
  ) {
    return baseIngredient;
  }


  return `${baseIngredient} (${notes})`;
}


function createRecipeJsonLd(
  recipe:
    PublicRecipeDetail,
) {
  const ingredients =
    recipe.ingredientGroups.flatMap(
      (
        group,
      ) =>
        group.ingredients.map(
          (
            ingredient,
          ) =>
            getStructuredIngredient(
              ingredient.quantity,
              ingredient.unit,
              ingredient.name,
              ingredient.notes,
            ),
        ),
    );


  const keywords = [
    ...recipe.categories.map(
      (
        category,
      ) =>
        category.name,
    ),

    ...recipe.tags.map(
      (
        tag,
      ) =>
        tag.name,
    ),
  ];


  return {
    "@context":
      "https://schema.org",

    "@type":
      "Recipe",

    name:
      recipe.title,

    description:
      recipe.shortDescription ??
      recipe.introduction ??
      `Receta de ${recipe.title} en CociHub.`,

    url:
      absoluteUrl(
        `/recipes/${recipe.slug}`,
      ),

    mainEntityOfPage:
      absoluteUrl(
        `/recipes/${recipe.slug}`,
      ),

    image:
      recipe.imageUrl
        ? [
            recipe.imageUrl,
          ]
        : undefined,

    datePublished:
      recipe.publishedAt ??
      undefined,

    recipeYield:
      recipe.baseServings
        ? `${recipe.baseServings} ${
            recipe.baseServings ===
            1
              ? "ración"
              : "raciones"
          }`
        : undefined,

    prepTime:
      minutesToIsoDuration(
        recipe.preparationMinutes,
      ),

    cookTime:
      minutesToIsoDuration(
        recipe.cookingMinutes,
      ),

    totalTime:
      minutesToIsoDuration(
        recipe.totalMinutes,
      ),

    recipeCategory:
      recipe.recipeType
        ?.name ??
      undefined,

    keywords:
      keywords.length >
      0
        ? keywords.join(
            ", ",
          )
        : undefined,

    recipeIngredient:
      ingredients.length >
      0
        ? ingredients
        : undefined,

    recipeInstructions:
      recipe.steps.length >
      0
        ? recipe.steps.map(
            (
              step,
              index,
            ) => ({
              "@type":
                "HowToStep",

              position:
                index +
                1,

              name:
                step.title ??
                `Paso ${
                  index +
                  1
                }`,

              text:
                step.instructions,
            }),
          )
        : undefined,
  };
}


function serializeJsonLd(
  value:
    unknown,
) {
  return JSON.stringify(
    value,
  ).replace(
    /</g,
    "\\u003c",
  );
}


export async function generateMetadata({
  params,
}: RecipeLayoutProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const recipe =
    await getPublishedRecipeBySlug(
      slug,
    );


  if (
    !recipe
  ) {
    return {
      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }


  const description =
    recipe.shortDescription ??
    `Descubre cómo preparar ${recipe.title} en CociHub.`;


  const canonicalUrl =
    absoluteUrl(
      `/recipes/${recipe.slug}`,
    );


  const images =
    recipe.imageUrl
      ? [
          {
            url:
              recipe.imageUrl,

            alt:
              recipe.imageAlt ??
              recipe.title,
          },
        ]
      : undefined;


  return {
    alternates: {
      canonical:
        canonicalUrl,
    },

    openGraph: {
      type:
        "article",

      locale:
        siteConfig.locale,

      siteName:
        siteConfig.name,

      title:
        recipe.title,

      description,

      url:
        canonicalUrl,

      publishedTime:
        recipe.publishedAt ??
        undefined,

      images,
    },

    twitter: {
      card:
        recipe.imageUrl
          ? "summary_large_image"
          : "summary",

      title:
        recipe.title,

      description,

      images:
        recipe.imageUrl
          ? [
              recipe.imageUrl,
            ]
          : undefined,
    },
  };
}


export default async function RecipeSeoLayout({
  children,
  params,
}: RecipeLayoutProps) {
  const {
    slug,
  } =
    await params;


  const recipe =
    await getPublishedRecipeBySlug(
      slug,
    );


  return (
    <>
      {recipe ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              serializeJsonLd(
                createRecipeJsonLd(
                  recipe,
                ),
              ),
          }}
        />
      ) : null}

      {children}
    </>
  );
}