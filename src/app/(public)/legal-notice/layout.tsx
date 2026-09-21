import type {
  ReactNode,
} from "react";

import {
  createStaticPageMetadata,
} from "@/lib/seo/create-static-page-metadata";


export const metadata =
  createStaticPageMetadata({
    title:
      "Aviso legal",

    description:
      "Información legal relativa al acceso y utilización de CociHub.",

    path:
      "/legal-notice",
  });


type LegalNoticeLayoutProps = {
  children:
    ReactNode;
};


export default function LegalNoticeLayout({
  children,
}: LegalNoticeLayoutProps) {
  return children;
}