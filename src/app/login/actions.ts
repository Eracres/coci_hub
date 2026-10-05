"use server";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export type LoginState = {
  status:
    | "idle"
    | "error";

  message:
    string | null;

  email:
    string;
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


export async function login(
  previousState:
    LoginState,

  formData:
    FormData,
): Promise<LoginState> {

  const email =
    getFormValue(
      formData,
      "email",
    )
      .trim()
      .toLowerCase();


  const password =
    getFormValue(
      formData,
      "password",
    );


  // =======================================================
  // BASIC VALIDATION
  // =======================================================

  if (
    !email ||
    !password
  ) {
    return {
      status:
        "error",

      message:
        "Introduce tu correo electrónico y tu contraseña.",

      email,
    };
  }


  const supabase =
    await createClient();


  // =======================================================
  // SUPABASE AUTH
  // =======================================================

  const {
    error:
      loginError,
  } =
    await supabase
      .auth
      .signInWithPassword({
        email,

        password,
      });


  if (loginError) {
    if (
      loginError.code ===
      "email_not_confirmed"
    ) {
      return {
        status:
          "error",

        message:
          "Debes confirmar tu correo electrónico antes de iniciar sesión.",

        email,
      };
    }


    return {
      status:
        "error",

      message:
        "El correo electrónico o la contraseña no son correctos.",

      email,
    };
  }


  // =======================================================
  // AUTHENTICATED USER
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
    return {
      status:
        "error",

      message:
        "No hemos podido iniciar tu sesión. Inténtalo de nuevo.",

      email,
    };
  }


  // =======================================================
  // COCIHUB PROFILE
  // =======================================================

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
      .select(
        "username, role",
      )
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    profileError ||
    !profile
  ) {
    await supabase
      .auth
      .signOut();


    return {
      status:
        "error",

      message:
        "No hemos podido encontrar tu perfil de CociHub.",

      email,
    };
  }


  // =======================================================
  // INCOMPLETE PROFILE
  // =======================================================

  if (
    !profile.username
  ) {
    redirect(
      "/complete-profile",
    );
  }


  // =======================================================
  // ROLE DESTINATION
  // =======================================================

  if (
    profile.role ===
    "admin"
  ) {
    redirect(
      "/admin",
    );
  }


  // /mi-cocihub will replace this destination when
  // the personal area is implemented.

  redirect(
    "/",
  );
}