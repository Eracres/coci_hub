"use client";

import {
  useEffect,
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Star,
} from "lucide-react";

import {
  deleteRecipeRatingAction,
  setRecipeRatingAction,
} from "@/app/(public)/recipes/rating-actions";


type RecipeRatingControlProps = {
  recipeId:
    string;

  ratingCount:
    number;

  averageRating:
    number | null;

  currentUserRating:
    number | null;

  isAuthenticated:
    boolean;
};


function getRatingCountLabel(
  count:
    number,
) {
  if (
    count ===
    0
  ) {
    return "Sin valoraciones";
  }


  if (
    count ===
    1
  ) {
    return "1 valoración";
  }


  return `${count} valoraciones`;
}


export function RecipeRatingControl({
  recipeId,
  ratingCount,
  averageRating,
  currentUserRating,
  isAuthenticated,
}: RecipeRatingControlProps) {
  const router =
    useRouter();


  const [
    isPending,
    startTransition,
  ] =
    useTransition();


  const [
    selectedRating,
    setSelectedRating,
  ] =
    useState<
      number | null
    >(
      currentUserRating,
    );


  const [
    hoveredRating,
    setHoveredRating,
  ] =
    useState<
      number | null
    >(
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


  useEffect(
    () => {
      setSelectedRating(
        currentUserRating,
      );
    },
    [
      currentUserRating,
    ],
  );


  const roundedAverage =
    averageRating ===
      null
      ? 0
      : Math.round(
          averageRating,
        );


  const displayedUserRating =
    hoveredRating ??
    selectedRating ??
    0;


  function handleRating(
    rating:
      number,
  ) {
    setMessage(
      null,
    );


    startTransition(
      async () => {
        const result =
          await setRecipeRatingAction(
            recipeId,
            rating,
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


        setSelectedRating(
          result.currentUserRating,
        );


        setHoveredRating(
          null,
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


  function handleDelete() {
    setMessage(
      null,
    );


    startTransition(
      async () => {
        const result =
          await deleteRecipeRatingAction(
            recipeId,
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


        setSelectedRating(
          null,
        );


        setHoveredRating(
          null,
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


  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div
          className="flex items-center gap-1"
          aria-label={
            averageRating ===
            null
              ? "Esta receta todavía no tiene valoraciones"
              : `Valoración media ${averageRating.toFixed(1)} de 5`
          }
        >
          {[
            1,
            2,
            3,
            4,
            5,
          ].map(
            (
              star,
            ) => (
              <Star
                key={
                  star
                }
                className={
                  star <=
                  roundedAverage
                    ? "size-5 fill-accent text-accent"
                    : "size-5 text-border"
                }
                aria-hidden="true"
              />
            ),
          )}
        </div>


        <div className="flex items-baseline gap-2">
          {averageRating !==
          null ? (
            <span className="font-semibold text-foreground">
              {averageRating.toFixed(
                1,
              )}
            </span>
          ) : null}


          <span className="text-sm text-muted-foreground">
            {getRatingCountLabel(
              ratingCount,
            )}
          </span>
        </div>
      </div>


      {isAuthenticated ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-foreground">
            Tu valoración
          </span>


          <div
            className="flex items-center gap-1"
            role="group"
            aria-label="Selecciona tu valoración"
            onMouseLeave={
              () =>
                setHoveredRating(
                  null,
                )
            }
          >
            {[
              1,
              2,
              3,
              4,
              5,
            ].map(
              (
                star,
              ) => (
                <button
                  key={
                    star
                  }
                  type="button"
                  disabled={
                    isPending
                  }
                  aria-label={`Valorar con ${star} ${star === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={
                    selectedRating ===
                    star
                  }
                  onMouseEnter={
                    () =>
                      setHoveredRating(
                        star,
                      )
                  }
                  onFocus={
                    () =>
                      setHoveredRating(
                        star,
                      )
                  }
                  onBlur={
                    () =>
                      setHoveredRating(
                        null,
                      )
                  }
                  onClick={
                    () =>
                      handleRating(
                        star,
                      )
                  }
                  className="rounded-md p-0.5 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-wait disabled:opacity-60"
                >
                  <Star
                    className={
                      star <=
                      displayedUserRating
                        ? "size-6 fill-accent text-accent"
                        : "size-6 text-border transition"
                    }
                    aria-hidden="true"
                  />
                </button>
              ),
            )}
          </div>


          {selectedRating !==
          null ? (
            <>
              <span className="text-sm text-muted-foreground">
                {
                  selectedRating
                }
                /5
              </span>

              <button
                type="button"
                disabled={
                  isPending
                }
                onClick={
                  handleDelete
                }
                className="text-xs font-semibold text-brand transition hover:text-brand-hover disabled:cursor-wait disabled:opacity-60"
              >
                Quitar valoración
              </button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">
              Elige de 1 a 5
              estrellas
            </span>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-brand transition hover:text-brand-hover"
          >
            Inicia sesión
          </Link>{" "}
          para valorar esta receta.
        </p>
      )}


      {message ? (
        <p
          role="status"
          className={
            message.type ===
            "success"
              ? "text-xs font-medium text-secondary-hover"
              : "text-xs font-medium text-red-600"
          }
        >
          {
            message.text
          }
        </p>
      ) : null}
    </div>
  );
}
