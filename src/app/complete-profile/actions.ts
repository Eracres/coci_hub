"use server";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export type CompleteProfileState = {
  status:
    | "idle"
    | "error";

  message:
    string | null;

  username:
    string;
};


function normalizeUsername(
  value: FormDataEntryValue | null,
) {
  if (
    typeof value !==
    "string"
  ) {
    return "";
  }


  return value
    .trim()
    .toLowerCase();
}


export async function completeProfile(
  previousState:
    CompleteProfileState,

  formData:
    FormData,
): Promise<CompleteProfileState> {

  const username =
    normalizeUsername(
      formData.get(
        "username",
      ),
    );


  // =======================================================
  // BASIC VALIDATION
  // =======================================================

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

      username,
    };
  }


  const supabase =
    await createClient();


  // =======================================================
  // AUTHENTICATION
  // =======================================================

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
    redirect(
      "/login?error=session-required",
    );
  }


  // =======================================================
  // USERNAME AVAILABILITY
  // =======================================================

  const {
    data:
      usernameAvailable,

    error:
      usernameError,
  } =
    await supabase.rpc(
      "is_username_available",
      {
        p_username:
          username,
      },
    );


  if (usernameError) {
    return {
      status:
        "error",

      message:
        "No hemos podido comprobar el nombre de usuario. Inténtalo de nuevo.",

      username,
    };
  }


  if (
    usernameAvailable !==
    true
  ) {
    return {
      status:
        "error",

      message:
        "Ese nombre de usuario no está disponible. Prueba con otro.",

      username,
    };
  }


  // =======================================================
  // COMPLETE PROFILE
  // =======================================================

  const {
    error:
      completeError,
  } =
    await supabase.rpc(
      "complete_my_profile",
      {
        p_username:
          username,

        p_display_name:
          null,
      },
    );


  if (completeError) {
    if (
      completeError.code ===
      "23505"
    ) {
      return {
        status:
          "error",

        message:
          "Ese nombre de usuario acaba de ser utilizado. Prueba con otro.",

        username,
      };
    }


    return {
      status:
        "error",

      message:
        "No hemos podido completar tu perfil. Inténtalo de nuevo.",

      username,
    };
  }


  redirect(
    "/",
  );
}
