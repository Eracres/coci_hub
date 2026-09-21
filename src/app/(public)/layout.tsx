import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  PublicFooter,
} from "@/components/layout/public-footer";

import {
  PublicHeader,
} from "@/components/layout/public-header";


export const metadata:
  Metadata = {
  alternates: {
    canonical:
      "/",
  },
};


type PublicLayoutProps =
  Readonly<{
    children:
      ReactNode;
  }>;


export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-foreground">
      <PublicHeader />

      <div className="flex-1">
        {children}
      </div>

      <PublicFooter />
    </div>
  );
}