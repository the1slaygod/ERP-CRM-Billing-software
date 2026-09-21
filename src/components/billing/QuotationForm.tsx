"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuotation, updateQuotation } from "@/app/actions/quotation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Info } from "lucide-react";
import { calculateItemTax } from "@/lib/taxCalculations";

type Customer = { id: string; name: string; gstin: string | null; billingAddress: string | null };
type Product = { id: string; name: string; sku: string; sellingPrice: number; gstPercent: number; hsnSac: string | null; unit: string; category?: string | null };

type InvoiceLine = {
  productId: string;
  quantity: number;
  rate: number;
  discount: number;
  defaultGstPercent: number;
  productCategory: string | null;
  unit: string;
};

type InitialData = {
  id: string;
  customerId: string;
  items: {
    productId: string;
    quantity: number;
    rate: number;
    discount: number;
  }[];
};

export function QuotationForm({ customers, products, initialData }: { customers: Customer[], products: Product[], initialData?: InitialData }) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(initialData?.customerId || "");
  const [lines, setLines] = useState<InvoiceLine[]>(() => {
    if (initialData?.items) {
      return initialData.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          rate: item.rate,
          discount: item.discount,
          defaultGstPercent: product?.gstPercent || 0,
          productCategory: product?.category || null,
          unit: product?.unit || "pcs"
        };
      });
    }
    return [];
  });
  const [isSaving, setIsSaving] = useState(false);

  const calculatedLines = lines.map(line => {
    const activeGstPercent = calculateItemTax(line.productCategory, line.defaultGstPercent, line.rate);
    const rawTotal = line.quantity * line.rate;
    const taxableValue = rawTotal - line.discount;
    const taxAmount = (taxableValue * activeGstPercent) / 100;
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;
    const total = taxableValue + taxAmount;
    
    return { ...line, activeGstPercent, taxableValue, cgst, sgst, igst: 0, total };
  });

  const subtotal = calculatedLines.reduce((acc, l) => acc + (l.quantity * l.rate), 0);
  const totalDiscount = calculatedLines.reduce((acc, l) => acc + l.discount, 0);
  const totalTaxable = calculatedLines.reduce((acc, l) => acc + l.taxableValue, 0);
  const totalCgst = calculatedLines.reduce((acc, l) => acc + l.cgst, 0);
  const totalSgst = calculatedLines.reduce((acc, l) => acc + l.sgst, 0);
  const grandTotal = totalTaxable + totalCgst + totalSgst;

  const handleAddLine = () => setLines([...lines, { productId: "", quantity: 1, rate: 0, discount: 0, defaultGstPercent: 0, productCategory: null, unit: "pcs" }]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], productId, rate: product.sellingPrice, defaultGstPercent: product.gstPercent, productCategory: product.category || null, unit: product.unit };
    setLines(newLines);
  };

  const updateLine = (index: number, field: keyof InvoiceLine, value: number) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!customerId || lines.length === 0 || lines.some(l => !l.productId)) {
      alert("Please select a customer and ensure all items have a product selected.");
      return;
    }
    setIsSaving(true);
    
    const payloadLines = calculatedLines.map(cl => ({
      productId: cl.productId,
      quantity: cl.quantity,
      rate: cl.rate,
      discount: cl.discount,
      gstPercent: cl.activeGstPercent,
      unit: cl.unit,
      taxableValue: cl.taxableValue,
      cgst: cl.cgst,
      sgst: cl.sgst,
      igst: cl.igst,
      total: cl.total
    }));

    let result;
    if (initialData?.id) {
      result = await updateQuotation(initialData.id, customerId, payloadLines, subtotal, totalDiscount, totalTaxable, totalCgst, totalSgst, 0, grandTotal);
    } else {
      result = await createQuotation(customerId, payloadLines, subtotal, totalDiscount, totalTaxable, totalCgst, totalSgst, 0, 0, grandTotal);
    }

    if (result.success) {
      router.push(initialData?.id ? `/quotations/${initialData.id}` : "/quotations");
    } else {
      alert(result.error);
      setIsSaving(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === customerId);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{initialData ? "Edit Quotation" : "Generate Quotation"}</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : initialData ? "Update Quotation" : "Save Quotation"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>
            <CardContent>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white">
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {selectedCustomer && (
                <div className="mt-4 p-4 bg-slate-50 rounded-md border text-sm text-slate-700">
                  <div className="font-semibold text-slate-900">{selectedCustomer.name}</div>
                  {selectedCustomer.billingAddress && <div>{selectedCustomer.billingAddress}</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quoted Items</CardTitle>
              <button onClick={handleAddLine} className="flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                <Plus className="h-4 w-4" /> Add Item
              </button>
            </CardHeader>
            <CardContent>
              {lines.length === 0 ? (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed rounded-md">No items added. Click 'Add Item' to start.</div>
              ) : (
                <div className="space-y-4">
                  {lines.map((line, idx) => {
                    const calc = calculatedLines[idx];
                    return (
                      <div key={idx} className="flex gap-4 items-start p-4 bg-slate-50 rounded-md border">
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-medium text-slate-500">Product</label>
                              <select value={line.productId} onChange={(e) => handleProductSelect(idx, e.target.value)} className="mt-1 w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white">
                                <option value="">Select...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>)}
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs font-medium text-slate-500">Qty</label>
                                <input type="number" min="1" value={line.quantity} onChange={(e) => updateLine(idx, 'quantity', parseInt(e.target.value)||0)} className="mt-1 w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500">Rate (₹)</label>
                                <input type="number" value={line.rate} onChange={(e) => updateLine(idx, 'rate', parseFloat(e.target.value)||0)} className="mt-1 w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-4">
                              <div>
                                <span className="text-slate-500 mr-2 text-xs">Discount (₹):</span>
                                <input type="number" value={line.discount} onChange={(e) => updateLine(idx, 'discount', parseFloat(e.target.value)||0)} className="w-20 rounded border-0 py-1 px-2 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-xs" />
                              </div>
                              <div>
                                <span className="text-slate-500 mr-2 text-xs flex items-center gap-1">
                                  GST: {calc.activeGstPercent}%
                                  {calc.activeGstPercent !== line.defaultGstPercent && (
                                    <Info className="w-3 h-3 text-indigo-500" title={`Smart Auto-Calculated (Default was ${line.defaultGstPercent}%)`} />
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="font-bold text-slate-900">₹{calc.total.toFixed(2)}</div>
                          </div>
                        </div>
                        <button onClick={() => removeLine(idx)} className="p-2 text-red-400 hover:text-red-600 bg-white rounded shadow-sm border mt-6"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader><CardTitle>Estimate Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm text-slate-600"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>Discount</span><span className="text-red-500">-₹{totalDiscount.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>CGST</span><span>₹{totalCgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm text-slate-600"><span>SGST</span><span>₹{totalSgst.toFixed(2)}</span></div>
              <div className="flex justify-between text-lg font-bold text-indigo-700 pt-4 border-t mt-4"><span>Grand Total</span><span>₹{grandTotal.toFixed(2)}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
