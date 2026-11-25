
import type { NextConfig } from "next";

type RemotePatterns = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>;

const remotePatterns: RemotePatterns = [];

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

if (supabaseUrl) {
  const parsedSupabaseUrl = new URL(supabaseUrl);

  remotePatterns.push({
    protocol:
      parsedSupabaseUrl.protocol === "http:"
        ? "http"
        : "https",

    hostname: parsedSupabaseUrl.hostname,

    port: parsedSupabaseUrl.port,

    pathname: "/storage/v1/object/public/**",
  });
}

// =======================================================
// GITHUB CODESPACES
// =======================================================

const codespaceName = process.env.CODESPACE_NAME;

const codespaceDomain =
  process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;

const codespaceOrigin =
  process.env.NODE_ENV === "development" &&
  codespaceName &&
  codespaceDomain
    ? `${codespaceName}-3000.${codespaceDomain}`
    : undefined;

// =======================================================
// NEXT.JS CONFIGURATION
// =======================================================

const nextConfig: NextConfig = {
  // =====================================================
  // TURBOPACK
  // =====================================================

  turbopack: {
    root: process.cwd(),
  },

  // =====================================================
  // IMAGES
  // =====================================================

  images: {
    formats: ["image/avif", "image/webp"],

    remotePatterns,
  },

  // =====================================================
  // CODESPACES DEVELOPMENT
  // =====================================================

  ...(codespaceOrigin
    ? {
        allowedDevOrigins: [codespaceOrigin],

        experimental: {
          serverActions: {
            allowedOrigins: [
              codespaceOrigin,
              "localhost:3000",
            ],
          },
        },
      }
    : {}),
};

export default nextConfig;
