import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Mail, Phone, MapPin, CheckCircle, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { CustomerTabs } from "@/components/crm/CustomerTabs";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      invoices: true,
      payments: true,
      quotations: true,
      leads: true,
      activities: {
        orderBy: { date: "desc" },
      },
      ledgerEntries: {
        orderBy: { date: "desc" }
      }
    }
  });

  if (!customer) {
    notFound();
  }

  // Calculate stats
  const totalInvoiced = customer.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = customer.payments.reduce((sum, pay) => sum + pay.amount, 0);
  const outstanding = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            {customer.company && <><Building2 className="h-4 w-4" /> {customer.company}</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/invoices/new?customerId=${customer.id}`} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Invoice
          </Link>
          <Link href={`/customers/${customer.id}/edit`} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 flex items-center gap-2">
            Edit Profile
          </Link>
          <a href={`mailto:${customer.email || ''}?subject=Customer Update`} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email Customer
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">₹{totalInvoiced.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-500">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-500">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{outstanding.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium text-slate-500">Credit Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{customer.creditLimit.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{customer.phone || "N/A"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{customer.email || "N/A"}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                <span className="flex-1">{customer.billingAddress || "N/A"}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-slate-500">GSTIN</div>
                <div className="mt-1 font-mono">{customer.gstin || "Unregistered"}</div>
              </div>
            </CardContent>
          </Card>
             <div className="col-span-2 space-y-6">
          <CustomerTabs customer={customer} />
        </div>     </div>
      </div>
    </div>
  );
}
