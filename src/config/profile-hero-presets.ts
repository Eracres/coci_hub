export const PROFILE_HERO_PRESETS = [
  {
    key:
      "mediterranean-table",

    label:
      "Mesa mediterránea",

    description:
      "Tomates, aceite de oliva, ajo y hierbas bajo una luz cálida.",

    placeholderBackground:
      "radial-gradient(circle at 35% 40%, rgba(217, 93, 57, 0.72), transparent 28%), radial-gradient(circle at 62% 58%, rgba(113, 140, 102, 0.64), transparent 30%), linear-gradient(120deg, #f4d7b5 0%, #e5a93d 38%, #a63f25 100%)",
  },

  {
    key:
      "traditional-stove",

    label:
      "Fogones tradicionales",

    description:
      "Cazuelas, cobre y cocina lenta con una atmósfera de hogar.",

    placeholderBackground:
      "radial-gradient(circle at 48% 46%, rgba(229, 169, 61, 0.62), transparent 26%), radial-gradient(circle at 75% 42%, rgba(166, 63, 37, 0.55), transparent 28%), linear-gradient(125deg, #4f352a 0%, #9b5f35 44%, #e8c28c 100%)",
  },

  {
    key:
      "herbs-and-garden",

    label:
      "Huerto y especias",

    description:
      "Hierbas frescas, macetas y vegetales en un rincón lleno de vida.",

    placeholderBackground:
      "radial-gradient(circle at 36% 42%, rgba(229, 169, 61, 0.48), transparent 26%), radial-gradient(circle at 68% 50%, rgba(78, 104, 71, 0.76), transparent 34%), linear-gradient(125deg, #d9d7a4 0%, #718c66 48%, #3d5940 100%)",
  },

  {
    key:
      "artisan-bakery",

    label:
      "Panadería artesanal",

    description:
      "Pan recién hecho, harina y tonos de trigo sobre una mesa rústica.",

    placeholderBackground:
      "radial-gradient(circle at 45% 48%, rgba(255, 249, 242, 0.52), transparent 24%), radial-gradient(circle at 73% 50%, rgba(180, 113, 55, 0.52), transparent 32%), linear-gradient(120deg, #f3dfba 0%, #c99556 52%, #805238 100%)",
  },

  {
    key:
      "rustic-pantry",

    label:
      "Despensa rústica",

    description:
      "Tarros, conservas y productos de temporada con carácter artesanal.",

    placeholderBackground:
      "radial-gradient(circle at 40% 48%, rgba(113, 140, 102, 0.62), transparent 28%), radial-gradient(circle at 70% 45%, rgba(217, 93, 57, 0.56), transparent 27%), linear-gradient(125deg, #ddd1a8 0%, #92834f 44%, #654737 100%)",
  },

  {
    key:
      "mexican-kitchen",

    label:
      "Cocina mexicana",

    description:
      "Color, cerámica, maíz y chiles en una escena gastronómica luminosa.",

    placeholderBackground:
      "radial-gradient(circle at 30% 45%, rgba(217, 93, 57, 0.78), transparent 26%), radial-gradient(circle at 62% 58%, rgba(229, 169, 61, 0.76), transparent 26%), radial-gradient(circle at 78% 34%, rgba(78, 104, 71, 0.62), transparent 24%), linear-gradient(120deg, #c9482d 0%, #e8a83b 52%, #497045 100%)",
  },
] as const;


export type ProfileHeroPreset =
  (
    typeof PROFILE_HERO_PRESETS
  )[number];


export type ProfileHeroPresetKey =
  ProfileHeroPreset["key"];


const PROFILE_HERO_PRESET_KEYS =
  new Set<
    ProfileHeroPresetKey
  >(
    PROFILE_HERO_PRESETS.map(
      (
        preset,
      ) =>
        preset.key,
    ),
  );


export function isProfileHeroPresetKey(
  value:
    string,
): value is ProfileHeroPresetKey {
  return PROFILE_HERO_PRESET_KEYS.has(
    value as
      ProfileHeroPresetKey,
  );
}


export function getProfileHeroPreset(
  value:
    string | null | undefined,
) {
  if (
    !value
  ) {
    return null;
  }


  return (
    PROFILE_HERO_PRESETS.find(
      (
        preset,
      ) =>
        preset.key ===
        value,
    ) ??
    null
  );
}
