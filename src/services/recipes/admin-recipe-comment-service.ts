import {
  createClient,
} from "@/lib/supabase/server";


const RECIPE_COMMENT_IMAGES_BUCKET =
  "recipe-comment-images";

const COMMENT_IMAGE_URL_TTL_SECONDS =
  60 * 60;


export type AdminRecipeCommentImage = {
  path:
    string;

  url:
    string;
};


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

  images:
    AdminRecipeCommentImage[];

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


export type DeleteAdminRecipeCommentResult = {
  deletedImageCount:
    number;

  storageCleanupFailed:
    boolean;
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

  image_paths:
    string[] | null;

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

export async function getAdminRecipeComments():
  Promise<AdminRecipeComment[]> {
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


  const imagePaths =
    Array.from(
      new Set(
        rows.flatMap(
          (
            row,
          ) =>
            row.image_paths ??
            [],
        ),
      ),
    );


  const signedUrlByPath =
    new Map<
      string,
      string
    >();


  if (
    imagePaths.length >
    0
  ) {
    const {
      data:
        signedImages,

      error:
        signedImagesError,
    } =
      await supabase.storage
        .from(
          RECIPE_COMMENT_IMAGES_BUCKET,
        )
        .createSignedUrls(
          imagePaths,
          COMMENT_IMAGE_URL_TTL_SECONDS,
        );


    if (
      signedImagesError
    ) {
      console.error(
        "GET ADMIN RECIPE COMMENT IMAGE URLS ERROR:",
        signedImagesError,
      );
    } else {
      signedImages?.forEach(
        (
          image,
        ) => {
          if (
            image.path &&
            image.signedUrl
          ) {
            signedUrlByPath.set(
              image.path,
              image.signedUrl,
            );
          }
        },
      );
    }
  }


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

      images:
        (
          row.image_paths ??
          []
        )
          .map(
            (
              path,
            ) => {
              const url =
                signedUrlByPath.get(
                  path,
                );


              if (
                !url
              ) {
                return null;
              }


              return {
                path,
                url,
              };
            },
          )
          .filter(
            (
              image,
            ): image is AdminRecipeCommentImage =>
              image !==
              null,
          ),

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
   DELETE COMMENT + STORAGE IMAGES
========================================================= */

export async function deleteAdminRecipeComment(
  commentId:
    string,
): Promise<DeleteAdminRecipeCommentResult> {
  const supabase =
    await createClient();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "admin_delete_recipe_comment_with_images",
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


  const imagePaths =
    Array.isArray(
      data,
    )
      ? (
          data as string[]
        )
      : [];


  if (
    imagePaths.length ===
    0
  ) {
    return {
      deletedImageCount:
        0,

      storageCleanupFailed:
        false,
    };
  }


  const {
    error:
      storageError,
  } =
    await supabase.storage
      .from(
        RECIPE_COMMENT_IMAGES_BUCKET,
      )
      .remove(
        imagePaths,
      );


  if (
    storageError
  ) {
    console.error(
      "DELETE ADMIN RECIPE COMMENT IMAGES ERROR:",
      storageError,
    );


    return {
      deletedImageCount:
        imagePaths.length,

      storageCleanupFailed:
        true,
    };
  }


  return {
    deletedImageCount:
      imagePaths.length,

    storageCleanupFailed:
      false,
  };
}