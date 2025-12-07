import { Helmet } from 'react-helmet-async';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  article?: {
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

export function SEOMeta({
  title = "Run Your Trip - Sua Próxima Viagem Começa Aqui",
  description = "Monte sua viagem grátis em minutos. Plataforma completa para planejamento de viagens personalizadas no Brasil. Roteiros, reservas e dicas em um só lugar.",
  keywords = "viagens personalizadas Brasil, planejamento de viagem, roteiro de viagem, reservas online, turismo Brasil",
  image = "https://runyourtrip.com/og-image.jpg",
  url = "https://runyourtrip.com",
  type = "website",
  article
}: SEOMetaProps) {
  const fullTitle = title.includes('Run Your Trip') 
    ? title 
    : `${title} | Run Your Trip`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="Run Your Trip" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Article specific meta tags */}
      {article && (
        <>
          {article.author && <meta property="article:author" content={article.author} />}
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}

// Page-specific meta components
export function MarketplaceMeta() {
  return (
    <SEOMeta
      title="Marketplace de Templates - Encontre o Site Perfeito"
      description="Explore centenas de templates profissionais para agências de viagem, blogs e plataformas de reserva. Preços acessíveis e personalização completa."
      keywords="templates viagem, sites prontos, website agência turismo, template blog viagem"
      url="https://runyourtrip.com/marketplace"
    />
  );
}

export function PricingMeta() {
  return (
    <SEOMeta
      title="Planos e Preços - Escolha o Ideal para Você"
      description="Planos flexíveis a partir de R$ 19,90/mês. Compare recursos e escolha o melhor para sua agência de viagens ou blog."
      keywords="preços plataforma viagem, planos agência turismo, quanto custa site viagem"
      url="https://runyourtrip.com/pricing"
    />
  );
}

export function HomeMeta() {
  return (
    <SEOMeta
      title="Dashboard - Gerencie Suas Viagens"
      description="Painel completo para gerenciar templates, projetos e análises de sua plataforma de viagens."
      url="https://runyourtrip.com/dashboard"
    />
  );
}

export function LandingMeta() {
  return (
    <SEOMeta
      title="Monte Sua Viagem em Minutos - Run Your Trip"
      description="Crie roteiros personalizados, reserve hotéis com desconto e ganhe R$ 10 por cada amigo indicado. Comece grátis agora!"
      keywords="criar roteiro viagem, planejar viagem Brasil, viagem personalizada, desconto hotel"
      url="https://runyourtrip.com"
    />
  );
}