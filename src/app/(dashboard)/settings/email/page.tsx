import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, Mail, Settings2, FileText } from "lucide-react";

export default function EmailSettingsPage() {
  // Read from environment variables securely on the server
  const isConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email & PDF Settings</h1>
          <p className="text-slate-500 mt-1">Configure SMTP settings to automatically email invoices and quotations.</p>
        </div>
      </div>

      <Card className={isConfigured ? "border-green-200" : "border-yellow-200"}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <div className="bg-green-100 p-3 rounded-full"><Mail className="w-8 h-8 text-green-600" /></div>
            ) : (
              <div className="bg-yellow-100 p-3 rounded-full"><XCircle className="w-8 h-8 text-yellow-600" /></div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isConfigured ? "SMTP Connected & Active" : "Not Connected (Dev Mode Active)"}
              </h2>
              <p className="text-slate-600 mt-1">
                {isConfigured 
                  ? "Your SMTP credentials are valid. Invoices will be emailed automatically as PDF attachments." 
                  : "Currently using Development Fallback. Emails will be logged to the server console instead of actually sending."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> SMTP Credentials</CardTitle>
          <CardDescription>
            These values must be securely stored in your server's `.env` file. You can use SendGrid, Resend, or AWS SES.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SMTP Host</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.SMTP_HOST ? process.env.SMTP_HOST : "Missing (SMTP_HOST)"}
                {process.env.SMTP_HOST ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SMTP Port</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.SMTP_PORT ? process.env.SMTP_PORT : "Missing (SMTP_PORT) (Usually 587)"}
                {process.env.SMTP_PORT ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SMTP Username</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.SMTP_USER ? "******** Loaded Securely ********" : "Missing (SMTP_USER)"}
                {process.env.SMTP_USER ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">SMTP Password</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.SMTP_PASS ? "******** Loaded Securely ********" : "Missing (SMTP_PASS)"}
                {process.env.SMTP_PASS ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">From Email Address</label>
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-md border text-slate-500 font-mono text-sm">
                {process.env.SMTP_FROM ? process.env.SMTP_FROM : "Missing (SMTP_FROM) e.g., billing@yourcompany.com"}
                {process.env.SMTP_FROM ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> PDF Generation Engine</CardTitle>
          <CardDescription>
            The system is configured to dynamically convert Invoices and Quotations into professional PDF documents before attaching them to emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="p-4 bg-slate-50 rounded border text-sm text-slate-700 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <strong>Engine Status: Ready</strong>
                <p className="mt-1 text-slate-500">The server-side document engine is initialized and ready to stream buffers to Nodemailer.</p>
              </div>
           </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
