import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import {
  createClient,
} from "@/lib/supabase/server";


export const metadata:
  Metadata = {
  robots: {
    index:
      false,

    follow:
      false,

    noarchive:
      true,

    noimageindex:
      true,

    nosnippet:
      true,
  },
};


export default async function AdminLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  const supabase =
    await createClient();


  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase.auth.getClaims();


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    !userId
  ) {
    redirect(
      "/login",
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
        "role",
      )
      .eq(
        "id",
        userId,
      )
      .single();


  if (
    profileError ||
    !profile ||
    profile.role !==
      "admin"
  ) {
    redirect(
      "/",
    );
  }


  return (
    <>
      {children}
    </>
  );
}