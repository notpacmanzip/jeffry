import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { Link } from "wouter";

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const isProPlan = user?.subscriptionStatus === "active";
  const apiCredits = stats?.apiCredits || 0;
  const maxCredits = isProPlan ? 3000 : 100;
  const usedCredits = maxCredits - apiCredits;
  const usagePercentage = (usedCredits / maxCredits) * 100;

  return (
    <Card className={`${isProPlan ? 'bg-gradient-to-br from-primary/5 to-blue-50 border-primary/20' : 'bg-slate-50'}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isProPlan ? 'bg-primary/10' : 'bg-slate-100'}`}>
            <Crown className={`w-4 h-4 ${isProPlan ? 'text-primary' : 'text-slate-600'}`} />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-slate-900">
              {isProPlan ? "Pro Plan" : "Free Plan"}
            </CardTitle>
            <p className="text-xs text-slate-600">
              {isProPlan ? "$29/month" : "Free forever"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-600">API Credits Used</span>
              <span className="font-medium text-slate-900">{usedCredits} / {maxCredits}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${isProPlan ? 'bg-primary' : 'bg-slate-400'}`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>
          
          {isProPlan ? (
            <Link href="/billing">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full bg-white/80 hover:bg-white border-primary/20 text-primary"
              >
                Manage Subscription
              </Button>
            </Link>
          ) : (
            <Link href="/subscribe">
              <Button size="sm" className="w-full">
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
