"use client";

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Icons } from '@/components/shared/icons';
import { useToast } from '@/hooks/use-toast';

interface LinkedAccount {
  id: string;
  provider: string;
  type: string;
}

export function AccountLinking() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch('/api/user/link-account');
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching linked accounts:', error);
    }
  };

  const handleLinkAccount = async (provider: 'google' | 'github') => {
    setLoading(true);
    setError(null);
    
    try {
      // Store the intent to link account in session storage
      sessionStorage.setItem('linkAccountIntent', 'true');
      
      // Sign in with the provider
      await signIn(provider, { 
        callbackUrl: '/auth/link-account',
        redirect: true 
      });
    } catch (error) {
      setError('Failed to initiate account linking');
      setLoading(false);
    }
  };

  const handleUnlinkAccount = async (provider: string) => {
    setUnlinkingProvider(provider);
    setError(null);
    
    try {
      const response = await fetch(`/api/user/link-account?provider=${provider}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlink account');
      }

      setSuccess(`${provider} account unlinked successfully`);
      await fetchLinkedAccounts();
      
      toast({
        title: 'Account Unlinked',
        description: `${provider} account has been unlinked from your profile.`,
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to unlink account');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return <Icons.google className="h-4 w-4" />;
      case 'github':
        return <Icons.gitHub className="h-4 w-4" />;
      case 'credentials':
        return <Icons.user className="h-4 w-4" />;
      default:
        return <Icons.user className="h-4 w-4" />;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      case 'credentials':
        return 'Email & Password';
      default:
        return provider;
    }
  };

  const isProviderLinked = (provider: string) => {
    return linkedAccounts.some(account => account.provider.toLowerCase() === provider.toLowerCase());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linked Accounts</CardTitle>
        <CardDescription>
          Connect your account to third-party services for easier sign-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error and Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Currently Linked Accounts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Currently Linked</h3>
          {linkedAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No accounts linked yet</p>
          ) : (
            <div className="space-y-2">
              {linkedAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(account.provider)}
                    <div>
                      <p className="font-medium">{getProviderName(account.provider)}</p>
                      <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Connected</Badge>
                    {linkedAccounts.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlinkAccount(account.provider)}
                        disabled={unlinkingProvider === account.provider}
                      >
                        {unlinkingProvider === account.provider ? (
                          <Icons.spinner className="h-4 w-4 animate-spin" />
                        ) : (
                          'Unlink'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Providers to Link */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Link New Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!isProviderLinked('google') && (
              <Button
                variant="outline"
                onClick={() => handleLinkAccount('google')}
                disabled={loading}
                className="justify-start"
              >
                <Icons.google className="mr-2 h-4 w-4" />
                Link Google Account
                {loading && <Icons.spinner className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            )}
            
            {!isProviderLinked('github') && (
              <Button
                variant="outline"
                onClick={() => handleLinkAccount('github')}
                disabled={loading}
                className="justify-start"
              >
                <Icons.gitHub className="mr-2 h-4 w-4" />
                Link GitHub Account
                {loading && <Icons.spinner className="ml-auto h-4 w-4 animate-spin" />}
              </Button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <Alert>
          <AlertDescription>
            Linking accounts allows you to sign in with multiple methods. You can always unlink accounts later, 
            but you must keep at least one account linked to your profile.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}