import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import WelcomeSection from "@/components/dashboard/welcome-section";
import TemplateGenerator from "@/components/dashboard/template-generator";
import AutomationWorkflow from "@/components/dashboard/automation-workflow";
import RecentTemplates from "@/components/dashboard/recent-templates";
import Sidebar from "@/components/dashboard/sidebar";
import TemplateGallery from "@/components/templates/template-gallery";
import SEO from "@/components/seo";

export default function Dashboard() {
  return (
    <>
      <SEO
        title="Dashboard de Gestão — RunYourTrip"
        description="Gerencie seus templates, projetos e análises em um só lugar. Crie templates de viagem com IA."
        path="/dashboard"
      />
      <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <WelcomeSection />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <TemplateGenerator />
            <AutomationWorkflow />
            <RecentTemplates />
          </div>
          
          <Sidebar />
        </div>

        <div className="mt-12">
          <TemplateGallery />
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
}
