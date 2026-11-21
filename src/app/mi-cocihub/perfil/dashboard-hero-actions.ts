"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  isProfileHeroPresetKey,
} from "@/config/profile-hero-presets";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  createClient,
} from "@/lib/supabase/server";


export type DashboardHeroActionResult = {
  success:
    boolean;

  message:
    string;
};


function revalidateDashboardHero() {
  revalidatePath(
    "/mi-cocihub",
  );


  revalidatePath(
    "/mi-cocihub/perfil",
  );
}


async function getAuthenticatedUserId() {
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


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    typeof userId !==
      "string" ||
    !userId
  ) {
    return {
      supabase,

      userId:
        null,
    };
  }


  return {
    supabase,
    userId,
  };
}


export async function saveMyDashboardHeroAction(
  formData:
    FormData,
): Promise<
  DashboardHeroActionResult
> {
  const rawHeroType =
    String(
      formData.get(
        "heroType",
      ) ??
      "",
    )
      .trim();


  const heroValue =
    String(
      formData.get(
        "heroValue",
      ) ??
      "",
    )
      .trim();


  const {
    supabase,
    userId,
  } =
    await getAuthenticatedUserId();


  if (
    !userId
  ) {
    return {
      success:
        false,

      message:
        "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }


  // =======================================================
  // AUTOMATIC MODE
  // =======================================================
  //
  // Empty type + empty value restores the default behaviour:
  // Mi CociHub automatically chooses an available recipe image.
  // =======================================================

  if (
    !rawHeroType &&
    !heroValue
  ) {
    const {
      error,
    } =
      await supabase.rpc(
        "set_my_dashboard_hero",
        {
          p_hero_type:
            null,

          p_hero_value:
            null,
        },
      );


    if (
      error
    ) {
      console.error(
        "RESET DASHBOARD HERO ERROR:",
        error,
      );


      return {
        success:
          false,

        message:
          "No se pudo restaurar la imagen automática de Mi CociHub.",
      };
    }


    revalidateDashboardHero();


    return {
      success:
        true,

      message:
        "Imagen de Mi CociHub restaurada al modo automático.",
    };
  }


  // =======================================================
  // SOURCE VALIDATION
  // =======================================================

  if (
    rawHeroType !==
      "preset" &&
    rawHeroType !==
      "recipe"
  ) {
    return {
      success:
        false,

      message:
        "El origen de la imagen no es válido.",
    };
  }


  if (
    !heroValue
  ) {
    return {
      success:
        false,

      message:
        "Selecciona una imagen antes de guardar.",
    };
  }


  // =======================================================
  // PRESET VALIDATION
  // =======================================================

  if (
    rawHeroType ===
      "preset" &&
    !isProfileHeroPresetKey(
      heroValue,
    )
  ) {
    return {
      success:
        false,

      message:
        "La imagen de la colección CociHub seleccionada no es válida.",
    };
  }


  // =======================================================
  // SAVE
  // =======================================================
  //
  // Recipe ownership and image availability are validated
  // again inside the database RPC.
  // =======================================================

  const {
    error,
  } =
    await supabase.rpc(
      "set_my_dashboard_hero",
      {
        p_hero_type:
          rawHeroType,

        p_hero_value:
          heroValue,
      },
    );


  if (
    error
  ) {
    if (
      errorHasCode(
        error,
        "42501",
      )
    ) {
      return {
        success:
          false,

        message:
          "Tu sesión no permite modificar esta configuración.",
      };
    }


    if (
      errorHasCode(
        error,
        "22023",
      )
    ) {
      return {
        success:
          false,

        message:
          rawHeroType ===
          "recipe"
            ? "Esa receta no puede utilizarse como imagen de Mi CociHub."
            : "La imagen seleccionada no es válida.",
      };
    }


    if (
      errorHasCode(
        error,
        "P0002",
      )
    ) {
      return {
        success:
          false,

        message:
          "No se pudo encontrar tu perfil.",
      };
    }


    console.error(
      "SAVE DASHBOARD HERO ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo guardar la imagen de Mi CociHub.",
    };
  }


  revalidateDashboardHero();


  return {
    success:
      true,

    message:
      rawHeroType ===
      "preset"
        ? "Imagen de la colección CociHub guardada correctamente."
        : "Imagen de tu receta guardada correctamente.",
  };
}
