import { Mountain } from "lucide-react";
import { BRAND_CONFIG } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Mountain className="text-white" size={16} />
            </div>
            <div>
              <span className="font-bold text-lg text-text-dark">{BRAND_CONFIG.name}</span>
              <div className="text-xs text-muted-foreground">{BRAND_CONFIG.tagline}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2024 Run Your Trip. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
