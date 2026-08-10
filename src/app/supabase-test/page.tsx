import {
  createClient,
} from "@/lib/supabase/server";

export default async function SupabaseTestPage() {
  const supabase =
    await createClient();

  const {
    data: recipeTypes,
    error: recipeTypesError,
  } =
    await supabase
      .from("recipe_types")
      .select("*")
      .order("position");

  const {
    data: allergens,
    error: allergensError,
  } =
    await supabase
      .from("allergens")
      .select("*")
      .order("position");

  return (
    <main className="p-8">
      <h1 className="font-serif text-3xl font-bold">
        Supabase Test
      </h1>

      <pre className="mt-6 overflow-auto rounded-lg border border-border bg-surface p-4 text-sm">
        {JSON.stringify(
          {
            recipeTypes,
            recipeTypesError:
              recipeTypesError?.message ??
              null,

            allergens,
            allergensError:
              allergensError?.message ??
              null,
          },
          null,
          2,
        )}
      </pre>
    </main>
  );
}