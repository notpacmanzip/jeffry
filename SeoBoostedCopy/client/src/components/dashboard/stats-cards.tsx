import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Wand2, Target, Coins } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const cards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: "+12%",
      changeText: "from last month",
      icon: Package,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Generated This Month",
      value: stats?.generatedThisMonth || 0,
      change: "+24%",
      changeText: "from last month",
      icon: Wand2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Avg. SEO Score",
      value: stats?.avgSeoScore?.toFixed(1) || "0.0",
      change: "+0.8",
      changeText: "improvement",
      icon: Target,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "API Credits Left",
      value: stats?.apiCredits || 0,
      change: null,
      changeText: "Resets in 12 days",
      icon: Coins,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-8 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 ${card.iconBg} rounded-lg`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              {card.change && (
                <span className="text-emerald-600 font-medium">{card.change}</span>
              )}
              <span className={`text-slate-600 ${card.change ? 'ml-2' : ''}`}>
                {card.changeText}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
