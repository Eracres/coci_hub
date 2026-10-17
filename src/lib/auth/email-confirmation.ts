import "server-only";

import {
  headers,
} from "next/headers";


export const PENDING_CONFIRMATION_EMAIL_COOKIE =
  "cocihub_pending_confirmation_email";


function isLocalHost(
  host:
    string,
) {
  return (
    host.startsWith(
      "localhost",
    ) ||
    host.startsWith(
      "127.0.0.1",
    )
  );
}


export async function getAppOrigin() {
  const headerStore =
    await headers();


  const origin =
    headerStore.get(
      "origin",
    );


  if (origin) {
    return origin;
  }


  const host =
    headerStore.get(
      "x-forwarded-host",
    ) ??
    headerStore.get(
      "host",
    );


  if (!host) {
    return (
      process.env
        .NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000"
    );
  }


  const forwardedProtocol =
    headerStore.get(
      "x-forwarded-proto",
    );


  const protocol =
    forwardedProtocol ??
    (
      isLocalHost(
        host,
      )
        ? "http"
        : "https"
    );


  return `${protocol}://${host}`;
}


export async function getEmailConfirmationRedirectUrl() {
  const origin =
    await getAppOrigin();


  return `${origin}/auth/confirm`;
}
