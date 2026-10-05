import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";


export async function GET(
  request: Request,
) {
  const requestUrl =
    new URL(
      request.url,
    );


  const code =
    requestUrl
      .searchParams
      .get(
        "code",
      );


  const origin =
    requestUrl
      .origin;


  // =======================================================
  // MISSING OAUTH CODE
  // =======================================================
  //
  // If somebody visits /auth/callback manually,
  // there is no OAuth code to exchange.
  //
  // In that case we simply return them to the login page.
  // =======================================================

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth-callback`,
    );
  }


  const supabase =
    await createClient();


  // =======================================================
  // EXCHANGE OAUTH CODE FOR SESSION
  // =======================================================

  const {
    error:
      exchangeError,
  } =
    await supabase
      .auth
      .exchangeCodeForSession(
        code,
      );


  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth-failed`,
    );
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
    return NextResponse.redirect(
      `${origin}/login?error=oauth-session`,
    );
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
    return NextResponse.redirect(
      `${origin}/login?error=profile-missing`,
    );
  }


  // =======================================================
  // INCOMPLETE OAUTH PROFILE
  // =======================================================

  if (
    !profile.username
  ) {
    return NextResponse.redirect(
      `${origin}/complete-profile`,
    );
  }


  // =======================================================
  // COMPLETE PROFILE
  // =======================================================
  //
  // Admin users return to the administration panel.
  //
  // Normal users will eventually go to /mi-cocihub.
  // Until that area exists, we return them to the homepage.
  // =======================================================

  if (
    profile.role ===
    "admin"
  ) {
    return NextResponse.redirect(
      `${origin}/admin`,
    );
  }


  return NextResponse.redirect(
    `${origin}/`,
  );
}
