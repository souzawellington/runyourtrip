import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, MapPin } from "lucide-react";
import Dashboard from "./dashboard";
import Header from "@/components/layout/header";
import SEO from "@/components/seo";

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <SEO
        title="Dashboard — RunYourTrip"
        description="Gerencie seus templates, projetos e análises em um só lugar."
        path="/dashboard"
      />
      <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-24">
        <Dashboard />
      </main>
    </div>
    </>
  );
}