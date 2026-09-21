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

import {
  getPublicCategoryBySlug,
} from "@/services/categories/public-category-service";


type CategoryLayoutProps = {
  children:
    ReactNode;

  params:
    Promise<{
      slug:
        string;
    }>;
};


export async function generateMetadata({
  params,
}: CategoryLayoutProps): Promise<Metadata> {
  const {
    slug,
  } =
    await params;


  const result =
    await getPublicCategoryBySlug(
      slug,
    );


  if (
    !result
  ) {
    return {
      robots: {
        index:
          false,

        follow:
          false,
      },
    };
  }


  const title =
    `${result.category.name} | CociHub`;


  const description =
    `Descubre las recetas de ${result.category.name} disponibles en CociHub.`;


  const canonicalUrl =
    absoluteUrl(
      `/categories/${result.category.slug}`,
    );


  return {
    alternates: {
      canonical:
        canonicalUrl,
    },

    openGraph: {
      type:
        "website",

      locale:
        siteConfig.locale,

      siteName:
        siteConfig.name,

      title,

      description,

      url:
        canonicalUrl,
    },

    twitter: {
      card:
        "summary",

      title,

      description,
    },
  };
}


export default function CategorySeoLayout({
  children,
}: CategoryLayoutProps) {
  return children;
}