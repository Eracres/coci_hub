"use server";

import {
  cookies,
} from "next/headers";

import {
  redirect,
} from "next/navigation";

import {
  getEmailConfirmationRedirectUrl,
  PENDING_CONFIRMATION_EMAIL_COOKIE,
} from "@/lib/auth/email-confirmation";

import {
  createClient,
} from "@/lib/supabase/server";


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


export async function resendConfirmationAction(
  formData:
    FormData,
) {
  const cookieStore =
    await cookies();


  const cookieEmail =
    cookieStore.get(
      PENDING_CONFIRMATION_EMAIL_COOKIE,
    )
      ?.value
      ?.trim()
      .toLowerCase() ??
    "";


  const submittedEmail =
    getFormValue(
      formData,
      "email",
    )
      .trim()
      .toLowerCase();


  const email =
    submittedEmail ||
    cookieEmail;


  if (
    !email ||
    !email.includes(
      "@",
    )
  ) {
    redirect(
      "/register/check-email?error=email-required",
    );
  }


  const confirmationRedirectUrl =
    await getEmailConfirmationRedirectUrl();


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.auth.resend({
      type:
        "signup",

      email,

      options: {
        emailRedirectTo:
          confirmationRedirectUrl,
      },
    });


  if (error) {
    console.error(
      "RESEND CONFIRMATION EMAIL ERROR:",
      error,
    );


    redirect(
      "/register/check-email?error=resend-failed",
    );
  }


  cookieStore.set(
    PENDING_CONFIRMATION_EMAIL_COOKIE,
    email,
    {
      httpOnly:
        true,

      sameSite:
        "lax",

      secure:
        process.env
          .NODE_ENV ===
        "production",

      path:
        "/",

      maxAge:
        60 *
        60 *
        24,
    },
  );


  redirect(
    "/register/check-email?sent=1",
  );
}
