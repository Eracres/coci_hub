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
      "/recipes",
  },

  openGraph: {
    type:
      "website",

    locale:
      siteConfig.locale,

    siteName:
      siteConfig.name,

    title:
      "Recetas | CociHub",

    description:
      "Explora las recetas publicadas en CociHub y encuentra nuevas ideas para cocinar.",

    url:
      absoluteUrl(
        "/recipes",
      ),
  },

  twitter: {
    card:
      "summary",

    title:
      "Recetas | CociHub",

    description:
      "Explora las recetas publicadas en CociHub y encuentra nuevas ideas para cocinar.",
  },
};


type RecipesLayoutProps = {
  children:
    ReactNode;
};


export default function RecipesLayout({
  children,
}: RecipesLayoutProps) {
  return children;
}