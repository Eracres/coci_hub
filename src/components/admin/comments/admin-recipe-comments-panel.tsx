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
  Eye,
  EyeOff,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  deleteAdminRecipeCommentAction,
  setAdminRecipeCommentHiddenAction,
} from "@/app/admin/comments/actions";

import type {
  AdminRecipeComment,
} from "@/services/recipes/admin-recipe-comment-service";


type AdminRecipeCommentsPanelProps = {
  comments:
    AdminRecipeComment[];
};


type AdminMessage = {
  type:
    "success" |
    "warning" |
    "error";

  text:
    string;
};


function formatDate(
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


function wasEdited(
  comment:
    AdminRecipeComment,
) {
  return (
    comment.updatedAt !==
    comment.createdAt
  );
}


export function AdminRecipeCommentsPanel({
  comments,
}: AdminRecipeCommentsPanelProps) {
  const router =
    useRouter();


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    message,
    setMessage,
  ] =
    useState<
      AdminMessage |
      null
    >(
      null,
    );


  const visibleCount =
    comments.filter(
      (
        comment,
      ) =>
        !comment.isHidden,
    ).length;


  const hiddenCount =
    comments.filter(
      (
        comment,
      ) =>
        comment.isHidden,
    ).length;


  function handleVisibilityChange(
    comment:
      AdminRecipeComment,
  ) {
    setMessage(
      null,
    );


    const hidden =
      !comment.isHidden;


    startTransition(
      async () => {
        const result =
          await setAdminRecipeCommentHiddenAction(
            comment.id,
            hidden,
            comment.recipeSlug,
          );


        setMessage({
          type:
            result.success
              ? "success"
              : "error",

          text:
            result.message,
        });


        if (
          result.success
        ) {
          router.refresh();
        }
      },
    );
  }


  function handleDelete(
    comment:
      AdminRecipeComment,
  ) {
    const confirmed =
      window.confirm(
        comment.images.length >
        0
          ? "Esta acción eliminará definitivamente el comentario y sus fotografías. ¿Quieres continuar?"
          : "Esta acción eliminará el comentario definitivamente. ¿Quieres continuar?",
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
          await deleteAdminRecipeCommentAction(
            comment.id,
            comment.recipeSlug,
          );


        setMessage({
          type:
            !result.success
              ? "error"
              : result.warning
                ? "warning"
                : "success",

          text:
            result.message,
        });


        if (
          result.success
        ) {
          router.refresh();
        }
      },
    );
  }


  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Totales
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-foreground">
            {
              comments.length
            }
          </p>
        </div>


        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-hover">
            Visibles
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-secondary-hover">
            {
              visibleCount
            }
          </p>
        </div>


        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-warning">
            Ocultos
          </p>

          <p className="mt-2 font-serif text-3xl font-bold text-warning">
            {
              hiddenCount
            }
          </p>
        </div>
      </section>


      {message ? (
        <div
          role="status"
          className={
            message.type ===
            "success"
              ? "mt-6 rounded-2xl border border-secondary/25 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-hover"
              : message.type ===
                  "warning"
                ? "mt-6 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning"
                : "mt-6 rounded-2xl border border-error/25 bg-error/5 px-4 py-3 text-sm font-medium text-error"
          }
        >
          {
            message.text
          }
        </div>
      ) : null}


      {comments.length ===
      0 ? (
        <section className="mt-8 rounded-3xl border border-dashed border-border bg-page-muted/40 px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <MessageCircle
              className="size-6"
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">
            Todavía no hay comentarios
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Cuando los usuarios participen en las recetas, sus comentarios aparecerán aquí para poder moderarlos.
          </p>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          {comments.map(
            (
              comment,
            ) => (
              <article
                key={
                  comment.id
                }
                className={
                  comment.isHidden
                    ? "rounded-3xl border border-warning/30 bg-warning/5 p-5 shadow-sm md:p-6"
                    : "rounded-3xl border border-border bg-surface p-5 shadow-sm md:p-6"
                }
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={
                          comment.isHidden
                            ? "inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning"
                            : "inline-flex items-center gap-1.5 rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary-hover"
                        }
                      >
                        {comment.isHidden ? (
                          <EyeOff
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        ) : (
                          <Eye
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        )}

                        {comment.isHidden
                          ? "Oculto"
                          : "Visible"}
                      </span>


                      {wasEdited(
                        comment,
                      ) ? (
                        <span className="rounded-full bg-page-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                          Editado
                        </span>
                      ) : null}


                      {comment.images.length >
                      0 ? (
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                          {comment.images.length ===
                          1
                            ? "1 foto"
                            : `${comment.images.length} fotos`}
                        </span>
                      ) : null}
                    </div>


                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-2">
                        <UserRound
                          className="size-4 text-brand"
                          aria-hidden="true"
                        />

                        <strong className="font-semibold text-foreground">
                          {
                            comment.authorDisplayName
                          }
                        </strong>
                      </span>


                      <span>
                        {formatDate(
                          comment.createdAt,
                        )}
                      </span>
                    </div>


                    <div className="mt-4 rounded-2xl border border-border bg-page/60 p-4">
                      <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                        {
                          comment.body
                        }
                      </p>
                    </div>


                    {comment.images.length >
                    0 ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Fotografías del comentario
                        </p>

                        <div className="mt-3 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {comment.images.map(
                            (
                              image,
                              imageIndex,
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
                                className="group relative block overflow-hidden rounded-2xl border border-border bg-page-muted"
                              >
                                <img
                                  src={
                                    image.url
                                  }
                                  alt={`Foto ${imageIndex + 1} del comentario de ${comment.authorDisplayName}`}
                                  className="aspect-square w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                                />

                                <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold text-white">
                                  Ampliar
                                </span>
                              </a>
                            ),
                          )}
                        </div>
                      </div>
                    ) : null}


                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium text-muted-foreground">
                        Receta:
                      </span>

                      <Link
                        href={`/admin/recipes/${comment.recipeId}/edit`}
                        className="inline-flex items-center gap-1.5 font-semibold text-brand transition hover:text-brand-hover"
                      >
                        {
                          comment.recipeTitle
                        }

                        <ExternalLink
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </Link>


                      <Link
                        href={`/recipes/${comment.recipeSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition hover:text-brand"
                      >
                        Ver receta pública

                        <ExternalLink
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </div>


                    {comment.isHidden &&
                    comment.hiddenAt ? (
                      <div className="mt-4 flex gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs leading-5 text-muted-foreground">
                        <ShieldCheck
                          className="mt-0.5 size-4 shrink-0 text-warning"
                          aria-hidden="true"
                        />

                        <span>
                          Ocultado el{" "}
                          {formatDate(
                            comment.hiddenAt,
                          )}
                          {comment.hiddenByDisplayName
                            ? ` por ${comment.hiddenByDisplayName}`
                            : ""}
                          .
                        </span>
                      </div>
                    ) : null}
                  </div>


                  <div className="flex shrink-0 flex-wrap gap-2 xl:w-44 xl:flex-col">
                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={
                        () =>
                          handleVisibilityChange(
                            comment,
                          )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-foreground transition hover:bg-page-muted disabled:cursor-wait disabled:opacity-50"
                    >
                      {comment.isHidden ? (
                        <>
                          <Eye
                            className="size-4 text-secondary-hover"
                            aria-hidden="true"
                          />

                          Restaurar
                        </>
                      ) : (
                        <>
                          <EyeOff
                            className="size-4 text-warning"
                            aria-hidden="true"
                          />

                          Ocultar
                        </>
                      )}
                    </button>


                    <button
                      type="button"
                      disabled={
                        isPending
                      }
                      onClick={
                        () =>
                          handleDelete(
                            comment,
                          )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-error/25 bg-error/5 px-4 text-sm font-semibold text-error transition hover:bg-error/10 disabled:cursor-wait disabled:opacity-50"
                    >
                      <Trash2
                        className="size-4"
                        aria-hidden="true"
                      />

                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>
      )}
    </>
  );
}