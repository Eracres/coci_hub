"use client";

import {
  useEffect,
} from "react";

import {
  ErrorState,
} from "@/components/errors/error-state";


type PublicErrorProps = {
  error:
    Error & {
      digest?:
        string;
    };

  reset:
    () => void;
};


export default function PublicError({
  error,
  reset,
}: PublicErrorProps) {
  useEffect(
    () => {
      console.error(
        "PUBLIC ROUTE ERROR:",
        error,
      );
    },
    [
      error,
    ],
  );


  return (
    <ErrorState
      title="No hemos podido cargar esta parte de CociHub"
      description="Se ha producido un problema mientras intentábamos preparar el contenido. Tus datos no se han modificado."
      reset={
        reset
      }
    />
  );
}