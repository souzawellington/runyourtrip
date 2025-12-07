import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Eye, Download, DollarSign, ExternalLink, LayersIcon,
  BarChart3, Plug, ArrowDownToLine, Image, TrendingUp,
  ShoppingCart, Zap
} from "lucide-react";
import { Link } from "wouter";

export default function Sidebar() {
  const { data: dailyStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/daily"],
  });

  const { data: weeklyRevenueData } = useQuery({
    queryKey: ["/api/analytics/weekly-revenue"],
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
  });

  const liveDeployments = templates?.filter((t: any) => t.status === "live").slice(0, 3) || [];
  const weeklyRevenue = weeklyRevenueData?.revenue || "0";

  // Revenue trend data for visualization
  const revenueTrend = [45, 65, 55, 80, 70, 95, 85];
  const maxHeight = Math.max(...revenueTrend);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="phoenix-card">
        <h3 className="text-lg font-bold text-[#EFEFEF] mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#FF7A2E]" />
          Performance de Hoje
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-[#28282D] rounded-lg hover:bg-[#2E2E33] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF7A2E]/20 rounded-lg">
                <Eye className="text-[#FF7A2E]" size={16} />
              </div>
              <span className="text-[#9E9E9E]">Visualizações</span>
            </div>
            <span className="font-bold text-[#EFEFEF]">
              {statsLoading ? "--" : dailyStats?.views || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#28282D] rounded-lg hover:bg-[#2E2E33] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Download className="text-green-400" size={16} />
              </div>
              <span className="text-[#9E9E9E]">Downloads</span>
            </div>
            <span className="font-bold text-[#EFEFEF]">
              {statsLoading ? "--" : dailyStats?.downloads || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#28282D] rounded-lg hover:bg-[#2E2E33] transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FF7A2E]/20 rounded-lg">
                <DollarSign className="text-[#FF7A2E]" size={16} />
              </div>
              <span className="text-[#9E9E9E]">Receita</span>
            </div>
            <span className="font-bold text-[#FF7A2E]">
              R${statsLoading ? "--" : dailyStats?.revenue || "0"}
            </span>
          </div>
        </div>
      </div>

      {/* Live Deployments */}
      <div className="phoenix-card">
        <h3 className="text-lg font-bold text-[#EFEFEF] mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Deploys Ativos
        </h3>

        <div className="space-y-3">
          {liveDeployments.length === 0 ? (
            <div className="text-sm text-[#9E9E9E] text-center py-4 bg-[#28282D] rounded-lg">
              Nenhum deploy ativo ainda
            </div>
          ) : (
            liveDeployments.map((deployment: any) => (
              <div
                key={deployment.id}
                className="flex items-center gap-3 p-3 bg-[#28282D] rounded-lg hover:bg-[#2E2E33] transition-colors group"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#EFEFEF] truncate">
                    {deployment.name.toLowerCase().replace(/\s+/g, '-')}
                  </div>
                  <div className="text-xs text-[#9E9E9E]">netlify.app</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#9E9E9E] hover:text-[#FF7A2E] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deployment.deploymentUrl && window.open(deployment.deploymentUrl, '_blank')}
                >
                  <ExternalLink size={14} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="phoenix-card">
        <h3 className="text-lg font-bold text-[#EFEFEF] mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#FF7A2E]" />
          Receita Semanal
        </h3>

        <div className="space-y-3">
          <div className="flex items-end justify-between h-20 gap-1">
            {revenueTrend.map((value, index) => (
              <div
                key={index}
                className="flex-1 bg-[#FF7A2E]/40 rounded-t hover:bg-[#FF7A2E] transition-all cursor-pointer group relative"
                style={{ height: `${(value / maxHeight) * 100}%` }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#28282D] text-[#EFEFEF] text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ${value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-[#9E9E9E]">
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center justify-between">
            <span className="text-green-400 text-sm font-medium">Esta Semana</span>
            <span className="text-green-400 font-bold">R${weeklyRevenue}</span>
          </div>
          <div className="text-xs text-[#9E9E9E] mt-1">+12% vs semana anterior</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="phoenix-card">
        <h3 className="text-lg font-bold text-[#EFEFEF] mb-4">Ações Rápidas</h3>

        <div className="space-y-2">
          <Link href="/marketplace">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-[#FF7A2E]/20 rounded-lg">
                <ShoppingCart className="text-[#FF7A2E]" size={16} />
              </div>
              <span className="font-medium">Marketplace</span>
            </Button>
          </Link>

          <Link href="/templates">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <LayersIcon className="text-blue-400" size={16} />
              </div>
              <span className="font-medium">Meus Templates</span>
            </Button>
          </Link>

          <Link href="/analytics">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <BarChart3 className="text-purple-400" size={16} />
              </div>
              <span className="font-medium">Analytics</span>
            </Button>
          </Link>

          <Link href="/ai-image-generator">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Image className="text-amber-400" size={16} />
              </div>
              <span className="font-medium">Gerador de Imagens IA</span>
            </Button>
          </Link>

          <Link href="/stripe-connect">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Plug className="text-green-400" size={16} />
              </div>
              <span className="font-medium">Stripe Connect</span>
            </Button>
          </Link>

          <Link href="/sales">
            <Button
              variant="ghost"
              className="w-full flex items-center gap-3 p-3 justify-start hover:bg-[#28282D] text-[#EFEFEF]"
            >
              <div className="p-2 bg-[#FF7A2E]/20 rounded-lg">
                <ArrowDownToLine className="text-[#FF7A2E]" size={16} />
              </div>
              <span className="font-medium">Minhas Vendas</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
