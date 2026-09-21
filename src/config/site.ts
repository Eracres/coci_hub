const rawSiteUrl =
  process.env
    .NEXT_PUBLIC_SITE_URL
    ?.trim() ||
  "http://localhost:3000";


const normalizedSiteUrl =
  rawSiteUrl.replace(
    /\/+$/,
    "",
  );


export const siteConfig = {
  name:
    "CociHub",

  description:
    "Recetas caseras explicadas paso a paso para cocinar, compartir y disfrutar.",

  slogan:
    "Comer es un placer, cocinar un privilegio, enseñar una responsabilidad.",

  url:
    normalizedSiteUrl,

  locale:
    "es_ES",

  language:
    "es",
} as const;


export function absoluteUrl(
  path:
    string = "/",
) {
  if (
    /^https?:\/\//i.test(
      path,
    )
  ) {
    return path;
  }


  const normalizedPath =
    path.startsWith(
      "/",
    )
      ? path
      : `/${path}`;


  return `${siteConfig.url}${normalizedPath}`;
}