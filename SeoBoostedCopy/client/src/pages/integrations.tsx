import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plug, ExternalLink, Settings, CheckCircle } from "lucide-react";

export default function Integrations() {
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

  const integrations = [
    {
      id: "shopify",
      name: "Shopify",
      description: "Connect your Shopify store to automatically sync products and descriptions",
      icon: "🛍️",
      status: "available",
      connected: false,
      features: ["Product sync", "Bulk description updates", "Automatic publishing"],
    },
    {
      id: "woocommerce",
      name: "WooCommerce",
      description: "Integrate with your WordPress WooCommerce store",
      icon: "🛒",
      status: "available",
      connected: false,
      features: ["Product import", "Description updates", "Category mapping"],
    },
    {
      id: "magento",
      name: "Magento",
      description: "Connect with Magento eCommerce platform",
      icon: "🏪",
      status: "coming_soon",
      connected: false,
      features: ["Product management", "Bulk operations", "Custom attributes"],
    },
    {
      id: "bigcommerce",
      name: "BigCommerce",
      description: "Integrate with BigCommerce for seamless product management",
      icon: "🏬",
      status: "coming_soon",
      connected: false,
      features: ["Product sync", "Variant support", "SEO optimization"],
    },
    {
      id: "etsy",
      name: "Etsy",
      description: "Connect your Etsy shop for handmade and vintage items",
      icon: "🎨",
      status: "coming_soon",
      connected: false,
      features: ["Listing updates", "Tag optimization", "Shop integration"],
    },
    {
      id: "amazon",
      name: "Amazon Seller Central",
      description: "Integrate with Amazon for marketplace listings",
      icon: "📦",
      status: "coming_soon",
      connected: false,
      features: ["Listing optimization", "Keyword targeting", "Bulk updates"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-emerald-100 text-emerald-800">Available</Badge>;
      case "coming_soon":
        return <Badge variant="outline">Coming Soon</Badge>;
      case "beta":
        return <Badge className="bg-amber-100 text-amber-800">Beta</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleConnect = (integrationId: string) => {
    toast({
      title: "Integration Setup",
      description: `${integrationId} integration setup would be handled here`,
    });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Integrations" 
          subtitle="Connect your eCommerce platforms and tools"
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Overview */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Plug className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Platform Integrations</h2>
                    <p className="text-slate-600">
                      Connect your eCommerce platforms to automatically sync products and descriptions. 
                      Save time and ensure consistency across all your sales channels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{integration.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          {getStatusBadge(integration.status)}
                        </div>
                      </div>
                      {integration.connected && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">
                      {integration.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <h4 className="text-sm font-medium text-slate-900">Features:</h4>
                      <ul className="space-y-1">
                        {integration.features.map((feature, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3">
                      {integration.connected ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Status</span>
                            <div className="flex items-center gap-2">
                              <Switch checked={true} />
                              <span className="text-sm font-medium text-emerald-600">Connected</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          disabled={integration.status !== "available"}
                          onClick={() => handleConnect(integration.id)}
                        >
                          {integration.status === "available" ? "Connect" : "Coming Soon"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* API Integration */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <span className="text-lg">🔗</span>
                  </div>
                  API Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">REST API</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Use our REST API to integrate DescriptAI with your custom applications 
                      and workflows. Perfect for developers and advanced users.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Documentation
                      </Button>
                      <Button size="sm" variant="outline">
                        Get API Key
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 mb-2">Webhooks</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Set up webhooks to receive real-time notifications when descriptions 
                      are generated or updated. Keep your systems in sync automatically.
                    </p>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure Webhooks
                    </Button>
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
