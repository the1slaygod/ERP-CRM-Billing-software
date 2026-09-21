import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search, Building2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CustomersPage() {
  // Fetch customers from database
  // Note: For initial render if db is empty, we will handle empty state.
  let customers: any[] = [];
  try {
    customers = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Database connection issue or no customers yet", e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <Link
          href="/customers/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Customer
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
              placeholder="Filter customers..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Name / Company</th>
                  <th className="px-6 py-3 font-medium">Contact</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Balance</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No customers found. Create your first customer to get started.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{customer.name}</div>
                        {customer.company && (
                          <div className="flex items-center text-xs text-slate-500 mt-1">
                            <Building2 className="mr-1 h-3 w-3" /> {customer.company}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {customer.phone && (
                            <div className="flex items-center text-xs text-slate-600">
                              <Phone className="mr-1 h-3 w-3" /> {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center text-xs text-slate-600">
                              <Mail className="mr-1 h-3 w-3" /> {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {customer.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">₹0.00</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                        >
                          View 360° Profile
                        </Link>
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
