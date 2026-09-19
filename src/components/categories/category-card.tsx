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
    <article className="group h-full">
      <Link
        href={`/categories/${category.slug}`}
        className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-secondary-hover transition duration-200 group-hover:bg-secondary group-hover:text-inverse">
            <BookOpen
              className="size-5"
              aria-hidden="true"
            />
          </span>


          <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition duration-200 group-hover:border-brand/30 group-hover:bg-brand/10 group-hover:text-brand">
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
        </div>


        <h2 className="mt-6 font-serif text-2xl font-bold leading-tight text-foreground transition-colors duration-200 group-hover:text-secondary-hover">
          {
            category.name
          }
        </h2>


        <div className="mt-3">
          <span className="inline-flex rounded-full bg-page-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
            {category.recipeCount ===
            1
              ? "1 receta publicada"
              : `${category.recipeCount} recetas publicadas`}
          </span>
        </div>


        <div className="mt-auto pt-6">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-secondary-hover">
            Explorar categoría

            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </article>
  );
}