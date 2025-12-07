import { useLocation } from "wouter";
import SEO from "./seo";

type SEORouteProps = Omit<React.ComponentProps<typeof SEO>, "path">;

/**
 * SEO component that automatically derives the canonical URL from the current route
 * Useful for dynamic pages where you don't want to manually pass the path
 */
export default function SEORoute(props: SEORouteProps) {
  const [location] = useLocation();
  return <SEO {...props} path={location || "/"} />;
}