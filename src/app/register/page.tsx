import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  UserPlus,
} from "lucide-react";

import Link from "next/link";

import {
  register,
} from "./actions";


type RegisterPageProps = {
  searchParams:
    Promise<{
      error?:
        string;

      success?:
        string;
    }>;
};


const errorMessages:
  Record<
    string,
    string
  > = {
  "invalid-data":
    "Revisa los datos del formulario e inténtalo de nuevo.",

  "password-mismatch":
    "Las contraseñas no coinciden.",

  "username-unavailable":
    "Ese nombre de usuario no está disponible. Prueba con otro.",

  "registration-unavailable":
    "No hemos podido comprobar el nombre de usuario. Inténtalo de nuevo.",

  "signup-failed":
    "No hemos podido crear la cuenta. Comprueba los datos o inténtalo de nuevo más tarde.",
};


export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params =
    await searchParams;


  const errorMessage =
    params.error
      ? errorMessages[
          params.error
        ] ??
        "No hemos podido completar el registro."
      : null;


  const accountCreated =
    params.success ===
    "created";


  const checkEmail =
    params.success ===
    "check-email";


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
              Crea tu cuenta
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Guarda tus recetas,
              compártelas con la
              comunidad y construye
              tu propio rincón dentro
              de CociHub.
            </p>
          </div>


          <div className="px-6 py-8 sm:px-8">

            {errorMessage && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <AlertCircle
                  className="mt-0.5 size-5 shrink-0"
                  aria-hidden="true"
                />

                <p>
                  {errorMessage}
                </p>
              </div>
            )}


            {accountCreated && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-border bg-page-muted p-4 text-sm">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-semibold">
                    ¡Cuenta creada!
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    Tu cuenta se ha
                    creado correctamente
                    y tu sesión está
                    activa.
                  </p>
                </div>
              </div>
            )}


            {checkEmail && (
              <div className="mb-6 flex gap-3 rounded-2xl border border-border bg-page-muted p-4 text-sm">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-brand"
                  aria-hidden="true"
                />

                <div>
                  <p className="font-semibold">
                    Revisa tu correo
                  </p>

                  <p className="mt-1 text-muted-foreground">
                    Hemos creado tu
                    cuenta. Confirma tu
                    dirección de correo
                    antes de iniciar
                    sesión.
                  </p>
                </div>
              </div>
            )}


            {!accountCreated &&
              !checkEmail && (
                <form
                  action={
                    register
                  }
                  className="space-y-5"
                >

                  <div>
                    <label
                      htmlFor="displayName"
                      className="mb-2 block text-sm font-medium"
                    >
                      Nombre visible
                    </label>

                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      placeholder="Por ejemplo, Sergio"
                      className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Opcional. Es el
                      nombre que podremos
                      mostrar junto a tus
                      recetas.
                    </p>
                  </div>


                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-medium"
                    >
                      Nombre de usuario
                    </label>

                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                      minLength={3}
                      maxLength={30}
                      pattern="[A-Za-z0-9_]{3,30}"
                      placeholder="sergio_cocina"
                      className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Entre 3 y 30
                      caracteres. Letras,
                      números y guion bajo.
                      Se guardará en
                      minúsculas.
                    </p>
                  </div>


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


                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium"
                    >
                      Contraseña
                    </label>

                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={72}
                      className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />

                    <p className="mt-2 text-xs text-muted-foreground">
                      Utiliza al menos
                      8 caracteres.
                    </p>
                  </div>


                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium"
                    >
                      Repite la contraseña
                    </label>

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={72}
                      className="w-full rounded-xl border border-border bg-page px-4 py-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15"
                    />
                  </div>


                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover"
                  >
                    <UserPlus
                      className="size-5"
                      aria-hidden="true"
                    />

                    Crear mi cuenta
                  </button>


                  <p className="text-center text-xs leading-5 text-muted-foreground">
                    Al crear tu cuenta
                    aceptas las normas
                    de CociHub y nuestra{" "}

                    <Link
                      href="/privacy"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      política de privacidad
                    </Link>

                    .
                  </p>
                </form>
              )}


            <div className="mt-8 border-t border-border pt-6 text-center">
              <p className="text-sm text-muted-foreground">
                ¿Ya tienes una cuenta?{" "}

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
