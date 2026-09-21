import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Search, Package } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Products & Services</h1>
        <Link
          href="/products/new"
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
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
              placeholder="Search by name, SKU, or HSN..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-y text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Product Details</th>
                  <th className="px-6 py-3 font-medium">Pricing (₹)</th>
                  <th className="px-6 py-3 font-medium">Taxes</th>
                  <th className="px-6 py-3 font-medium">Stock Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No products found. Add your first product to build your catalog.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded flex items-center justify-center">
                            <Package className="h-5 w-5 text-slate-400" />
                          </div>
                          <div>
                            <Link href={`/products/${product.id}`} className="font-medium text-slate-900 hover:text-indigo-600 hover:underline underline-offset-4 transition-all cursor-pointer block">
                              {product.name}
                            </Link>
                            <div className="text-xs text-slate-500 mt-0.5">SKU: {product.sku}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <div className="text-sm text-slate-900">Sell: ₹{product.sellingPrice.toLocaleString()}</div>
                          <div className="text-xs text-slate-500">Cost: ₹{product.costPrice.toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">GST: {product.gstPercent}%</div>
                        <div className="text-xs text-slate-500">HSN: {product.hsnSac || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4">
                        {product.currentStock <= product.reorderLevel ? (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                            Low Stock: {product.currentStock} {product.unit}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                            In Stock: {product.currentStock} {product.unit}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                          Edit
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
