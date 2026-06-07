"use client";

import {
  Settings as SettingsIcon,
  ExternalLink,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  contact_gmail,
  contact_number,
  contact_address,
} from "@/lib/data";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-600" />
          Settings
        </h1>
        <p className="text-gray-500 mt-2">
          Application configuration is managed via environment variables.
        </p>
      </div>

      <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-600" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Support Email
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {contact_gmail}
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Contact Number
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {contact_number}
              </p>
            </div>
            <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 md:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                Address
              </p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {contact_address}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 bg-white shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-indigo-600" /> Environment Variables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            App-wide settings like site name, feature toggles, and media
            credentials are configured through environment variables in your{" "}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
              .env
            </code>{" "}
            file. No database-based settings UI is available.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
