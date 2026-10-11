import "server-only";

import {
  Resend,
} from "resend";


let resendClient:
  Resend | null =
    null;


/* =========================================================
   RESEND CLIENT
========================================================= */

export function getResendClient() {
  const apiKey =
    process.env
      .RESEND_API_KEY
      ?.trim();


  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not configured.",
    );
  }


  if (!resendClient) {
    resendClient =
      new Resend(
        apiKey,
      );
  }


  return resendClient;
}


/* =========================================================
   TRANSACTIONAL EMAIL SENDER
========================================================= */

export function getTransactionalEmailSender() {
  const sender =
    process.env
      .COCIHUB_EMAIL_FROM
      ?.trim();


  if (!sender) {
    throw new Error(
      "COCIHUB_EMAIL_FROM is not configured.",
    );
  }


  return sender;
}
