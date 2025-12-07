import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, ArrowLeft, Zap, Download, Headphones } from "lucide-react";

export default function SubscriptionSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Crown className="h-12 w-12 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-purple-800 dark:text-purple-200 mb-2">
            Welcome to Pro!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your subscription is now active. Enjoy unlimited access to premium templates.
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Your Subscription
                <Badge variant="secondary" className="ml-auto">
                  Active
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Pro Plan</h3>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">$79/month</p>
                  <p className="text-sm text-muted-foreground">Next billing: Feb 6, 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                What You Get
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited template downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority customer support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Access to premium templates</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Early access to new releases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom template requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Commercial license included</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Download className="h-6 w-6" />
                  <span className="text-sm">Browse Templates</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Crown className="h-6 w-6" />
                  <span className="text-sm">Premium Collection</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                  <Headphones className="h-6 w-6" />
                  <span className="text-sm">Contact Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Start Downloading
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              Questions about your subscription? 
              <a href="mailto:billing@runyourtrip.com" className="text-blue-600 hover:underline ml-1">
                Contact billing support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}