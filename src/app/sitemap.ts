import type {
  MetadataRoute,
} from "next";

import {
  absoluteUrl,
} from "@/config/site";

import {
  getPublicCategories,
} from "@/services/categories/public-category-service";

import {
  getPublishedRecipes,
} from "@/services/recipes/public-recipe-service";


export default async function sitemap():
  Promise<
    MetadataRoute.Sitemap
  > {
  const [
    recipes,
    categories,
  ] =
    await Promise.all([
      getPublishedRecipes(),
      getPublicCategories(),
    ]);


  const staticPages:
    MetadataRoute.Sitemap =
    [
      {
        url:
          absoluteUrl(
            "/",
          ),

        changeFrequency:
          "weekly",

        priority:
          1,
      },

      {
        url:
          absoluteUrl(
            "/recipes",
          ),

        changeFrequency:
          "daily",

        priority:
          0.9,
      },

      {
        url:
          absoluteUrl(
            "/categories",
          ),

        changeFrequency:
          "weekly",

        priority:
          0.8,
      },

      {
        url:
          absoluteUrl(
            "/about",
          ),

        changeFrequency:
          "monthly",

        priority:
          0.6,
      },

      {
        url:
          absoluteUrl(
            "/legal-notice",
          ),

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },

      {
        url:
          absoluteUrl(
            "/privacy",
          ),

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },

      {
        url:
          absoluteUrl(
            "/cookies",
          ),

        changeFrequency:
          "yearly",

        priority:
          0.2,
      },
    ];


  const recipePages:
    MetadataRoute.Sitemap =
    recipes.map(
      (
        recipe,
      ) => ({
        url:
          absoluteUrl(
            `/recipes/${recipe.slug}`,
          ),

        lastModified:
          recipe.publishedAt ??
          undefined,

        changeFrequency:
          "monthly",

        priority:
          recipe.featured
            ? 0.9
            : 0.8,
      }),
    );


  /*
   * Evitamos meter en el sitemap
   * categorías completamente vacías.
   *
   * Pueden seguir existiendo y ser
   * accesibles, pero no aportan valor
   * SEO mientras no tengan recetas.
   */
  const categoryPages:
    MetadataRoute.Sitemap =
    categories
      .filter(
        (
          category,
        ) =>
          category.recipeCount >
          0,
      )
      .map(
        (
          category,
        ) => ({
          url:
            absoluteUrl(
              `/categories/${category.slug}`,
            ),

          changeFrequency:
            "weekly",

          priority:
            0.7,
        }),
      );


  return [
    ...staticPages,
    ...recipePages,
    ...categoryPages,
  ];
}