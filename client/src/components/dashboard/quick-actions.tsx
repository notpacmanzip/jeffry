import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, Search } from "lucide-react";
import { SiShopify } from "react-icons/si";

interface QuickActionsProps {
  onNewProduct?: () => void;
}

export default function QuickActions({ onNewProduct }: QuickActionsProps) {
  const actions = [
    {
      title: "Bulk Upload Products",
      icon: Upload,
      iconColor: "text-primary",
      onClick: () => {
        // Handle bulk upload
      },
    },
    {
      title: "Connect Shopify Store",
      icon: SiShopify,
      iconColor: "text-emerald-600",
      onClick: () => {
        // Handle Shopify integration
      },
    },
    {
      title: "Export Descriptions",
      icon: Download,
      iconColor: "text-blue-600",
      onClick: () => {
        // Handle export
      },
    },
    {
      title: "Keyword Research",
      icon: Search,
      iconColor: "text-amber-600",
      onClick: () => {
        // Handle keyword research
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={action.onClick}
            >
              <action.icon className={`w-4 h-4 mr-3 ${action.iconColor}`} />
              <span className="text-sm font-medium text-slate-700">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
