"use client";

import { useEffect, useState, useTransition } from "react";
import { getCompanySettings, updateCompanySettings } from "@/app/actions/settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Landmark, Upload, Save, FileText } from "lucide-react";

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getCompanySettings();
      setSettings(data);
      if (data.logoBase64) setLogoPreview(data.logoBase64);
    }
    load();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", settings.id);
    if (logoPreview) {
      formData.set("logoBase64", logoPreview);
    }

    startTransition(async () => {
      const result = await updateCompanySettings(formData);
      if (result.success) {
        toast.success("Company settings updated successfully");
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  };

  if (!settings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-sm text-slate-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
        <p className="text-slate-500 mt-1">Manage your brand identity, legal, and banking details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <CardTitle>Brand Identity</CardTitle>
            </div>
            <CardDescription>Your company name and logo as it appears on invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name <span className="text-red-500">*</span></label>
              <input required defaultValue={settings.companyName} name="companyName" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Company Logo</label>
              <div className="mt-2 flex items-center gap-6">
                <div className="h-24 w-48 rounded border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden relative">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-gray-500">No logo</span>
                  )}
                </div>
                <label className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Change Logo</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={handleLogoUpload} />
                </label>
                {logoPreview && (
                  <button type="button" onClick={() => setLogoPreview(null)} className="text-sm text-red-600 hover:text-red-500 font-medium">Remove</button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Recommended size: 400x150px. Max size: 2MB.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <CardTitle>Legal Details</CardTitle>
            </div>
            <CardDescription>Official business details used for compliance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <input defaultValue={settings.phone || ""} name="phone" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input type="email" defaultValue={settings.email || ""} name="email" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">GSTIN</label>
                <input defaultValue={settings.gstin || ""} name="gstin" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">PAN</label>
                <input defaultValue={settings.pan || ""} name="pan" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registered Address</label>
              <textarea defaultValue={settings.address || ""} name="address" rows={3} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Terms & Conditions</label>
              <textarea defaultValue={settings.terms || ""} name="terms" rows={3} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="1. Payment due within 15 days..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-600" />
              <CardTitle>Bank Details</CardTitle>
            </div>
            <CardDescription>Where customers should send their payments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Bank Name</label>
              <input defaultValue={settings.bankName || ""} name="bankName" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="HDFC Bank" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Number</label>
                <input defaultValue={settings.accountNumber || ""} name="accountNumber" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">IFSC Code</label>
                <input defaultValue={settings.ifscCode || ""} name="ifscCode" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm uppercase" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">UPI ID</label>
              <input defaultValue={settings.upiId || ""} name="upiId" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="merchant@upi" />
              <p className="text-xs text-gray-500">Used to generate dynamic QR codes on invoices.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2 sticky bottom-6 z-10">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
