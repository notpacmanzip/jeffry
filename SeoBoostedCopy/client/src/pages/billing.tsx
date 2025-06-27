import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { CreditCard, Download, Calendar, Crown, Zap } from "lucide-react";

export default function Billing() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

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

  const currentPlan = user?.subscriptionStatus === "active" ? "Pro" : "Free";
  const isProPlan = currentPlan === "Pro";

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Billing" 
          subtitle="Manage your subscription and billing information"
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Current Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Current Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${isProPlan ? 'bg-primary/10' : 'bg-slate-100'}`}>
                      {isProPlan ? (
                        <Crown className="w-6 h-6 text-primary" />
                      ) : (
                        <Zap className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{currentPlan} Plan</h3>
                      <p className="text-slate-600">
                        {isProPlan ? "$29/month" : "Free forever"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={isProPlan ? "default" : "secondary"}>
                      {isProPlan ? "Active" : "Free"}
                    </Badge>
                    {!isProPlan && (
                      <div className="mt-2">
                        <Link href="/subscribe">
                          <Button size="sm">
                            Upgrade to Pro
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {dashboardStats?.apiCredits || 0}
                    </div>
                    <div className="text-sm text-slate-600">API Credits Remaining</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {isProPlan ? "Resets monthly" : "Free tier limit"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {dashboardStats?.totalProducts || 0}
                    </div>
                    <div className="text-sm text-slate-600">Total Products</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {isProPlan ? "Unlimited" : "Up to 100"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900">
                      {dashboardStats?.generatedThisMonth || 0}
                    </div>
                    <div className="text-sm text-slate-600">Generated This Month</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {isProPlan ? "Up to 3,000" : "Up to 100"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isProPlan ? (
                  <div className="space-y-4">
                    {/* Mock billing history for pro users */}
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">Pro Plan - December 2024</div>
                          <div className="text-sm text-slate-600">Paid on Dec 1, 2024</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">$29.00</div>
                        <Badge variant="outline" className="text-xs">
                          Paid
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900">Pro Plan - November 2024</div>
                          <div className="text-sm text-slate-600">Paid on Nov 1, 2024</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-slate-900">$29.00</div>
                        <Badge variant="outline" className="text-xs">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <h3 className="font-medium text-slate-900 mb-2">No Billing History</h3>
                    <p className="text-sm">You're currently on the free plan. Upgrade to Pro to access billing history.</p>
                    <Link href="/subscribe">
                      <Button className="mt-4">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            {isProPlan && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded">
                        <CreditCard className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">•••• •••• •••• 4242</div>
                        <div className="text-sm text-slate-600">Expires 12/2025</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Update
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Plan Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Free Plan */}
                  <div className={`border rounded-lg p-6 ${!isProPlan ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Free</h3>
                      {!isProPlan && <Badge>Current</Badge>}
                    </div>
                    <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        100 AI-generated descriptions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Basic SEO optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Email support
                      </li>
                    </ul>
                  </div>

                  {/* Pro Plan */}
                  <div className={`border rounded-lg p-6 ${isProPlan ? 'border-primary bg-primary/5' : 'border-slate-200'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Pro</h3>
                      {isProPlan ? (
                        <Badge>Current</Badge>
                      ) : (
                        <Badge variant="outline">Recommended</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold mb-4">$29<span className="text-sm font-normal">/month</span></div>
                    <ul className="space-y-2 text-sm mb-6">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        3,000 AI-generated descriptions
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Advanced SEO optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Bulk processing
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Analytics dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        Priority support
                      </li>
                    </ul>
                    {!isProPlan && (
                      <Link href="/subscribe">
                        <Button className="w-full">
                          Upgrade to Pro
                        </Button>
                      </Link>
                    )}
                    {isProPlan && (
                      <Button variant="outline" className="w-full">
                        Manage Subscription
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
