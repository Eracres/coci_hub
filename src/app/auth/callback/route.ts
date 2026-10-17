import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";


export async function GET(
  request:
    Request,
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


  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=oauth-callback`,
    );
  }


  const supabase =
    await createClient();


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


  if (
    !profile.username
  ) {
    return NextResponse.redirect(
      `${origin}/complete-profile`,
    );
  }


  if (
    profile.role ===
    "admin"
  ) {
    return NextResponse.redirect(
      `${origin}/admin`,
    );
  }


  return NextResponse.redirect(
    `${origin}/mi-cocihub`,
  );
}