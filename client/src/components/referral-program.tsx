import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Gift, 
  Users, 
  Copy, 
  Check,
  Share2,
  DollarSign,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReferralProgram() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  
  const userId = (user as any)?.claims?.sub || (user as any)?.id;

  // Fetch referral stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/referrals/stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const response = await fetch(`/api/referrals/stats/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch referral stats");
      return response.json();
    },
  });

  // Generate referral code
  const generateCode = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/referrals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to generate referral code");
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Referral Code Generated!",
        description: `Your code: ${data.referralCode}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/referrals/stats"] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const shareOnSocial = (platform: string, code: string) => {
    const shareUrl = `${window.location.origin}/signup?ref=${code}`;
    const message = "Join RunYourTrip and get $10 credit! Use my referral code: " + code;
    
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], "_blank");
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-500" />
            Referral Program
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sign in to start earning rewards by referring friends!
          </p>
        </CardContent>
      </Card>
    );
  }

  const referralCode = stats?.activeCode;
  const shareLink = referralCode ? `${window.location.origin}/signup?ref=${referralCode}` : "";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gift className="h-6 w-6 text-green-600" />
            Referral Program
          </CardTitle>
          <CardDescription>
            Earn $10 credit for every friend who signs up and makes their first purchase!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                      <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold">{stats?.completedReferrals || 0}</p>
                    </div>
                    <Award className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Earned</p>
                      <p className="text-2xl font-bold">${stats?.totalRewards || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share your unique code with friends to earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralCode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  value={referralCode}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(referralCode)}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Share Link:</p>
                <div className="flex items-center gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shareLink)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial("twitter", referralCode)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial("linkedin", referralCode)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  onClick={() => shareOnSocial("facebook", referralCode)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Generate your referral code to start earning rewards
              </p>
              <Button
                onClick={() => generateCode.mutate()}
                disabled={generateCode.isPending}
              >
                Generate Referral Code
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Share Your Code</h4>
                <p className="text-sm text-muted-foreground">
                  Share your unique referral code or link with friends
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Friends Sign Up</h4>
                <p className="text-sm text-muted-foreground">
                  They use your code when creating their account
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Earn Rewards</h4>
                <p className="text-sm text-muted-foreground">
                  Get $10 credit when they make their first purchase
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      {stats?.referralHistory?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.referralHistory.map((referral: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm">{referral.code}</p>
                    <p className="text-xs text-muted-foreground">
                      {referral.status === "completed" 
                        ? `Completed on ${new Date(referral.completedAt).toLocaleDateString()}`
                        : referral.status === "expired"
                        ? "Expired"
                        : `Expires ${new Date(referral.expiresAt).toLocaleDateString()}`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      referral.status === "completed" ? "default" :
                      referral.status === "expired" ? "secondary" :
                      "outline"
                    }>
                      {referral.status}
                    </Badge>
                    {referral.reward && (
                      <Badge variant="outline">${referral.reward}</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}