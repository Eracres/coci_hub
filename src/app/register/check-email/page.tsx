import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  MailCheck,
} from "lucide-react";

import Link from "next/link";

import {
  cookies,
} from "next/headers";

import {
  PENDING_CONFIRMATION_EMAIL_COOKIE,
} from "@/lib/auth/email-confirmation";

import {
  resendConfirmationAction,
} from "./actions";


type CheckEmailPageProps = {
  searchParams:
    Promise<{
      sent?:
        string;

      error?:
        string;
    }>;
};


function maskEmail(
  email:
    string,
) {
  const [
    localPart,
    domain,
  ] =
    email.split(
      "@",
    );


  if (
    !localPart ||
    !domain
  ) {
    return email;
  }


  if (
    localPart.length <=
    2
  ) {
    return `${localPart[0] ?? "*"}***@${domain}`;
  }


  return `${localPart[0]}***${localPart.at(-1)}@${domain}`;
}


export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const params =
    await searchParams;


  const cookieStore =
    await cookies();


  const pendingEmail =
    cookieStore.get(
      PENDING_CONFIRMATION_EMAIL_COOKIE,
    )
      ?.value
      ?.trim()
      .toLowerCase() ??
    "";


  const resendSucceeded =
    params.sent ===
    "1";


  const confirmationFailed =
    params.error ===
    "invalid-or-expired";


  const resendFailed =
    params.error ===
    "resend-failed";


  const emailRequired =
    params.error ===
    "email-required";


  return (
    <main className="min-h-screen bg-page px-4 py-10 text-foreground">

      <div className="mx-auto w-full max-w-lg">

        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >

          <ArrowLeft
            className="size-4"
            aria-hidden="true"
          />

          Volver a CociHub

        </Link>


        <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">

          <div className="border-b border-border bg-page-muted px-6 py-8 sm:px-8">

            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-brand text-inverse shadow-sm">

              <ChefHat
                className="size-6"
                aria-hidden="true"
              />

            </div>


            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand">
              CociHub
            </p>


            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Revisa tu correo
            </h1>


            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Solo queda confirmar tu
              dirección de correo para
              activar tu cuenta.
            </p>

          </div>


          <div className="px-6 py-8 sm:px-8">

            <div className="flex gap-4 rounded-2xl border border-brand/20 bg-brand/5 p-5">

              <MailCheck
                className="mt-0.5 size-6 shrink-0 text-brand"
                aria-hidden="true"
              />


              <div>

                <p className="font-semibold text-foreground">
                  Te hemos enviado un enlace
                  de confirmación
                </p>


                {pendingEmail && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Correo enviado a{" "}

                    <strong className="font-semibold text-foreground">
                      {
                        maskEmail(
                          pendingEmail,
                        )
                      }
                    </strong>
                  </p>
                )}


                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Abre el correo y pulsa
                  «Confirmar mi cuenta».
                  Después volverás a CociHub
                  con tu sesión iniciada.
                </p>

              </div>

            </div>


            {resendSucceeded && (

              <div
                role="status"
                className="mt-5 flex gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4 text-sm"
              >

                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <p>
                  Hemos enviado un nuevo
                  correo de confirmación.
                </p>

              </div>

            )}


            {confirmationFailed && (

              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >

                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

                <p>
                  El enlace de confirmación
                  no es válido o ha caducado.
                  Solicita uno nuevo.
                </p>

              </div>

            )}


            {resendFailed && (

              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >

                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

                <p>
                  No hemos podido reenviar
                  el correo. Espera unos
                  segundos e inténtalo de
                  nuevo.
                </p>

              </div>

            )}


            {emailRequired && (

              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >

                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

                <p>
                  Introduce el correo con
                  el que creaste tu cuenta.
                </p>

              </div>

            )}


            <div className="mt-7">

              <p className="text-sm font-semibold text-foreground">
                ¿No encuentras el correo?
              </p>


              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Comprueba también las
                carpetas de spam, promociones
                o correo no deseado.
              </p>


              <form
                action={
                  resendConfirmationAction
                }
                className="mt-5 space-y-4"
              >

                {pendingEmail ? (

                  <input
                    type="hidden"
                    name="email"
                    value={
                      pendingEmail
                    }
                  />

                ) : (

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium"
                    >
                      Correo electrónico
                    </label>


                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="tu@email.com"
                      className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />

                  </div>

                )}


                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-5 py-3.5 text-sm font-semibold text-foreground transition hover:bg-page-muted"
                >
                  Reenviar correo de confirmación
                </button>

              </form>

            </div>


            <div className="mt-8 border-t border-border pt-6 text-center">

              <p className="text-sm text-muted-foreground">
                ¿Ya has confirmado tu
                cuenta?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-brand transition hover:text-brand-hover"
                >
                  Iniciar sesión
                </Link>
              </p>

            </div>

          </div>

        </section>


        <p className="mt-6 text-center font-serif text-sm italic text-muted-foreground">
          Comer es un placer,
          cocinar un privilegio,
          enseñar una responsabilidad.
        </p>

      </div>

    </main>
  );
}
