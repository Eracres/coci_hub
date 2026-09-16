import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
} from "lucide-react";

import type {
  PublicCategorySummary,
} from "@/types/public-category";


type CategoryCardProps = {
  category:
    PublicCategorySummary;
};


export function CategoryCard({
  category,
}: CategoryCardProps) {
  return (
    <article className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <Link
        href={`/categories/${category.slug}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-brand">
            <BookOpen
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>


          <ArrowRight
            className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand"
            aria-hidden="true"
          />
        </div>


        <h2 className="mt-6 font-serif text-2xl font-bold text-foreground">
          {
            category.name
          }
        </h2>


        <p className="mt-2 text-sm text-muted-foreground">
          {category.recipeCount ===
          1
            ? "1 receta publicada"
            : `${category.recipeCount} recetas publicadas`}
        </p>


        <div className="mt-5 text-sm font-semibold text-brand">
          Ver recetas →
        </div>
      </Link>
    </article>
  );
}