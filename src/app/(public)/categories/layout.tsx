import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  absoluteUrl,
  siteConfig,
} from "@/config/site";


export const metadata:
  Metadata = {
  alternates: {
    canonical:
      "/categories",
  },

  openGraph: {
    type:
      "website",

    locale:
      siteConfig.locale,

    siteName:
      siteConfig.name,

    title:
      "Categorías | CociHub",

    description:
      "Explora las recetas de CociHub organizadas por categorías.",

    url:
      absoluteUrl(
        "/categories",
      ),
  },

  twitter: {
    card:
      "summary",

    title:
      "Categorías | CociHub",

    description:
      "Explora las recetas de CociHub organizadas por categorías.",
  },
};


type CategoriesLayoutProps = {
  children:
    ReactNode;
};


export default function CategoriesLayout({
  children,
}: CategoriesLayoutProps) {
  return children;
}