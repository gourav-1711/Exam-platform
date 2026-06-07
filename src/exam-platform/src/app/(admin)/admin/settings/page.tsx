"use client";

import { useAdminSettings, useUpdateSettings, useGetCloudinaryUsage } from "@/lib/api";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Settings as SettingsIcon,
  Save,
  ShieldCheck,
  Mail,
  Phone,
  Power,
  HardDrive,
  Layout,
  BookOpen,
  CloudLightning,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAdminSettings();
  const { data: mediaUsage, isLoading: loadingMedia } = useGetCloudinaryUsage();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    siteName: "",
    siteDescription: "",
    supportEmail: "",
    supportPhone: "",
    maintenanceMode: false,
    leaderboardEnabled: true,
    quizEnabled: true,
    currentAffairsEnabled: true,
    registrationEnabled: true,
  });

  useEffect(() => {
    if (settings) {
      setForm({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription,
        supportEmail: settings.supportEmail,
        supportPhone: settings.supportPhone,
        maintenanceMode: settings.maintenanceMode,
        leaderboardEnabled: settings.leaderboardEnabled,
        quizEnabled: settings.quizEnabled,
        currentAffairsEnabled: settings.currentAffairsEnabled,
        registrationEnabled: settings.registrationEnabled,
      });
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync(form);
      toast({ title: "Settings saved successfully" });
    } catch {
      toast({ title: "Failed to update settings", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
        <p className="text-gray-500 mt-2">Manage global application settings, modules, and support details</p>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-[500px]">
          <TabsTrigger value="general" className="flex items-center gap-1.5">
            <Layout className="w-4 h-4" /> General
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-1.5">
            <Power className="w-4 h-4" /> Modules
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4" /> Media Usage
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSave} className="space-y-6">
          <TabsContent value="general" className="space-y-6">
            {/* General Info */}
            <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> General Customization
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Configure site branding and descriptions displayed globally
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Site Name</label>
                    <input
                      type="text"
                      value={form.siteName}
                      onChange={(e) => setForm((p) => ({ ...p, siteName: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Site Description</label>
                    <input
                      type="text"
                      value={form.siteDescription}
                      onChange={(e) => setForm((p) => ({ ...p, siteDescription: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Information */}
            <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" /> Support Details
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Update primary contact channels for learners requiring assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Support Email</label>
                    <input
                      type="email"
                      value={form.supportEmail}
                      onChange={(e) => setForm((p) => ({ ...p, supportEmail: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Support Phone</label>
                    <input
                      type="text"
                      value={form.supportPhone}
                      onChange={(e) => setForm((p) => ({ ...p, supportPhone: e.target.value }))}
                      required
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            {/* Feature Toggles & Maintenance */}
            <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Power className="w-5 h-5 text-indigo-600" /> Feature Toggles & Security
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Enable or lock down entire portions of the public exam application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Maintenance Mode</p>
                      <p className="text-[11px] text-gray-400">Lock site for general users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.maintenanceMode}
                      onChange={(e) => setForm((p) => ({ ...p, maintenanceMode: e.target.checked }))}
                      className="w-5 h-5 accent-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Leaderboard System</p>
                      <p className="text-[11px] text-gray-400">Enable points ranking boards</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.leaderboardEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, leaderboardEnabled: e.target.checked }))}
                      className="w-5 h-5 accent-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Quiz Module</p>
                      <p className="text-[11px] text-gray-400">Enable free interactive tests</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.quizEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, quizEnabled: e.target.checked }))}
                      className="w-5 h-5 accent-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Current Affairs</p>
                      <p className="text-[11px] text-gray-400">Display daily news analysis</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.currentAffairsEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, currentAffairsEnabled: e.target.checked }))}
                      className="w-5 h-5 accent-indigo-500"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 col-span-1 md:col-span-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Registration Enabled</p>
                      <p className="text-[11px] text-gray-400">Allow new students to sign up</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.registrationEnabled}
                      onChange={(e) => setForm((p) => ({ ...p, registrationEnabled: e.target.checked }))}
                      className="w-5 h-5 accent-indigo-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            {/* Cloudinary usage report */}
            <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CloudLightning className="w-5 h-5 text-indigo-600" /> Cloudinary Media Storage
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Dynamic usage indicators representing your Cloudinary raw storage limit for textbooks and exam papers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {loadingMedia ? (
                  <p className="text-sm text-gray-400">Retrieving Cloudinary CDN metrics...</p>
                ) : !mediaUsage ? (
                  <p className="text-sm text-gray-400">Usage stats unavailable</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {mediaUsage.storageUsedMb} MB of {mediaUsage.limitMb} MB Used
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          You are using {mediaUsage.percent}% of your allocated Cloudinary limit.
                        </p>
                      </div>
                      <Badge className="bg-indigo-600 text-white font-bold">
                        {mediaUsage.percent}%
                      </Badge>
                    </div>

                    <Progress value={mediaUsage.percent} className="h-2" />

                    <div className="pt-2 grid grid-cols-2 gap-4 border-t">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cloud Credits Used</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                          {mediaUsage.creditsUsed} / {mediaUsage.creditsLimit} Credits
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={updateSettings.isPending}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {updateSettings.isPending ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </Tabs>
    </div>
  );
}