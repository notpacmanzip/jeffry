import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Zap } from "lucide-react";

export default function Analytics() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics"],
    enabled: isAuthenticated,
  });

  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Analytics" 
          subtitle="Track your content performance and SEO metrics"
        />
        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="seo">SEO Performance</TabsTrigger>
              <TabsTrigger value="content">Content Analytics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Descriptions</p>
                        <p className="text-2xl font-bold text-slate-900">{dashboardStats?.totalProducts || 0}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">+12%</span>
                      <span className="text-slate-600 ml-2">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Avg. SEO Score</p>
                        <p className="text-2xl font-bold text-slate-900">{dashboardStats?.avgSeoScore?.toFixed(1) || "0.0"}</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <Target className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">+0.8</span>
                      <span className="text-slate-600 ml-2">improvement</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Generated This Month</p>
                        <p className="text-2xl font-bold text-slate-900">{dashboardStats?.generatedThisMonth || 0}</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <Zap className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                      <span className="text-emerald-600 font-medium">+24%</span>
                      <span className="text-slate-600 ml-2">from last month</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">API Credits Used</p>
                        <p className="text-2xl font-bold text-slate-900">{3000 - (dashboardStats?.apiCredits || 0)}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <PieChart className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex items-center mt-4 text-sm">
                      <span className="text-slate-600">{dashboardStats?.apiCredits || 0} remaining</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">High-performing content</span>
                        <Badge className="bg-emerald-100 text-emerald-800">78%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Average word count</span>
                        <span className="text-sm font-medium">142 words</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Top category</span>
                        <span className="text-sm font-medium">Electronics</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Keyword density</span>
                        <Badge variant="outline">Optimal</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="text-center text-slate-500">
                          <BarChart3 className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                          <p>No recent activity data available</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>SEO Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-slate-500 py-12">
                    <Target className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">SEO Analytics Coming Soon</h3>
                    <p>Detailed SEO performance metrics and keyword analysis will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-slate-500 py-12">
                    <PieChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Content Analytics Coming Soon</h3>
                    <p>Comprehensive content performance analysis and insights will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center text-slate-500 py-12">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Trend Analysis Coming Soon</h3>
                    <p>Historical performance trends and forecasting will be available here.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
