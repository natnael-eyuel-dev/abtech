"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function PasswordManagement() {
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    checkPasswordStatus();
  }, []);

  const checkPasswordStatus = async () => {
    try {
      const response = await fetch('/api/user/set-password');
      if (response.ok) {
        const data = await response.json();
        setHasPassword(data.hasPassword);
      }
    } catch (error) {
      console.error('Error checking password status:', error);
    }
  };

  const handleSetPassword = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate passwords
      if (passwordData.password !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (passwordData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      const response = await fetch('/api/user/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordData.password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      setSuccess('Password set successfully!');
      setHasPassword(true);
      setPasswordData({ password: '', confirmPassword: '' });
      
      toast({
        title: 'Password Set',
        description: 'You can now sign in with your email and password.',
      });
      
      // Close dialog after successful change
      setTimeout(() => {
        setIsDialogOpen(false);
        setSuccess(null);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/set-password', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove password');
      }

      setSuccess('Password removed successfully!');
      setHasPassword(false);
      
      toast({
        title: 'Password Removed',
        description: 'You can no longer sign in with email and password.',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password Management</CardTitle>
        <CardDescription>
          Manage your email and password login credentials
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

        {/* Current Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Current Status</h3>
          <div className="flex items-center gap-3">
            {hasPassword ? (
              <>
                <Badge className="bg-green-100 text-green-800">
                  <Icons.check className="w-3 h-3 mr-1" />
                  Password Set
                </Badge>
                <span className="text-sm text-muted-foreground">
                  You can sign in with email and password
                </span>
              </>
            ) : (
              <>
                <Badge variant="outline">
                  <Icons.x className="w-3 h-3 mr-1" />
                  No Password
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Email and password login is disabled
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
          <div className="space-y-2">
            {!hasPassword ? (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start">
                    <Icons.key className="w-4 h-4 mr-2" />
                    Set Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Set Password</DialogTitle>
                    <DialogDescription>
                      Create a password to enable email and password login.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                        placeholder="Enter new password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSetPassword} disabled={loading}>
                      {loading ? 'Setting...' : 'Set Password'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleRemovePassword}
                disabled={loading}
              >
                {loading ? (
                  <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Icons.trash2 className="w-4 h-4 mr-2" />
                )}
                Remove Password
              </Button>
            )}
          </div>
        </div>

        {/* Info Box */}
        <Alert>
          <AlertDescription>
            {hasPassword 
              ? "You currently have both OAuth and password login enabled. You can remove your password to use only OAuth providers, or keep it for backup login access."
              : "You can set a password to enable traditional email and password login alongside your OAuth providers. This gives you multiple ways to access your account."
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}