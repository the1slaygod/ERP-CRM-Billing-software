import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buildWhatsAppChatUrl } from "@/lib/whatsapp";

export default async function QuotationsPage() {
  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
        <Link
          href="/quotations/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Create Quotation
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
              placeholder="Search by quote number or customer..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Quote Number</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Valid Until</th>
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {quotations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No quotations found. Create a quotation to send estimates.
                    </td>
                  </tr>
                ) : (
                  quotations.map((quote) => (
                    <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 flex-shrink-0 bg-blue-50 rounded flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-slate-900">{quote.number}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {quote.customer.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        ₹{quote.grandTotal.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          quote.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 
                          quote.status === 'REJECTED' ? 'bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20' :
                          'bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20'
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link href={`/quotations/${quote.id}`} className="text-blue-600 hover:text-blue-900 text-sm font-medium">View</Link>
                        {quote.customer?.email && (
                          <a href={`mailto:${quote.customer.email}?subject=Quotation ${quote.number}&body=Hi ${quote.customer.name},%0D%0A%0D%0AHere is your quotation ${quote.number} for Rs. ${quote.grandTotal.toLocaleString()}.%0D%0A%0D%0AThank you!`} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Email</a>
                        )}
                        {quote.customer?.phone && (
                          <a href={buildWhatsAppChatUrl(quote.customer.phone, `Hi ${quote.customer.name},\n\nHere is your quotation ${quote.number} for ₹${quote.grandTotal.toLocaleString()}.\n\nThank you!`)} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">WhatsApp</a>
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
