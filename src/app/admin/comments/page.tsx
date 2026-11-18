import {
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import {
  AdminRecipeCommentsPanel,
} from "@/components/admin/comments/admin-recipe-comments-panel";

import {
  getAdminRecipeComments,
} from "@/services/recipes/admin-recipe-comment-service";


export default async function AdminCommentsPage() {
  const comments =
    await getAdminRecipeComments();


  return (
    <main className="mx-auto max-w-6xl p-6 md:p-8">
      <header className="max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ShieldCheck
              className="size-5"
              aria-hidden="true"
            />
          </span>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand">
              Moderación
            </p>

            <h1 className="mt-1 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Comentarios
            </h1>
          </div>
        </div>


        <p className="mt-5 text-sm leading-7 text-muted-foreground md:text-base">
          Revisa los comentarios publicados por la comunidad. Puedes ocultarlos temporalmente, restaurarlos o eliminarlos definitivamente.
        </p>
      </header>


      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border bg-page-muted/50 px-4 py-3 text-sm text-muted-foreground">
        <MessageCircle
          className="size-4 shrink-0 text-brand"
          aria-hidden="true"
        />

        Los comentarios ocultos dejan de aparecer inmediatamente en la receta pública, pero se conservan para poder restaurarlos.
      </div>


      <AdminRecipeCommentsPanel
        comments={
          comments
        }
      />
    </main>
  );
}

