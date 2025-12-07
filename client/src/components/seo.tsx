import { Helmet } from "react-helmet-async";
import { SITE } from "@/config/site";

type SEOProps = {
  title?: string;
  description?: string;
  /** Path after domain, e.g. "/marketplace" */
  path?: string;
  image?: string; // absolute or relative
  noindex?: boolean;
  /** Optional JSON-LD. Will be stringified as-is. */
  structuredData?: Record<string, any> | Record<string, any>[];
};

function absoluteUrl(input?: string) {
  if (!input) return undefined;
  if (input.startsWith("http://") || input.startsWith("https://")) return input;
  return new URL(input, SITE.url).toString();
}

export default function SEO({
  title,
  description,
  path = "/",
  image,
  noindex,
  structuredData,
}: SEOProps) {
  const metaTitle = title || SITE.defaultTitle;
  const metaDesc = description || SITE.defaultDescription;
  const url = absoluteUrl(path) || SITE.url;
  const ogImage = absoluteUrl(image || SITE.defaultImage);

  return (
    <Helmet>
      {/* Primary */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={SITE.locale} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={SITE.twitterHandle} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Theme */}
      <meta name="theme-color" content={SITE.themeColor} />

      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, follow" />}

      {/* Optional JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {Array.isArray(structuredData)
            ? JSON.stringify(structuredData)
            : JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}