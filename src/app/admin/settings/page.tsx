"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import PageHero from "@/components/shared/PageHero";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Setting {
  id: string;
  siteName: string;
  tagline?: string | null;
  logo?: string | null;
  favicon?: string | null;
  defaultPostStatus: string;
  postsPerPage: number;
  allowComments: boolean;
  defaultMetaDescription?: string | null;
  defaultMetaKeywords?: string | null;
  defaultOgImage?: string | null;
  twitterHandle?: string | null;
  themeMode: string;
  homepageLayout: string;
  analyticsId?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUser?: string | null;
  smtpPassword?: string | null;
  senderEmail?: string | null;
  maintenanceMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!data) {
        setSettings({
            id: "",
            siteName: "AB TECH",
            tagline: "",
            logo: "",
            favicon: "",
            defaultPostStatus: "draft",
            postsPerPage: 10,
            allowComments: true,
            defaultMetaDescription: "",
            defaultMetaKeywords: "",
            defaultOgImage: "",
            twitterHandle: "",
            themeMode: "system",
            homepageLayout: "list",
            analyticsId: "",
            smtpHost: "",
            smtpPort: null,
            smtpUser: "",
            smtpPassword: "",
            senderEmail: "",
            maintenanceMode: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        } else {
        setSettings(data);
        }
    } catch (err) {
        console.error("Failed to fetch settings:", err);
        setError("Failed to load settings");
    } finally {
        setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update settings");
        return;
      }

      const updatedSettings = await res.json();
      setSettings(updatedSettings);

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (err) {
      setError("Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof Setting, value: any) => {
    setSettings((prev) => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen bg-background">
      <PageHero
        title="Site Settings"
        subtitle="Configure your site preferences and options"
        badge="Admin"
        actions={<Button variant="outline" onClick={() => router.back()}>Back</Button>}
      />
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSave}>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO & Social</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* General Settings Tab */}
              <TabsContent value="general">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Basic information about your site
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="siteName">Site Name</Label>
                      <Input
                        id="siteName"
                        value={settings?.siteName || ""}
                        onChange={(e) => handleChange("siteName", e.target.value)}
                        placeholder="My Blog"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input
                        id="tagline"
                        value={settings?.tagline || ""}
                        onChange={(e) => handleChange("tagline", e.target.value)}
                        placeholder="A short description of your site"
                      />
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo URL</Label>
                      <Input
                        id="logo"
                        value={settings?.logo || ""}
                        onChange={(e) => handleChange("logo", e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="favicon">Favicon URL</Label>
                      <Input
                        id="favicon"
                        value={settings?.favicon || ""}
                        onChange={(e) => handleChange("favicon", e.target.value)}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          When enabled, the site will be temporarily unavailable to visitors
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings?.maintenanceMode || false}
                        onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Settings Tab */}
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Settings</CardTitle>
                    <CardDescription>
                      Configure how your content is displayed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="defaultPostStatus">Default Post Status</Label>
                      <Select
                        value={settings?.defaultPostStatus || "draft"}
                        onValueChange={(value) => handleChange("defaultPostStatus", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="postsPerPage">Posts Per Page</Label>
                      <Input
                        id="postsPerPage"
                        type="number"
                        min="1"
                        max="100"
                        value={settings?.postsPerPage || 10}
                        onChange={(e) => handleChange("postsPerPage", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="allowComments">Allow Comments</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable comments on posts
                        </p>
                      </div>
                      <Switch
                        id="allowComments"
                        checked={settings?.allowComments || true}
                        onCheckedChange={(checked) => handleChange("allowComments", checked)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="homepageLayout">Homepage Layout</Label>
                      <Select
                        value={settings?.homepageLayout || "list"}
                        onValueChange={(value) => handleChange("homepageLayout", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">List View</SelectItem>
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="magazine">Magazine Style</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="themeMode">Theme Mode</Label>
                      <Select
                        value={settings?.themeMode || "system"}
                        onValueChange={(value) => handleChange("themeMode", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select theme mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System Default</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SEO & Social Settings Tab */}
              <TabsContent value="seo">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO & Social Media</CardTitle>
                    <CardDescription>
                      Optimize your site for search engines and social sharing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="defaultMetaDescription">Default Meta Description</Label>
                      <Input
                        id="defaultMetaDescription"
                        value={settings?.defaultMetaDescription || ""}
                        onChange={(e) => handleChange("defaultMetaDescription", e.target.value)}
                        placeholder="A default description for search engines"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultMetaKeywords">Default Meta Keywords</Label>
                      <Input
                        id="defaultMetaKeywords"
                        value={settings?.defaultMetaKeywords || ""}
                        onChange={(e) => handleChange("defaultMetaKeywords", e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div>
                      <Label htmlFor="defaultOgImage">Default Open Graph Image URL</Label>
                      <Input
                        id="defaultOgImage"
                        value={settings?.defaultOgImage || ""}
                        onChange={(e) => handleChange("defaultOgImage", e.target.value)}
                        placeholder="https://example.com/og-image.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitterHandle">Twitter Handle</Label>
                      <Input
                        id="twitterHandle"
                        value={settings?.twitterHandle || ""}
                        onChange={(e) => handleChange("twitterHandle", e.target.value)}
                        placeholder="@yourhandle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="analyticsId">Google Analytics ID</Label>
                      <Input
                        id="analyticsId"
                        value={settings?.analyticsId || ""}
                        onChange={(e) => handleChange("analyticsId", e.target.value)}
                        placeholder="G-XXXXXXXXXX"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Advanced Settings Tab */}
              <TabsContent value="advanced">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Email and other advanced configurations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="smtpHost">SMTP Host</Label>
                      <Input
                        id="smtpHost"
                        value={settings?.smtpHost || ""}
                        onChange={(e) => handleChange("smtpHost", e.target.value)}
                        placeholder="smtp.example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPort">SMTP Port</Label>
                      <Input
                        id="smtpPort"
                        type="number"
                        value={settings?.smtpPort || ""}
                        onChange={(e) => handleChange("smtpPort", e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="587"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpUser">SMTP Username</Label>
                      <Input
                        id="smtpUser"
                        value={settings?.smtpUser || ""}
                        onChange={(e) => handleChange("smtpUser", e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="smtpPassword">SMTP Password</Label>
                      <Input
                        id="smtpPassword"
                        type="password"
                        value={settings?.smtpPassword || ""}
                        onChange={(e) => handleChange("smtpPassword", e.target.value)}
                        placeholder="Your SMTP password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="senderEmail">Sender Email Address</Label>
                      <Input
                        id="senderEmail"
                        type="email"
                        value={settings?.senderEmail || ""}
                        onChange={(e) => handleChange("senderEmail", e.target.value)}
                        placeholder="noreply@example.com"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}