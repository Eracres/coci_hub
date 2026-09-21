import type {
  ReactNode,
} from "react";

import {
  createStaticPageMetadata,
} from "@/lib/seo/create-static-page-metadata";


export const metadata =
  createStaticPageMetadata({
    title:
      "Política de cookies",

    description:
      "Información sobre el uso de cookies y tecnologías similares en CociHub.",

    path:
      "/cookies",
  });


type CookiesLayoutProps = {
  children:
    ReactNode;
};


export default function CookiesLayout({
  children,
}: CookiesLayoutProps) {
  return children;
}