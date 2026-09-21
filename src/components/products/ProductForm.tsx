"use client";

import { createProduct, updateProduct, deleteProduct } from "@/app/actions/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

type ProductInitialData = {
  id?: string;
  name: string;
  sku: string;
  category: string | null;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  gstPercent: number;
  hsnSac: string | null;
  openingStock: number;
  reorderLevel: number;
};

export function ProductForm({ initialData }: { initialData?: ProductInitialData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData?.id;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateProduct(initialData.id!, formData);
      } else {
        result = await createProduct(formData);
      }
      
      if (result.success) {
        toast.success(`Product ${isEditing ? 'updated' : 'created'} successfully!`);
        router.push("/products");
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} product.`);
      }
    });
  }

  function handleDelete() {
    if (!initialData?.id) return;
    
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      startTransition(async () => {
        const result = await deleteProduct(initialData.id!);
        if (result.success) {
          toast.success("Product deleted successfully");
          router.push("/products");
        } else {
          toast.error(result.error || "Failed to delete product");
        }
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name <span className="text-red-500">*</span></label>
              <input required name="name" defaultValue={initialData?.name} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="Premium Widget" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU (Stock Keeping Unit) <span className="text-red-500">*</span></label>
              <input required name="sku" defaultValue={initialData?.sku} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="WID-PREM-001" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <input name="category" defaultValue={initialData?.category || ""} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="Electronics" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit of Measure</label>
              <select name="unit" defaultValue={initialData?.unit || "pcs"} className="w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white">
                <option value="pcs">Pieces (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="ltr">Liters (ltr)</option>
                <option value="box">Boxes</option>
                <option value="service">Service (Hour/Day)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & GST</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selling Price (₹) <span className="text-red-500">*</span></label>
              <input required type="number" step="0.01" name="sellingPrice" defaultValue={initialData?.sellingPrice} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="999.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cost Price (₹)</label>
              <input type="number" step="0.01" name="costPrice" defaultValue={initialData?.costPrice} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="500.00" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GST Percentage (%)</label>
              <select name="gstPercent" defaultValue={initialData?.gstPercent || 0} className="w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white">
                <option value="0">0% (Exempt)</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">HSN / SAC Code</label>
              <input name="hsnSac" defaultValue={initialData?.hsnSac || ""} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="8543" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Opening Stock</label>
              <input type="number" name="openingStock" defaultValue={initialData?.openingStock || 0} disabled={isEditing} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500" />
              <p className="text-xs text-slate-500">{isEditing ? "Opening stock cannot be edited after creation." : "Initial quantity available in stock."}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reorder Level (Low Stock Alert)</label>
              <input type="number" name="reorderLevel" defaultValue={initialData?.reorderLevel || 5} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" />
              <p className="text-xs text-slate-500">Alert me when stock falls below this number.</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6">
            <div>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  🗑️ Delete Product
                </button>
              )}
            </div>
            <button 
              type="submit" 
              disabled={isPending}
              className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving..." : isEditing ? "Update Product" : "Save Product in Catalog"}
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
