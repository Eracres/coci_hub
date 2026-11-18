/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useRef,
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  ImagePlus,
  MessageCircle,
  Pencil,
  Send,
  SmilePlus,
  Trash2,
  X,
} from "lucide-react";

import {
  addRecipeCommentAction,
  createRecipeCommentImageUploadAction,
  deleteRecipeCommentAction,
  removeRecipeCommentImagesAction,
  setRecipeCommentImagesAction,
  updateRecipeCommentAction,
} from "@/app/(public)/recipes/comment-actions";

import {
  createClient,
} from "@/lib/supabase/client";

import type {
  RecipeComment,
} from "@/services/recipes/recipe-comment-service";


const COMMENT_IMAGES_BUCKET =
  "recipe-comment-images";

const MAX_COMMENT_IMAGES =
  3;

const MAX_IMAGE_SIZE =
  5 *
  1024 *
  1024;

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const COMMENT_EMOJIS = [
  "😀",
  "😄",
  "😂",
  "🤣",
  "😍",
  "🤩",
  "🤤",
  "😋",
  "🥰",
  "😊",
  "❤️",
  "🔥",
  "👏",
  "👍",
  "👌",
  "💯",
  "🎉",
  "✨",
  "😮",
  "😭",
  "🍕",
  "🍔",
  "🌮",
  "🍰",
  "🥘",
  "🍳",
  "🥗",
  "🌶️",
  "🧄",
  "🧀",
] as const;


type RecipeCommentsPanelProps = {
  recipeId:
    string;

  comments:
    RecipeComment[];

  isAuthenticated:
    boolean;
};


type SelectedCommentImage = {
  id:
    string;

  file:
    File;

  previewUrl:
    string;
};


type EmojiPickerTarget =
  | "new"
  | "edit"
  | null;


function formatCommentDate(
  value:
    string,
) {
  const date =
    new Date(
      value,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "es-ES",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(
    date,
  );
}


function getInitial(
  name:
    string,
) {
  const trimmed =
    name.trim();


  if (
    !trimmed
  ) {
    return "U";
  }


  return trimmed
    .charAt(
      0,
    )
    .toUpperCase();
}


function wasEdited(
  comment:
    RecipeComment,
) {
  return (
    comment.updatedAt !==
    comment.createdAt
  );
}


function validateSelectedFiles(
  files:
    File[],

  availableSlots:
    number,
): string | null {
  if (
    files.length >
    availableSlots
  ) {
    return `Puedes adjuntar un máximo de ${MAX_COMMENT_IMAGES} fotos.`;
  }


  const invalidType =
    files.find(
      (
        file,
      ) =>
        !ALLOWED_IMAGE_TYPES.has(
          file.type,
        ),
    );


  if (
    invalidType
  ) {
    return "Las fotos deben ser JPG, PNG o WebP.";
  }


  const oversizedImage =
    files.find(
      (
        file,
      ) =>
        file.size >
        MAX_IMAGE_SIZE,
    );


  if (
    oversizedImage
  ) {
    return "Cada foto puede ocupar como máximo 5 MB.";
  }


  return null;
}


function createSelectedImages(
  files:
    File[],
): SelectedCommentImage[] {
  return files.map(
    (
      file,
    ) => ({
      id:
        crypto.randomUUID(),

      file,

      previewUrl:
        URL.createObjectURL(
          file,
        ),
    }),
  );
}


export function RecipeCommentsPanel({
  recipeId,
  comments,
  isAuthenticated,
}: RecipeCommentsPanelProps) {
  const router =
    useRouter();


  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  const editFileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );


  const newCommentTextareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );


  const editingTextareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    newComment,
    setNewComment,
  ] =
    useState(
      "",
    );


  const [
    selectedImages,
    setSelectedImages,
  ] =
    useState<
      SelectedCommentImage[]
    >(
      [],
    );


  const [
    editingCommentId,
    setEditingCommentId,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const [
    editingBody,
    setEditingBody,
  ] =
    useState(
      "",
    );


  const [
    editingSelectedImages,
    setEditingSelectedImages,
  ] =
    useState<
      SelectedCommentImage[]
    >(
      [],
    );


  const [
    emojiPickerTarget,
    setEmojiPickerTarget,
  ] =
    useState<EmojiPickerTarget>(
      null,
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      {
        type:
          "success" |
          "error";

        text:
          string;
      } |
      null
    >(
      null,
    );


  function clearSelectedImages() {
    selectedImages.forEach(
      (
        image,
      ) => {
        URL.revokeObjectURL(
          image.previewUrl,
        );
      },
    );


    setSelectedImages(
      [],
    );


    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }


  function clearEditingSelectedImages() {
    editingSelectedImages.forEach(
      (
        image,
      ) => {
        URL.revokeObjectURL(
          image.previewUrl,
        );
      },
    );


    setEditingSelectedImages(
      [],
    );


    if (
      editFileInputRef.current
    ) {
      editFileInputRef.current.value =
        "";
    }
  }


  function removeSelectedImage(
    imageId:
      string,
  ) {
    setSelectedImages(
      (
        currentImages,
      ) => {
        const imageToRemove =
          currentImages.find(
            (
              image,
            ) =>
              image.id ===
              imageId,
          );


        if (
          imageToRemove
        ) {
          URL.revokeObjectURL(
            imageToRemove.previewUrl,
          );
        }


        return currentImages.filter(
          (
            image,
          ) =>
            image.id !==
            imageId,
        );
      },
    );
  }


  function removeEditingSelectedImage(
    imageId:
      string,
  ) {
    setEditingSelectedImages(
      (
        currentImages,
      ) => {
        const imageToRemove =
          currentImages.find(
            (
              image,
            ) =>
              image.id ===
              imageId,
          );


        if (
          imageToRemove
        ) {
          URL.revokeObjectURL(
            imageToRemove.previewUrl,
          );
        }


        return currentImages.filter(
          (
            image,
          ) =>
            image.id !==
            imageId,
        );
      },
    );
  }


  function handleSelectImages(
    event:
      React.ChangeEvent<HTMLInputElement>,
  ) {
    const files =
      Array.from(
        event.target.files ??
        [],
      );


    event.target.value =
      "";


    if (
      files.length ===
      0
    ) {
      return;
    }


    const availableSlots =
      MAX_COMMENT_IMAGES -
      selectedImages.length;


    const validationError =
      validateSelectedFiles(
        files,
        availableSlots,
      );


    if (
      validationError
    ) {
      setMessage({
        type:
          "error",

        text:
          validationError,
      });


      return;
    }


    const newImages =
      createSelectedImages(
        files,
      );


    setSelectedImages(
      (
        currentImages,
      ) => [
        ...currentImages,
        ...newImages,
      ],
    );


    setMessage(
      null,
    );
  }


  function handleSelectEditingImages(
    event:
      React.ChangeEvent<HTMLInputElement>,

    existingImageCount:
      number,
  ) {
    const files =
      Array.from(
        event.target.files ??
        [],
      );


    event.target.value =
      "";


    if (
      files.length ===
      0
    ) {
      return;
    }


    const currentImageCount =
      existingImageCount +
      editingSelectedImages.length;


    const availableSlots =
      MAX_COMMENT_IMAGES -
      currentImageCount;


    const validationError =
      validateSelectedFiles(
        files,
        availableSlots,
      );


    if (
      validationError
    ) {
      setMessage({
        type:
          "error",

        text:
          validationError,
      });


      return;
    }


    const newImages =
      createSelectedImages(
        files,
      );


    setEditingSelectedImages(
      (
        currentImages,
      ) => [
        ...currentImages,
        ...newImages,
      ],
    );


    setMessage(
      null,
    );
  }


  function insertNewCommentEmoji(
    emoji:
      string,
  ) {
    const textarea =
      newCommentTextareaRef.current;

    const selectionStart =
      textarea?.selectionStart ??
      newComment.length;

    const selectionEnd =
      textarea?.selectionEnd ??
      newComment.length;


    const nextValue =
      newComment.slice(
        0,
        selectionStart,
      ) +
      emoji +
      newComment.slice(
        selectionEnd,
      );


    if (
      nextValue.length >
      2000
    ) {
      setMessage({
        type:
          "error",

        text:
          "El comentario no puede superar los 2000 caracteres.",
      });


      return;
    }


    const nextCursorPosition =
      selectionStart +
      emoji.length;


    setNewComment(
      nextValue,
    );


    setEmojiPickerTarget(
      null,
    );


    requestAnimationFrame(
      () => {
        textarea?.focus();

        textarea?.setSelectionRange(
          nextCursorPosition,
          nextCursorPosition,
        );
      },
    );
  }


  function insertEditingEmoji(
    emoji:
      string,
  ) {
    const textarea =
      editingTextareaRef.current;

    const selectionStart =
      textarea?.selectionStart ??
      editingBody.length;

    const selectionEnd =
      textarea?.selectionEnd ??
      editingBody.length;


    const nextValue =
      editingBody.slice(
        0,
        selectionStart,
      ) +
      emoji +
      editingBody.slice(
        selectionEnd,
      );


    if (
      nextValue.length >
      2000
    ) {
      setMessage({
        type:
          "error",

        text:
          "El comentario no puede superar los 2000 caracteres.",
      });


      return;
    }


    const nextCursorPosition =
      selectionStart +
      emoji.length;


    setEditingBody(
      nextValue,
    );


    setEmojiPickerTarget(
      null,
    );


    requestAnimationFrame(
      () => {
        textarea?.focus();

        textarea?.setSelectionRange(
          nextCursorPosition,
          nextCursorPosition,
        );
      },
    );
  }


  async function removeUploadedImages(
    imagePaths:
      string[],
  ) {
    if (
      imagePaths.length ===
      0
    ) {
      return true;
    }


    const result =
      await removeRecipeCommentImagesAction(
        imagePaths,
      );


    if (
      !result.success
    ) {
      console.error(
        "REMOVE RECIPE COMMENT IMAGES ERROR:",
        result.message,
      );


      return false;
    }


    return true;
  }


  async function uploadCommentImages(
    commentId:
      string,

    images:
      SelectedCommentImage[],
  ) {
    if (
      images.length ===
      0
    ) {
      return [] as string[];
    }


    const supabase =
      createClient();


    const uploadedPaths:
      string[] = [];


    try {
      for (
        const selectedImage
        of images
      ) {
        const signedUpload =
          await createRecipeCommentImageUploadAction(
            commentId,
            selectedImage.file.type,
          );


        if (
          !signedUpload.success ||
          !signedUpload.path ||
          !signedUpload.token
        ) {
          throw new Error(
            signedUpload.message,
          );
        }


        const {
          error:
            uploadError,
        } =
          await supabase.storage
            .from(
              COMMENT_IMAGES_BUCKET,
            )
            .uploadToSignedUrl(
              signedUpload.path,
              signedUpload.token,
              selectedImage.file,
              {
                cacheControl:
                  "3600",

                contentType:
                  selectedImage.file.type,
              },
            );


        if (
          uploadError
        ) {
          throw uploadError;
        }


        uploadedPaths.push(
          signedUpload.path,
        );
      }


      return uploadedPaths;

    } catch (
      error
    ) {
      await removeUploadedImages(
        uploadedPaths,
      );


      throw error;
    }
  }


  function handleCreate() {
    setMessage(
      null,
    );


    setEmojiPickerTarget(
      null,
    );


    startTransition(
      async () => {
        const result =
          await addRecipeCommentAction(
            recipeId,
            newComment,
          );


        if (
          !result.success
        ) {
          setMessage({
            type:
              "error",

            text:
              result.message,
          });


          return;
        }


        const commentId =
          result.commentId;


        if (
          !commentId
        ) {
          setMessage({
            type:
              "error",

            text:
              "El comentario se publicó, pero no se pudo obtener su identificador.",
          });


          router.refresh();


          return;
        }


        let uploadedPaths:
          string[] = [];


        try {
          if (
            selectedImages.length >
            0
          ) {
            uploadedPaths =
              await uploadCommentImages(
                commentId,
                selectedImages,
              );


            const imagesResult =
              await setRecipeCommentImagesAction(
                commentId,
                uploadedPaths,
              );


            if (
              !imagesResult.success
            ) {
              throw new Error(
                imagesResult.message,
              );
            }
          }

        } catch (
          error
        ) {
          console.error(
            "CREATE RECIPE COMMENT WITH IMAGES ERROR:",
            error,
          );


          await removeUploadedImages(
            uploadedPaths,
          );


          const rollbackResult =
            await deleteRecipeCommentAction(
              commentId,
            );


          if (
            !rollbackResult.success
          ) {
            console.error(
              "ROLLBACK RECIPE COMMENT ERROR:",
              rollbackResult.message,
            );
          }


          setMessage({
            type:
              "error",

            text:
              "No se pudieron adjuntar las fotos. El comentario no se ha publicado.",
          });


          router.refresh();


          return;
        }


        const publishedWithImages =
          selectedImages.length >
          0;


        setNewComment(
          "",
        );


        clearSelectedImages();


        setMessage({
          type:
            "success",

          text:
            publishedWithImages
              ? "Comentario y fotos publicados."
              : result.message,
        });


        router.refresh();
      },
    );
  }


  function startEditing(
    comment:
      RecipeComment,
  ) {
    setMessage(
      null,
    );


    setEmojiPickerTarget(
      null,
    );


    clearEditingSelectedImages();


    setEditingCommentId(
      comment.id,
    );


    setEditingBody(
      comment.body,
    );
  }


  function cancelEditing() {
    setEditingCommentId(
      null,
    );


    setEditingBody(
      "",
    );


    setEmojiPickerTarget(
      null,
    );


    clearEditingSelectedImages();
  }


  function handleUpdate(
    comment:
      RecipeComment,
  ) {
    setMessage(
      null,
    );


    setEmojiPickerTarget(
      null,
    );


    startTransition(
      async () => {
        const originalImagePaths =
          comment.images.map(
            (
              image,
            ) =>
              image.path,
          );


        let uploadedPaths:
          string[] = [];


        try {
          if (
            editingSelectedImages.length >
            0
          ) {
            uploadedPaths =
              await uploadCommentImages(
                comment.id,
                editingSelectedImages,
              );


            const nextImagePaths = [
              ...originalImagePaths,
              ...uploadedPaths,
            ];


            const imagesResult =
              await setRecipeCommentImagesAction(
                comment.id,
                nextImagePaths,
              );


            if (
              !imagesResult.success
            ) {
              throw new Error(
                imagesResult.message,
              );
            }
          }


          const result =
            await updateRecipeCommentAction(
              comment.id,
              editingBody,
            );


          if (
            !result.success
          ) {
            if (
              uploadedPaths.length >
              0
            ) {
              await removeUploadedImages(
                uploadedPaths,
              );


              const rollbackImagesResult =
                await setRecipeCommentImagesAction(
                  comment.id,
                  originalImagePaths,
                );


              if (
                !rollbackImagesResult.success
              ) {
                console.error(
                  "ROLLBACK RECIPE COMMENT IMAGES ERROR:",
                  rollbackImagesResult.message,
                );
              }
            }


            setMessage({
              type:
                "error",

              text:
                result.message,
            });


            return;
          }


          const updatedWithImages =
            editingSelectedImages.length >
            0;


          cancelEditing();


          setMessage({
            type:
              "success",

            text:
              updatedWithImages
                ? "Comentario y fotos actualizados."
                : result.message,
          });


          router.refresh();

        } catch (
          error
        ) {
          console.error(
            "UPDATE RECIPE COMMENT WITH IMAGES ERROR:",
            error,
          );


          if (
            uploadedPaths.length >
            0
          ) {
            await removeUploadedImages(
              uploadedPaths,
            );


            const rollbackImagesResult =
              await setRecipeCommentImagesAction(
                comment.id,
                originalImagePaths,
              );


            if (
              !rollbackImagesResult.success
            ) {
              console.error(
                "ROLLBACK RECIPE COMMENT IMAGES ERROR:",
                rollbackImagesResult.message,
              );
            }
          }


          setMessage({
            type:
              "error",

            text:
              "No se pudieron actualizar el comentario y sus fotos.",
          });


          router.refresh();
        }
      },
    );
  }


  function handleDelete(
    commentId:
      string,
  ) {
    const confirmed =
      window.confirm(
        "¿Quieres eliminar este comentario?",
      );


    if (
      !confirmed
    ) {
      return;
    }


    setMessage(
      null,
    );


    setEmojiPickerTarget(
      null,
    );


    startTransition(
      async () => {
        const comment =
          comments.find(
            (
              item,
            ) =>
              item.id ===
              commentId,
          );


        if (
          comment &&
          comment.images.length >
          0
        ) {
          const imagesRemoved =
            await removeUploadedImages(
              comment.images.map(
                (
                  image,
                ) =>
                  image.path,
              ),
            );


          if (
            !imagesRemoved
          ) {
            setMessage({
              type:
                "error",

              text:
                "No se pudieron eliminar las fotos del comentario.",
            });


            return;
          }
        }


        const result =
          await deleteRecipeCommentAction(
            commentId,
          );


        if (
          !result.success
        ) {
          setMessage({
            type:
              "error",

            text:
              result.message,
          });


          return;
        }


        if (
          editingCommentId ===
          commentId
        ) {
          cancelEditing();
        }


        setMessage({
          type:
            "success",

          text:
            result.message,
        });


        router.refresh();
      },
    );
  }


  return (
    <section className="mt-16 border-t border-border pt-12">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
          <MessageCircle
            className="size-5"
            aria-hidden="true"
          />
        </span>


        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
            Comunidad
          </p>

          <h2 className="mt-1 font-serif text-3xl font-bold text-foreground">
            Comentarios
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {comments.length ===
            0
              ? "Todavía no hay comentarios."
              : comments.length ===
                  1
                ? "1 comentario"
                : `${comments.length} comentarios`}
          </p>
        </div>
      </div>


      {isAuthenticated ? (
        <div className="mt-8 rounded-3xl border border-border bg-surface p-5 shadow-sm md:p-6">
          <label
            htmlFor="recipe-comment"
            className="font-semibold text-foreground"
          >
            ¿Qué te ha parecido esta receta?
          </label>


          <textarea
            ref={
              newCommentTextareaRef
            }
            id="recipe-comment"
            value={
              newComment
            }
            maxLength={
              2000
            }
            disabled={
              isPending
            }
            onChange={
              (
                event,
              ) =>
                setNewComment(
                  event.target
                    .value,
                )
            }
            placeholder="Comparte tu opinión, algún consejo o cómo te ha quedado..."
            className="mt-4 min-h-28 w-full resize-y rounded-2xl border border-border bg-page px-4 py-3 text-sm leading-6 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-wait disabled:opacity-60"
          />


          {selectedImages.length >
          0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {selectedImages.map(
                (
                  image,
                ) => (
                  <div
                    key={
                      image.id
                    }
                    className="group relative overflow-hidden rounded-2xl border border-border bg-page-muted"
                  >
                    <img
                      src={
                        image.previewUrl
                      }
                      alt="Vista previa de la foto seleccionada"
                      className="aspect-square w-full object-cover"
                    />

                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={
                        () =>
                          removeSelectedImage(
                            image.id,
                          )
                      }
                      aria-label="Quitar foto"
                      className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
                    >
                      <X
                        className="size-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ),
              )}
            </div>
          ) : null}


          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={
                isPending
              }
              aria-expanded={
                emojiPickerTarget ===
                "new"
              }
              onClick={
                () =>
                  setEmojiPickerTarget(
                    (
                      currentTarget,
                    ) =>
                      currentTarget ===
                      "new"
                        ? null
                        : "new",
                  )
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <SmilePlus
                className="size-4"
                aria-hidden="true"
              />

              Emoji
            </button>


            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={
                isPending ||
                selectedImages.length >=
                  MAX_COMMENT_IMAGES
              }
              onChange={
                handleSelectImages
              }
              className="sr-only"
            />


            <button
              type="button"
              disabled={
                isPending ||
                selectedImages.length >=
                  MAX_COMMENT_IMAGES
              }
              onClick={
                () =>
                  fileInputRef.current?.click()
              }
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ImagePlus
                className="size-4"
                aria-hidden="true"
              />

              {selectedImages.length ===
              0
                ? "Añadir fotos"
                : `Añadir fotos (${selectedImages.length}/${MAX_COMMENT_IMAGES})`}
            </button>


            <span className="text-xs text-muted-foreground">
              JPG, PNG o WebP · máximo 5 MB por foto
            </span>
          </div>


          {emojiPickerTarget ===
          "new" ? (
            <div className="mt-3 max-w-md rounded-2xl border border-border bg-page p-3 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                Añadir emoji
              </p>

              <div className="flex flex-wrap gap-1">
                {COMMENT_EMOJIS.map(
                  (
                    emoji,
                  ) => (
                    <button
                      key={
                        emoji
                      }
                      type="button"
                      disabled={
                        isPending
                      }
                      aria-label={`Añadir emoji ${emoji}`}
                      onClick={
                        () =>
                          insertNewCommentEmoji(
                            emoji,
                          )
                      }
                      className="flex size-9 items-center justify-center rounded-lg text-xl transition hover:bg-brand/10 hover:scale-110 disabled:opacity-50"
                    >
                      {
                        emoji
                      }
                    </button>
                  ),
                )}
              </div>
            </div>
          ) : null}


          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {
                newComment.length
              }
              /2000
            </span>


            <button
              type="button"
              disabled={
                isPending ||
                newComment
                  .trim()
                  .length ===
                  0
              }
              onClick={
                handleCreate
              }
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send
                className="size-4"
                aria-hidden="true"
              />

              {isPending
                ? "Publicando..."
                : "Publicar comentario"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-page-muted/50 px-5 py-4 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-brand transition hover:text-brand-hover"
          >
            Inicia sesión
          </Link>{" "}
          para participar en los comentarios.
        </div>
      )}


      {message ? (
        <p
          role="status"
          className={
            message.type ===
            "success"
              ? "mt-4 text-sm font-medium text-secondary-hover"
              : "mt-4 text-sm font-medium text-red-600"
          }
        >
          {
            message.text
          }
        </p>
      ) : null}


      {comments.length >
      0 ? (
        <div className="mt-8 space-y-4">
          {comments.map(
            (
              comment,
            ) => {
              const isEditing =
                editingCommentId ===
                comment.id;

              const editingImageCount =
                comment.images.length +
                editingSelectedImages.length;


              return (
                <article
                  key={
                    comment.id
                  }
                  className="rounded-3xl border border-border bg-surface p-5 shadow-sm md:p-6"
                >
                  <div className="flex gap-4">
                    {comment.authorAvatarUrl ? (
                      <img
                        src={
                          comment.authorAvatarUrl
                        }
                        alt=""
                        className="size-11 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 font-semibold text-brand">
                        {getInitial(
                          comment.authorDisplayName,
                        )}
                      </div>
                    )}


                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">
                            {
                              comment.authorDisplayName
                            }
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatCommentDate(
                              comment.createdAt,
                            )}

                            {wasEdited(
                              comment,
                            )
                              ? " · Editado"
                              : ""}
                          </p>
                        </div>


                        {comment.isOwn &&
                        !isEditing ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={
                                isPending
                              }
                              onClick={
                                () =>
                                  startEditing(
                                    comment,
                                  )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-brand disabled:opacity-50"
                            >
                              <Pencil
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              Editar
                            </button>


                            <button
                              type="button"
                              disabled={
                                isPending
                              }
                              onClick={
                                () =>
                                  handleDelete(
                                    comment.id,
                                  )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            >
                              <Trash2
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              Eliminar
                            </button>
                          </div>
                        ) : null}
                      </div>


                      {isEditing ? (
                        <div className="mt-4">
                          <textarea
                            ref={
                              editingTextareaRef
                            }
                            value={
                              editingBody
                            }
                            maxLength={
                              2000
                            }
                            disabled={
                              isPending
                            }
                            onChange={
                              (
                                event,
                              ) =>
                                setEditingBody(
                                  event.target
                                    .value,
                                )
                            }
                            className="min-h-24 w-full resize-y rounded-2xl border border-border bg-page px-4 py-3 text-sm leading-6 text-foreground outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-wait disabled:opacity-60"
                          />


                          {comment.images.length >
                          0 ||
                          editingSelectedImages.length >
                          0 ? (
                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                              {comment.images.map(
                                (
                                  image,
                                ) => (
                                  <div
                                    key={
                                      image.path
                                    }
                                    className="relative overflow-hidden rounded-2xl border border-border bg-page-muted"
                                  >
                                    <img
                                      src={
                                        image.url
                                      }
                                      alt={`Foto actual compartida por ${comment.authorDisplayName}`}
                                      className="aspect-square w-full object-cover"
                                    />

                                    <span className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                                      Actual
                                    </span>
                                  </div>
                                ),
                              )}


                              {editingSelectedImages.map(
                                (
                                  image,
                                ) => (
                                  <div
                                    key={
                                      image.id
                                    }
                                    className="group relative overflow-hidden rounded-2xl border border-brand/30 bg-page-muted"
                                  >
                                    <img
                                      src={
                                        image.previewUrl
                                      }
                                      alt="Vista previa de la nueva foto"
                                      className="aspect-square w-full object-cover"
                                    />

                                    <span className="absolute bottom-2 left-2 rounded-full bg-brand px-2 py-1 text-[11px] font-semibold text-inverse">
                                      Nueva
                                    </span>

                                    <button
                                      type="button"
                                      disabled={
                                        isPending
                                      }
                                      onClick={
                                        () =>
                                          removeEditingSelectedImage(
                                            image.id,
                                          )
                                      }
                                      aria-label="Quitar nueva foto"
                                      className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"
                                    >
                                      <X
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          ) : null}


                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              disabled={
                                isPending
                              }
                              aria-expanded={
                                emojiPickerTarget ===
                                "edit"
                              }
                              onClick={
                                () =>
                                  setEmojiPickerTarget(
                                    (
                                      currentTarget,
                                    ) =>
                                      currentTarget ===
                                      "edit"
                                        ? null
                                        : "edit",
                                  )
                              }
                              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-brand disabled:opacity-50"
                            >
                              <SmilePlus
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              Emoji
                            </button>


                            <input
                              ref={
                                editFileInputRef
                              }
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              multiple
                              disabled={
                                isPending ||
                                editingImageCount >=
                                  MAX_COMMENT_IMAGES
                              }
                              onChange={
                                (
                                  event,
                                ) =>
                                  handleSelectEditingImages(
                                    event,
                                    comment.images.length,
                                  )
                              }
                              className="sr-only"
                            />


                            <button
                              type="button"
                              disabled={
                                isPending ||
                                editingImageCount >=
                                  MAX_COMMENT_IMAGES
                              }
                              onClick={
                                () =>
                                  editFileInputRef.current?.click()
                              }
                              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted-foreground transition hover:bg-page-muted hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ImagePlus
                                className="size-3.5"
                                aria-hidden="true"
                              />

                              {editingImageCount ===
                              0
                                ? "Añadir fotos"
                                : `Añadir fotos (${editingImageCount}/${MAX_COMMENT_IMAGES})`}
                            </button>


                            <span className="text-xs text-muted-foreground">
                              JPG, PNG o WebP · máximo 5 MB
                            </span>
                          </div>


                          {emojiPickerTarget ===
                          "edit" ? (
                            <div className="mt-3 max-w-md rounded-2xl border border-border bg-page p-3 shadow-sm">
                              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                                Añadir emoji
                              </p>

                              <div className="flex flex-wrap gap-1">
                                {COMMENT_EMOJIS.map(
                                  (
                                    emoji,
                                  ) => (
                                    <button
                                      key={
                                        emoji
                                      }
                                      type="button"
                                      disabled={
                                        isPending
                                      }
                                      aria-label={`Añadir emoji ${emoji}`}
                                      onClick={
                                        () =>
                                          insertEditingEmoji(
                                            emoji,
                                          )
                                      }
                                      className="flex size-9 items-center justify-center rounded-lg text-xl transition hover:bg-brand/10 hover:scale-110 disabled:opacity-50"
                                    >
                                      {
                                        emoji
                                      }
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                          ) : null}


                          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">
                              {
                                editingBody.length
                              }
                              /2000
                            </span>


                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={
                                  isPending
                                }
                                onClick={
                                  cancelEditing
                                }
                                className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-xs font-semibold text-muted-foreground transition hover:bg-page-muted disabled:opacity-50"
                              >
                                <X
                                  className="size-3.5"
                                  aria-hidden="true"
                                />

                                Cancelar
                              </button>


                              <button
                                type="button"
                                disabled={
                                  isPending ||
                                  editingBody
                                    .trim()
                                    .length ===
                                    0
                                }
                                onClick={
                                  () =>
                                    handleUpdate(
                                      comment,
                                    )
                                }
                                className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-brand px-3 text-xs font-semibold text-inverse transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Guardar cambios
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                            {
                              comment.body
                            }
                          </p>


                          {comment.images.length >
                          0 ? (
                            <div
                              className={
                                comment.images.length ===
                                1
                                  ? "mt-4 max-w-xl"
                                  : "mt-4 grid max-w-2xl gap-3 sm:grid-cols-2"
                              }
                            >
                              {comment.images.map(
                                (
                                  image,
                                ) => (
                                  <a
                                    key={
                                      image.path
                                    }
                                    href={
                                      image.url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block overflow-hidden rounded-2xl border border-border bg-page-muted"
                                  >
                                    <img
                                      src={
                                        image.url
                                      }
                                      alt={`Foto compartida por ${comment.authorDisplayName}`}
                                      className="max-h-[28rem] w-full object-cover transition duration-200 hover:scale-[1.01]"
                                    />
                                  </a>
                                ),
                              )}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            },
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-page-muted/30 px-6 py-10 text-center">
          <MessageCircle
            className="mx-auto size-7 text-muted-foreground"
            aria-hidden="true"
          />

          <p className="mt-3 font-semibold text-foreground">
            Sé el primero en comentar
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Comparte tu experiencia con esta receta.
          </p>
        </div>
      )}
    </section>
  );
}