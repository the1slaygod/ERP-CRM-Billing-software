"use client";

import { createCustomer, updateCustomer } from "@/app/actions/customer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FormEvent, useTransition } from "react";
import { toast } from "sonner";

export function CustomerForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!initialData;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      let result;
      if (isEditing) {
        result = await updateCustomer(initialData.id, formData);
      } else {
        result = await createCustomer(formData);
      }
      
      if (result.success && result.customerId) {
        toast.success(isEditing ? "Customer updated successfully!" : "Customer created successfully!");
        router.push(`/customers/${result.customerId}`);
      } else {
        toast.error(result.error || `Failed to ${isEditing ? 'update' : 'create'} customer.`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name <span className="text-red-500">*</span></label>
              <input required defaultValue={initialData?.name} name="name" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name</label>
              <input defaultValue={initialData?.company || ""} name="company" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="Acme Corp" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input defaultValue={initialData?.phone || ""} name="phone" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="+91 9876543210" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">WhatsApp Number</label>
              <input defaultValue={initialData?.whatsapp || ""} name="whatsapp" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="+91 9876543210" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input type="email" defaultValue={initialData?.email || ""} name="email" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Type</label>
              <select defaultValue={initialData?.type || "B2B"} name="type" className="w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm bg-white">
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GSTIN (Optional)</label>
            <input defaultValue={initialData?.gstin || ""} name="gstin" className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="27XXXXX1234X1Z5" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Billing Address</label>
            <textarea defaultValue={initialData?.billingAddress || ""} name="billingAddress" rows={3} className="w-full rounded-md border-0 py-2 pl-3 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm" placeholder="123 Business Park, Mumbai" />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <button 
              type="button"
              onClick={() => router.back()}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isPending}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {isPending ? "Saving..." : (isEditing ? "Save Changes" : "Create Customer")}
            </button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
