"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  errorHasCode,
} from "@/lib/errors/supabase-error";

import {
  createClient,
} from "@/lib/supabase/server";


const AVATAR_BUCKET =
  "profile-avatars";


const MAX_AVATAR_SIZE =
  5 *
  1024 *
  1024;


type AvatarKind = {
  extension:
    "jpg" |
    "png" |
    "webp";

  contentType:
    "image/jpeg" |
    "image/png" |
    "image/webp";
};


export type ProfileActionResult = {
  success:
    boolean;

  message?:
    string;

  avatarUrl?:
    string | null;
};


function revalidateProfile() {
  revalidatePath(
    "/",
    "layout",
  );

  revalidatePath(
    "/mi-cocihub",
  );

  revalidatePath(
    "/mi-cocihub/perfil",
  );
}


async function detectAvatarKind(
  file:
    File,
): Promise<
  AvatarKind | null
> {
  const bytes =
    new Uint8Array(
      await file
        .slice(
          0,
          12,
        )
        .arrayBuffer(),
    );


  // JPEG

  if (
    bytes.length >=
      3 &&
    bytes[0] ===
      0xff &&
    bytes[1] ===
      0xd8 &&
    bytes[2] ===
      0xff
  ) {
    return {
      extension:
        "jpg",

      contentType:
        "image/jpeg",
    };
  }


  // PNG

  if (
    bytes.length >=
      8 &&
    bytes[0] ===
      0x89 &&
    bytes[1] ===
      0x50 &&
    bytes[2] ===
      0x4e &&
    bytes[3] ===
      0x47 &&
    bytes[4] ===
      0x0d &&
    bytes[5] ===
      0x0a &&
    bytes[6] ===
      0x1a &&
    bytes[7] ===
      0x0a
  ) {
    return {
      extension:
        "png",

      contentType:
        "image/png",
    };
  }


  // WEBP

  if (
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
  ) {
    return {
      extension:
        "webp",

      contentType:
        "image/webp",
    };
  }


  return null;
}


async function getAuthenticatedProfile() {
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
      profile,

    error:
      profileError,
  } =
    await supabase
      .from(
        "profiles",
      )
      .select(`
        display_name,
        username,
        avatar_url
      `)
      .eq(
        "id",
        userId,
      )
      .maybeSingle();


  if (
    profileError ||
    !profile
  ) {
    return {
      supabase,
      userId:
        null,
      profile:
        null,
      error:
        "No se pudo obtener tu perfil.",
    };
  }


  return {
    supabase,
    userId,
    profile,
    error:
      null,
  };
}


/* =========================================================
   UPDATE PROFILE
========================================================= */

export async function updateMyProfileAction(
  formData:
    FormData,
): Promise<
  ProfileActionResult
> {
  const displayName =
    String(
      formData.get(
        "displayName",
      ) ??
      "",
    )
      .trim();


  const username =
    String(
      formData.get(
        "username",
      ) ??
      "",
    )
      .trim()
      .toLowerCase();


  if (
    displayName.length <
      2 ||
    displayName.length >
      120
  ) {
    return {
      success:
        false,

      message:
        "El nombre visible debe contener entre 2 y 120 caracteres.",
    };
  }


  if (
    !/^[a-z0-9_]{3,30}$/.test(
      username,
    )
  ) {
    return {
      success:
        false,

      message:
        "El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras minúsculas, números y guiones bajos.",
    };
  }


  const {
    supabase,
    userId,
    error:
      authError,
  } =
    await getAuthenticatedProfile();


  if (
    authError ||
    !userId
  ) {
    return {
      success:
        false,

      message:
        authError ??
        "No se pudo comprobar tu sesión.",
    };
  }


  const {
    error,
  } =
    await supabase.rpc(
      "update_my_profile",
      {
        p_display_name:
          displayName,

        p_username:
          username,
      },
    );


  if (
    error
  ) {
    if (
      errorHasCode(
        error,
        "23505",
      )
    ) {
      return {
        success:
          false,

        message:
          "Ese nombre de usuario ya está siendo utilizado.",
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
          "Los datos introducidos no son válidos.",
      };
    }


    console.error(
      "UPDATE PROFILE ERROR:",
      error,
    );


    return {
      success:
        false,

      message:
        "No se pudo actualizar el perfil.",
    };
  }


  revalidateProfile();


  return {
    success:
      true,

    message:
      "Perfil actualizado correctamente.",
  };
}


/* =========================================================
   SAVE CUSTOM AVATAR
========================================================= */

export async function saveMyAvatarAction(
  formData:
    FormData,
): Promise<
  ProfileActionResult
> {
  const {
    supabase,
    userId,
    profile,
    error:
      profileError,
  } =
    await getAuthenticatedProfile();


  if (
    profileError ||
    !userId ||
    !profile
  ) {
    return {
      success:
        false,

      message:
        profileError ??
        "No se pudo comprobar tu perfil.",
    };
  }


  const entry =
    formData.get(
      "avatar",
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
    MAX_AVATAR_SIZE
  ) {
    return {
      success:
        false,

      message:
        "La imagen supera el límite máximo de 5 MB.",
    };
  }


  const avatarKind =
    await detectAvatarKind(
      entry,
    );


  if (
    !avatarKind
  ) {
    return {
      success:
        false,

      message:
        "Formato no válido. Utiliza JPG, PNG o WebP.",
    };
  }


  const previousPath =
    profile.avatar_url;


  const newPath =
    `${userId}/avatar-${Date.now()}.${avatarKind.extension}`;


  const {
    error:
      uploadError,
  } =
    await supabase
      .storage
      .from(
        AVATAR_BUCKET,
      )
      .upload(
        newPath,
        entry,
        {
          contentType:
            avatarKind.contentType,

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
      "AVATAR UPLOAD ERROR:",
      uploadError,
    );


    return {
      success:
        false,

      message:
        "No se pudo subir el avatar.",
    };
  }


  const {
    error:
      databaseError,
  } =
    await supabase.rpc(
      "set_my_avatar",
      {
        p_avatar_path:
          newPath,
      },
    );


  if (
    databaseError
  ) {
    await supabase
      .storage
      .from(
        AVATAR_BUCKET,
      )
      .remove([
        newPath,
      ]);


    console.error(
      "SET PROFILE AVATAR ERROR:",
      databaseError,
    );


    return {
      success:
        false,

      message:
        "La imagen se subió, pero no pudo asociarse a tu perfil.",
    };
  }


  /*
   * Solo borramos objetos internos de CociHub.
   * Nunca intentamos borrar una URL externa de Google.
   */

  if (
    previousPath &&
    !/^https?:\/\//i.test(
      previousPath,
    ) &&
    previousPath !==
      newPath
  ) {
    const {
      error:
        cleanupError,
    } =
      await supabase
        .storage
        .from(
          AVATAR_BUCKET,
        )
        .remove([
          previousPath,
        ]);


    if (
      cleanupError
    ) {
      console.error(
        "OLD AVATAR CLEANUP ERROR:",
        cleanupError,
      );
    }
  }


  const {
    data:
      publicUrlData,
  } =
    supabase
      .storage
      .from(
        AVATAR_BUCKET,
      )
      .getPublicUrl(
        newPath,
      );


  revalidateProfile();


  return {
    success:
      true,

    message:
      "Avatar actualizado correctamente.",

    avatarUrl:
      publicUrlData
        .publicUrl,
  };
}


/* =========================================================
   DELETE CUSTOM AVATAR
========================================================= */

export async function deleteMyAvatarAction(): Promise<
  ProfileActionResult
> {
  const {
    supabase,
    userId,
    profile,
    error:
      profileError,
  } =
    await getAuthenticatedProfile();


  if (
    profileError ||
    !userId ||
    !profile
  ) {
    return {
      success:
        false,

      message:
        profileError ??
        "No se pudo comprobar tu perfil.",
    };
  }


  const currentPath =
    profile.avatar_url;


  const {
    error:
      databaseError,
  } =
    await supabase.rpc(
      "set_my_avatar",
      {
        p_avatar_path:
          null,
      },
    );


  if (
    databaseError
  ) {
    console.error(
      "REMOVE PROFILE AVATAR ERROR:",
      databaseError,
    );


    return {
      success:
        false,

      message:
        "No se pudo retirar el avatar personalizado.",
    };
  }


  if (
    currentPath &&
    !/^https?:\/\//i.test(
      currentPath,
    ) &&
    currentPath.startsWith(
      `${userId}/`,
    )
  ) {
    const {
      error:
        storageError,
    } =
      await supabase
        .storage
        .from(
          AVATAR_BUCKET,
        )
        .remove([
          currentPath,
        ]);


    if (
      storageError
    ) {
      console.error(
        "DELETE AVATAR STORAGE ERROR:",
        storageError,
      );
    }
  }


  revalidateProfile();


  return {
    success:
      true,

    message:
      "Avatar personalizado eliminado.",
  };
}
