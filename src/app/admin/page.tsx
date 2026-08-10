import { logout } from "./actions";

export default function AdminPage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        CociHub Admin
      </h1>

      <p className="mt-4">
        Acceso administrativo correcto.
      </p>

      <form
        action={logout}
        className="mt-8"
      >
        <button
          type="submit"
          className="rounded-lg border px-4 py-2"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}