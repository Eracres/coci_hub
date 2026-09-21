import type {
  Metadata,
} from "next";

import {
  Inter,
  Lora,
} from "next/font/google";

import {
  siteConfig,
} from "@/config/site";

import "./globals.css";


const inter =
  Inter({
    variable:
      "--font-inter",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });


const lora =
  Lora({
    variable:
      "--font-lora",

    subsets: [
      "latin",
    ],

    display:
      "swap",
  });


export const metadata:
  Metadata = {
  metadataBase:
    new URL(
      siteConfig.url,
    ),

  applicationName:
    siteConfig.name,

  title: {
    default:
      siteConfig.name,

    template:
      `%s | ${siteConfig.name}`,
  },

  description:
    siteConfig.description,

  icons: {
    icon:
      "/favicon.ico",
  },

  robots: {
    index:
      true,

    follow:
      true,
  },

  formatDetection: {
    email:
      false,

    address:
      false,

    telephone:
      false,
  },

  openGraph: {
    type:
      "website",

    locale:
      siteConfig.locale,

    siteName:
      siteConfig.name,

    title:
      siteConfig.name,

    description:
      siteConfig.description,

    url:
      siteConfig.url,
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      siteConfig.name,

    description:
      siteConfig.description,
  },
};


type RootLayoutProps =
  Readonly<{
    children:
      React.ReactNode;
  }>;


export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${lora.variable}`}
      >
        {children}
      </body>
    </html>
  );
}