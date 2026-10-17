import type {
  LucideIcon,
} from "lucide-react";

import {
  Apple,
  Bean,
  Beef,
  BookOpen,
  ChefHat,
  Droplet,
  Drumstick,
  Fish,
  Flame,
  Ham,
  Leaf,
  Package,
  Sandwich,
  Shell,
  Snowflake,
  Soup,
  Sparkles,
  Tag,
} from "lucide-react";

import {
  normalizeRecipeCategoryName,
} from "@/config/recipe-category-sections";


export type RecipeCategoryVisual =
  | {
      kind:
        "icon";

      icon:
        LucideIcon;
    }
  | {
      kind:
        "flag";

      flag:
        string;
    };


function icon(
  value:
    LucideIcon,
): RecipeCategoryVisual {
  return {
    kind:
      "icon",

    icon:
      value,
  };
}


function flag(
  value:
    string,
): RecipeCategoryVisual {
  return {
    kind:
      "flag",

    flag:
      value,
  };
}


const DEFAULT_RECIPE_CATEGORY_VISUAL =
  icon(
    Tag,
  );


const RECIPE_CATEGORY_VISUALS:
  Record<
    string,
    RecipeCategoryVisual
  > = {
    /*
     * =====================================================
     * INGREDIENTE PRINCIPAL
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Carnes",
    )]:
      icon(
        Beef,
      ),

    [normalizeRecipeCategoryName(
      "Aves",
    )]:
      icon(
        Drumstick,
      ),

    [normalizeRecipeCategoryName(
      "Cerdo",
    )]:
      icon(
        Ham,
      ),

    [normalizeRecipeCategoryName(
      "Pescados",
    )]:
      icon(
        Fish,
      ),

    [normalizeRecipeCategoryName(
      "Mariscos",
    )]:
      icon(
        Shell,
      ),

    [normalizeRecipeCategoryName(
      "Arroces",
    )]:
      icon(
        ChefHat,
      ),

    [normalizeRecipeCategoryName(
      "Pasta",
    )]:
      icon(
        ChefHat,
      ),

    [normalizeRecipeCategoryName(
      "Verduras y hortalizas",
    )]:
      icon(
        Leaf,
      ),

    [normalizeRecipeCategoryName(
      "Legumbres",
    )]:
      icon(
        Bean,
      ),

    [normalizeRecipeCategoryName(
      "Setas y hongos",
    )]:
      icon(
        Leaf,
      ),

    [normalizeRecipeCategoryName(
      "Patatas",
    )]:
      icon(
        Leaf,
      ),

    [normalizeRecipeCategoryName(
      "Frutas",
    )]:
      icon(
        Apple,
      ),

    [normalizeRecipeCategoryName(
      "Frutos secos",
    )]:
      icon(
        Leaf,
      ),

    [normalizeRecipeCategoryName(
      "Huevos",
    )]:
      icon(
        ChefHat,
      ),

    [normalizeRecipeCategoryName(
      "Quesos y lácteos",
    )]:
      icon(
        ChefHat,
      ),


    /*
     * =====================================================
     * TIPO DE PREPARACIÓN O FORMATO
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Ensaladas",
    )]:
      icon(
        Leaf,
      ),

    [normalizeRecipeCategoryName(
      "Sopas y cremas",
    )]:
      icon(
        Soup,
      ),

    [normalizeRecipeCategoryName(
      "Guisos y estofados",
    )]:
      icon(
        Soup,
      ),

    [normalizeRecipeCategoryName(
      "Platos de cuchara",
    )]:
      icon(
        Soup,
      ),

    [normalizeRecipeCategoryName(
      "Salsas",
    )]:
      icon(
        Droplet,
      ),

    [normalizeRecipeCategoryName(
      "Croquetas y frituras",
    )]:
      icon(
        Flame,
      ),

    [normalizeRecipeCategoryName(
      "Panes y masas",
    )]:
      icon(
        Sandwich,
      ),

    [normalizeRecipeCategoryName(
      "Pizzas",
    )]:
      icon(
        ChefHat,
      ),

    [normalizeRecipeCategoryName(
      "Bocadillos y sándwiches",
    )]:
      icon(
        Sandwich,
      ),

    [normalizeRecipeCategoryName(
      "Empanadas",
    )]:
      icon(
        Sandwich,
      ),

    [normalizeRecipeCategoryName(
      "Tartas y pasteles",
    )]:
      icon(
        Sparkles,
      ),

    [normalizeRecipeCategoryName(
      "Galletas y dulces",
    )]:
      icon(
        Sparkles,
      ),

    [normalizeRecipeCategoryName(
      "Helados y postres fríos",
    )]:
      icon(
        Snowflake,
      ),

    [normalizeRecipeCategoryName(
      "Conservas y encurtidos",
    )]:
      icon(
        Package,
      ),

    [normalizeRecipeCategoryName(
      "Bebidas",
    )]:
      icon(
        Droplet,
      ),


    /*
     * =====================================================
     * COCINA Y ORIGEN GASTRONÓMICO
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Cocina española",
    )]:
      flag(
        "🇪🇸",
      ),

    [normalizeRecipeCategoryName(
      "Cocina francesa",
    )]:
      flag(
        "🇫🇷",
      ),

    [normalizeRecipeCategoryName(
      "Cocina italiana",
    )]:
      flag(
        "🇮🇹",
      ),

    [normalizeRecipeCategoryName(
      "Cocina mexicana",
    )]:
      flag(
        "🇲🇽",
      ),

    [normalizeRecipeCategoryName(
      "Cocina colombiana",
    )]:
      flag(
        "🇨🇴",
      ),

    [normalizeRecipeCategoryName(
      "Cocina ecuatoriana",
    )]:
      flag(
        "🇪🇨",
      ),

    [normalizeRecipeCategoryName(
      "Cocina peruana",
    )]:
      flag(
        "🇵🇪",
      ),

    [normalizeRecipeCategoryName(
      "Cocina china",
    )]:
      flag(
        "🇨🇳",
      ),

    [normalizeRecipeCategoryName(
      "Cocina japonesa",
    )]:
      flag(
        "🇯🇵",
      ),

    [normalizeRecipeCategoryName(
      "Cocina india",
    )]:
      flag(
        "🇮🇳",
      ),


    /*
     * =====================================================
     * ESTILO DE COCINA
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Cocina tradicional",
    )]:
      icon(
        BookOpen,
      ),
  };


export function getRecipeCategoryVisual(
  categoryName:
    string,
): RecipeCategoryVisual {
  return (
    RECIPE_CATEGORY_VISUALS[
      normalizeRecipeCategoryName(
        categoryName,
      )
    ] ??
    DEFAULT_RECIPE_CATEGORY_VISUAL
  );
}