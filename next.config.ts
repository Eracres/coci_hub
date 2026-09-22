import type { NextConfig } from "next";

type RemotePatterns = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>;

const remotePatterns:
  RemotePatterns =
  [];

const supabaseUrl =
  process.env
    .NEXT_PUBLIC_SUPABASE_URL
    ?.trim();

if (
  supabaseUrl
) {
  const parsedSupabaseUrl =
    new URL(
      supabaseUrl,
    );

  remotePatterns.push(
    {
      protocol:
        parsedSupabaseUrl.protocol ===
        "http:"
          ? "http"
          : "https",

      hostname:
        parsedSupabaseUrl.hostname,

      port:
        parsedSupabaseUrl.port,

      pathname:
        "/storage/v1/object/public/**",
    },
  );
}

const nextConfig:
  NextConfig = {
  images: {
    formats: [
      "image/avif",
      "image/webp",
    ],

    remotePatterns,
  },
};

export default nextConfig;