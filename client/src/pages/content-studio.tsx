import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  Sparkles, 
  Code, 
  BookOpen, 
  Users, 
  Zap, 
  Globe,
  Lightbulb,
  Target,
  Timer,
  DollarSign,
  Download,
  Eye,
  Play,
  Wand2
} from "lucide-react";
import { motion } from "framer-motion";

interface ContentIdea {
  id: number;
  title: string;
  description: string;
  topics: string[];
  difficulty: string;
  estimatedDuration: number;
}

interface GeneratedContent {
  title: string;
  description: string;
  fullContent: string;
  interactiveElements: string[];
  assessments: string[];
  vocabulary: string[];
  code: string;
  thumbnailUrl?: string;
  estimatedPrice: number;
  difficulty: string;
  duration: number;
  techStack: string[];
}

export default function ContentStudio() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("generator");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [progress, setProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    topic: "",
    targetAudience: "intermediate" as "beginner" | "intermediate" | "advanced",
    contentType: "simulation" as "simulation" | "workshop" | "microlearning" | "coaching" | "portfolio" | "networking",
    duration: 60,
    includeInteractive: true,
    techFocus: [] as string[],
  });

  const contentTypes = [
    { value: "simulation", label: "Interactive Technical Simulation", icon: Code },
    { value: "workshop", label: "Cross-Cultural Workshop", icon: Globe },
    { value: "microlearning", label: "Microlearning Series", icon: BookOpen },
    { value: "coaching", label: "AI Coaching Session", icon: Bot },
    { value: "portfolio", label: "Portfolio Development", icon: Target },
    { value: "networking", label: "Networking Platform", icon: Users },
  ];

  const techFocusOptions = [
    "Cloud Computing", "DevOps", "Machine Learning", "Cybersecurity", 
    "Mobile Development", "Web Development", "Data Science", "Blockchain",
    "IoT", "Microservices", "Kubernetes", "Docker", "Python", "JavaScript",
    "React", "Node.js", "AWS", "Azure", "GCP"
  ];

  const loadContentIdeas = async () => {
    try {
      const response = await apiRequest("/api/content/content-ideas", {
        method: "GET"
      });
      setContentIdeas(response.ideas);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load content ideas",
        variant: "destructive"
      });
    }
  };

  const generateContent = async () => {
    if (!formData.topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a topic",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      const response = await apiRequest("/api/content/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      setProgress(100);
      setGeneratedContent(response.content);
      setActiveTab("preview");

      toast({
        title: "Content Generated!",
        description: "Your tech English learning content is ready",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const createTemplate = async () => {
    if (!generatedContent) return;

    try {
      const response = await apiRequest("/api/content/create-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: generatedContent,
          userId: "demo-user",
          categoryId: 1
        })
      });

      toast({
        title: "Template Created!",
        description: "Your content is now available in the marketplace",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive"
      });
    }
  };

  const addTechFocus = (tech: string) => {
    if (!formData.techFocus.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        techFocus: [...prev.techFocus, tech]
      }));
    }
  };

  const removeTechFocus = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techFocus: prev.techFocus.filter(t => t !== tech)
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3"
        >
          <Wand2 className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            AI Content Studio
          </h1>
        </motion.div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create innovative English learning content for tech professionals using the power of AI
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Content Generator
          </TabsTrigger>
          <TabsTrigger value="ideas" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Content Ideas
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview & Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Content Configuration
                </CardTitle>
                <CardDescription>
                  Define your learning content parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Docker containerization for beginners"
                    value={formData.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select 
                      value={formData.targetAudience} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, targetAudience: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      min="5"
                      max="480"
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {contentTypes.map((type) => (
                      <Card
                        key={type.value}
                        className={`cursor-pointer transition-colors ${
                          formData.contentType === type.value 
                            ? "border-primary bg-primary/5" 
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, contentType: type.value as any }))}
                      >
                        <CardContent className="flex items-center gap-3 p-3">
                          <type.icon className="h-5 w-5 text-primary" />
                          <span className="font-medium">{type.label}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="interactive">Include Interactive Elements</Label>
                  <Switch
                    id="interactive"
                    checked={formData.includeInteractive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, includeInteractive: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Technology Focus
                </CardTitle>
                <CardDescription>
                  Select relevant technologies for your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {techFocusOptions.map((tech) => (
                    <Button
                      key={tech}
                      variant={formData.techFocus.includes(tech) ? "default" : "outline"}
                      size="sm"
                      onClick={() => 
                        formData.techFocus.includes(tech) 
                          ? removeTechFocus(tech)
                          : addTechFocus(tech)
                      }
                    >
                      {tech}
                    </Button>
                  ))}
                </div>

                {formData.techFocus.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Technologies:</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.techFocus.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeTechFocus(tech)}
                        >
                          {tech} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={generateContent}
                    disabled={isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Bot className="h-4 w-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>

                  {isGenerating && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Analyzing trends...</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ideas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Curated Content Ideas
              </CardTitle>
              <CardDescription>
                Pre-designed innovative content concepts for tech professionals
              </CardDescription>
              <Button onClick={loadContentIdeas} variant="outline" size="sm">
                Load Ideas
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contentIdeas.map((idea) => (
                  <Card key={idea.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{idea.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4" />
                          <span className="text-sm">{idea.estimatedDuration} minutes</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {idea.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        
                        <Button
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              topic: idea.title,
                              duration: idea.estimatedDuration,
                              targetAudience: idea.difficulty as any,
                              techFocus: idea.topics
                            }));
                            setActiveTab("generator");
                          }}
                        >
                          Use This Idea
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {generatedContent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Content Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{generatedContent.title}</h3>
                    <p className="text-muted-foreground mt-1">{generatedContent.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">${generatedContent.estimatedPrice}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4" />
                        <span className="text-sm">{generatedContent.duration} minutes</span>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Badge variant="outline">{generatedContent.difficulty}</Badge>
                      <div className="flex flex-wrap gap-1">
                        {generatedContent.techStack.slice(0, 2).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Interactive Elements:</Label>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {generatedContent.interactiveElements.slice(0, 3).map((element, index) => (
                        <li key={index}>{element}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <Label>Key Vocabulary:</Label>
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.vocabulary.slice(0, 5).map((word, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {word}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={createTemplate} className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Add to Marketplace
                    </Button>
                    <Button variant="outline" size="icon">
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Generated Code Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96">
                    <pre className="text-sm">
                      <code>{generatedContent.code.slice(0, 500)}...</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Content Generated Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate content first to see the preview
                </p>
                <Button onClick={() => setActiveTab("generator")}>
                  Go to Generator
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}