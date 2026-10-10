import type {
  EmailOtpType,
} from "@supabase/supabase-js";

import {
  cookies,
} from "next/headers";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  PENDING_CONFIRMATION_EMAIL_COOKIE,
} from "@/lib/auth/email-confirmation";

import {
  createClient,
} from "@/lib/supabase/server";


function getHomeUrl(
  request:
    NextRequest,
) {
  const url =
    request.nextUrl.clone();


  url.pathname =
    "/";


  url.search =
    "";


  return url;
}


function getConfirmationErrorUrl(
  request:
    NextRequest,
) {
  const url =
    request.nextUrl.clone();


  url.pathname =
    "/register/check-email";


  url.search =
    "?error=invalid-or-expired";


  return url;
}


async function clearPendingConfirmationEmail() {
  const cookieStore =
    await cookies();


  cookieStore.delete(
    PENDING_CONFIRMATION_EMAIL_COOKIE,
  );
}


export async function GET(
  request:
    NextRequest,
) {
  const tokenHash =
    request.nextUrl
      .searchParams
      .get(
        "token_hash",
      );


  const type =
    request.nextUrl
      .searchParams
      .get(
        "type",
      ) as
        EmailOtpType |
        null;


  const supabase =
    await createClient();


  // =======================================================
  // MALFORMED LINK
  // =======================================================

  if (
    !tokenHash ||
    !type
  ) {
    const {
      data:
        claimsData,
    } =
      await supabase.auth
        .getClaims();


    /*
     * Si el usuario ya está autenticado,
     * un enlace antiguo o incompleto no necesita
     * mostrar ningún error.
     */

    if (
      claimsData
        ?.claims
        ?.sub
    ) {
      await clearPendingConfirmationEmail();


      return NextResponse.redirect(
        getHomeUrl(
          request,
        ),
      );
    }


    return NextResponse.redirect(
      getConfirmationErrorUrl(
        request,
      ),
    );
  }


  // =======================================================
  // VERIFY EMAIL TOKEN
  // =======================================================

  const {
    error:
      verificationError,
  } =
    await supabase.auth
      .verifyOtp({
        type,

        token_hash:
          tokenHash,
      });


  // =======================================================
  // SUCCESS
  // =======================================================

  if (
    !verificationError
  ) {
    await clearPendingConfirmationEmail();


    return NextResponse.redirect(
      getHomeUrl(
        request,
      ),
    );
  }


  console.error(
    "EMAIL CONFIRMATION ERROR:",
    verificationError,
  );


  // =======================================================
  // TOKEN ALREADY USED BUT SESSION EXISTS
  // =======================================================
  //
  // Un enlace de confirmación es de un solo uso.
  //
  // Si el usuario vuelve a pulsarlo después de haber
  // confirmado correctamente su cuenta, verifyOtp()
  // fallará porque el token ya está consumido.
  //
  // Pero si CociHub ya tiene una sesión válida,
  // no mostramos un falso error de confirmación.
  // =======================================================

  const {
    data:
      claimsData,
  } =
    await supabase.auth
      .getClaims();


  if (
    claimsData
      ?.claims
      ?.sub
  ) {
    await clearPendingConfirmationEmail();


    return NextResponse.redirect(
      getHomeUrl(
        request,
      ),
    );
  }


  // =======================================================
  // REAL INVALID / EXPIRED LINK
  // =======================================================

  return NextResponse.redirect(
    getConfirmationErrorUrl(
      request,
    ),
  );
}