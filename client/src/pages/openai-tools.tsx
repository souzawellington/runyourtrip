import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Mic, 
  Volume2, 
  Brain, 
  Shield,
  Bot,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function OpenAITools() {
  const { toast } = useToast();

  // Chat Completion State
  const [chatMessages, setChatMessages] = useState<Array<{role: "system" | "user" | "assistant", content: string}>>([
    { role: "system" as const, content: "You are a helpful assistant." }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [chatResponse, setChatResponse] = useState("");

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageSize, setImageSize] = useState("1024x1024");
  const [imageQuality, setImageQuality] = useState("standard");
  const [imageStyle, setImageStyle] = useState("vivid");
  const [generatedImage, setGeneratedImage] = useState("");

  // Text Embedding State
  const [embeddingText, setEmbeddingText] = useState("");
  const [embeddingResult, setEmbeddingResult] = useState<number[]>([]);

  // Content Moderation State
  const [moderationText, setModerationText] = useState("");
  const [moderationResult, setModerationResult] = useState<any>(null);

  // Audio Transcription State
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcriptionResult, setTranscriptionResult] = useState("");

  // Text-to-Speech State
  const [speechText, setSpeechText] = useState("");
  const [speechVoice, setSpeechVoice] = useState("alloy");
  const [speechAudio, setSpeechAudio] = useState<string>("");

  // Chat Completion Mutation
  const chatMutation = useMutation({
    mutationFn: async (data: { messages: any[], maxTokens?: number, temperature?: number }) => {
      const response = await apiRequest("POST", "/api/v1/chat/completions", data);
      return response.json();
    },
    onSuccess: (data) => {
      setChatResponse(data.message);
      setChatMessages(prev => [...prev, 
        { role: "user" as const, content: newMessage },
        { role: "assistant" as const, content: data.message }
      ]);
      setNewMessage("");
      toast({
        title: "Chat Response Generated",
        description: "AI response has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chat Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Image Generation Mutation
  const imageMutation = useMutation({
    mutationFn: async (data: { prompt: string, size?: string, quality?: string, style?: string }) => {
      const response = await apiRequest("POST", "/api/v1/images", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImage(data.url);
      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Image Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Embedding Mutation
  const embeddingMutation = useMutation({
    mutationFn: async (data: { input: string, model?: string }) => {
      const response = await apiRequest("POST", "/api/v1/embeddings", data);
      return response.json();
    },
    onSuccess: (data) => {
      setEmbeddingResult(data.embeddings[0]);
      toast({
        title: "Embeddings Created",
        description: "Text embeddings have been generated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Embedding Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Moderation Mutation
  const moderationMutation = useMutation({
    mutationFn: async (data: { input: string }) => {
      const response = await apiRequest("POST", "/api/v1/moderations", data);
      return response.json();
    },
    onSuccess: (data) => {
      setModerationResult(data.results[0]);
      toast({
        title: "Content Moderated",
        description: "Content moderation analysis completed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Moderation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Audio Transcription Mutation
  const transcriptionMutation = useMutation({
    mutationFn: async (data: { audioFile: string, filename: string }) => {
      const response = await apiRequest("POST", "/api/v1/audio/transcriptions", data);
      return response.json();
    },
    onSuccess: (data) => {
      setTranscriptionResult(data.text);
      toast({
        title: "Audio Transcribed",
        description: "Audio has been transcribed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Transcription Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Text-to-Speech Mutation
  const speechMutation = useMutation({
    mutationFn: async (data: { text: string, voice?: string }) => {
      const response = await apiRequest("POST", "/api/v1/audio/speech", data);
      return response.blob();
    },
    onSuccess: (blob) => {
      const audioUrl = URL.createObjectURL(blob);
      setSpeechAudio(audioUrl);
      toast({
        title: "Speech Generated",
        description: "Text-to-speech audio has been generated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Speech Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChat = () => {
    if (!newMessage.trim()) return;
    
    chatMutation.mutate({
      messages: [...chatMessages, { role: "user", content: newMessage }],
      maxTokens: 1000,
      temperature: 0.7
    });
  };

  const handleImageGeneration = () => {
    if (!imagePrompt.trim()) return;
    
    imageMutation.mutate({
      prompt: imagePrompt,
      size: imageSize,
      quality: imageQuality,
      style: imageStyle
    });
  };

  const handleEmbedding = () => {
    if (!embeddingText.trim()) return;
    
    embeddingMutation.mutate({
      input: embeddingText,
      model: "text-embedding-3-small"
    });
  };

  const handleModeration = () => {
    if (!moderationText.trim()) return;
    
    moderationMutation.mutate({
      input: moderationText
    });
  };

  const handleTranscription = () => {
    if (!audioFile) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      transcriptionMutation.mutate({
        audioFile: base64,
        filename: audioFile.name
      });
    };
    reader.readAsDataURL(audioFile);
  };

  const handleSpeech = () => {
    if (!speechText.trim()) return;
    
    speechMutation.mutate({
      text: speechText,
      voice: speechVoice
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">OpenAI API Tools</h1>
          <p className="text-muted-foreground">
            Comprehensive testing interface for all OpenAI capabilities integrated into Run Your Trip platform.
          </p>
        </div>

        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="images" className="flex items-center gap-2">
              <ImageIcon size={16} />
              Images
            </TabsTrigger>
            <TabsTrigger value="audio" className="flex items-center gap-2">
              <Mic size={16} />
              Audio
            </TabsTrigger>
            <TabsTrigger value="embeddings" className="flex items-center gap-2">
              <Brain size={16} />
              Embeddings
            </TabsTrigger>
            <TabsTrigger value="moderation" className="flex items-center gap-2">
              <Shield size={16} />
              Moderation
            </TabsTrigger>
            <TabsTrigger value="speech" className="flex items-center gap-2">
              <Volume2 size={16} />
              Speech
            </TabsTrigger>
          </TabsList>

          {/* Chat Completions */}
          <TabsContent value="chat" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="text-blue-600" />
                  Chat Completions
                </CardTitle>
                <CardDescription>
                  Test GPT-4o chat completions with conversation context.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="chat-input">Your Message</Label>
                  <Textarea
                    id="chat-input"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="mt-2"
                  />
                </div>
                
                <Button 
                  onClick={handleChat}
                  disabled={chatMutation.isPending || !newMessage.trim()}
                  className="w-full"
                >
                  {chatMutation.isPending ? (
                    <>
                      <Bot className="mr-2 animate-spin" size={16} />
                      Generating Response...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2" size={16} />
                      Send Message
                    </>
                  )}
                </Button>

                {chatResponse && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">AI Response:</h4>
                    <p className="text-sm">{chatResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Image Generation */}
          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="text-purple-600" />
                  Image Generation
                </CardTitle>
                <CardDescription>
                  Generate images using DALL-E 3 with custom parameters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image-prompt">Image Prompt</Label>
                  <Textarea
                    id="image-prompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="A futuristic city skyline at sunset with flying cars..."
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Size</Label>
                    <Select value={imageSize} onValueChange={setImageSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">1024x1024</SelectItem>
                        <SelectItem value="1792x1024">1792x1024</SelectItem>
                        <SelectItem value="1024x1792">1024x1792</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quality</Label>
                    <Select value={imageQuality} onValueChange={setImageQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Style</Label>
                    <Select value={imageStyle} onValueChange={setImageStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vivid">Vivid</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button 
                  onClick={handleImageGeneration}
                  disabled={imageMutation.isPending || !imagePrompt.trim()}
                  className="w-full"
                >
                  {imageMutation.isPending ? (
                    <>
                      <Sparkles className="mr-2 animate-spin" size={16} />
                      Generating Image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="mr-2" size={16} />
                      Generate Image
                    </>
                  )}
                </Button>

                {generatedImage && (
                  <div className="mt-4">
                    <img 
                      src={generatedImage} 
                      alt="Generated" 
                      className="w-full max-w-md rounded-lg border"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audio Transcription */}
          <TabsContent value="audio" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="text-green-600" />
                  Audio Transcription
                </CardTitle>
                <CardDescription>
                  Upload audio files for transcription using Whisper.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="audio-file">Audio File</Label>
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleTranscription}
                  disabled={transcriptionMutation.isPending || !audioFile}
                  className="w-full"
                >
                  {transcriptionMutation.isPending ? (
                    <>
                      <Mic className="mr-2 animate-pulse" size={16} />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2" size={16} />
                      Transcribe Audio
                    </>
                  )}
                </Button>

                {transcriptionResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Transcription:</h4>
                    <p className="text-sm">{transcriptionResult}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Embeddings */}
          <TabsContent value="embeddings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="text-orange-600" />
                  Text Embeddings
                </CardTitle>
                <CardDescription>
                  Generate vector embeddings for text using OpenAI's embedding models.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="embedding-text">Text to Embed</Label>
                  <Textarea
                    id="embedding-text"
                    value={embeddingText}
                    onChange={(e) => setEmbeddingText(e.target.value)}
                    placeholder="Enter text to generate embeddings for..."
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleEmbedding}
                  disabled={embeddingMutation.isPending || !embeddingText.trim()}
                  className="w-full"
                >
                  {embeddingMutation.isPending ? (
                    <>
                      <Brain className="mr-2 animate-pulse" size={16} />
                      Creating Embeddings...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2" size={16} />
                      Generate Embeddings
                    </>
                  )}
                </Button>

                {embeddingResult.length > 0 && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Embedding Vector:</h4>
                    <Badge variant="secondary" className="mb-2">
                      Dimensions: {embeddingResult.length}
                    </Badge>
                    <p className="text-xs font-mono break-all">
                      [{embeddingResult.slice(0, 5).map(n => n.toFixed(6)).join(', ')}...]
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Moderation */}
          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="text-red-600" />
                  Content Moderation
                </CardTitle>
                <CardDescription>
                  Analyze content for harmful, inappropriate, or policy-violating material.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="moderation-text">Content to Moderate</Label>
                  <Textarea
                    id="moderation-text"
                    value={moderationText}
                    onChange={(e) => setModerationText(e.target.value)}
                    placeholder="Enter content to analyze for moderation..."
                    className="mt-2"
                  />
                </div>

                <Button 
                  onClick={handleModeration}
                  disabled={moderationMutation.isPending || !moderationText.trim()}
                  className="w-full"
                >
                  {moderationMutation.isPending ? (
                    <>
                      <Shield className="mr-2 animate-pulse" size={16} />
                      Analyzing Content...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2" size={16} />
                      Moderate Content
                    </>
                  )}
                </Button>

                {moderationResult && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Moderation Results:</h4>
                    <div className="space-y-2">
                      <Badge variant={moderationResult.flagged ? "destructive" : "secondary"}>
                        {moderationResult.flagged ? "Content Flagged" : "Content Safe"}
                      </Badge>
                      {moderationResult.flagged && (
                        <div className="text-sm">
                          <p className="font-medium">Flagged Categories:</p>
                          <ul className="list-disc list-inside">
                            {Object.entries(moderationResult.categories as Record<string, boolean>).map(([category, flagged]) => 
                              flagged && <li key={category}>{category}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text-to-Speech */}
          <TabsContent value="speech" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="text-indigo-600" />
                  Text-to-Speech
                </CardTitle>
                <CardDescription>
                  Convert text to natural-sounding speech with various voice options.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="speech-text">Text to Synthesize</Label>
                  <Textarea
                    id="speech-text"
                    value={speechText}
                    onChange={(e) => setSpeechText(e.target.value)}
                    placeholder="Enter text to convert to speech..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Voice</Label>
                  <Select value={speechVoice} onValueChange={setSpeechVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alloy">Alloy</SelectItem>
                      <SelectItem value="echo">Echo</SelectItem>
                      <SelectItem value="fable">Fable</SelectItem>
                      <SelectItem value="onyx">Onyx</SelectItem>
                      <SelectItem value="nova">Nova</SelectItem>
                      <SelectItem value="shimmer">Shimmer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSpeech}
                  disabled={speechMutation.isPending || !speechText.trim()}
                  className="w-full"
                >
                  {speechMutation.isPending ? (
                    <>
                      <Volume2 className="mr-2 animate-pulse" size={16} />
                      Generating Speech...
                    </>
                  ) : (
                    <>
                      <Volume2 className="mr-2" size={16} />
                      Generate Speech
                    </>
                  )}
                </Button>

                {speechAudio && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Generated Audio:</h4>
                    <audio controls className="w-full">
                      <source src={speechAudio} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}