'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Calendar, 
  Crown, 
  Shield, 
  Edit, 
  Save, 
  X,
  Camera,
  MapPin,
  Link as LinkIcon,
  FileText,
  Settings,
  LogOut,
  ArrowLeft,
  Download,
  Trash2,
  Key,
  AlertTriangle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from 'next-auth/react';
import { AccountLinking } from '@/components/auth/account-linking';
import { PasswordManagement } from '@/components/auth/password-management';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PremiumStatus {
  isPremium: boolean;
  role: string;
  premiumExpires?: string;
  hasActiveSubscription: boolean;
  daysRemaining: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: ''
  });

  // Password change state
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Account deletion state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchUserData();
      fetchPremiumStatus();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          name: data.name || '',
          bio: data.bio || '',
          avatar: data.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch('/api/user/premium-status');
      const data = await response.json();
      setPremiumStatus(data);
    } catch (error) {
      console.error('Error fetching premium status:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
      avatar: user?.avatar || ''
    });
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handlePasswordChange = async () => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }

      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Close dialog after successful change
      setTimeout(() => {
        setIsPasswordDialogOpen(false);
        setPasswordSuccess(null);
      }, 2000);

    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: deletePassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: '/' });

    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/user/export-data');
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `user-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Data exported successfully!');
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data');
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-800"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'AUTHOR':
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="w-3 h-3 mr-1" />Author</Badge>;
      case 'MODERATOR':
        return <Badge className="bg-purple-100 text-purple-800"><Shield className="w-3 h-3 mr-1" />Moderator</Badge>;
      case 'PREMIUM_USER':
        return <Badge className="bg-yellow-100 text-yellow-800"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      default:
        return <Badge variant="secondary">Free User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.avatar || ''} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2) : <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>
                  {editing && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <CardTitle>{user.name}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  {getRoleBadge(user.role)}
                  {premiumStatus?.isPremium && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{user.email}</span>
                    {user.emailVerified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  {premiumStatus?.isPremium && premiumStatus.premiumExpires && (
                    <div className="flex items-center gap-3 text-sm">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span>Premium expires {formatDate(premiumStatus.premiumExpires)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/billing')}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    {premiumStatus?.isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
                  </Button>
                  
                  {(user.role === 'ADMIN' || user.role === 'AUTHOR') && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-red-600 hover:text-red-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile Information</TabsTrigger>
                <TabsTrigger value="account">Account Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>
                          Update your profile details and public information
                        </CardDescription>
                      </div>
                      {!editing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-sm font-medium">{user.name || 'Not set'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="bg-muted"
                        />
                        {user.emailVerified && (
                          <Badge variant="outline">Verified</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email address cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      {editing ? (
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={4}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {user.bio || 'No bio set'}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="avatar">Avatar URL</Label>
                      {editing ? (
                        <Input
                          id="avatar"
                          value={formData.avatar}
                          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                          placeholder="https://example.com/avatar.jpg"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {user.avatar || 'No avatar set'}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account security and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Security</h4>
                        <div className="space-y-2">
                          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start"
                              >
                                <Key className="w-4 h-4 mr-2" />
                                Change Password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Change Password</DialogTitle>
                                <DialogDescription>
                                  Enter your current password and choose a new one.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {passwordError && (
                                  <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                      {passwordError}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                {passwordSuccess && (
                                  <Alert className="border-green-200 bg-green-50">
                                    <AlertDescription className="text-green-800">
                                      {passwordSuccess}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="current-password">Current Password</Label>
                                  <Input
                                    id="current-password"
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="new-password">New Password</Label>
                                  <Input
                                    id="new-password"
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                                  <Input
                                    id="confirm-password"
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handlePasswordChange} disabled={passwordLoading}>
                                  {passwordLoading ? 'Changing...' : 'Change Password'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Data & Privacy</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleDataExport}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download My Data
                          </Button>
                          
                          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                  Delete Account
                                </DialogTitle>
                                <DialogDescription>
                                  This action cannot be undone. This will permanently delete your account and all associated data.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                {deleteError && (
                                  <Alert className="border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800">
                                      {deleteError}
                                    </AlertDescription>
                                  </Alert>
                                )}
                                <div className="space-y-2">
                                  <Label htmlFor="delete-password">Confirm Password</Label>
                                  <Input
                                    id="delete-password"
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password to confirm deletion"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    Enter your password to confirm account deletion
                                  </p>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  onClick={handleAccountDeletion}
                                  disabled={deleteLoading || !deletePassword}
                                >
                                  {deleteLoading ? 'Deleting...' : 'Delete Account'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Connected Accounts</h4>
                        <AccountLinking />
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Password Management</h4>
                        <PasswordManagement />
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Preferences</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => router.push('/billing')}
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Subscription Settings
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
}