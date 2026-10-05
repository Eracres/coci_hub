"use server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  registerSchema,
} from "@/schemas/register-schema";


type RegisterValues = {
  displayName:
    string;

  username:
    string;

  email:
    string;
};


export type RegisterState = {
  status:
    | "idle"
    | "error"
    | "success";

  message:
    string | null;

  values:
    RegisterValues;

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


export async function register(
  previousState:
    RegisterState,

  formData:
    FormData,
): Promise<RegisterState> {

  const rawValues:
    RegisterValues = {
    displayName:
      getFormValue(
        formData,
        "displayName",
      ),

    username:
      getFormValue(
        formData,
        "username",
      ),

    email:
      getFormValue(
        formData,
        "email",
      ),
  };


  const parsed =
    registerSchema.safeParse({
      ...rawValues,

      password:
        getFormValue(
          formData,
          "password",
        ),

      confirmPassword:
        getFormValue(
          formData,
          "confirmPassword",
        ),
    });


  const attempt =
    previousState.attempt +
    1;


  if (!parsed.success) {
    const firstIssue =
      parsed.error
        .issues[0];


    return {
      status:
        "error",

      message:
        firstIssue
          ?.message ??
        "Revisa los datos del formulario e inténtalo de nuevo.",

      values:
        rawValues,

      attempt,
    };
  }


  const {
    displayName,
    username,
    email,
    password,
  } =
    parsed.data;


  const safeValues:
    RegisterValues = {
    displayName:
      displayName ??
      "",

    username,

    email,
  };


  const supabase =
    await createClient();


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

      values:
        safeValues,

      attempt,
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

      values:
        safeValues,

      attempt,
    };
  }


  // =======================================================
  // SUPABASE AUTH REGISTRATION
  // =======================================================

  const {
    data:
      signUpData,

    error:
      signUpError,
  } =
    await supabase.auth.signUp({
      email,

      password,

      options: {
        data: {
          username,

          display_name:
            displayName ??
            username,
        },
      },
    });


  if (signUpError) {
    return {
      status:
        "error",

      message:
        "No hemos podido crear la cuenta. Comprueba los datos o inténtalo de nuevo más tarde.",

      values:
        safeValues,

      attempt,
    };
  }


  // =======================================================
  // SUCCESS
  // =======================================================

  if (
    signUpData.session
  ) {
    return {
      status:
        "success",

      message:
        "Tu cuenta se ha creado correctamente y tu sesión ya está activa.",

      values: {
        displayName:
          "",

        username:
          "",

        email:
          "",
      },

      attempt,
    };
  }


  return {
    status:
      "success",

    message:
      "Te hemos enviado un correo de confirmación. Abre el enlace para activar tu cuenta antes de iniciar sesión.",

    values: {
      displayName:
        "",

      username:
        "",

      email:
        "",
    },

    attempt,
  };
}