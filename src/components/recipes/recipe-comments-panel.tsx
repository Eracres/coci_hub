/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";

import {
  addRecipeCommentAction,
  deleteRecipeCommentAction,
  updateRecipeCommentAction,
} from "@/app/(public)/recipes/comment-actions";

import type {
  RecipeComment,
} from "@/services/recipes/recipe-comment-service";


type RecipeCommentsPanelProps = {
  recipeId:
    string;

  comments:
    RecipeComment[];

  isAuthenticated:
    boolean;
};


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


export function RecipeCommentsPanel({
  recipeId,
  comments,
  isAuthenticated,
}: RecipeCommentsPanelProps) {
  const router =
    useRouter();


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


  function handleCreate() {
    setMessage(
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


        setNewComment(
          "",
        );


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


  function startEditing(
    comment:
      RecipeComment,
  ) {
    setMessage(
      null,
    );


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
  }


  function handleUpdate(
    commentId:
      string,
  ) {
    setMessage(
      null,
    );


    startTransition(
      async () => {
        const result =
          await updateRecipeCommentAction(
            commentId,
            editingBody,
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


        cancelEditing();


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


    startTransition(
      async () => {
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


          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
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
                                      comment.id,
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
                        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                          {
                            comment.body
                          }
                        </p>
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
