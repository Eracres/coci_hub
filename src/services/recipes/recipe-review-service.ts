import {
  createClient,
} from "@/lib/supabase/server";


export type AdminRecipeReviewStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "archived";


export type AdminRecipeReviewInfo = {
  id:
    string;

  status:
    AdminRecipeReviewStatus;

  submitted_at:
    string | null;

  reviewed_at:
    string | null;

  reviewed_by:
    string | null;

  review_notes:
    string | null;
};


/* =========================================================
   GET ADMIN REVIEW INFO
========================================================= */

export async function getAdminRecipeReviewInfo(
  recipeId:
    string,
): Promise<
  AdminRecipeReviewInfo | null
> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase
      .from(
        "recipes",
      )
      .select(`
        id,
        status,
        submitted_at,
        reviewed_at,
        reviewed_by,
        review_notes
      `)
      .eq(
        "id",
        recipeId,
      )
      .maybeSingle();


  if (
    error
  ) {
    throw new Error(
      `No se pudo obtener la información de revisión: ${error.message}`,
    );
  }


  return (
    data as
      AdminRecipeReviewInfo | null
  );
}
