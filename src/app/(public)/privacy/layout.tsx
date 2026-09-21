import type {
  ReactNode,
} from "react";

import {
  createStaticPageMetadata,
} from "@/lib/seo/create-static-page-metadata";


export const metadata =
  createStaticPageMetadata({
    title:
      "Política de privacidad",

    description:
      "Información sobre privacidad y tratamiento de datos personales en CociHub.",

    path:
      "/privacy",
  });


type PrivacyLayoutProps = {
  children:
    ReactNode;
};


export default function PrivacyLayout({
  children,
}: PrivacyLayoutProps) {
  return children;
}