/* eslint-disable @next/next/no-img-element */

"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  ChefHat,
  Clock3,
  LoaderCircle,
  Search,
} from "lucide-react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";


const MIN_SEARCH_LENGTH =
  2;

const SEARCH_DELAY_MS =
  280;


type SearchSuggestion = {
  id:
    string;

  title:
    string;

  slug:
    string;

  shortDescription:
    string | null;

  imageUrl:
    string | null;

  totalMinutes:
    number;

  difficulty:
    "easy" |
    "medium" |
    "hard" |
    null;
};


type SearchSuggestionResponse = {
  results:
    SearchSuggestion[];

  total?:
    number;

  error?:
    string;
};


function getDifficultyLabel(
  difficulty:
    SearchSuggestion["difficulty"],
) {
  switch (
    difficulty
  ) {
    case "easy":
      return "Fácil";

    case "medium":
      return "Media";

    case "hard":
      return "Difícil";

    default:
      return null;
  }
}


export function RecipeSearchAutocomplete() {
  const router =
    useRouter();


  const containerRef =
    useRef<HTMLDivElement>(
      null,
    );


  const [
    query,
    setQuery,
  ] =
    useState(
      "",
    );


  const [
    results,
    setResults,
  ] =
    useState<
      SearchSuggestion[]
    >(
      [],
    );


  const [
    total,
    setTotal,
  ] =
    useState(
      0,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );


  const [
    open,
    setOpen,
  ] =
    useState(
      false,
    );


  const [
    selectedIndex,
    setSelectedIndex,
  ] =
    useState(
      -1,
    );


  const trimmedQuery =
    query.trim();


  useEffect(
    () => {
      if (
        trimmedQuery.length <
        MIN_SEARCH_LENGTH
      ) {
        setResults(
          [],
        );

        setTotal(
          0,
        );

        setLoading(
          false,
        );

        setOpen(
          false,
        );

        setSelectedIndex(
          -1,
        );

        return;
      }


      const controller =
        new AbortController();


      const timeout =
        window.setTimeout(
          async () => {
            setLoading(
              true,
            );


            try {
              const response =
                await fetch(
                  `/api/recipes/search-suggestions?q=${encodeURIComponent(
                    trimmedQuery,
                  )}`,
                  {
                    signal:
                      controller.signal,

                    cache:
                      "no-store",
                  },
                );


              if (
                !response.ok
              ) {
                throw new Error(
                  "Search request failed",
                );
              }


              const data =
                (
                  await response.json()
                ) as SearchSuggestionResponse;


              setResults(
                data.results ??
                  [],
              );

              setTotal(
                data.total ??
                  0,
              );

              setOpen(
                true,
              );

              setSelectedIndex(
                -1,
              );

            } catch (
              error
            ) {
              if (
                error instanceof DOMException &&
                error.name ===
                  "AbortError"
              ) {
                return;
              }


              console.error(
                "RECIPE SEARCH AUTOCOMPLETE ERROR:",
                error,
              );


              setResults(
                [],
              );

              setTotal(
                0,
              );

              setOpen(
                true,
              );

              setSelectedIndex(
                -1,
              );

            } finally {
              if (
                !controller.signal.aborted
              ) {
                setLoading(
                  false,
                );
              }
            }
          },
          SEARCH_DELAY_MS,
        );


      return () => {
        window.clearTimeout(
          timeout,
        );

        controller.abort();
      };
    },
    [
      trimmedQuery,
    ],
  );


  function handleKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
      "Escape"
    ) {
      setOpen(
        false,
      );

      setSelectedIndex(
        -1,
      );

      return;
    }


    if (
      !open ||
      results.length ===
        0
    ) {
      return;
    }


    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();


      setSelectedIndex(
        (
          current,
        ) =>
          current >=
          results.length -
            1
            ? 0
            : current +
              1,
      );

      return;
    }


    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();


      setSelectedIndex(
        (
          current,
        ) =>
          current <=
          0
            ? results.length -
              1
            : current -
              1,
      );

      return;
    }


    if (
      event.key ===
        "Enter" &&
      selectedIndex >=
        0
    ) {
      event.preventDefault();


      const selectedRecipe =
        results[
          selectedIndex
        ];


      if (
        selectedRecipe
      ) {
        router.push(
          `/recipes/${selectedRecipe.slug}`,
        );

        setOpen(
          false,
        );
      }
    }
  }


  function handleBlur(
    event:
      React.FocusEvent<HTMLDivElement>,
  ) {
    const nextTarget =
      event.relatedTarget;


    if (
      nextTarget instanceof Node &&
      containerRef.current?.contains(
        nextTarget,
      )
    ) {
      return;
    }


    setOpen(
      false,
    );

    setSelectedIndex(
      -1,
    );
  }


  return (
    <div
      ref={
        containerRef
      }
      className="relative mx-auto mt-9 max-w-4xl"
      onBlur={
        handleBlur
      }
    >
      <form
        action="/recipes"
        method="get"
        role="search"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-2 shadow-md transition focus-within:border-brand/40 focus-within:ring-4 focus-within:ring-brand/10">
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3 sm:px-4">
            <Search
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />


            <input
              type="search"
              name="search"
              value={
                query
              }
              placeholder="Buscar recetas..."
              aria-label="Buscar recetas"
              aria-autocomplete="list"
              aria-expanded={
                open
              }
              aria-controls="recipe-search-suggestions"
              autoComplete="off"
              onChange={
                (
                  event,
                ) => {
                  setQuery(
                    event.target.value,
                  );

                  if (
                    event.target.value
                      .trim()
                      .length >=
                    MIN_SEARCH_LENGTH
                  ) {
                    setOpen(
                      true,
                    );
                  }
                }
              }
              onFocus={
                () => {
                  if (
                    trimmedQuery.length >=
                    MIN_SEARCH_LENGTH
                  ) {
                    setOpen(
                      true,
                    );
                  }
                }
              }
              onKeyDown={
                handleKeyDown
              }
              className="min-h-11 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
            />
          </div>


          <button
            type="submit"
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-inverse transition hover:bg-brand-hover sm:px-7"
          >
            Buscar
          </button>
        </div>
      </form>


      {open ? (
        <div
          id="recipe-search-suggestions"
          role="listbox"
          aria-label="Sugerencias de recetas"
          className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-xl"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-6 text-sm text-muted-foreground">
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />

              Buscando recetas...
            </div>
          ) : results.length >
            0 ? (
            <>
              <div className="p-2">
                {results.map(
                  (
                    recipe,
                    index,
                  ) => {
                    const difficultyLabel =
                      getDifficultyLabel(
                        recipe.difficulty,
                      );


                    return (
                      <Link
                        key={
                          recipe.id
                        }
                        href={`/recipes/${recipe.slug}`}
                        role="option"
                        aria-selected={
                          selectedIndex ===
                          index
                        }
                        onMouseEnter={
                          () =>
                            setSelectedIndex(
                              index,
                            )
                        }
                        onClick={
                          () =>
                            setOpen(
                              false,
                            )
                        }
                        className={
                          selectedIndex ===
                          index
                            ? "flex items-center gap-4 rounded-xl bg-page-muted p-3 transition"
                            : "flex items-center gap-4 rounded-xl p-3 transition hover:bg-page-muted"
                        }
                      >
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-page-muted">
                          {recipe.imageUrl ? (
                            <img
                              src={
                                recipe.imageUrl
                              }
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-brand">
                              <ChefHat
                                className="size-6"
                                aria-hidden="true"
                              />
                            </div>
                          )}
                        </div>


                        <div className="min-w-0 flex-1">
                          <p className="truncate font-serif text-base font-bold text-foreground">
                            {
                              recipe.title
                            }
                          </p>


                          {recipe.shortDescription ? (
                            <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                              {
                                recipe.shortDescription
                              }
                            </p>
                          ) : null}


                          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {recipe.totalMinutes >
                            0 ? (
                              <span className="inline-flex items-center gap-1">
                                <Clock3
                                  className="size-3.5 text-brand"
                                  aria-hidden="true"
                                />

                                {
                                  recipe.totalMinutes
                                } min
                              </span>
                            ) : null}


                            {difficultyLabel ? (
                              <span>
                                {
                                  difficultyLabel
                                }
                              </span>
                            ) : null}
                          </div>
                        </div>


                        <ArrowRight
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  },
                )}
              </div>


              <Link
                href={`/recipes?search=${encodeURIComponent(
                  trimmedQuery,
                )}`}
                onClick={
                  () =>
                    setOpen(
                      false,
                    )
                }
                className="flex items-center justify-between gap-4 border-t border-border bg-page-muted/40 px-5 py-3.5 text-sm font-semibold text-brand transition hover:bg-page-muted hover:text-brand-hover"
              >
                <span>
                  Ver todos los resultados para “
                  {
                    trimmedQuery
                  }
                  ”
                </span>

                <span className="text-xs font-medium text-muted-foreground">
                  {
                    total
                  }{" "}
                  {total ===
                  1
                    ? "resultado"
                    : "resultados"}
                </span>
              </Link>
            </>
          ) : (
            <div className="px-5 py-6 text-center">
              <p className="text-sm font-semibold text-foreground">
                No encontramos coincidencias
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Prueba con otro nombre de receta.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
