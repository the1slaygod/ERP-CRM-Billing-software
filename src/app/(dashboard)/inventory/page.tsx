import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InventoryPage() {
  const products = await prisma.product.findMany({
    orderBy: { currentStock: "asc" }
  });

  const transactions = await prisma.inventoryTransaction.findMany({
    include: { product: true },
    orderBy: { date: "desc" },
    take: 50
  });

  const lowStockCount = products.filter(p => p.currentStock <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <button className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <RefreshCw className="h-4 w-4" />
          Stock Adjustment
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500">Total Products</div>
            <div className="text-3xl font-bold mt-2">{products.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-red-600">Low Stock Alerts</div>
                <div className="text-3xl font-bold text-red-700 mt-2">{lowStockCount}</div>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-50">
          <CardContent className="p-6">
            <div className="text-sm font-medium text-slate-500">Inventory Value (Sell)</div>
            <div className="text-3xl font-bold text-indigo-700 mt-2">
              ₹{products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Products Needing Reorder
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Current Stock</th>
                    <th className="px-4 py-2 font-medium">Reorder At</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {products.filter(p => p.currentStock <= p.reorderLevel).map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link href={`/products/${product.id}`} className="font-medium text-slate-900 hover:text-indigo-600 hover:underline underline-offset-4 transition-all cursor-pointer">
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-red-600 font-bold">{product.currentStock}</td>
                      <td className="px-4 py-3 text-slate-500">{product.reorderLevel}</td>
                    </tr>
                  ))}
                  {lowStockCount === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                        All products are sufficiently stocked.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Ledger */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Stock Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-y text-slate-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Product</th>
                    <th className="px-4 py-2 font-medium">Qty</th>
                    <th className="px-4 py-2 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {tx.type === "STOCK_IN" ? (
                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">
                              <ArrowDownToLine className="h-3 w-3" /> IN
                            </span>
                          ) : tx.type === "STOCK_OUT" ? (
                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs font-medium">
                              <ArrowUpFromLine className="h-3 w-3" /> OUT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-medium">
                              <RefreshCw className="h-3 w-3" /> ADJ
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 truncate max-w-[150px]" title={tx.product.name}>
                          <Link href={`/products/${tx.product.id}`} className="font-medium text-slate-900 hover:text-indigo-600 hover:underline underline-offset-4 transition-all cursor-pointer">
                            {tx.product.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-bold">{tx.quantity}</td>
                        <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[100px]" title={tx.reference || ""}>
                          {tx.reference || "-"}
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
    </div>
  );
}
