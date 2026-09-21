import type {
  Metadata,
} from "next";

import {
  absoluteUrl,
  siteConfig,
} from "@/config/site";


type CreateStaticPageMetadataInput = {
  title:
    string;

  description:
    string;

  path:
    string;
};


export function createStaticPageMetadata({
  title,
  description,
  path,
}: CreateStaticPageMetadataInput): Metadata {
  const canonicalUrl =
    absoluteUrl(
      path,
    );


  const socialImage =
    absoluteUrl(
      "/opengraph-image",
    );


  const socialTitle =
    title ===
    siteConfig.name
      ? siteConfig.name
      : `${title} | ${siteConfig.name}`;


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

      title:
        socialTitle,

      description,

      url:
        canonicalUrl,

      images: [
        {
          url:
            socialImage,

          width:
            1200,

          height:
            630,

          alt:
            `${siteConfig.name} — ${title}`,
        },
      ],
    },

    twitter: {
      card:
        "summary_large_image",

      title:
        socialTitle,

      description,

      images: [
        socialImage,
      ],
    },
  };
}