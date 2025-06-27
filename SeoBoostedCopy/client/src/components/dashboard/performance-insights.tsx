import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export default function PerformanceInsights() {
  const insights = [
    {
      label: "Top Performing Category",
      value: "Electronics",
    },
    {
      label: "Avg. Description Length",
      value: "127 words",
    },
    {
      label: "Keyword Density",
      value: "Optimal",
      valueColor: "text-emerald-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Performance Insights</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{insight.label}</span>
              <span className={`text-sm font-medium ${insight.valueColor || 'text-slate-900'}`}>
                {insight.value}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-slate-100">
            <Button variant="ghost" size="sm" className="w-full justify-start p-0 h-auto text-primary">
              <span className="text-sm font-medium">View Full Analytics</span>
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
