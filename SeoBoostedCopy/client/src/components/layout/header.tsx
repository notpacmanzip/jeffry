import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onNewProduct?: () => void;
}

export default function Header({ title, subtitle, onNewProduct }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {onNewProduct && (
            <Button onClick={onNewProduct} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Product
            </Button>
          )}
          <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
