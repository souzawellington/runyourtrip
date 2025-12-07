import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Code, 
  Eye, 
  Download,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function DemoPage() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeTab, setActiveTab] = useState("preview");
  const [demoUsed, setDemoUsed] = useState(false);

  const handleGenerateDemo = async () => {
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please describe the website you want to create.",
        variant: "destructive",
      });
      return;
    }

    if (demoUsed) {
      toast({
        title: "Demo limit reached",
        description: "Create a free account to generate unlimited templates.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation (in production, this would call the actual API)
    setTimeout(() => {
      const mockCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description.slice(0, 30)}...</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; }
        .hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 80px 20px;
            text-align: center;
        }
        .hero h1 { font-size: 3rem; margin-bottom: 20px; }
        .hero p { font-size: 1.2rem; opacity: 0.9; }
        .features {
            padding: 60px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 40px;
        }
        .feature-card {
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }
        .feature-card:hover { transform: translateY(-5px); }
        .cta {
            background: #667eea;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1.1rem;
            cursor: pointer;
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <section class="hero">
        <h1>Your Amazing Website</h1>
        <p>${description}</p>
    </section>
    
    <section class="features">
        <h2>Key Features</h2>
        <div class="feature-grid">
            <div class="feature-card">
                <h3>Feature 1</h3>
                <p>Professional design that captures attention</p>
            </div>
            <div class="feature-card">
                <h3>Feature 2</h3>
                <p>Responsive layout for all devices</p>
            </div>
            <div class="feature-card">
                <h3>Feature 3</h3>
                <p>SEO optimized for better visibility</p>
            </div>
        </div>
        <button class="cta">Get Started</button>
    </section>
</body>
</html>`;
      
      setGeneratedCode(mockCode);
      setDemoUsed(true);
      setIsGenerating(false);
      setActiveTab("preview");
      
      toast({
        title: "Template generated!",
        description: "This is a demo preview. Sign up to deploy and customize your template.",
      });
    }, 3000);
  };

  const exampleTemplates = [
    "A modern portfolio website for a photographer",
    "An e-commerce store for handmade jewelry",
    "A landing page for a SaaS product",
    "A blog for travel adventures",
    "A restaurant website with menu and reservations",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      {/* Header */}
      <section className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <h1 className="text-2xl font-bold">Run Your Trip</h1>
            </Link>
            <Badge variant="secondary">Free Demo</Badge>
          </div>
          <Link href="/register">
            <Button>
              Sign Up Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Demo Section */}
      <section className="px-4 py-12">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="mb-4 text-4xl font-bold">
              Try It Free - No Sign Up Required
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Generate your first template instantly. See the magic of AI-powered website creation.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Describe Your Website
                </CardTitle>
                <CardDescription>
                  Tell us what kind of website you want to create
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="E.g., A modern portfolio website for a freelance designer with dark theme, project gallery, and contact form..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={500}
                  disabled={demoUsed}
                />
                
                <div className="text-sm text-muted-foreground">
                  {description.length}/500 characters
                </div>

                {/* Example Templates */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Try these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleTemplates.map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setDescription(example)}
                        disabled={demoUsed}
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleGenerateDemo}
                  disabled={isGenerating || demoUsed || !description.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Your Template...
                    </>
                  ) : demoUsed ? (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Demo Limit Reached - Sign Up Free
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Template
                    </>
                  )}
                </Button>

                {demoUsed && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You've used your free demo. Create an account to:
                      <ul className="mt-2 list-disc list-inside">
                        <li>Generate unlimited templates</li>
                        <li>Deploy to production</li>
                        <li>Access the marketplace</li>
                        <li>Customize and edit code</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Preview Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Generated Template</CardTitle>
                <CardDescription>
                  Preview your AI-generated website
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedCode ? (
                  <div className="space-y-4">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="preview">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </TabsTrigger>
                        <TabsTrigger value="code">
                          <Code className="mr-2 h-4 w-4" />
                          Code
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="preview" className="mt-4">
                        <div className="relative">
                          <iframe
                            srcDoc={generatedCode}
                            className="h-[500px] w-full rounded-lg border"
                            title="Template Preview"
                          />
                          <div className="absolute bottom-4 right-4">
                            <Badge className="bg-black/70 text-white">
                              Demo Preview
                            </Badge>
                          </div>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="code" className="mt-4">
                        <div className="relative">
                          <pre className="h-[500px] overflow-auto rounded-lg bg-secondary p-4 text-sm">
                            <code>{generatedCode}</code>
                          </pre>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute right-2 top-2"
                            onClick={() => {
                              navigator.clipboard.writeText(generatedCode);
                              toast({
                                title: "Code copied!",
                                description: "Sign up to deploy this template.",
                              });
                            }}
                          >
                            Copy Code
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Alert className="bg-primary/10">
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Love what you see?</strong> Sign up now to:
                        <ul className="mt-1 list-disc list-inside">
                          <li>Deploy this template instantly</li>
                          <li>Edit and customize everything</li>
                          <li>Add to marketplace and earn money</li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                      <Link href="/register" className="flex-1">
                        <Button className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Sign Up & Deploy
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setGeneratedCode("");
                          setDescription("");
                          setDemoUsed(false);
                        }}
                      >
                        Try Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-[500px] items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <Code className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Your generated template will appear here
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <Sparkles className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">AI-Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI understands your needs
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Code className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">Clean Code</h3>
                <p className="text-sm text-muted-foreground">
                  Professional, optimized HTML/CSS/JS
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Eye className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">Instant Preview</h3>
                <p className="text-sm text-muted-foreground">
                  See your website before deploying
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <Download className="mb-2 h-8 w-8 text-primary" />
                <h3 className="font-semibold">One-Click Deploy</h3>
                <p className="text-sm text-muted-foreground">
                  Go live instantly with sign up
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}