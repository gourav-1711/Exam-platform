"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, User, Shield, Bell, Palette } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setTheme } from "@/store/slices/uiSlice";

export default function SettingsPage() {
  const { user } = useUser();
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your admin preferences</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" /> Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <img src={user.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
            )}
            <div>
              <p className="font-semibold text-gray-900">{user?.fullName ?? "—"}</p>
              <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
            <Badge className="ml-auto bg-violet-100 text-violet-700 hover:bg-violet-100">
              <Shield className="h-3 w-3 mr-1" /> Admin
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-gray-400" /> Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                size="sm"
                onClick={() => dispatch(setTheme(t))}
                className={theme === t ? "bg-violet-600 hover:bg-violet-700" : ""}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Theme preference is saved locally</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" /> Admin Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Your admin role is managed through Clerk user metadata. To grant or revoke admin access for other users, update their <code className="bg-gray-100 px-1 rounded">publicMetadata.role</code> to <code className="bg-gray-100 px-1 rounded">"admin"</code>.
          </p>
          <div className="rounded-lg bg-violet-50 border border-violet-100 p-3 text-sm text-violet-700">
            <strong>Your role:</strong> {String((user?.publicMetadata as Record<string, unknown>)?.role ?? "user")}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" /> API Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">Cache settings (managed by the server):</p>
          <div className="space-y-2 text-sm">
            {[
              { label: "Dashboard Statistics", ttl: "5 min" },
              { label: "Question Lists", ttl: "10 min" },
              { label: "Analytics Data", ttl: "15 min" },
              { label: "Leaderboard", ttl: "5 min" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-gray-700">{item.label}</span>
                <Badge variant="outline" className="text-xs">{item.ttl}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
