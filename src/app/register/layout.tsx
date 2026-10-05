import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";


export const metadata:
  Metadata = {
  title:
    "Crear cuenta | CociHub",

  description:
    "Crea tu cuenta en CociHub y empieza a compartir tus propias recetas.",

  robots: {
    index:
      false,

    follow:
      false,

    noarchive:
      true,

    noimageindex:
      true,

    nosnippet:
      true,
  },
};


type RegisterLayoutProps = {
  children:
    ReactNode;
};


export default function RegisterLayout({
  children,
}: RegisterLayoutProps) {
  return children;
}
