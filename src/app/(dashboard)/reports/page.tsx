import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, FileSpreadsheet, PieChart, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ReportsPage() {
  const invoices = await prisma.invoice.findMany({
    select: {
      type: true,
      taxableValue: true,
      cgst: true,
      sgst: true,
      igst: true,
      grandTotal: true
    }
  });

  const totalGST = invoices.reduce((acc, inv) => acc + inv.cgst + inv.sgst + inv.igst, 0);
  const totalTaxable = invoices.reduce((acc, inv) => acc + inv.taxableValue, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Export your GST filings and view business performance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" /> Tax Summary (Current Month)</CardTitle>
            <CardDescription>Estimated tax liabilities based on generated invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Total Taxable Sales</span>
              <span className="font-bold text-slate-900">₹{totalTaxable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Total Output GST (CGST + SGST + IGST)</span>
              <span className="font-bold text-indigo-600">₹{totalGST.toLocaleString()}</span>
            </div>
            <div className="pt-4">
              <button className="w-full flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                Export GSTR-1 Excel (B2B/B2C)
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> Sales Performance</CardTitle>
            <CardDescription>Revenue breakdown by category and timeline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex justify-between items-center py-2 border-b">
              <span className="text-slate-600">Total Invoices Generated</span>
              <span className="font-bold text-slate-900">{invoices.length}</span>
            </div>
            <div className="pt-12 text-center text-slate-400 text-sm italic">
              (Charts and graphical visualizations will render here in production)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Exports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-between p-4 rounded border hover:bg-slate-50 transition-colors text-left">
              <div>
                <div className="font-medium text-slate-900">Customer Ledger</div>
                <div className="text-xs text-slate-500 mt-1">Export all transactions per customer</div>
              </div>
              <Download className="h-5 w-5 text-slate-400" />
            </button>
            <button className="flex items-center justify-between p-4 rounded border hover:bg-slate-50 transition-colors text-left">
              <div>
                <div className="font-medium text-slate-900">Inventory Valuation</div>
                <div className="text-xs text-slate-500 mt-1">Current stock levels & value</div>
              </div>
              <Download className="h-5 w-5 text-slate-400" />
            </button>
            <button className="flex items-center justify-between p-4 rounded border hover:bg-slate-50 transition-colors text-left">
              <div>
                <div className="font-medium text-slate-900">Payment Collection</div>
                <div className="text-xs text-slate-500 mt-1">Received vs Outstanding payments</div>
              </div>
              <Download className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
