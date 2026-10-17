"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  createClient,
} from "@/lib/supabase/server";


export type ProfileState = {
  status:
    | "idle"
    | "success"
    | "error";

  message:
    string | null;

  values: {
    displayName:
      string;

    username:
      string;
  };

  attempt:
    number;
};


function getFormValue(
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


export async function updateProfile(
  previousState:
    ProfileState,

  formData:
    FormData,
): Promise<ProfileState> {

  const displayName =
    getFormValue(
      formData,
      "displayName",
    )
      .trim();


  const username =
    getFormValue(
      formData,
      "username",
    )
      .trim()
      .toLowerCase();


  const nextAttempt =
    previousState.attempt +
    1;


  const values = {
    displayName,
    username,
  };


  // =======================================================
  // BASIC VALIDATION
  // =======================================================

  if (
    displayName.length >
    120
  ) {
    return {
      status:
        "error",

      message:
        "El nombre visible no puede superar los 120 caracteres.",

      values,

      attempt:
        nextAttempt,
    };
  }


  if (
    !/^[a-z0-9_]{3,30}$/.test(
      username,
    )
  ) {
    return {
      status:
        "error",

      message:
        "El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números y guiones bajos.",

      values,

      attempt:
        nextAttempt,
    };
  }


  // =======================================================
  // AUTHENTICATION
  // =======================================================

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
      status:
        "error",

      message:
        "Tu sesión ya no es válida. Vuelve a iniciar sesión.",

      values,

      attempt:
        nextAttempt,
    };
  }


  // =======================================================
  // CONTROLLED PROFILE UPDATE
  // =======================================================

  const {
    error:
      updateError,
  } =
    await supabase.rpc(
      "update_my_profile",
      {
        p_display_name:
          displayName ||
          null,

        p_username:
          username,
      },
    );


  if (updateError) {

    if (
      updateError.code ===
      "23505"
    ) {
      return {
        status:
          "error",

        message:
          "Ese nombre de usuario ya está siendo utilizado. Prueba con otro.",

        values,

        attempt:
          nextAttempt,
      };
    }


    if (
      updateError.code ===
      "22023"
    ) {
      if (
        updateError.message
          .toLowerCase()
          .includes(
            "reserved",
          )
      ) {
        return {
          status:
            "error",

          message:
            "Ese nombre de usuario está reservado por CociHub. Elige otro.",

          values,

          attempt:
            nextAttempt,
        };
      }


      return {
        status:
          "error",

        message:
          "El nombre de usuario no tiene un formato válido.",

        values,

        attempt:
          nextAttempt,
      };
    }


    if (
      updateError.code ===
      "42501"
    ) {
      return {
        status:
          "error",

        message:
          "No tienes permiso para modificar este perfil.",

        values,

        attempt:
          nextAttempt,
      };
    }


    return {
      status:
        "error",

      message:
        "No hemos podido guardar los cambios. Inténtalo de nuevo.",

      values,

      attempt:
        nextAttempt,
    };
  }


  // =======================================================
  // REFRESH SERVER DATA
  // =======================================================

  revalidatePath(
    "/mi-cocihub",
  );

  revalidatePath(
    "/mi-cocihub/perfil",
  );


  return {
    status:
      "success",

    message:
      "Tu perfil se ha actualizado correctamente.",

    values,

    attempt:
      nextAttempt,
  };
}
