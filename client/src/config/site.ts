// Site configuration for SEO and metadata
export const SITE = {
  name: "RunYourTrip",
  url: "https://www.runyourtrip.com.br",
  // Global fallbacks (used if a page doesn't provide its own)
  defaultTitle: "Run Your Trip — Monte sua viagem em minutos",
  defaultDescription:
    "Planeje e reserve viagens personalizadas no Brasil com transparência e rapidez. Crie templates de sites de viagem com IA.",
  defaultImage: "/og.jpg", // ensure this exists at public root
  themeColor: "#0ea5e9",
  // Additional metadata
  locale: "pt_BR",
  twitterHandle: "@runyourtrip",
  // Business information
  business: {
    legalName: "RunYourTrip LTDA",
    email: "contato@runyourtrip.com.br",
    phone: "+55 11 99999-9999",
    address: {
      streetAddress: "Av. Paulista, 1000",
      addressLocality: "São Paulo",
      addressRegion: "SP",
      postalCode: "01310-100",
      addressCountry: "BR"
    }
  }
};