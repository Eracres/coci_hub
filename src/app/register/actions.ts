"use server";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  registerSchema,
} from "@/schemas/register-schema";


export async function register(
  formData: FormData,
): Promise<void> {
  const parsed =
    registerSchema.safeParse({
      displayName:
        formData.get(
          "displayName",
        ),

      username:
        formData.get(
          "username",
        ),

      email:
        formData.get(
          "email",
        ),

      password:
        formData.get(
          "password",
        ),

      confirmPassword:
        formData.get(
          "confirmPassword",
        ),
    });


  if (!parsed.success) {
    const passwordMismatch =
      parsed.error.issues.some(
        (issue) =>
          issue.path[0] ===
            "confirmPassword" &&
          issue.message ===
            "Las contraseñas no coinciden.",
      );


    if (passwordMismatch) {
      redirect(
        "/register?error=password-mismatch",
      );
    }


    redirect(
      "/register?error=invalid-data",
    );
  }


  const {
    displayName,
    username,
    email,
    password,
  } =
    parsed.data;


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
    redirect(
      "/register?error=registration-unavailable",
    );
  }


  if (
    usernameAvailable !==
    true
  ) {
    redirect(
      "/register?error=username-unavailable",
    );
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
    redirect(
      "/register?error=signup-failed",
    );
  }


  // =======================================================
  // REGISTRATION RESULT
  // =======================================================
  //
  // Depending on the Supabase Auth configuration,
  // registration can either:
  //
  //   1. create a session immediately, or
  //   2. require email confirmation first.
  //
  // We support both cases.
  // =======================================================

  if (signUpData.session) {
    redirect(
      "/register?success=created",
    );
  }


  redirect(
    "/register?success=check-email",
  );
}
