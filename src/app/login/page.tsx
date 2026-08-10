import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-md rounded-2xl border p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Administración
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Accede al panel de administración de CociHub.
          </p>
        </div>

        <form action={login} className="space-y-6">
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
              className="w-full rounded-lg border px-3 py-2"
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
              autoComplete="current-password"
              required
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-3 text-white"
          >
            Iniciar sesión
          </button>
        </form>
      </section>
    </main>
  );
}
