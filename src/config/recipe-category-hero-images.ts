export type RecipeCategoryHeroImage = {
  src:
    string;

  alt:
    string;
};


/*
 * =========================================================
 * CATEGORY HERO IMAGES
 * =========================================================
 *
 * Specific hero artwork for individual recipe categories.
 *
 * Images live in:
 *
 *   /public/category-heroes/
 *
 * The collection uses CociHub's common visual direction:
 *
 *   - gastronomic oil painting
 *   - visible but controlled brushwork
 *   - warm natural light
 *   - appetising food
 *   - clean editorial composition
 *   - subject weighted toward the right side
 *   - safe visual space on the left for the curved mask
 * =========================================================
 */

const CATEGORY_HERO_IMAGES:
  Record<
    string,
    RecipeCategoryHeroImage
  > = {
    "cocina-mexicana": {
      src:
        "/category-heroes/cocina-mexicana.png",

      alt:
        "Ilustración al óleo de un molcajete con guacamole, chile y lima sobre un textil mexicano.",
    },
  };


/*
 * =========================================================
 * SECTION FALLBACK IMAGES
 * =========================================================
 *
 * Optional fallback artwork shared by categories from the
 * same taxonomy section.
 * =========================================================
 */

const CATEGORY_SECTION_HERO_IMAGES:
  Record<
    string,
    RecipeCategoryHeroImage
  > = {
};


/*
 * =========================================================
 * PUBLIC HELPER
 * =========================================================
 */

export function getRecipeCategoryHeroImage(
  categorySlug:
    string,

  sectionTitle?:
    string | null,
): RecipeCategoryHeroImage | null {
  const categoryImage =
    CATEGORY_HERO_IMAGES[
      categorySlug
    ];


  if (
    categoryImage
  ) {
    return categoryImage;
  }


  if (
    sectionTitle
  ) {
    const sectionImage =
      CATEGORY_SECTION_HERO_IMAGES[
        sectionTitle
      ];


    if (
      sectionImage
    ) {
      return sectionImage;
    }
  }


  return null;
}