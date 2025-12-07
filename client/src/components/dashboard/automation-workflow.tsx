import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Upload, Rocket, Store } from "lucide-react";
import { WORKFLOW_STEPS } from "@/lib/constants";

export default function AutomationWorkflow() {
  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const latestProject = projects?.[0];
  const currentStep = latestProject?.workflowStep || 1;
  const status = latestProject?.status || "pending";

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep && status === "processing") return "processing";
    if (stepId === currentStep) return "current";
    return "pending";
  };

  const getStepIcon = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    const iconProps = { size: 16, className: "text-white" };
    
    switch (stepId) {
      case 1: return stepStatus === "completed" ? <CheckCircle {...iconProps} /> : <Upload {...iconProps} />;
      case 2: return stepStatus === "completed" ? <CheckCircle {...iconProps} /> : <Upload {...iconProps} />;
      case 3: return stepStatus === "completed" ? <CheckCircle {...iconProps} /> : <Rocket {...iconProps} />;
      case 4: return stepStatus === "completed" ? <CheckCircle {...iconProps} /> : <Store {...iconProps} />;
      default: return <Clock {...iconProps} />;
    }
  };

  const getStepClassName = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    switch (stepStatus) {
      case "completed": return "bg-success";
      case "processing": return "bg-primary animate-pulse";
      case "current": return "bg-primary";
      default: return "bg-gray-300";
    }
  };

  const getContainerClassName = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    switch (stepStatus) {
      case "completed": return "bg-gray-50";
      case "processing": 
      case "current": return "bg-primary/5 border-l-4 border-primary";
      default: return "bg-gray-50 opacity-60";
    }
  };

  const getStatusText = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    switch (stepStatus) {
      case "completed": return "Completed";
      case "processing": return "In Progress";
      case "current": return "Current";
      default: return "Pending";
    }
  };

  const getStatusClassName = (stepId: number) => {
    const stepStatus = getStepStatus(stepId);
    switch (stepStatus) {
      case "completed": return "text-success";
      case "processing": 
      case "current": return "text-primary";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-text-dark mb-6">Automation Workflow</h2>
        
        <div className="space-y-4">
          {WORKFLOW_STEPS.map((step) => (
            <div key={step.id} className={`flex items-center space-x-4 p-4 rounded-lg ${getContainerClassName(step.id)}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStepClassName(step.id)}`}>
                {getStepIcon(step.id)}
              </div>
              <div className="flex-1">
                <div className="font-medium">{step.name}</div>
                <div className="text-sm text-gray-600">{step.description}</div>
              </div>
              <Badge variant="outline" className={`text-sm font-medium ${getStatusClassName(step.id)}`}>
                {getStatusText(step.id)}
              </Badge>
            </div>
          ))}
        </div>
        
        {latestProject && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">
              Latest Project: <span className="font-medium">{latestProject.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Status: {latestProject.status} • Step {latestProject.workflowStep} of 4
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
