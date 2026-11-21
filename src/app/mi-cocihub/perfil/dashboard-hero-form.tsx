"use client";

import {
  Check,
  ChefHat,
  ImagePlus,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  Upload,
  UtensilsCrossed,
} from "lucide-react";

import type {
  CSSProperties,
} from "react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  PROFILE_HERO_PRESETS,
  getProfileHeroPreset,
} from "@/config/profile-hero-presets";

import {
  saveMyDashboardHeroAction,
} from "./dashboard-hero-actions";


type DashboardHeroType =
  | "preset"
  | "recipe"
  | "custom"
  | null;


type SelectableHeroType =
  | "preset"
  | "recipe"
  | null;


export type DashboardHeroRecipeOption = {
  id:
    string;

  title:
    string;

  imageUrl:
    string;
};


type DashboardHeroFormProps = {
  displayName:
    string;

  username:
    string;

  roleLabel:
    string;

  avatarUrl:
    string | null;

  initialHeroType:
    DashboardHeroType;

  initialHeroValue:
    string | null;

  recipes:
    DashboardHeroRecipeOption[];

  automaticRecipeImageUrl:
    string | null;
};


type ActiveTab =
  | "preset"
  | "recipe"
  | "custom";


type StatusMessage = {
  success:
    boolean;

  text:
    string;
};


function getInitials(
  value:
    string,
) {
  const parts =
    value
      .trim()
      .split(
        /\s+/,
      )
      .filter(
        Boolean,
      );


  if (
    parts.length ===
    0
  ) {
    return "U";
  }


  if (
    parts.length ===
    1
  ) {
    return parts[0]
      .slice(
        0,
        2,
      )
      .toUpperCase();
  }


  return (
    (
      parts[0]?.[0] ??
      ""
    ) +
    (
      parts[
        parts.length -
        1
      ]?.[0] ??
      ""
    )
  ).toUpperCase();
}


export function DashboardHeroForm({
  displayName,
  username,
  roleLabel,
  avatarUrl,
  initialHeroType,
  initialHeroValue,
  recipes,
  automaticRecipeImageUrl,
}: DashboardHeroFormProps) {
  const router =
    useRouter();


  const normalizedInitialType:
    SelectableHeroType =
      initialHeroType ===
        "preset" ||
      initialHeroType ===
        "recipe"
        ? initialHeroType
        : null;


  const [
    selectedType,
    setSelectedType,
  ] =
    useState<
      SelectableHeroType
    >(
      normalizedInitialType,
    );


  const [
    selectedValue,
    setSelectedValue,
  ] =
    useState<
      string | null
    >(
      normalizedInitialType
        ? initialHeroValue
        : null,
    );


  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      ActiveTab
    >(
      normalizedInitialType ??
      "preset",
    );


  const [
    message,
    setMessage,
  ] =
    useState<
      StatusMessage | null
    >(
      null,
    );


  const [
    isSaving,
    setIsSaving,
  ] =
    useState(
      false,
    );


  const selectedPreset =
    selectedType ===
    "preset"
      ? getProfileHeroPreset(
          selectedValue,
        )
      : null;


  const selectedRecipe =
    selectedType ===
    "recipe"
      ? (
          recipes.find(
            (
              recipe,
            ) =>
              recipe.id ===
              selectedValue,
          ) ??
          null
        )
      : null;


  const isAutomatic =
    selectedType ===
      null;


  const activeImageUrl =
    selectedRecipe
      ?.imageUrl ??
    (
      isAutomatic
        ? automaticRecipeImageUrl
        : null
    );


  let previewStyle:
    CSSProperties;


  if (
    selectedPreset
  ) {
    previewStyle = {
      background:
        selectedPreset
          .placeholderBackground,
    };

  } else if (
    activeImageUrl
  ) {
    previewStyle = {
      backgroundImage:
        `url("${activeImageUrl}")`,

      backgroundPosition:
        "center",

      backgroundSize:
        "cover",
    };

  } else {
    previewStyle = {
      background:
        "radial-gradient(circle at 35% 45%, rgba(217, 93, 57, 0.22), transparent 30%), radial-gradient(circle at 70% 45%, rgba(113, 140, 102, 0.22), transparent 30%), linear-gradient(120deg, #fff9f2 0%, #f4e9dc 100%)",
    };
  }


  function selectPreset(
    key:
      string,
  ) {
    setSelectedType(
      "preset",
    );


    setSelectedValue(
      key,
    );


    setActiveTab(
      "preset",
    );


    setMessage(
      null,
    );
  }


  function selectRecipe(
    id:
      string,
  ) {
    setSelectedType(
      "recipe",
    );


    setSelectedValue(
      id,
    );


    setActiveTab(
      "recipe",
    );


    setMessage(
      null,
    );
  }


  function selectAutomatic() {
    setSelectedType(
      null,
    );


    setSelectedValue(
      null,
    );


    setMessage(
      null,
    );
  }


  async function handleSave() {
    if (
      activeTab ===
      "custom"
    ) {
      return;
    }


    setMessage(
      null,
    );


    const formData =
      new FormData();


    formData.set(
      "heroType",
      selectedType ??
      "",
    );


    formData.set(
      "heroValue",
      selectedValue ??
      "",
    );


    setIsSaving(
      true,
    );


    try {
      const result =
        await saveMyDashboardHeroAction(
          formData,
        );


      setMessage({
        success:
          result.success,

        text:
          result.message,
      });


      if (
        result.success
      ) {
        router.refresh();
      }

    } finally {
      setIsSaving(
        false,
      );
    }
  }


  return (
    <section className="mt-8 border-t border-border pt-7">
      {/* ===================================================
          TITLE
      =================================================== */}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-8">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ImagePlus
              className="size-5"
              aria-hidden="true"
            />
          </span>


          <h2 className="font-serif text-3xl font-bold">
            Imagen de Mi CociHub
          </h2>
        </div>


        <p className="max-w-2xl pb-1 font-serif text-sm italic leading-6 text-muted-foreground">
          Elige la imagen que
          aparecerá en la cabecera de
          tu espacio personal y haz
          que Mi CociHub sea realmente
          tuyo.
        </p>
      </div>


      {/* ===================================================
          LIVE PREVIEW
      =================================================== */}

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
            Vista previa
          </p>


          <span className="rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted-foreground">
            {isAutomatic
              ? "Selección automática"
              : selectedType ===
                "preset"
                ? "Colección CociHub"
                : "Imagen de receta"}
          </span>
        </div>


        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface shadow-sm">
          <div className="relative grid min-h-[205px] gap-5 px-6 py-7 md:grid-cols-[auto_minmax(0,1fr)_210px] md:items-center lg:px-8">
            {/* BACKGROUND PREVIEW */}

            <div
              className="pointer-events-none absolute inset-y-0 left-[35%] right-[13%] hidden md:block"
              aria-hidden="true"
              style={{
                ...previewStyle,

                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)",

                maskImage:
                  "linear-gradient(to right, transparent 0%, black 22%, black 78%, transparent 100%)",
              }}
            />


            {/* AVATAR */}

            <div className="relative z-10 flex justify-center md:justify-start">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-page-muted shadow-md">
                {avatarUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={
                      avatarUrl
                    }
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-2xl font-bold text-brand">
                    {
                      getInitials(
                        displayName,
                      )
                    }
                  </span>
                )}
              </div>
            </div>


            {/* PROFILE */}

            <div className="relative z-10 min-w-0 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
                Mi CociHub
              </p>


              <h3 className="mt-1 font-serif text-3xl font-bold">
                Hola, {
                  displayName
                }
              </h3>


              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="font-semibold text-muted-foreground">
                  @
                  {
                    username
                  }
                </span>


                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">
                  <ChefHat
                    className="size-3"
                    aria-hidden="true"
                  />

                  {
                    roleLabel
                  }
                </span>
              </div>


              <p className="mt-3 max-w-md font-serif text-sm italic leading-6 text-muted-foreground">
                Este es tu espacio
                personal en CociHub.
              </p>
            </div>


            {/* MOCK ACTIONS */}

            <div className="relative z-10 hidden flex-col gap-2 md:flex">
              <span className="rounded-xl bg-brand px-4 py-2.5 text-center text-xs font-semibold text-inverse shadow-sm">
                + Nueva receta
              </span>


              <span className="rounded-xl border border-border bg-surface/95 px-4 py-2.5 text-center text-xs font-semibold shadow-sm">
                Editar perfil
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* ===================================================
          SOURCE SELECTOR
      =================================================== */}

      <div className="mt-6">
        <p className="font-serif text-xl font-bold">
          Elige el origen de tu imagen
        </p>


        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "preset",
                )
            }
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
              activeTab ===
              "preset"
                ? "border-brand bg-brand/[0.045] shadow-sm"
                : "border-border bg-surface hover:border-brand/30"
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Palette
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <span>
              <span className="block font-serif font-bold">
                Colección CociHub
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Fondos exclusivos
                con estética al óleo.
              </span>
            </span>
          </button>


          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "recipe",
                )
            }
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
              activeTab ===
              "recipe"
                ? "border-secondary bg-secondary/[0.055] shadow-sm"
                : "border-border bg-surface hover:border-secondary/40"
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary-hover">
              <UtensilsCrossed
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <span>
              <span className="block font-serif font-bold">
                Mis recetas
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Utiliza una fotografía
                de tu propio recetario.
              </span>
            </span>
          </button>


          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "custom",
                )
            }
            className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${
              activeTab ===
              "custom"
                ? "border-accent bg-accent/[0.07] shadow-sm"
                : "border-border bg-surface hover:border-accent/50"
            }`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-warning">
              <Upload
                className="size-5"
                aria-hidden="true"
              />
            </span>


            <span>
              <span className="block font-serif font-bold">
                Mi propia imagen
              </span>

              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Sube una fotografía
                panorámica personalizada.
              </span>
            </span>
          </button>
        </div>
      </div>


      {/* ===================================================
          PRESETS
      =================================================== */}

      {activeTab ===
      "preset" ? (
        <div className="mt-6 rounded-[2rem] border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
                CociHub al óleo
              </p>


              <h3 className="mt-1 font-serif text-2xl font-bold">
                Colección CociHub
              </h3>
            </div>


            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
              De momento utilizamos
              fondos temporales. Después
              los sustituiremos por las
              ilustraciones al óleo
              definitivas.
            </p>
          </div>


          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PROFILE_HERO_PRESETS.map(
              (
                preset,
              ) => {
                const selected =
                  selectedType ===
                    "preset" &&
                  selectedValue ===
                    preset.key;


                return (
                  <button
                    key={
                      preset.key
                    }
                    type="button"
                    onClick={
                      () =>
                        selectPreset(
                          preset.key,
                        )
                    }
                    className={`group overflow-hidden rounded-2xl border bg-page text-left transition ${
                      selected
                        ? "border-brand ring-2 ring-brand/15"
                        : "border-border hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className="relative aspect-[16/7]"
                      style={{
                        background:
                          preset.placeholderBackground,
                      }}
                    >
                      {selected ? (
                        <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-brand text-inverse shadow-md">
                          <Check
                            className="size-4"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}


                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/5" />
                    </div>


                    <div className="p-4">
                      <p className="font-serif text-lg font-bold">
                        {
                          preset.label
                        }
                      </p>


                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {
                          preset.description
                        }
                      </p>
                    </div>
                  </button>
                );
              },
            )}
          </div>
        </div>
      ) : null}


      {/* ===================================================
          RECIPES
      =================================================== */}

      {activeTab ===
      "recipe" ? (
        <div className="mt-6 rounded-[2rem] border border-border bg-surface p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-hover">
              Tu recetario
            </p>


            <h3 className="mt-1 font-serif text-2xl font-bold">
              Elige una de tus recetas
            </h3>


            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Solo aparecen las recetas
              que tienen una imagen
              principal disponible.
            </p>
          </div>


          {recipes.length >
          0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {recipes.map(
                (
                  recipe,
                ) => {
                  const selected =
                    selectedType ===
                      "recipe" &&
                    selectedValue ===
                      recipe.id;


                  return (
                    <button
                      key={
                        recipe.id
                      }
                      type="button"
                      onClick={
                        () =>
                          selectRecipe(
                            recipe.id,
                          )
                      }
                      className={`group overflow-hidden rounded-2xl border bg-page text-left transition ${
                        selected
                          ? "border-secondary ring-2 ring-secondary/15"
                          : "border-border hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-sm"
                      }`}
                    >
                      <div className="relative aspect-[16/7] overflow-hidden bg-page-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            recipe.imageUrl
                          }
                          alt=""
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                        />


                        {selected ? (
                          <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-secondary-hover text-inverse shadow-md">
                            <Check
                              className="size-4"
                              aria-hidden="true"
                            />
                          </span>
                        ) : null}


                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      </div>


                      <div className="p-4">
                        <p className="line-clamp-2 font-serif text-lg font-bold">
                          {
                            recipe.title
                          }
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border bg-page-muted/35 px-6 py-10 text-center">
              <UtensilsCrossed
                className="mx-auto size-7 text-secondary-hover"
                aria-hidden="true"
              />


              <p className="mt-3 font-serif text-lg font-bold">
                No tienes recetas con imagen
              </p>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Cuando alguna de tus
                recetas tenga fotografía,
                podrás utilizarla como
                imagen de Mi CociHub.
              </p>
            </div>
          )}
        </div>
      ) : null}


      {/* ===================================================
          CUSTOM IMAGE - NEXT STEP
      =================================================== */}

      {activeTab ===
      "custom" ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-accent/35 bg-accent/[0.035] px-6 py-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-warning">
            <Upload
              className="size-6"
              aria-hidden="true"
            />
          </span>


          <h3 className="mt-4 font-serif text-2xl font-bold">
            Tu propia imagen
          </h3>


          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            Esta opción se activará en
            el siguiente paso, cuando
            incorporemos el recorte
            panorámico, optimización WebP
            y almacenamiento seguro de
            la imagen.
          </p>
        </div>
      ) : null}


      {/* ===================================================
          SAVE / RESET
      =================================================== */}

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {isAutomatic
              ? "Modo automático activo"
              : selectedPreset
                ? selectedPreset.label
                : selectedRecipe
                  ? selectedRecipe.title
                  : "Selecciona una imagen"}
          </p>


          <p className="mt-1 text-xs text-muted-foreground">
            {isAutomatic
              ? "CociHub elegirá automáticamente una imagen disponible de tus recetas."
              : "La vista previa muestra cómo quedará antes de guardar."}
          </p>
        </div>


        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={
              selectAutomatic
            }
            disabled={
              isSaving
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:bg-page-muted disabled:opacity-50"
          >
            <RotateCcw
              className="size-4"
              aria-hidden="true"
            />

            Usar modo automático
          </button>


          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              isSaving ||
              activeTab ===
                "custom"
            }
            className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-inverse shadow-sm transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Save
                className="size-4"
                aria-hidden="true"
              />
            )}


            {isSaving
              ? "Guardando..."
              : "Guardar imagen de Mi CociHub"}
          </button>
        </div>
      </div>


      {message ? (
        <p
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
            message.success
              ? "border-secondary/25 bg-secondary/[0.06] text-foreground"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {
            message.text
          }
        </p>
      ) : null}
    </section>
  );
}
