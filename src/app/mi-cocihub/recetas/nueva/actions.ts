"use server";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export type NewRecipeState = {
  status:
    | "idle"
    | "error";

  message:
    string | null;

  values: {
    title:
      string;

    slug:
      string;
  };
};


function getValue(
  formData:
    FormData,

  field:
    string,
) {
  const value =
    formData.get(
      field,
    );


  return typeof value ===
    "string"
    ? value
    : "";
}


export async function createRecipe(
  previousState:
    NewRecipeState,

  formData:
    FormData,
): Promise<NewRecipeState> {

  const title =
    getValue(
      formData,
      "title",
    )
      .trim();


  const slug =
    getValue(
      formData,
      "slug",
    )
      .trim()
      .toLowerCase();


  const values = {
    title,
    slug,
  };


  if (
    title.length <
      3 ||
    title.length >
      120
  ) {
    return {
      status:
        "error",

      message:
        "El título debe tener entre 3 y 120 caracteres.",

      values,
    };
  }


  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
      slug,
    )
  ) {
    return {
      status:
        "error",

      message:
        "La URL de la receta solo puede contener letras minúsculas, números y guiones.",

      values,
    };
  }


  const supabase =
    await createClient();


  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase
      .auth
      .getClaims();


  if (
    claimsError ||
    !claimsData
      ?.claims
      ?.sub
  ) {
    redirect(
      "/login?error=session-required",
    );
  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_recipe_draft",
      {
        p_title:
          title,

        p_slug:
          slug,
      },
    );


  if (error) {

    if (
      error.code ===
      "23505"
    ) {
      return {
        status:
          "error",

        message:
          "Ya existe una receta con esa URL. Prueba con otra.",

        values,
      };
    }


    return {
      status:
        "error",

      message:
        "No hemos podido crear el borrador. Inténtalo de nuevo.",

      values,
    };
  }


  const recipe =
    Array.isArray(
      data,
    )
      ? data[0]
      : data;


  if (
    !recipe?.id
  ) {
    return {
      status:
        "error",

      message:
        "La receta se creó, pero no hemos podido obtener su identificador.",

      values,
    };
  }


  redirect(
    `/mi-cocihub/recetas/${recipe.id}/editar`,
  );
}
