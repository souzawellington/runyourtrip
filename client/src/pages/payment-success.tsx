import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft, Star } from "lucide-react";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [templateData, setTemplateData] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Get template info from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    
    if (templateId) {
      // In a real app, you might fetch template details here
      setTemplateData({
        id: templateId,
        name: "Template Name" // This would come from your API
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground">
            Thank you for your purchase. Your template is ready for download.
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Your Purchase
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b">
              <div>
                <h3 className="font-semibold">{templateData?.name || "Template"}</h3>
                <p className="text-sm text-muted-foreground">Digital Download</p>
              </div>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2">What's Next?</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Download your template files</li>
                <li>• Follow the included setup instructions</li>
                <li>• Customize to match your brand</li>
                <li>• Deploy to your hosting platform</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Love this template?
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Help other users by leaving a review and rating.
              </p>
              <Button variant="outline" size="sm">
                Leave a Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button variant="outline">
                Browse More Templates
              </Button>
            </Link>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Need help? <a href="mailto:support@runyourtrip.com" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </div>
  );
}