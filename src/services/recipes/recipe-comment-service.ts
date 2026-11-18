import {
  createClient,
} from "@/lib/supabase/server";


const RECIPE_COMMENT_IMAGES_BUCKET =
  "recipe-comment-images";

const COMMENT_IMAGE_URL_TTL_SECONDS =
  60 * 60;


export type RecipeCommentImage = {
  path:
    string;

  url:
    string;
};


export type RecipeCommentImageUpload = {
  path:
    string;

  token:
    string;
};


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

  images:
    RecipeCommentImage[];

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

  image_paths:
    string[];

  created_at:
    string;

  updated_at:
    string;

  is_own:
    boolean | null;
};


function getImageExtension(
  mimeType:
    string,
) {
  switch (
    mimeType
  ) {
    case "image/jpeg":
      return "jpg";

    case "image/png":
      return "png";

    case "image/webp":
      return "webp";

    default:
      return null;
  }
}


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
        "GET RECIPE COMMENT IMAGE URLS ERROR:",
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
                ): image is RecipeCommentImage =>
                  image !==
                  null,
              ),

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
   CREATE SIGNED IMAGE UPLOAD
========================================================= */

export async function createRecipeCommentImageUpload(
  commentId:
    string,

  mimeType:
    string,
): Promise<RecipeCommentImageUpload> {
  const extension =
    getImageExtension(
      mimeType,
    );


  if (
    !extension
  ) {
    throw new Error(
      "Invalid image type",
    );
  }


  const supabase =
    await createClient();


  const {
    data:
      claimsData,

    error:
      claimsError,
  } =
    await supabase.auth.getClaims();


  const userId =
    claimsData
      ?.claims
      ?.sub;


  if (
    claimsError ||
    !userId
  ) {
    throw new Error(
      "Not authenticated",
    );
  }


  const imagePath =
    `${userId}/${commentId}/${crypto.randomUUID()}.${extension}`;


  const {
    data,
    error,
  } =
    await supabase.storage
      .from(
        RECIPE_COMMENT_IMAGES_BUCKET,
      )
      .createSignedUploadUrl(
        imagePath,
      );


  if (
    error
  ) {
    throw error;
  }


  if (
    !data?.token
  ) {
    throw new Error(
      "Signed upload token was not returned",
    );
  }


  return {
    path:
      imagePath,

    token:
      data.token,
  };
}


/* =========================================================
   REMOVE COMMENT IMAGES
========================================================= */

export async function removeRecipeCommentImages(
  imagePaths:
    string[],
) {
  if (
    imagePaths.length ===
    0
  ) {
    return;
  }


  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.storage
      .from(
        RECIPE_COMMENT_IMAGES_BUCKET,
      )
      .remove(
        imagePaths,
      );


  if (
    error
  ) {
    throw error;
  }
}


/* =========================================================
   SET COMMENT IMAGES
========================================================= */

export async function setRecipeCommentImages(
  commentId:
    string,

  imagePaths:
    string[],
) {
  const supabase =
    await createClient();


  const {
    error,
  } =
    await supabase.rpc(
      "set_recipe_comment_images",
      {
        p_comment_id:
          commentId,

        p_image_paths:
          imagePaths,
      },
    );


  if (
    error
  ) {
    throw error;
  }
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