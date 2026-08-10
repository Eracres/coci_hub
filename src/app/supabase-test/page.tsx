import { createClient } from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase = await createClient();

  const { data: recipes, error: selectError } = await supabase
    .from("recipes")
    .select("id, title, status");

  const { data: insertedRecipe, error: insertError } = await supabase
    .from("recipes")
    .insert({
      title: "Intento anónimo",
      slug: "intento-anonimo",
    })
    .select();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">
        Prueba de seguridad Supabase
      </h1>

      <pre className="mt-6 overflow-auto rounded-lg border p-4 text-sm">
        {JSON.stringify(
          {
            publicRecipes: recipes,
            selectError: selectError?.message ?? null,

            insertResult: insertedRecipe,
            insertError: insertError?.message ?? null,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}