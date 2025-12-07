import { useQuery } from "@tanstack/react-query";
import { BRAND_CONFIG } from "@/lib/constants";
import { TrendingUp, Package, DollarSign, Target, Sparkles } from "lucide-react";

interface DashboardMetrics {
  templatesGenerated: number;
  successfulDeployments: number;
  totalSales: number;
  totalRevenue: string;
  conversionRate: number;
}

export default function WelcomeSection() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/analytics/dashboard-metrics"],
    refetchInterval: 30000,
  });

  const stats = [
    {
      label: "Templates Gerados",
      value: isLoading || !metrics ? "--" : metrics.templatesGenerated,
      icon: Package,
      color: "text-[#FF7A2E]",
      bgColor: "bg-[#FF7A2E]/10",
    },
    {
      label: "Deploys Realizados",
      value: isLoading || !metrics ? "--" : metrics.successfulDeployments,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      label: "Receita Total",
      value: isLoading || !metrics ? "--" : `R$${parseFloat(metrics.totalRevenue || "0").toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: "text-[#FF7A2E]",
      bgColor: "bg-[#FF7A2E]/10",
    },
    {
      label: "Taxa de Conversão",
      value: isLoading || !metrics ? "--" : `${metrics.conversionRate}%`,
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
  ];

  return (
    <div className="mb-8">
      {/* Hero Section */}
      <div className="phoenix-card relative overflow-hidden mb-6">
        {/* Glow effect background */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#FF7A2E]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#FF7A2E]/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#FF7A2E] rounded-lg glow-orange-sm">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-[#FF7A2E] font-semibold text-sm uppercase tracking-wider">
                Run Your Trip
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-[#EFEFEF] mb-3">
              Bem-vindo ao seu <span className="text-gradient">Império de Templates</span>
            </h1>

            <p className="text-[#9E9E9E] text-lg max-w-xl">
              {BRAND_CONFIG.description || "Crie, venda e automatize templates de viagem com IA."}
            </p>
          </div>

          {/* Optional illustration area */}
          <div className="hidden lg:block">
            <div className="w-48 h-48 bg-gradient-to-br from-[#FF7A2E]/20 to-transparent rounded-full flex items-center justify-center">
              <span className="text-6xl">✈️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="phoenix-card flex items-center gap-4 group"
            >
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-[#9E9E9E]">
                  {stat.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
