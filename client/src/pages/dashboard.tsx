import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCards from "@/components/dashboard/stats-cards";
import RecentProducts from "@/components/dashboard/recent-products";
import QuickActions from "@/components/dashboard/quick-actions";
import SubscriptionStatus from "@/components/dashboard/subscription-status";
import PerformanceInsights from "@/components/dashboard/performance-insights";
import GenerationModal from "@/components/modals/generation-modal";
import { useState } from "react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);

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
          title="Dashboard" 
          subtitle="Overview of your AI-generated product descriptions"
          onNewProduct={() => setIsGenerationModalOpen(true)}
        />
        <main className="flex-1 overflow-auto p-6">
          <StatsCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2">
              <RecentProducts />
            </div>
            <div className="space-y-6">
              <QuickActions onNewProduct={() => setIsGenerationModalOpen(true)} />
              <SubscriptionStatus />
              <PerformanceInsights />
            </div>
          </div>
        </main>
      </div>
      <GenerationModal 
        isOpen={isGenerationModalOpen} 
        onOpenChange={setIsGenerationModalOpen} 
      />
    </div>
  );
}
