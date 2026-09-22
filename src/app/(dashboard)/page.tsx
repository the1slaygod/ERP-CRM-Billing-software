import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, FileText, ArrowUpRight, TrendingUp, AlertCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getDashboardData() {
  const [totalCustomers, invoices, allInvoices, products] = await Promise.all([
    prisma.customer.count(),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { customer: true },
    }),
    prisma.invoice.findMany({
      select: { grandTotal: true, status: true },
    }),
    prisma.product.findMany({
      select: { currentStock: true, reorderLevel: true },
    }),
  ]);

  return {
    totalCustomers,
    invoices,
    totalRevenue: allInvoices.reduce((acc, invoice) => acc + invoice.grandTotal, 0),
    outstandingReceivables: allInvoices
      .filter((invoice) => invoice.status === "UNPAID")
      .reduce((acc, invoice) => acc + invoice.grandTotal, 0),
    lowStockCount: products.filter((product) => product.currentStock <= product.reorderLevel).length,
  };
}

export default async function DashboardPage() {
  const { totalCustomers, invoices, totalRevenue, outstandingReceivables, lowStockCount } =
    isDatabaseConfigured
      ? await getDashboardData()
      : {
          totalCustomers: 0,
          invoices: [],
          totalRevenue: 0,
          outstandingReceivables: 0,
          lowStockCount: 0,
        };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Overview</h1>
        <p className="text-slate-500 mt-1">Here is what's happening with your business today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/invoices" className="block transition-transform hover:scale-[1.02]">
          <Card className="h-full hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <TrendingUp className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12% from last month
            </p>
          </CardContent>
        </Card>
        </Link>
        
        <Link href="/invoices" className="block transition-transform hover:scale-[1.02]">
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Outstanding Receivables</p>
              <FileText className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">₹{outstandingReceivables.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Across all unpaid invoices</p>
          </CardContent>
        </Card>
        </Link>

        <Link href="/customers" className="block transition-transform hover:scale-[1.02]">
        <Card className="h-full hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Total Customers</p>
              <Users className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCustomers}</div>
            <span className="text-xs text-indigo-600 hover:underline mt-1 block">View all customers</span>
          </CardContent>
        </Card>
        </Link>

        <Link href="/inventory" className="block transition-transform hover:scale-[1.02]">
        <Card className={`h-full hover:shadow-md transition-shadow ${lowStockCount > 0 ? "bg-red-50/50 border-red-200" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-500">Low Stock Alerts</p>
              {lowStockCount > 0 ? <AlertCircle className="h-4 w-4 text-red-500" /> : <Package className="h-4 w-4 text-slate-500" />}
            </div>
            <div className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-700" : "text-slate-900"}`}>{lowStockCount}</div>
            <span className="text-xs text-indigo-600 hover:underline mt-1 block">Check inventory</span>
          </CardContent>
        </Card>
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Invoices */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Invoice</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {invoices.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No recent invoices</td></tr>
                  ) : invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-indigo-600">{inv.number}</td>
                      <td className="px-4 py-3">{inv.customer.name}</td>
                      <td className="px-4 py-3 font-semibold">₹{inv.grandTotal.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          inv.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/invoices/${inv.id}`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/invoices/new" className="flex items-center p-3 text-sm font-medium text-slate-700 rounded-md bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border">
              <FileText className="h-4 w-4 mr-3 text-slate-400" /> Create New Invoice
            </Link>
            <Link href="/customers/new" className="flex items-center p-3 text-sm font-medium text-slate-700 rounded-md bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border">
              <Users className="h-4 w-4 mr-3 text-slate-400" /> Add New Customer
            </Link>
            <Link href="/reports" className="flex items-center p-3 text-sm font-medium text-slate-700 rounded-md bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border">
              <TrendingUp className="h-4 w-4 mr-3 text-slate-400" /> View GST Reports
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
