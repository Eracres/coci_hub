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


const PROFILE_HERO_BUCKET =
  "profile-hero-images";


const MAX_CUSTOM_HERO_SIZE =
  1024 *
  1024;


type CurrentDashboardHero = {
  dashboard_hero_type:
    string | null;

  dashboard_hero_value:
    string | null;
};


export type DashboardHeroActionResult = {
  success:
    boolean;

  message:
    string;

  heroPath?:
    string;

  heroUrl?:
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


async function getAuthenticatedDashboardHero() {
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

      profile:
        null,

      error:
        "Tu sesión ha caducado. Vuelve a iniciar sesión.",
    };
  }


  const {
    data:
      profileData,

    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(
        "dashboard_hero_type, dashboard_hero_value",
      )
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    profileError ||
    !profileData
  ) {
    return {
      supabase,

      userId,

      profile:
        null,

      error:
        "No se pudo cargar la configuración de tu perfil.",
    };
  }


  return {
    supabase,

    userId,

    profile:
      profileData as
        CurrentDashboardHero,

    error:
      null,
  };
}


async function cleanupPreviousCustomHero(
  supabase:
    Awaited<
      ReturnType<
        typeof createClient
      >
    >,

  userId:
    string,

  profile:
    CurrentDashboardHero,

  nextPath:
    string | null = null,
) {
  if (
    profile
      .dashboard_hero_type !==
      "custom"
  ) {
    return;
  }


  const previousPath =
    profile
      .dashboard_hero_value;


  if (
    !previousPath ||
    previousPath ===
      nextPath
  ) {
    return;
  }


  if (
    !previousPath.startsWith(
      `${userId}/hero-`,
    ) ||
    !previousPath.endsWith(
      ".webp",
    )
  ) {
    return;
  }


  const {
    error:
      cleanupError,
  } =
    await supabase
      .storage
      .from(
        PROFILE_HERO_BUCKET,
      )
      .remove([
        previousPath,
      ]);


  if (
    cleanupError
  ) {
    console.error(
      "OLD DASHBOARD HERO CLEANUP ERROR:",
      cleanupError,
    );
  }
}


async function isWebP(
  file:
    File,
) {
  const bytes =
    new Uint8Array(
      await file
        .slice(
          0,
          12,
        )
        .arrayBuffer(),
    );


  return (
    bytes.length >=
      12 &&
    bytes[0] ===
      0x52 &&
    bytes[1] ===
      0x49 &&
    bytes[2] ===
      0x46 &&
    bytes[3] ===
      0x46 &&
    bytes[8] ===
      0x57 &&
    bytes[9] ===
      0x45 &&
    bytes[10] ===
      0x42 &&
    bytes[11] ===
      0x50
  );
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
    profile,
    error:
      authenticationError,
  } =
    await getAuthenticatedDashboardHero();


  if (
    authenticationError ||
    !userId ||
    !profile
  ) {
    return {
      success:
        false,

      message:
        authenticationError ??
        "No se pudo comprobar tu perfil.",
    };
  }


  // =======================================================
  // AUTOMATIC MODE
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


    await cleanupPreviousCustomHero(
      supabase,
      userId,
      profile,
    );


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


  await cleanupPreviousCustomHero(
    supabase,
    userId,
    profile,
  );


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


/* =========================================================
   SAVE CUSTOM DASHBOARD HERO
========================================================= */

export async function saveMyCustomDashboardHeroAction(
  formData:
    FormData,
): Promise<
  DashboardHeroActionResult
> {
  const {
    supabase,
    userId,
    profile,
    error:
      authenticationError,
  } =
    await getAuthenticatedDashboardHero();


  if (
    authenticationError ||
    !userId ||
    !profile
  ) {
    return {
      success:
        false,

      message:
        authenticationError ??
        "No se pudo comprobar tu perfil.",
    };
  }


  const entry =
    formData.get(
      "hero",
    );


  if (
    !(entry instanceof File) ||
    entry.size ===
      0
  ) {
    return {
      success:
        false,

      message:
        "Selecciona una imagen.",
    };
  }


  if (
    entry.size >
    MAX_CUSTOM_HERO_SIZE
  ) {
    return {
      success:
        false,

      message:
        "La imagen optimizada supera el límite máximo de 1 MB.",
    };
  }


  if (
    entry.type !==
      "image/webp" ||
    !(
      await isWebP(
        entry,
      )
    )
  ) {
    return {
      success:
        false,

      message:
        "La imagen procesada no tiene un formato WebP válido.",
    };
  }


  const newPath =
    `${userId}/hero-${Date.now()}.webp`;


  const {
    error:
      uploadError,
  } =
    await supabase
      .storage
      .from(
        PROFILE_HERO_BUCKET,
      )
      .upload(
        newPath,
        entry,
        {
          contentType:
            "image/webp",

          cacheControl:
            "31536000",

          upsert:
            false,
        },
      );


  if (
    uploadError
  ) {
    console.error(
      "DASHBOARD HERO UPLOAD ERROR:",
      uploadError,
    );


    return {
      success:
        false,

      message:
        "No se pudo subir la imagen de Mi CociHub.",
    };
  }


  const {
    error:
      databaseError,
  } =
    await supabase.rpc(
      "set_my_dashboard_hero",
      {
        p_hero_type:
          "custom",

        p_hero_value:
          newPath,
      },
    );


  if (
    databaseError
  ) {
    await supabase
      .storage
      .from(
        PROFILE_HERO_BUCKET,
      )
      .remove([
        newPath,
      ]);


    console.error(
      "SET CUSTOM DASHBOARD HERO ERROR:",
      databaseError,
    );


    return {
      success:
        false,

      message:
        "La imagen se subió, pero no pudo asociarse a tu perfil.",
    };
  }


  await cleanupPreviousCustomHero(
    supabase,
    userId,
    profile,
    newPath,
  );


  const {
    data:
      signedData,

    error:
      signedError,
  } =
    await supabase
      .storage
      .from(
        PROFILE_HERO_BUCKET,
      )
      .createSignedUrl(
        newPath,
        60 *
        60,
      );


  if (
    signedError
  ) {
    console.error(
      "CUSTOM DASHBOARD HERO SIGNED URL ERROR:",
      signedError,
    );
  }


  revalidateDashboardHero();


  return {
    success:
      true,

    message:
      "Tu imagen personalizada se ha guardado correctamente.",

    heroPath:
      newPath,

    heroUrl:
      signedData
        ?.signedUrl,
  };
}