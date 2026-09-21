import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp";

export default async function SalesOrdersPage() {
  const salesOrders = await prisma.salesOrder.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
        <Link
          href="/sales-orders/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="relative max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by SO number or customer..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">SO Number</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {salesOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No sales orders found. Create a sales order to confirm a purchase.
                    </td>
                  </tr>
                ) : (
                  salesOrders.map((so) => (
                    <tr key={so.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex-shrink-0 bg-purple-50 rounded flex items-center justify-center">
                            <ClipboardList className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="font-semibold text-slate-900">{so.number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {so.customer.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(so.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{so.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          so.status === 'COMPLETED' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 
                          so.status === 'CANCELLED' ? 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20' :
                          'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                        }`}>
                          {so.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link href={`/invoices/new?customerId=${so.customerId}`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Invoice</Link>
                        {so.customer?.phone && (
                          <a href={buildWhatsAppChatUrl(so.customer.phone, `Hi ${so.customer.name},\n\nHere is your Sales Order ${so.number} for ₹${so.grandTotal.toLocaleString()}.\n\nThank you!`)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">WhatsApp</a>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
