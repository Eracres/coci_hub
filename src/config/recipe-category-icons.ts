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
  Globe,
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


const RECIPE_CATEGORY_ICONS:
  Record<
    string,
    LucideIcon
  > = {
    /*
     * =====================================================
     * INGREDIENTE PRINCIPAL
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Carnes",
    )]:
      Beef,

    [normalizeRecipeCategoryName(
      "Aves",
    )]:
      Drumstick,

    [normalizeRecipeCategoryName(
      "Cerdo",
    )]:
      Ham,

    [normalizeRecipeCategoryName(
      "Pescados",
    )]:
      Fish,

    [normalizeRecipeCategoryName(
      "Mariscos",
    )]:
      Shell,

    [normalizeRecipeCategoryName(
      "Arroces",
    )]:
      ChefHat,

    [normalizeRecipeCategoryName(
      "Pasta",
    )]:
      ChefHat,

    [normalizeRecipeCategoryName(
      "Verduras y hortalizas",
    )]:
      Leaf,

    [normalizeRecipeCategoryName(
      "Legumbres",
    )]:
      Bean,

    [normalizeRecipeCategoryName(
      "Setas y hongos",
    )]:
      Leaf,

    [normalizeRecipeCategoryName(
      "Patatas",
    )]:
      Leaf,

    [normalizeRecipeCategoryName(
      "Frutas",
    )]:
      Apple,

    [normalizeRecipeCategoryName(
      "Frutos secos",
    )]:
      Leaf,

    [normalizeRecipeCategoryName(
      "Huevos",
    )]:
      ChefHat,

    [normalizeRecipeCategoryName(
      "Quesos y lácteos",
    )]:
      ChefHat,


    /*
     * =====================================================
     * TIPO DE PREPARACIÓN O FORMATO
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Ensaladas",
    )]:
      Leaf,

    [normalizeRecipeCategoryName(
      "Sopas y cremas",
    )]:
      Soup,

    [normalizeRecipeCategoryName(
      "Guisos y estofados",
    )]:
      Soup,

    [normalizeRecipeCategoryName(
      "Platos de cuchara",
    )]:
      Soup,

    [normalizeRecipeCategoryName(
      "Salsas",
    )]:
      Droplet,

    [normalizeRecipeCategoryName(
      "Croquetas y frituras",
    )]:
      Flame,

    [normalizeRecipeCategoryName(
      "Panes y masas",
    )]:
      Sandwich,

    [normalizeRecipeCategoryName(
      "Pizzas",
    )]:
      ChefHat,

    [normalizeRecipeCategoryName(
      "Bocadillos y sándwiches",
    )]:
      Sandwich,

    [normalizeRecipeCategoryName(
      "Empanadas",
    )]:
      Sandwich,

    [normalizeRecipeCategoryName(
      "Tartas y pasteles",
    )]:
      Sparkles,

    [normalizeRecipeCategoryName(
      "Galletas y dulces",
    )]:
      Sparkles,

    [normalizeRecipeCategoryName(
      "Helados y postres fríos",
    )]:
      Snowflake,

    [normalizeRecipeCategoryName(
      "Conservas y encurtidos",
    )]:
      Package,

    [normalizeRecipeCategoryName(
      "Bebidas",
    )]:
      Droplet,


    /*
     * =====================================================
     * COCINA Y ORIGEN GASTRONÓMICO
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Cocina española",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina francesa",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina italiana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina mexicana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina colombiana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina venezolana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina ecuatoriana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina peruana",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina china",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina japonesa",
    )]:
      Globe,

    [normalizeRecipeCategoryName(
      "Cocina india",
    )]:
      Globe,


    /*
     * =====================================================
     * ESTILO DE COCINA
     * =====================================================
     */

    [normalizeRecipeCategoryName(
      "Cocina tradicional",
    )]:
      BookOpen,
  };


export function getRecipeCategoryIcon(
  categoryName:
    string,
): LucideIcon {
  return (
    RECIPE_CATEGORY_ICONS[
      normalizeRecipeCategoryName(
        categoryName,
      )
    ] ??
    Tag
  );
}
