import {
  NextResponse,
} from "next/server";

import {
  searchPublishedRecipes,
} from "@/services/recipes/public-recipe-list-service";


const MIN_SEARCH_LENGTH =
  2;

const MAX_RESULTS =
  5;


export async function GET(
  request:
    Request,
) {
  const {
    searchParams,
  } =
    new URL(
      request.url,
    );


  const search =
    (
      searchParams.get(
        "q",
      ) ??
      ""
    ).trim();


  if (
    search.length <
    MIN_SEARCH_LENGTH
  ) {
    return NextResponse.json(
      {
        results:
          [],
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }


  try {
    const result =
      await searchPublishedRecipes({
        search,

        category:
          "",

        recipeType:
          "",

        difficulty:
          "",

        tag:
          "",

        order:
          "featured",
      });


    const suggestions =
      result.recipes
        .slice(
          0,
          MAX_RESULTS,
        )
        .map(
          (
            recipe,
          ) => ({
            id:
              recipe.id,

            title:
              recipe.title,

            slug:
              recipe.slug,

            shortDescription:
              recipe.shortDescription,

            imageUrl:
              recipe.imageUrl,

            totalMinutes:
              recipe.totalMinutes,

            difficulty:
              recipe.difficulty,
          }),
        );


    return NextResponse.json(
      {
        results:
          suggestions,

        total:
          result.total,
      },
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );

  } catch (
    error
  ) {
    console.error(
      "PUBLIC RECIPE SEARCH SUGGESTIONS ERROR:",
      error,
    );


    return NextResponse.json(
      {
        results:
          [],

        error:
          "No se pudieron cargar las sugerencias.",
      },
      {
        status:
          500,

        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  }
}
