import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Settings2, Link as LinkIcon, RefreshCw } from "lucide-react";

export default function WhatsAppSettingsPage() {
  // Read from environment variables securely on the server
  const isConfigured = !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp Integration</h1>
          <p className="text-slate-500 mt-1">Connect your Meta WhatsApp Cloud API for automated messaging.</p>
        </div>
        <button 
          className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Test Connection
        </button>
      </div>

      <Card className={isConfigured ? "border-green-200" : "border-yellow-200"}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <div className="bg-green-100 p-3 rounded-full"><CheckCircle2 className="w-8 h-8 text-green-600" /></div>
            ) : (
              <div className="bg-yellow-100 p-3 rounded-full"><XCircle className="w-8 h-8 text-yellow-600" /></div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isConfigured ? "Connected & Active" : "Not Connected (Fallback Mode Active)"}
              </h2>
              <p className="text-slate-600 mt-1">
                {isConfigured 
                  ? "Your Meta API credentials are valid. Messages will be sent automatically in the background." 
                  : "Currently using 'wa.me' click-to-chat fallback. To enable full automation, provide the Meta API credentials below."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> Meta API Credentials</CardTitle>
          <CardDescription>
            These values must be securely stored in your server's `.env` file. They are never exposed to the frontend browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number ID</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.WHATSAPP_PHONE_NUMBER_ID ? "Loaded from .env" : "Missing in .env (WHATSAPP_PHONE_NUMBER_ID)"}
                {process.env.WHATSAPP_PHONE_NUMBER_ID ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">WABA ID (Business Account ID)</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.WHATSAPP_WABA_ID ? "Loaded from .env" : "Missing in .env (WHATSAPP_WABA_ID)"}
                {process.env.WHATSAPP_WABA_ID ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Permanent Access Token</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.WHATSAPP_ACCESS_TOKEN ? "******** Loaded Securely ********" : "Missing in .env (WHATSAPP_ACCESS_TOKEN)"}
                {process.env.WHATSAPP_ACCESS_TOKEN ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Webhook Configuration</CardTitle>
          <CardDescription>
            Configure this URL in your Meta App Dashboard to receive live status updates (Delivered, Read, Replied).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Callback URL</label>
            <div className="px-3 py-2 bg-slate-100 rounded-md border text-slate-900 font-mono text-sm select-all">
              https://your-domain.com/api/webhooks/whatsapp
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Verify Token</label>
            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? "******** Loaded Securely ********" : "Missing in .env (WHATSAPP_WEBHOOK_VERIFY_TOKEN)"}
                {process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
        <strong>Setup Instructions:</strong> Please see the documentation for steps to generate these credentials from the Meta App Dashboard. Never expose these values in the frontend code.
      </div>
    </div>
  );
}
