import type {
  NextConfig,
} from "next";


type RemotePatterns =
  NonNullable<
    NonNullable<
      NextConfig[
        "images"
      ]
    >[
      "remotePatterns"
    ]
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

  // =======================================================
  // TURBOPACK
  // =======================================================
  //
  // CociHub has its own package-lock.json in the project
  // root.
  //
  // There is also an unrelated package-lock.json in the
  // user's home directory. Without an explicit root,
  // Turbopack can infer /home/eracres as the workspace root.
  //
  // process.cwd() points to the directory where
  // `npm run dev` is executed:
  //
  //   ~/Escritorio/coci_hub
  //
  // This keeps routing, cache and module resolution scoped
  // to the real CociHub project.
  // =======================================================

  turbopack: {
    root:
      process.cwd(),
  },


  // =======================================================
  // IMAGES
  // =======================================================

  images: {
    formats: [
      "image/avif",
      "image/webp",
    ],

    remotePatterns,
  },
};


export default nextConfig;