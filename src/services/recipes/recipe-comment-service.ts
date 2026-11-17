import {
  createClient,
} from "@/lib/supabase/server";


export type RecipeComment = {
  id:
    string;

  authorId:
    string;

  authorDisplayName:
    string;

  authorAvatarUrl:
    string | null;

  body:
    string;

  createdAt:
    string;

  updatedAt:
    string;

  isOwn:
    boolean;
};


export type RecipeCommentsResult = {
  comments:
    RecipeComment[];

  isAuthenticated:
    boolean;
};


type RecipeCommentRow = {
  comment_id:
    string;

  author_id:
    string;

  author_display_name:
    string;

  author_avatar_url:
    string | null;

  body:
    string;

  created_at:
    string;

  updated_at:
    string;

  is_own:
    boolean | null;
};


/* =========================================================
   GET COMMENTS
========================================================= */

export async function getRecipeComments(
  recipeId:
    string,
): Promise<RecipeCommentsResult> {
  const supabase =
    await createClient();


  const {
    data:
      claimsData,
  } =
    await supabase.auth.getClaims();


  const isAuthenticated =
    Boolean(
      claimsData
        ?.claims
        ?.sub,
    );


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_recipe_comments",
      {
        p_recipe_id:
          recipeId,
      },
    );


  if (
    error
  ) {
    console.error(
      "GET RECIPE COMMENTS ERROR:",
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
    ) as RecipeCommentRow[];


  return {
    comments:
      rows.map(
        (
          row,
        ) => ({
          id:
            row.comment_id,

          authorId:
            row.author_id,

          authorDisplayName:
            row.author_display_name,

          authorAvatarUrl:
            row.author_avatar_url,

          body:
            row.body,

          createdAt:
            row.created_at,

          updatedAt:
            row.updated_at,

          isOwn:
            Boolean(
              row.is_own,
            ),
        }),
      ),

    isAuthenticated,
  };
}


/* =========================================================
   ADD COMMENT
========================================================= */

export async function addRecipeComment(
  recipeId:
    string,

  body:
    string,
) {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "add_recipe_comment",
      {
        p_recipe_id:
          recipeId,

        p_body:
          body,
      },
    );


  if (
    error
  ) {
    throw error;
  }


  return data as string;
}


/* =========================================================
   UPDATE COMMENT
========================================================= */

export async function updateRecipeComment(
  commentId:
    string,

  body:
    string,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "update_recipe_comment",
      {
        p_comment_id:
          commentId,

        p_body:
          body,
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

export async function deleteRecipeComment(
  commentId:
    string,
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "delete_recipe_comment",
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
