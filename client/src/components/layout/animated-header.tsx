import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/contexts/theme-context";
import runYourTripLogoLight from "@assets/run-your-trip-logo-light.png";
import runYourTripLogoDark from "@assets/run-your-trip-logo-dark.png";

export default function AnimatedHeader() {
  const [active, setActive] = useState<string | null>(null);
  const [location] = useLocation();
  const { theme } = useTheme();
  
  // Use appropriate logo based on theme
  const currentLogo = theme === "dark" ? runYourTripLogoDark : runYourTripLogoLight;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={currentLogo} 
              alt="Run Your Trip" 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Animated Navigation Menu */}
          <Menu setActive={setActive}>
            <Link href="/demo">
              <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-full hover:opacity-90 transition-opacity">
                Try Demo
              </button>
            </Link>
            
            <MenuItem setActive={setActive} active={active} item="Templates">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/templates" setActive={setActive}>Browse All Templates</HoveredLink>
                <HoveredLink href="/marketplace" setActive={setActive}>Template Marketplace</HoveredLink>
                <HoveredLink href="/templates?category=portfolio" setActive={setActive}>Travel Portfolios</HoveredLink>
                <HoveredLink href="/templates?category=blog" setActive={setActive}>Travel Blogs</HoveredLink>
                <HoveredLink href="/templates?category=booking" setActive={setActive}>Booking Platforms</HoveredLink>
              </div>
            </MenuItem>
            
            <MenuItem setActive={setActive} active={active} item="AI Tools">
              <div className="text-sm grid grid-cols-2 gap-10 p-4">
                <ProductItem
                  title="Content Studio"
                  href="/content-studio"
                  src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&q=80"
                  description="AI-powered content generation for your projects"
                />
                <ProductItem
                  title="AI Image Generator"
                  href="/ai-image-generator"
                  src="https://images.unsplash.com/photo-1633477189729-9290b3261d0a?w=300&q=80"
                  description="Create stunning images with AI"
                />
                <ProductItem
                  title="OpenAI Tools"
                  href="/openai-tools"
                  src="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&q=80"
                  description="Advanced AI capabilities for developers"
                />
                <ProductItem
                  title="Template Generator"
                  href="/dashboard"
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&q=80"
                  description="Generate complete websites with AI"
                />
              </div>
            </MenuItem>
            
            <MenuItem setActive={setActive} active={active} item="Workspaces">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/workspaces" setActive={setActive}>My Workspaces</HoveredLink>
                <HoveredLink href="/workspaces/create" setActive={setActive}>Create Workspace</HoveredLink>
                <HoveredLink href="/workspaces/invitations" setActive={setActive}>Invitations</HoveredLink>
                <HoveredLink href="/workspaces/settings" setActive={setActive}>Workspace Settings</HoveredLink>
              </div>
            </MenuItem>

            <MenuItem setActive={setActive} active={active} item="Analytics">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/analytics" setActive={setActive}>Dashboard Overview</HoveredLink>
                <HoveredLink href="/analytics?tab=advanced" setActive={setActive}>Advanced Analytics</HoveredLink>
                <HoveredLink href="/analytics?tab=realtime" setActive={setActive}>Real-time Metrics</HoveredLink>
                <HoveredLink href="/analytics?tab=reports" setActive={setActive}>Generate Reports</HoveredLink>
              </div>
            </MenuItem>

            <Link href="/sales">
              <button className="px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity">
                Pricing
              </button>
            </Link>

            <MenuItem setActive={setActive} active={active} item="Admin">
              <div className="flex flex-col space-y-4 text-sm">
                <HoveredLink href="/admin" setActive={setActive}>Admin Dashboard</HoveredLink>
                <HoveredLink href="/admin/login" setActive={setActive}>Admin Login</HoveredLink>
                <HoveredLink href="/stripe-connect" setActive={setActive}>Stripe Connect</HoveredLink>
                <HoveredLink href="/connectivity" setActive={setActive}>System Status</HoveredLink>
                <HoveredLink href="/health" setActive={setActive}>System Health</HoveredLink>
                <HoveredLink href="/management" setActive={setActive}>Management Panel</HoveredLink>
              </div>
            </MenuItem>
          </Menu>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-blue-600 text-white">
                <Plus size={16} className="mr-2" />
                New Template
              </Button>
            </Link>
            <Link href="/api/logout">
              <div className="w-8 h-8 bg-gray-300 hover:bg-gray-400 transition-colors rounded-full flex items-center justify-center cursor-pointer">
                <User size={16} className="text-gray-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}