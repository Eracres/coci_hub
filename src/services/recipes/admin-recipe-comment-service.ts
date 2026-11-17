import {
  createClient,
} from "@/lib/supabase/server";


export type AdminRecipeComment = {
  id:
    string;

  recipeId:
    string;

  recipeTitle:
    string;

  recipeSlug:
    string;

  authorId:
    string;

  authorDisplayName:
    string;

  authorAvatarUrl:
    string | null;

  body:
    string;

  isHidden:
    boolean;

  hiddenAt:
    string | null;

  hiddenBy:
    string | null;

  hiddenByDisplayName:
    string | null;

  createdAt:
    string;

  updatedAt:
    string;
};


type AdminRecipeCommentRow = {
  comment_id:
    string;

  recipe_id:
    string;

  recipe_title:
    string;

  recipe_slug:
    string;

  author_id:
    string;

  author_display_name:
    string;

  author_avatar_url:
    string | null;

  body:
    string;

  is_hidden:
    boolean;

  hidden_at:
    string | null;

  hidden_by:
    string | null;

  hidden_by_display_name:
    string | null;

  created_at:
    string;

  updated_at:
    string;
};


/* =========================================================
   GET ADMIN COMMENTS
========================================================= */

export async function getAdminRecipeComments(): Promise<
  AdminRecipeComment[]
> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_admin_recipe_comments",
    );


  if (
    error
  ) {
    console.error(
      "GET ADMIN RECIPE COMMENTS ERROR:",
      error,
    );


    throw new Error(
      "No se pudieron cargar los comentarios.",
    );
  }


  const rows =
    (
      data ??
      []
    ) as AdminRecipeCommentRow[];


  return rows.map(
    (
      row,
    ) => ({
      id:
        row.comment_id,

      recipeId:
        row.recipe_id,

      recipeTitle:
        row.recipe_title,

      recipeSlug:
        row.recipe_slug,

      authorId:
        row.author_id,

      authorDisplayName:
        row.author_display_name,

      authorAvatarUrl:
        row.author_avatar_url,

      body:
        row.body,

      isHidden:
        row.is_hidden,

      hiddenAt:
        row.hidden_at,

      hiddenBy:
        row.hidden_by,

      hiddenByDisplayName:
        row.hidden_by_display_name,

      createdAt:
        row.created_at,

      updatedAt:
        row.updated_at,
    }),
  );
}


/* =========================================================
   HIDE / RESTORE COMMENT
========================================================= */

export async function setAdminRecipeCommentHidden(
  commentId:
    string,

  hidden:
    boolean,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "admin_set_recipe_comment_hidden",
      {
        p_comment_id:
          commentId,

        p_hidden:
          hidden,
      },
    );


  if (
    error
  ) {
    throw error;
  }
}


/* =========================================================
   DELETE COMMENT
========================================================= */

export async function deleteAdminRecipeComment(
  commentId:
    string,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "admin_delete_recipe_comment",
      {
        p_comment_id:
          commentId,
      },
    );


  if (
    error
  ) {
    throw error;
  }
}
