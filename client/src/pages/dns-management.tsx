
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Globe, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DNSManagement() {
  const [domain, setDomain] = useState('runyourtrip.com.br');
  const [verificationValue, setVerificationValue] = useState('openai-domain-verification=dv-cKYo4Q0l5FpaihXiW6izKr2T');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const addVerificationMutation = useMutation({
    mutationFn: async (data: { domain: string; verificationValue: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/godaddy/verify-domain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add DNS record');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMessage({ type: 'success', text: data.message });
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message });
    }
  });

  const verifyOwnershipMutation = useMutation({
    mutationFn: async (data: { domain: string; verificationValue: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/godaddy/verify-ownership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to verify domain');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setMessage({ 
        type: data.verified ? 'success' : 'error', 
        text: data.message 
      });
    },
    onError: (error: Error) => {
      setMessage({ type: 'error', text: error.message });
    }
  });

  const handleAddVerification = () => {
    setMessage(null);
    addVerificationMutation.mutate({ domain, verificationValue });
  };

  const handleVerifyOwnership = () => {
    setMessage(null);
    verifyOwnershipMutation.mutate({ domain, verificationValue });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Globe className="h-8 w-8" />
          DNS Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage DNS records for your domains via GoDaddy API
        </p>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>OpenAI Domain Verification</CardTitle>
          <CardDescription>
            Add TXT record to verify domain ownership for OpenAI services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification">Verification Value</Label>
            <Input
              id="verification"
              value={verificationValue}
              onChange={(e) => setVerificationValue(e.target.value)}
              placeholder="openai-domain-verification=..."
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleAddVerification}
              disabled={addVerificationMutation.isPending || !domain || !verificationValue}
            >
              {addVerificationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add TXT Record
            </Button>

            <Button 
              variant="outline"
              onClick={handleVerifyOwnership}
              disabled={verifyOwnershipMutation.isPending || !domain || !verificationValue}
            >
              {verifyOwnershipMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify Ownership
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Enter your domain name (e.g., runyourtrip.com.br)</li>
              <li>Paste the verification value from OpenAI</li>
              <li>Click "Add TXT Record" to configure DNS via GoDaddy</li>
              <li>Wait 5-15 minutes for DNS propagation</li>
              <li>Click "Verify Ownership" to check if the record is active</li>
              <li>Return to OpenAI to complete verification</li>
            </ol>
          </div>

          <div className="mt-4 p-4 border border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              <strong>Note:</strong> Your GoDaddy API credentials are securely stored in Replit Secrets. 
              DNS changes are made automatically via the GoDaddy API.
            </p>
            <p className="text-sm text-green-900 dark:text-green-100 mt-2">
              <strong>Environment:</strong> Using <span className="font-bold">PRODUCTION</span> mode with <code className="bg-green-100 dark:bg-green-800 px-1 rounded">GODADDY_API_KEY</code> and <code className="bg-green-100 dark:bg-green-800 px-1 rounded">GODADDY_API_SECRET</code>. 
              Your domain <code className="bg-green-100 dark:bg-green-800 px-1 rounded">runyourtrip.com.br</code> can be managed directly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
