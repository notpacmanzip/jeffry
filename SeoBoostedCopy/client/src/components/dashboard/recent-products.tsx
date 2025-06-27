import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import type { Product } from "@shared/schema";

export default function RecentProducts() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-products"],
    queryFn: () => fetch("/api/dashboard/recent-products?limit=5").then(res => res.json()),
  });

  const getSeoScoreBadge = (score: string | null) => {
    if (!score) return <Badge variant="secondary">No Score</Badge>;
    const numScore = parseFloat(score);
    if (numScore >= 8) return <Badge className="bg-emerald-100 text-emerald-800">SEO: {score}</Badge>;
    if (numScore >= 6) return <Badge className="bg-amber-100 text-amber-800">SEO: {score}</Badge>;
    return <Badge variant="destructive">SEO: {score}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Products</CardTitle>
          <Button variant="ghost" size="sm" className="text-sm text-primary hover:text-primary/80">
            View all
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-6 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-1">
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-600">
                    {product.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                  <p className="text-xs text-slate-500">
                    {product.createdAt 
                      ? new Date(product.createdAt).toLocaleDateString()
                      : "Unknown date"
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getSeoScoreBadge(product.seoScore)}
                  <button className="text-slate-400 hover:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="font-medium text-slate-900 mb-2">No products yet</h3>
            <p className="text-sm">Create your first product to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
